import {
  buildExportDocument,
  buildInstructionUrl,
  COLLECTOR_STATE_KEY,
  createInitialState,
  isFreightEkAuthCallback,
  isFreightEkPage,
  nextPendingIndex,
  parseInstructionUrl,
  parseShipmentIds,
  summarizeState,
  COLLECTOR_CONCURRENCY,
} from "./lib/queue.js";
import { extensionResourcePath } from "./lib/resource-path.js";

const MAX_ATTEMPTS = 3;
const RUNTIME_REVISION = "1.4.0";
const AUTH_CALLBACK_RETRY_MS = 15_000;
const EXTENSION_MANIFEST = chrome.runtime.getManifest();
let transitionPromise = Promise.resolve();
const workerTimers = new Map();

// Only queue claims and state writes are serialized. Each tab reads its page
// independently, and delays never hold this transition chain.
function enqueueTransition(work) {
  transitionPromise = transitionPromise.then(work, work);
  return transitionPromise;
}

function runEvent(work) {
  enqueueTransition(work).catch((error) =>
    console.error("FreightEK collector:", error),
  );
}

chrome.runtime.onInstalled.addListener(() =>
  runEvent(async () => {
    const state = await loadState();
    if (state.status === "running") {
      await pauseForError(state, {
        code: "EXTENSION_RELOADED",
        message:
          "Extension reloaded. Press Resume to reconnect the collection tabs.",
      });
    } else await saveState(state);
  }),
);

chrome.runtime.onStartup.addListener(() =>
  runEvent(async () => {
    const state = await loadState();
    if (state.status === "running") {
      await pauseForError(state, {
        code: "BROWSER_RESTARTED",
        message: "Chrome restarted. Press Resume to continue the saved queue.",
      });
    }
  }),
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  enqueueTransition(() => handleMessage(message, sender))
    .then((response) => sendResponse({ ok: true, ...response }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: {
          code: error.code ?? "UNEXPECTED_ERROR",
          message: error.message,
        },
      }),
    );
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== "complete") return;
  runEvent(async () => {
    const state = await loadState();
    const worker = state.workers.find((entry) => entry.tabId === tabId);
    if (state.status !== "running" || !worker || worker.index === null) return;
    if (changeInfo.url && isFreightEkAuthCallback(changeInfo.url)) {
      worker.jobId = null;
      setWorkerStage(
        worker,
        "auth_callback",
        "Refreshing login; reopening this shipment in 15 seconds.",
      );
      appendActivity(state, worker.stage, laneMessage(worker));
      scheduleWorker(state, worker, "auth", AUTH_CALLBACK_RETRY_MS);
      await saveState(state);
      return;
    }
    if (worker.action) return;
    if (changeInfo.url && !parseInstructionUrl(changeInfo.url)) {
      await pauseForError(state, {
        code: "AUTH_OR_ROUTE_REDIRECT",
        message:
          "Thread " +
          worker.id +
          " left the instruction route: " +
          safeUrl(changeInfo.url),
      });
      return;
    }
    const route = parseInstructionUrl(tab.url);
    if (
      changeInfo.status !== "complete" ||
      route?.shipmentId !== state.manifest[worker.index]?.shipmentId
    )
      return;
    setWorkerStage(worker, "page_loaded", "Connecting the page reader.");
    appendActivity(state, worker.stage, laneMessage(worker));
    await saveState(state);
    try {
      await ensureContentScripts(tabId);
      await chrome.tabs.sendMessage(tabId, {
        type: "EXTRACT_NOW",
        jobId: worker.jobId,
      });
    } catch (error) {
      await pauseForError(state, {
        code: "CONTENT_SCRIPT_UNAVAILABLE",
        message:
          "Thread " +
          worker.id +
          " cannot start the page reader: " +
          error.message,
      });
    }
  });
});

chrome.tabs.onRemoved.addListener((tabId) =>
  runEvent(async () => {
    const state = await loadState();
    const worker = state.workers.find((entry) => entry.tabId === tabId);
    if (!worker) return;
    worker.tabId = null;
    if (state.status === "running") {
      await pauseForError(state, {
        code: "TAB_CLOSED",
        message:
          "A collection tab was closed. Press Resume to recreate it and continue.",
      });
    } else await saveState(state);
  }),
);

async function handleMessage(message, sender) {
  switch (message?.type) {
    case "GET_STATE":
      return { state: summarizeState(await loadState()) };
    case "START":
      return startCollection(message.shipmentIds);
    case "PAUSE":
      return pauseCollection();
    case "RESUME":
      return resumeCollection();
    case "RESET":
      return resetCollection();
    case "EXPORT":
      return exportResults();
    case "FREIGHTEK_CONTENT_READY":
      return acceptContentReady(message, sender);
    case "FREIGHTEK_EXTRACTION_PROGRESS":
      return acceptExtractionProgress(message.payload, sender);
    case "FREIGHTEK_EXTRACTION_RESULT":
      return acceptExtractionResult(message.payload, sender);
    case "FREIGHTEK_EXTRACTION_ERROR":
      return acceptExtractionError(message.payload, sender);
    default:
      throw new Error("Unknown extension message: " + message?.type);
  }
}

async function loadState() {
  const draftKey = "freightekShipmentIdsDraftV1";
  const stored = await chrome.storage.local.get([
    COLLECTOR_STATE_KEY,
    draftKey,
  ]);
  let state = stored[COLLECTOR_STATE_KEY] ?? createInitialState();
  if (state.manifest.length > 0 && state.manifestSource !== "custom") {
    const archived = state;
    state = createInitialState();
    const migration = {
      freightekArchivedFixedCollectorStateV1: archived,
      [COLLECTOR_STATE_KEY]: state,
    };
    try {
      const draft = parseShipmentIds(stored[draftKey]);
      if (
        draft.length === archived.manifest.length &&
        draft.every(
          (entry, index) =>
            entry.shipmentId === archived.manifest[index].shipmentId,
        )
      )
        migration[draftKey] = "";
    } catch {
      /* Preserve unrelated drafts. */
    }
    await chrome.storage.local.set(migration);
  }
  state.workers ??= [];
  state.concurrency = COLLECTOR_CONCURRENCY;
  state.version = 3;
  if (state.runtimeRevision !== RUNTIME_REVISION) {
    if (state.status === "running") {
      state.status = "paused";
      state.lastError = {
        code: "EXTENSION_UPDATED",
        message:
          "Collector updated. Press Resume to reconnect the collection tabs.",
      };
      appendActivity(state, "extension_updated", state.lastError.message);
      clearWorkerTimers();
    }
    const containerOnlyResults = Object.entries(state.results ?? {}).filter(
      ([, result]) => !result?.pageSnapshot,
    );
    if (containerOnlyResults.length) {
      state.legacyContainerResults ??= {};
      for (const [shipmentId, value] of containerOnlyResults) {
        state.legacyContainerResults[shipmentId] = value;
        delete state.results[shipmentId];
      }
      appendActivity(
        state,
        "recapture_required",
        containerOnlyResults.length +
          " container-only result(s) need a complete page snapshot.",
      );
    }
    state.runtimeRevision = RUNTIME_REVISION;
    await saveState(state);
  }
  if (state.status === "running") {
    for (const worker of state.workers)
      if (worker.action && worker.dueAt !== null) armWorker(worker);
  }
  return state;
}

async function saveState(state) {
  const first = state.workers.find((worker) => worker.index !== null);
  state.currentIndex =
    first?.index ??
    (nextPendingIndex(state, 0) === -1
      ? state.manifest.length
      : nextPendingIndex(state, 0));
  state.activeTabId = state.workers[0]?.tabId ?? state.activeTabId;
  state.updatedAt = new Date().toISOString();
  await chrome.storage.local.set({ [COLLECTOR_STATE_KEY]: state });
}

function newWorker(id, tabId = null) {
  return {
    id,
    tabId,
    index: null,
    jobId: null,
    action: null,
    actionId: null,
    dueAt: null,
    stage: "idle",
    stageMessage: "Waiting for work.",
  };
}

async function prepareWorkers(state, activeTab) {
  clearWorkerTimers();
  const pendingCount = state.manifest.filter(
    (entry) =>
      !state.results[entry.shipmentId] && !state.failures[entry.shipmentId],
  ).length;
  if (!pendingCount) {
    state.workers = state.workers.map((worker) =>
      newWorker(worker.id, worker.tabId),
    );
    await completeIfDone(state);
    return;
  }
  const candidates = [];
  if (activeTab?.id && isFreightEkPage(activeTab.url))
    candidates.push(activeTab);
  const existingIds = [
    ...new Set([
      ...state.workers.map((worker) => worker.tabId),
      state.activeTabId,
    ]),
  ].filter((id) => id !== null && id !== undefined);
  const existingTabs = await Promise.all(
    existingIds.map((id) => chrome.tabs.get(id).catch(() => null)),
  );
  for (const tab of existingTabs) {
    const ownedBlank =
      tab?.url === "about:blank" &&
      state.workers.some((worker) => worker.tabId === tab.id);
    if (
      tab?.id &&
      (isFreightEkPage(tab.url) || ownedBlank) &&
      !candidates.some((candidate) => candidate.id === tab.id)
    )
      candidates.push(tab);
  }
  const hostTab = candidates.find((tab) => isFreightEkPage(tab.url));
  if (!hostTab)
    throw new Error(
      "Open an authenticated seatrans.freightek.com page first, then press Resume.",
    );
  const size = Math.min(COLLECTOR_CONCURRENCY, pendingCount);
  state.workers = candidates
    .slice(0, size)
    .map((tab, index) => newWorker(index + 1, tab.id));
  // Persist every created tab so a partial failure can reuse it on Resume.
  await saveState(state);
  try {
    while (state.workers.length < size) {
      const options = {
        url: "about:blank",
        active: false,
        openerTabId: hostTab.id,
      };
      if (hostTab.windowId !== undefined) options.windowId = hostTab.windowId;
      const tab = await chrome.tabs.create(options);
      if (!tab?.id) throw new Error("Chrome did not create a collection tab.");
      state.workers.push(newWorker(state.workers.length + 1, tab.id));
      await saveState(state);
    }
    for (const worker of state.workers) claimNext(state, worker);
    await saveState(state);
    const operations = await Promise.allSettled(
      state.workers
        .filter((worker) => worker.index !== null)
        .map((worker) => navigateTab(state, worker)),
    );
    const failure = operations.find(
      (operation) => operation.status === "rejected",
    );
    if (failure) throw failure.reason;
  } catch (error) {
    await pauseForError(state, {
      code: "TAB_START_FAILED",
      message: error.message,
    });
    throw error;
  }
}

async function startCollection(shipmentIds) {
  const requested = parseShipmentIds(shipmentIds);
  const state = await loadState();
  if (state.status === "running")
    throw new Error("Pause collection before changing Shipment IDs.");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !isFreightEkPage(tab.url))
    throw new Error(
      "Open an authenticated seatrans.freightek.com page in the active tab first.",
    );
  const sameList =
    requested.length === state.manifest.length &&
    requested.every(
      (entry, index) => entry.shipmentId === state.manifest[index].shipmentId,
    );
  if (!sameList) {
    const workers = state.workers;
    const existing = new Map(
      state.manifest.map((entry) => [entry.shipmentId, entry]),
    );
    Object.assign(
      state,
      createInitialState(
        requested.map((entry) => existing.get(entry.shipmentId) ?? entry),
      ),
    );
    state.workers = workers;
  }
  state.manifestSource = "custom";
  state.runtimeRevision = RUNTIME_REVISION;
  state.manifestChecksum = await sha256(JSON.stringify(state.manifest));
  state.status = "running";
  state.startedAt ??= new Date().toISOString();
  state.completedAt = null;
  state.lastError = null;
  appendActivity(
    state,
    "starting",
    "Starting up to three collection threads from the shared queue.",
  );
  await prepareWorkers(state, tab);
  return { state: summarizeState(state) };
}

async function pauseCollection() {
  const state = await loadState();
  if (state.status === "running") state.status = "paused";
  clearWorkerTimers();
  for (const worker of state.workers) {
    worker.jobId = null;
    setWorkerStage(worker, "paused", "Paused; unfinished work will resume.");
  }
  appendActivity(state, "paused", "All collection threads paused.");
  await saveState(state);
  return { state: summarizeState(state) };
}

async function resumeCollection() {
  const state = await loadState();
  if (!state.manifest.length)
    throw new Error("Enter Shipment IDs and start collection first.");
  if (state.status === "running") return { state: summarizeState(state) };
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  state.status = "running";
  state.lastError = null;
  state.completedAt = null;
  appendActivity(
    state,
    "resuming",
    "Resuming unfinished shipments with up to three threads.",
  );
  try {
    await prepareWorkers(state, activeTab);
  } catch (error) {
    if (state.status === "running")
      await pauseForError(state, {
        code: "RESUME_FAILED",
        message: error.message,
      });
    throw error;
  }
  return { state: summarizeState(state) };
}

async function resetCollection() {
  const oldState = await loadState();
  if (oldState.status === "running")
    throw new Error("Pause collection before resetting progress.");
  clearWorkerTimers();
  const state = createInitialState(oldState.manifest);
  state.manifestChecksum = oldState.manifestChecksum;
  state.manifestSource = oldState.manifestSource;
  state.runtimeRevision = RUNTIME_REVISION;
  state.workers = oldState.workers.map((worker) =>
    newWorker(worker.id, worker.tabId),
  );
  await saveState(state);
  return { state: summarizeState(state) };
}

function claimNext(state, worker) {
  const index = nextPendingIndex(state, 0);
  worker.index = index === -1 ? null : index;
  worker.action = null;
  worker.actionId = null;
  worker.dueAt = null;
  worker.jobId = index === -1 ? null : crypto.randomUUID();
  if (index === -1)
    setWorkerStage(worker, "idle", "No queued shipments remaining.");
  else {
    setWorkerStage(
      worker,
      "navigating",
      "Opening " + state.manifest[index].shipmentId + ".",
    );
    appendActivity(state, worker.stage, laneMessage(worker));
  }
}

async function navigateTab(state, worker) {
  if (worker.index === null) return;
  const entry = state.manifest[worker.index];
  const tab = await chrome.tabs.get(worker.tabId).catch(() => null);
  if (parseInstructionUrl(tab?.url)?.shipmentId === entry.shipmentId)
    await chrome.tabs.reload(worker.tabId);
  else
    await chrome.tabs.update(worker.tabId, {
      url: buildInstructionUrl(entry.shipmentId),
    });
}

function scheduleWorker(state, worker, action, delayMs) {
  cancelWorkerTimer(worker.id);
  worker.action = action;
  worker.actionId = crypto.randomUUID();
  worker.dueAt = Date.now() + delayMs;
  if (state.status === "running") armWorker(worker);
}

function armWorker(worker) {
  const existing = workerTimers.get(worker.id);
  if (
    existing?.actionId === worker.actionId &&
    existing.dueAt === worker.dueAt &&
    existing.action === worker.action
  )
    return;
  cancelWorkerTimer(worker.id);
  const dueAt = worker.dueAt,
    action = worker.action,
    actionId = worker.actionId;
  const timer = setTimeout(
    () => {
      workerTimers.delete(worker.id);
      runEvent(() => runScheduledWorker(worker.id, action, dueAt, actionId));
    },
    Math.max(0, dueAt - Date.now()),
  );
  workerTimers.set(worker.id, { timer, action, dueAt, actionId });
}

function cancelWorkerTimer(id) {
  const current = workerTimers.get(id);
  if (current) clearTimeout(current.timer);
  workerTimers.delete(id);
}

function clearWorkerTimers() {
  for (const id of [...workerTimers.keys()]) cancelWorkerTimer(id);
}

async function runScheduledWorker(id, action, dueAt, actionId) {
  const state = await loadState();
  const worker = state.workers.find((entry) => entry.id === id);
  if (
    state.status !== "running" ||
    !worker ||
    worker.action !== action ||
    worker.dueAt !== dueAt ||
    worker.actionId !== actionId
  )
    return;
  cancelWorkerTimer(id);
  worker.action = null;
  worker.actionId = null;
  worker.dueAt = null;
  if (action === "next") claimNext(state, worker);
  else if (worker.index !== null) {
    worker.jobId = crypto.randomUUID();
    setWorkerStage(
      worker,
      "navigating",
      "Reopening " + state.manifest[worker.index].shipmentId + ".",
    );
    appendActivity(state, worker.stage, laneMessage(worker));
  }
  await saveState(state);
  try {
    await navigateTab(state, worker);
  } catch (error) {
    await pauseForError(state, {
      code: "TAB_NAVIGATION_FAILED",
      message: "Thread " + id + ": " + error.message,
    });
  }
  await completeIfDone(state);
}

async function completeIfDone(state) {
  if (state.status !== "running") return;
  const outstanding = state.manifest.some(
    (entry) =>
      !state.results[entry.shipmentId] && !state.failures[entry.shipmentId],
  );
  if (outstanding) return;
  state.status = "completed";
  state.completedAt = new Date().toISOString();
  clearWorkerTimers();
  state.workers = state.workers.map((worker) =>
    newWorker(worker.id, worker.tabId),
  );
  appendActivity(
    state,
    "completed",
    "All queued Shipment IDs have a terminal result.",
  );
  await saveState(state);
}

function workerForMessage(state, payload, sender, requireJob = true) {
  if (
    state.status !== "running" ||
    (sender.frameId !== undefined && sender.frameId !== 0)
  )
    return null;
  return (
    state.workers.find(
      (worker) =>
        worker.tabId === sender.tab?.id &&
        worker.index !== null &&
        !worker.action &&
        worker.jobId &&
        state.manifest[worker.index]?.shipmentId === payload?.shipmentId &&
        (!requireJob || payload?.jobId === worker.jobId),
    ) ?? null
  );
}

async function acceptContentReady(message, sender) {
  const state = await loadState();
  const worker = workerForMessage(state, message, sender, false);
  if (worker) {
    setWorkerStage(worker, "extracting", "Reading " + message.shipmentId + ".");
    appendActivity(state, worker.stage, laneMessage(worker));
    await saveState(state);
  }
  return { shouldExtract: Boolean(worker), jobId: worker?.jobId ?? null };
}

async function acceptExtractionProgress(payload, sender) {
  const state = await loadState();
  const worker = workerForMessage(state, payload, sender);
  if (!worker) return { ignored: true };
  setWorkerStage(
    worker,
    payload.stage ?? "extracting",
    payload.message ?? "Reading shipment.",
  );
  appendActivity(state, worker.stage, laneMessage(worker));
  await saveState(state);
  return { accepted: true, state: summarizeState(state) };
}

async function acceptExtractionResult(payload, sender) {
  const state = await loadState();
  const worker = workerForMessage(state, payload, sender);
  if (!worker) return { ignored: true };
  if (
    !payload.pageSnapshot ||
    !Array.isArray(payload.pageSnapshot.sections) ||
    !Array.isArray(payload.pageSnapshot.ungroupedFields)
  ) {
    return acceptExtractionError(
      {
        ...payload,
        code: "PAGE_SNAPSHOT_MISSING",
        message:
          "The page reader did not return a complete instruction snapshot.",
      },
      sender,
    );
  }
  if (payload.extractedRowCount !== payload.displayedTotal) {
    return acceptExtractionError(
      {
        ...payload,
        code: "ROW_COUNT_MISMATCH",
        message: "Extracted row count does not match the displayed total.",
      },
      sender,
    );
  }
  const shipmentId = state.manifest[worker.index].shipmentId;
  const result = {
    sourceUrl: payload.sourceUrl,
    collectedAt: payload.collectedAt,
    bookingNo: payload.bookingNo ?? null,
    displayedTotal: payload.displayedTotal,
    extractedRowCount: payload.extractedRowCount,
    fields: payload.fields,
    sourceHeaders: payload.sourceHeaders,
    optionalFieldsMissing: payload.optionalFieldsMissing,
    containers: payload.containers,
    pageSnapshot: payload.pageSnapshot,
  };
  result.checksum = await sha256(JSON.stringify(result));
  state.results[shipmentId] = result;
  delete state.failures[shipmentId];
  delete state.attempts[shipmentId];
  worker.index = null;
  worker.jobId = null;
  state.lastError = null;
  setWorkerStage(
    worker,
    "waiting",
    "Saved " + shipmentId + "; waiting for the next queued ID.",
  );
  appendActivity(state, "saved", laneMessage(worker));
  scheduleWorker(state, worker, "next", randomDelay(2_500, 4_000));
  await saveState(state);
  await completeIfDone(state);
  return { accepted: true, state: summarizeState(state) };
}

async function acceptExtractionError(payload, sender) {
  const state = await loadState();
  const worker = workerForMessage(state, payload, sender);
  if (!worker) return { ignored: true };
  const shipmentId = state.manifest[worker.index].shipmentId;
  const error = {
    code: payload.code ?? "EXTRACTION_ERROR",
    message: payload.message ?? "Unknown extraction error.",
    details: payload.details ?? null,
    at: new Date().toISOString(),
  };
  if (
    ["AUTH_REQUIRED", "SELECTOR_DRIFT", "PAGE_SNAPSHOT_MISSING"].includes(
      error.code,
    )
  ) {
    await pauseForError(state, error);
    return { paused: true, state: summarizeState(state) };
  }
  const attempt = (state.attempts[shipmentId] ?? 0) + 1;
  state.attempts[shipmentId] = attempt;
  worker.jobId = null;
  state.lastError = error;
  if (attempt < MAX_ATTEMPTS) {
    setWorkerStage(
      worker,
      "retrying",
      shipmentId + ": retry " + attempt + "/" + MAX_ATTEMPTS + ".",
    );
    appendActivity(state, worker.stage, laneMessage(worker));
    scheduleWorker(state, worker, "retry", randomDelay(900, 1_600));
    await saveState(state);
    return { retrying: true, state: summarizeState(state) };
  }
  state.failures[shipmentId] = { ...error, attempts: attempt };
  worker.index = null;
  setWorkerStage(
    worker,
    "waiting",
    shipmentId +
      " failed after " +
      attempt +
      " attempts; continuing the queue.",
  );
  appendActivity(state, "failed", laneMessage(worker));
  scheduleWorker(state, worker, "next", randomDelay(2_500, 4_000));
  await saveState(state);
  await completeIfDone(state);
  return { failed: true, state: summarizeState(state) };
}

async function pauseForError(state, error) {
  state.status = "paused";
  state.lastError = error;
  clearWorkerTimers();
  for (const worker of state.workers) {
    worker.jobId = null;
    setWorkerStage(
      worker,
      "paused",
      "Paused; press Resume after resolving the error.",
    );
  }
  appendActivity(state, "paused_error", error.code + ": " + error.message);
  await saveState(state);
}

async function ensureContentScripts(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["lib/extract-table.js", "content.js"].map((path) =>
      extensionResourcePath(EXTENSION_MANIFEST, path),
    ),
  });
}

function setWorkerStage(worker, stage, message) {
  worker.stage = stage;
  worker.stageMessage = message;
}

function laneMessage(worker) {
  return "Thread " + worker.id + ": " + worker.stageMessage;
}

function appendActivity(state, stage, message) {
  const at = new Date().toISOString();
  state.stage = stage;
  state.stageMessage = message;
  state.lastActivityAt = at;
  state.activityLog ??= [];
  state.activityLog.push({ at, stage, message });
  if (state.activityLog.length > 20)
    state.activityLog.splice(0, state.activityLog.length - 20);
}

async function exportResults() {
  const state = await loadState();
  return {
    document: buildExportDocument(state),
    filename:
      "seatrans/freightek-shipments-" +
      new Date().toISOString().replace(/[:.]/g, "-") +
      ".json",
    state: summarizeState(state),
  };
}

async function sha256(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function randomDelay(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.origin + url.pathname;
  } catch {
    return "unknown URL";
  }
}
