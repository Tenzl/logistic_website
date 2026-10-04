const SHIPMENT_ID_PATTERN = /^S\d{7}$/;
const FREIGHTEK_HOST = "seatrans.freightek.com";
const STATE_KEY = "freightekContainerCollectorStateV1";

export const COLLECTOR_STATE_KEY = STATE_KEY;
export const COLLECTOR_CONCURRENCY = 3;

export function parseShipmentIds(value) {
  if (typeof value !== "string") throw new Error("Enter at least one Shipment ID.");
  const ids = value.split(/[,\r\n]+/).map((id) => id.trim().toUpperCase()).filter(Boolean);
  if (ids.length === 0) throw new Error("Enter at least one Shipment ID.");
  return [...new Set(ids)].map((shipmentId) => ({
    shipmentId,
    bookingNo: null,
    clearanceNo: null,
    truckingNo: null,
    mbl: null,
    hbl: null,
    url: buildInstructionUrl(shipmentId),
  }));
}

export function buildInstructionUrl(shipmentId) {
  const normalized = String(shipmentId ?? "")
    .trim()
    .toUpperCase();
  if (!SHIPMENT_ID_PATTERN.test(normalized)) {
    throw new Error(`Invalid Shipment ID: ${shipmentId}`);
  }
  return `https://${FREIGHTEK_HOST}/shipments/management/${normalized}/instruction`;
}

export function parseInstructionUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" || url.hostname !== FREIGHTEK_HOST) {
    return null;
  }

  const match = url.pathname.match(
    /^\/shipments\/management\/(S\d{7})\/instruction\/?$/i,
  );
  if (!match) return null;

  return {
    shipmentId: match[1].toUpperCase(),
    url: buildInstructionUrl(match[1]),
  };
}

export function isFreightEkAuthCallback(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === FREIGHTEK_HOST &&
      /^\/auth\/callback\/?$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function isFreightEkPage(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === FREIGHTEK_HOST;
  } catch {
    return false;
  }
}

export function createInitialState(manifest = []) {
  return {
    version: 3,
    concurrency: COLLECTOR_CONCURRENCY,
    workers: [],
    status: "idle",
    stage: "ready",
    stageMessage: "Ready to collect shipments.",
    manifest,
    manifestChecksum: null,
    manifestSource: null,
    activeTabId: null,
    currentIndex: 0,
    attempts: {},
    results: {},
    failures: {},
    lastError: null,
    startedAt: null,
    completedAt: null,
    lastActivityAt: null,
    authRecoveryUntil: null,
    activityLog: [],
    updatedAt: new Date().toISOString(),
  };
}

export function nextPendingIndex(state, startIndex = state.currentIndex ?? 0) {
  const assigned = new Set((state.workers ?? []).map((worker) => worker.index).filter((index) => index !== null));
  for (
    let index = Math.max(0, startIndex);
    index < state.manifest.length;
    index += 1
  ) {
    const shipmentId = state.manifest[index].shipmentId;
    if (!assigned.has(index) && !state.results[shipmentId] && !state.failures[shipmentId]) return index;
  }
  return -1;
}

export function summarizeState(state) {
  const total = state.manifest?.length ?? 0;
  const success = Object.keys(state.results ?? {}).length;
  const failed = Object.keys(state.failures ?? {}).length;
  const current =
    state.currentIndex >= 0 ? state.manifest?.[state.currentIndex] : null;

  return {
    status: state.status,
    concurrency: COLLECTOR_CONCURRENCY,
    workers: (state.workers ?? []).map((worker) => ({
      id: worker.id,
      tabId: worker.tabId,
      shipmentId: state.manifest?.[worker.index]?.shipmentId ?? null,
      stage: worker.stage,
      stageMessage: worker.stageMessage,
    })),
    stage: state.stage ?? "unknown",
    stageMessage: state.stageMessage ?? null,
    total,
    success,
    failed,
    processed: success + failed,
    currentShipmentId: current?.shipmentId ?? null,
    currentBookingNo: current?.bookingNo ?? null,
    manifestSource: state.manifestSource ?? null,
    shipmentIds: (state.manifest ?? []).map((entry) => entry.shipmentId).join(", "),
    lastError: state.lastError,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
    lastActivityAt: state.lastActivityAt ?? null,
    activityLog: Array.isArray(state.activityLog)
      ? state.activityLog.slice(-8)
      : [],
    updatedAt: state.updatedAt,
  };
}

export function buildExportDocument(state) {
  const entries = state.manifest.map((manifestEntry) => {
    const shipmentId = manifestEntry.shipmentId;
    if (state.results[shipmentId]) {
      return {
        ...manifestEntry,
        status: "success",
        ...state.results[shipmentId],
      };
    }
    if (state.failures[shipmentId]) {
      return {
        ...manifestEntry,
        status: "failed",
        error: state.failures[shipmentId],
      };
    }
    return { ...manifestEntry, status: "pending" };
  });

  return {
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    manifestChecksum: state.manifestChecksum,
    summary: summarizeState(state),
    entries,
  };
}
