import { parseShipmentIds } from "./lib/queue.js";

const DRAFT_KEY = "freightekShipmentIdsDraftV1";
const elements = {
  shipmentIdsInput: document.querySelector("#shipmentIdsInput"),
  shipmentIdsCount: document.querySelector("#shipmentIdsCount"),
  shipmentIdsError: document.querySelector("#shipmentIdsError"),
  statusDot: document.querySelector("#statusDot"),
  statusText: document.querySelector("#statusText"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  shipmentText: document.querySelector("#shipmentText"),
  bookingText: document.querySelector("#bookingText"),
  successText: document.querySelector("#successText"),
  failedText: document.querySelector("#failedText"),
  stageText: document.querySelector("#stageText"),
  activityLog: document.querySelector("#activityLog"),
  workerList: document.querySelector("#workerList"),
  errorText: document.querySelector("#errorText"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  resumeButton: document.querySelector("#resumeButton"),
  exportButton: document.querySelector("#exportButton"),
  resetButton: document.querySelector("#resetButton"),
};

let latestState = null;
let busy = false;
let inputValid = false;
let inputEdited = false;

elements.startButton.addEventListener("click", () =>
  perform("START", { shipmentIds: elements.shipmentIdsInput.value }),
);
elements.shipmentIdsInput.addEventListener("input", () => {
  inputEdited = true;
  saveDraft();
  validateInput();
  render(latestState);
});
elements.pauseButton.addEventListener("click", () => perform("PAUSE"));
elements.resumeButton.addEventListener("click", () => perform("RESUME"));
elements.exportButton.addEventListener("click", () => perform("EXPORT"));
elements.resetButton.addEventListener("click", async () => {
  if (!confirm("Reset all collected results and failures?")) return;
  await perform("RESET");
});

async function perform(type, payload = {}) {
  busy = true;
  render(latestState);
  try {
    const response = await chrome.runtime.sendMessage({ type, ...payload });
    if (!response?.ok)
      throw new Error(response?.error?.message ?? "Extension request failed.");
    if (type === "EXPORT" && response.document) {
      await downloadExport(response.document, response.filename);
    }
    if (response.state) latestState = response.state;
  } catch (error) {
    latestState = {
      ...(latestState ?? emptyState()),
      lastError: { code: "POPUP_ERROR", message: error.message },
    };
  } finally {
    busy = false;
    render(latestState);
  }
}

async function downloadExport(documentValue, filename) {
  const blob = new Blob([JSON.stringify(documentValue, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  try {
    await chrome.downloads.download({ url, filename, saveAs: true });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

async function refresh() {
  try {
    const response = await chrome.runtime.sendMessage({ type: "GET_STATE" });
    if (response?.ok) {
      latestState = response.state;
      render(latestState);
    }
  } catch {
    // A service-worker restart is transient; the next polling cycle reconnects.
  }
}

function render(state = emptyState()) {
  state ??= emptyState();
  const total = state.total ?? 0;
  const processed = state.processed ?? 0;
  const percentage = total > 0 ? Math.min(100, (processed / total) * 100) : 0;
  const status = state.status ?? "idle";

  elements.statusDot.className = `status-dot ${status}`;
  elements.statusText.textContent = statusLabel(status);
  elements.progressText.textContent = `${processed} / ${total}`;
  elements.progressBar.style.width = `${percentage}%`;
  elements.shipmentText.textContent = state.currentShipmentId ?? "—";
  elements.bookingText.textContent = state.currentBookingNo ?? "—";
  elements.successText.textContent = String(state.success ?? 0);
  elements.failedText.textContent = String(state.failed ?? 0);
  elements.stageText.textContent =
    state.stageMessage ?? "Waiting for collector status.";
  renderActivityLog(state.activityLog ?? []);
  renderWorkers(state.workers ?? []);

  const error = state.lastError;
  elements.errorText.hidden = !error;
  elements.errorText.textContent = error
    ? `${error.code}: ${error.message}`
    : "";

  const isRunning = status === "running";
  elements.shipmentIdsInput.disabled = busy || isRunning;
  elements.startButton.disabled = busy || isRunning || !inputValid;
  elements.pauseButton.disabled = busy || !isRunning;
  elements.resumeButton.disabled = busy || total === 0 || !["paused", "idle"].includes(status);
  elements.exportButton.disabled = busy || processed === 0;
  elements.resetButton.disabled = busy || isRunning || processed === 0;
}

function renderActivityLog(entries) {
  elements.activityLog.replaceChildren(
    ...entries
      .slice()
      .reverse()
      .map((entry) => {
        const item = document.createElement("li");
        const time = document.createElement("time");
        const message = document.createElement("span");
        const date = new Date(entry.at);
        time.textContent = Number.isNaN(date.getTime())
          ? "—"
          : date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
        message.textContent = entry.message;
        item.append(time, message);
        return item;
      }),
  );
}

function renderWorkers(workers) {
  elements.workerList.replaceChildren(...workers.map((worker) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = `Thread ${worker.id} · ${worker.shipmentId ?? "Waiting"}`;
    detail.textContent = worker.stageMessage ?? worker.stage ?? "Waiting for work.";
    item.append(title, detail);
    return item;
  }));
  if (workers.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Up to 3 threads start when you collect entered IDs.";
    elements.workerList.append(item);
  }
}

function statusLabel(status) {
  return (
    {
      idle: "Ready",
      running: "Collecting",
      paused: "Paused",
      completed: "Completed",
    }[status] ?? status
  );
}

function emptyState() {
  return {
    status: "idle",
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
  };
}

function saveDraft() {
  chrome.storage.local.set({ [DRAFT_KEY]: elements.shipmentIdsInput.value }).catch(() => {});
}

function validateInput() {
  elements.shipmentIdsError.hidden = true;
  inputValid = false;
  try {
    const entries = parseShipmentIds(elements.shipmentIdsInput.value);
    inputValid = true;
    elements.shipmentIdsCount.textContent = `${entries.length} unique Shipment IDs`;
  } catch (error) {
    elements.shipmentIdsCount.textContent = "0 unique Shipment IDs";
    if (elements.shipmentIdsInput.value.trim()) {
      elements.shipmentIdsError.hidden = false;
      elements.shipmentIdsError.textContent = error.message;
    }
  }
}

async function initialize() {
  render(latestState);
  await refresh();
  try {
    const stored = await chrome.storage.local.get(DRAFT_KEY);
    if (!inputEdited && typeof stored[DRAFT_KEY] === "string") {
      elements.shipmentIdsInput.value = stored[DRAFT_KEY];
      inputEdited = true;
    }
  } catch {
    // Collection can still use the entered IDs when a draft cannot be restored.
  }
  if (!inputEdited && latestState?.manifestSource === "custom") {
    elements.shipmentIdsInput.value = latestState.shipmentIds;
  }
  validateInput();
  render(latestState);
  setInterval(refresh, 1_000);
}

initialize();
