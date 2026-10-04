import assert from "node:assert/strict";
import test from "node:test";
import { COLLECTOR_STATE_KEY, createInitialState } from "../chrome-extension/lib/queue.js";

test("START uses the pasted IDs, validates before replacing progress, and resumes the same custom list", async () => {
  const listeners = {};
  const updates = [];
  let archivedState;
  let draft = "S2608021";
  let storedState = createInitialState([{ shipmentId: "S2608021", bookingNo: "BOOK-1" }]);
  globalThis.chrome = {
    runtime: {
      getManifest: () => ({ background: { service_worker: "chrome-extension/background.js" } }),
      getURL: (path) => `chrome-extension://test/${path}`,
      onInstalled: { addListener: (listener) => (listeners.installed = listener) },
      onStartup: { addListener: (listener) => (listeners.startup = listener) },
      onMessage: { addListener: (listener) => (listeners.message = listener) },
    },
    storage: { local: {
      get: async () => ({ [COLLECTOR_STATE_KEY]: structuredClone(storedState), freightekShipmentIdsDraftV1: draft }),
      set: async (value) => {
        storedState = structuredClone(value[COLLECTOR_STATE_KEY]);
        if (value.freightekArchivedFixedCollectorStateV1) archivedState = value.freightekArchivedFixedCollectorStateV1;
        if (Object.hasOwn(value, "freightekShipmentIdsDraftV1")) draft = value.freightekShipmentIdsDraftV1;
      },
    } },
    tabs: {
      create: async (options) => ({ id: 42, ...options }),
      query: async () => [{ id: 41, url: "https://seatrans.freightek.com/shipments/management" }],
      get: async () => null,
      update: async (tabId, options) => { updates.push(options.url); return { id: tabId, ...options }; },
      onUpdated: { addListener: () => {} },
      onRemoved: { addListener: () => {} },
    },
  };
  await import(`../chrome-extension/background.js?custom=${Date.now()}`);
  const request = (message) => new Promise((resolve) => listeners.message(message, {}, resolve));
  const initial = await request({ type: "GET_STATE" });
  assert.equal(initial.state.total, 0, "Previously fixed IDs must not become the active queue");
  assert.equal(archivedState.manifest[0].shipmentId, "S2608021");
  assert.equal(draft, "", "A draft populated from the fixed list must not be restored");
  assert.equal((await request({ type: "START" })).ok, false);
  assert.equal((await request({ type: "RESUME" })).ok, false);

  storedState = createInitialState([{ shipmentId: "S2608021", bookingNo: "BOOK-1" }]);
  draft = "S2609009";
  await request({ type: "GET_STATE" });
  assert.equal(draft, "S2609009", "A user-edited draft survives migration");
  const beforeRemovedAction = structuredClone(storedState);
  assert.equal((await request({ type: "RELOAD_MANIFEST" })).ok, false);
  assert.deepEqual(storedState, beforeRemovedAction);
  const response = await request({ type: "START", shipmentIds: "s2609001, S2609002,S2609001" });
  assert.equal(response.ok, true);
  assert.equal(response.state.total, 2);
  assert.deepEqual(storedState.manifest.map((entry) => entry.shipmentId), ["S2609001", "S2609002"]);
  assert.equal(updates[0], "https://seatrans.freightek.com/shipments/management/S2609001/instruction");

  const runningState = structuredClone(storedState);
  assert.equal((await request({ type: "START", shipmentIds: "S2609003" })).ok, false);
  assert.deepEqual(storedState, runningState);
  await request({ type: "PAUSE" });
  const pausedState = structuredClone(storedState);
  assert.equal((await request({ type: "START", shipmentIds: "S2609003,invalid" })).ok, false);
  assert.deepEqual(storedState, pausedState);
  assert.equal((await request({ type: "START", shipmentIds: " , " })).ok, false);
  assert.deepEqual(storedState, pausedState);

  storedState.results.S2609001 = { checksum: "success", pageSnapshot: { sections: [], ungroupedFields: [] } };
  const continued = await request({ type: "START", shipmentIds: "S2609001,S2609002" });
  assert.equal(continued.ok, true);
  assert.equal(continued.state.success, 1);
  assert.equal(updates.at(-1), "https://seatrans.freightek.com/shipments/management/S2609002/instruction");
  await request({ type: "PAUSE" });
  const reset = await request({ type: "RESET" });
  assert.equal(reset.state.manifestSource, "custom");
  assert.equal(reset.state.shipmentIds, "S2609001, S2609002");
  assert.equal(reset.state.processed, 0);

  storedState = createInitialState();
  const empty = await request({ type: "GET_STATE" });
  assert.equal(empty.ok, true);
  assert.equal(empty.state.total, 0);
  assert.equal((await request({ type: "RESUME" })).ok, false);
});
