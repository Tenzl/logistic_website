import assert from "node:assert/strict";
import test from "node:test";

import {
  COLLECTOR_STATE_KEY,
  createInitialState,
} from "../chrome-extension/lib/queue.js";

test("START reuses the active Chrome tab and navigates it to the first pending Shipment ID", async () => {
  const listeners = {};
  const updates = [];
  let storedState = createInitialState([
    { shipmentId: "S2608021", bookingNo: "BOOK-1" },
    { shipmentId: "S2608020", bookingNo: "BOOK-2" },
  ]);
  storedState.manifestSource = "custom";

  globalThis.chrome = {
    runtime: {
      getManifest: () => ({ background: { service_worker: "background.js" } }),
      getURL: (path) => `chrome-extension://test/${path}`,
      onInstalled: {
        addListener: (listener) => (listeners.installed = listener),
      },
      onStartup: { addListener: (listener) => (listeners.startup = listener) },
      onMessage: { addListener: (listener) => (listeners.message = listener) },
    },
    storage: {
      local: {
        get: async () => ({
          [COLLECTOR_STATE_KEY]: structuredClone(storedState),
        }),
        set: async (value) => {
          storedState = structuredClone(value[COLLECTOR_STATE_KEY]);
        },
      },
    },
    tabs: {
      create: async (options) => ({ id: 42, ...options }),
      query: async () => [
        {
          id: 41,
          url: "https://seatrans.freightek.com/shipments/management",
        },
      ],
      get: async () => null,
      update: async (tabId, options) => {
        updates.push({ tabId, options });
        return { id: tabId, url: options.url };
      },
      reload: async () => undefined,
      sendMessage: async () => undefined,
      onUpdated: { addListener: (listener) => (listeners.updated = listener) },
      onRemoved: { addListener: (listener) => (listeners.removed = listener) },
    },
  };

  await import(`../chrome-extension/background.js?test=${Date.now()}`);
  const response = await new Promise((resolve) => {
    const keepChannelOpen = listeners.message(
      { type: "START", shipmentIds: "S2608021,S2608020" },
      {},
      resolve,
    );
    assert.equal(keepChannelOpen, true);
  });

  assert.equal(response.ok, true);
  assert.equal(storedState.activeTabId, 41);
  assert.equal(storedState.status, "running");
  assert.deepEqual(updates, [
    {
      tabId: 41,
      options: {
        url: "https://seatrans.freightek.com/shipments/management/S2608021/instruction",
      },
    },
    {
      tabId: 42,
      options: {
        url: "https://seatrans.freightek.com/shipments/management/S2608020/instruction",
      },
    },
  ]);
});

test("RESUME prefers the active valid instruction tab over a stale stored callback tab", async () => {
  const listeners = {};
  const updates = [];
  let storedState = createInitialState([
    { shipmentId: "S2608021", bookingNo: "BOOK-1" },
    { shipmentId: "S2608020", bookingNo: "BOOK-2" },
    { shipmentId: "S2608019", bookingNo: "BOOK-3" },
    { shipmentId: "S2608018", bookingNo: "BOOK-4" },
    { shipmentId: "S2608017", bookingNo: "BOOK-5" },
  ]);
  storedState.status = "paused";
  storedState.manifestSource = "custom";
  storedState.currentIndex = 4;
  storedState.activeTabId = 17;
  for (const shipmentId of ["S2608021", "S2608020", "S2608019", "S2608018"]) {
    storedState.results[shipmentId] = {
      checksum: `checksum-${shipmentId}`,
      pageSnapshot: { sections: [], ungroupedFields: [] },
    };
  }

  globalThis.chrome = {
    runtime: {
      getManifest: () => ({ background: { service_worker: "background.js" } }),
      getURL: (path) => `chrome-extension://test/${path}`,
      onInstalled: {
        addListener: (listener) => (listeners.installed = listener),
      },
      onStartup: { addListener: (listener) => (listeners.startup = listener) },
      onMessage: { addListener: (listener) => (listeners.message = listener) },
    },
    storage: {
      local: {
        get: async () => ({
          [COLLECTOR_STATE_KEY]: structuredClone(storedState),
        }),
        set: async (value) => {
          storedState = structuredClone(value[COLLECTOR_STATE_KEY]);
        },
      },
    },
    tabs: {
      query: async () => [
        {
          id: 42,
          url: "https://seatrans.freightek.com/shipments/management/S2608020/instruction",
        },
      ],
      get: async (tabId) =>
        tabId === 17
          ? { id: 17, url: "https://seatrans.freightek.com/auth/callback" }
          : null,
      update: async (tabId, options) => {
        updates.push({ tabId, options });
        return { id: tabId, url: options.url };
      },
      reload: async () => undefined,
      sendMessage: async () => undefined,
      onUpdated: { addListener: (listener) => (listeners.updated = listener) },
      onRemoved: { addListener: (listener) => (listeners.removed = listener) },
    },
  };

  await import(`../chrome-extension/background.js?resume-test=${Date.now()}`);
  const response = await new Promise((resolve) => {
    listeners.message({ type: "RESUME" }, {}, resolve);
  });

  assert.equal(response.ok, true);
  assert.equal(storedState.activeTabId, 42);
  assert.equal(storedState.status, "running");
  assert.equal(storedState.lastError, null);
  assert.deepEqual(updates, [
    {
      tabId: 42,
      options: {
        url: "https://seatrans.freightek.com/shipments/management/S2608017/instruction",
      },
    },
  ]);
});

test("extraction result persists the live Booking No. in the exported shipment result", async () => {
  const listeners = {};
  let storedState = createInitialState([
    { shipmentId: "S2608021", bookingNo: null },
  ]);
  storedState.status = "running";
  storedState.manifestSource = "custom";
  storedState.runtimeRevision = "1.4.0";
  storedState.workers = [
    {
      id: 1,
      tabId: 41,
      index: 0,
      jobId: "job-1",
      action: null,
      actionId: null,
      dueAt: null,
      stage: "extracting",
      stageMessage: "Reading shipment.",
    },
  ];

  globalThis.chrome = {
    runtime: {
      getManifest: () => ({ background: { service_worker: "background.js" } }),
      getURL: (path) => `chrome-extension://test/${path}`,
      onInstalled: {
        addListener: (listener) => (listeners.installed = listener),
      },
      onStartup: { addListener: (listener) => (listeners.startup = listener) },
      onMessage: { addListener: (listener) => (listeners.message = listener) },
    },
    storage: {
      local: {
        get: async () => ({
          [COLLECTOR_STATE_KEY]: structuredClone(storedState),
        }),
        set: async (value) => {
          storedState = structuredClone(value[COLLECTOR_STATE_KEY]);
        },
      },
    },
    tabs: {
      onUpdated: { addListener: (listener) => (listeners.updated = listener) },
      onRemoved: { addListener: (listener) => (listeners.removed = listener) },
    },
  };

  await import(`../chrome-extension/background.js?result-test=${Date.now()}`);
  const response = await new Promise((resolve) => {
    listeners.message(
      {
        type: "FREIGHTEK_EXTRACTION_RESULT",
        payload: {
          shipmentId: "S2608021",
          jobId: "job-1",
          bookingNo: "EMFUIHOSA021266",
          sourceUrl:
            "https://seatrans.freightek.com/shipments/management/S2608021/instruction",
          collectedAt: "2026-09-16T00:00:00.000Z",
          displayedTotal: 1,
          extractedRowCount: 1,
          fields: {},
          sourceHeaders: [],
          optionalFieldsMissing: [],
          containers: [{ containerNo: "CONT-1" }],
          pageSnapshot: { sections: [], ungroupedFields: [] },
        },
      },
      { tab: { id: 41 }, frameId: 0 },
      resolve,
    );
  });

  assert.equal(response.ok, true);
  assert.equal(storedState.results.S2608021.bookingNo, "EMFUIHOSA021266");
});
