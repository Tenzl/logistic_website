import assert from "node:assert/strict";
import test from "node:test";
import { COLLECTOR_STATE_KEY, buildInstructionUrl } from "../chrome-extension/lib/queue.js";

async function setup() {
  const previous = { chrome: globalThis.chrome, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, now: Date.now };
  const store = {};
  const tabs = new Map([[41, { id: 41, windowId: 1, url: "https://seatrans.freightek.com/shipments/management" }]]);
  const listeners = {};
  const timers = new Map();
  const navigations = [];
  let clock = Date.now();
  let nextTimer = 1;
  let nextTab = 42;
  Date.now = () => clock;
  globalThis.setTimeout = (callback, delay) => { const id = nextTimer++; timers.set(id, { callback, at: clock + delay }); return id; };
  globalThis.clearTimeout = (id) => timers.delete(id);
  globalThis.chrome = {
    runtime: {
      getManifest: () => ({ background: { service_worker: "chrome-extension/background.js" } }),
      onInstalled: { addListener: (fn) => { listeners.installed = fn; } },
      onStartup: { addListener: (fn) => { listeners.startup = fn; } },
      onMessage: { addListener: (fn) => { listeners.message = fn; } },
    },
    storage: { local: {
      get: async () => structuredClone(store),
      set: async (value) => Object.assign(store, structuredClone(value)),
    } },
    tabs: {
      query: async () => [tabs.get(41)].filter(Boolean),
      get: async (id) => { if (!tabs.has(id)) throw new Error("Tab closed"); return tabs.get(id); },
      create: async (options) => { const tab = { id: nextTab++, ...options }; tabs.set(tab.id, tab); return tab; },
      update: async (id, options) => { if (!tabs.has(id)) throw new Error("Tab closed"); Object.assign(tabs.get(id), options); navigations.push({ tabId: id, url: options.url }); return tabs.get(id); },
      reload: async (id) => { navigations.push({ tabId: id, url: tabs.get(id).url }); },
      sendMessage: async () => ({ ok: true }),
      onUpdated: { addListener: (fn) => { listeners.updated = fn; } },
      onRemoved: { addListener: (fn) => { listeners.removed = fn; } },
    },
    scripting: { executeScript: async () => [] },
  };
  await import(`../chrome-extension/background.js?parallel=${Math.random()}`);
  const request = (message, sender = {}) => new Promise((resolve) => listeners.message(message, sender, resolve));
  return {
    request, tabs, listeners, navigations, timers,
    state: () => store[COLLECTOR_STATE_KEY],
    worker: (id) => structuredClone(store[COLLECTOR_STATE_KEY].workers.find((worker) => worker.id === id)),
    finish: (worker, overrides = {}) => request({ type: "FREIGHTEK_EXTRACTION_RESULT", payload: {
      shipmentId: store[COLLECTOR_STATE_KEY].manifest[worker.index].shipmentId,
      jobId: worker.jobId, displayedTotal: 0, extractedRowCount: 0, containers: [],
      pageSnapshot: { sections: [], ungroupedFields: [] }, ...overrides,
    } }, { tab: { id: worker.tabId }, frameId: 0 }),
    tick: async () => {
      const at = Math.min(...Array.from(timers.values(), (timer) => timer.at));
      if (!Number.isFinite(at)) return;
      clock = at;
      for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.callback(); }
      await request({ type: "GET_STATE" });
    },
    close: () => { globalThis.chrome = previous.chrome; globalThis.setTimeout = previous.setTimeout; globalThis.clearTimeout = previous.clearTimeout; Date.now = previous.now; },
    restartWorker: async () => {
      timers.clear();
      await import(`../chrome-extension/background.js?restart=${Math.random()}`);
    },
  };
}

test("three tabs collect distinct IDs concurrently, accept out-of-order results, and refill independently", async () => {
  const h = await setup();
  try {
    const ids = Array.from({ length: 7 }, (_, index) => `S${2609001 + index}`);
    const start = await h.request({ type: "START", shipmentIds: ids.join(",") });
    assert.equal(start.ok, true);
    assert.equal(h.tabs.size, 3);
    assert.deepEqual(h.navigations.map((entry) => entry.url), ids.slice(0, 3).map(buildInstructionUrl));
    const first = h.worker(1), second = h.worker(2), third = h.worker(3);
    assert.equal(new Set([first.jobId, second.jobId, third.jobId]).size, 3);
    assert.equal((await h.finish(second)).accepted, true);
    assert.equal((await h.finish(second)).ignored, true);
    assert.equal((await h.finish(first, { jobId: second.jobId })).ignored, true);
    assert.equal((await h.request({ type: "GET_STATE" })).state.success, 1);
    assert.equal(h.worker(1).index, first.index);
    assert.equal(h.worker(3).index, third.index);
    await h.tick();
    assert.equal(h.worker(2).index, 3);
    assert.equal(h.state().status, "running");
    for (let round = 0; round < 8 && h.state().status !== "completed"; round++) {
      await Promise.all(structuredClone(h.state().workers)
        .filter((worker) => worker.index !== null && worker.jobId)
        .map((worker) => h.finish(worker)));
      await h.tick();
    }
    assert.equal(h.state().status, "completed");
    assert.equal(Object.keys(h.state().results).length, ids.length);
    assert.equal(h.navigations.length, ids.length);
    assert.equal(new Set(h.navigations.map((entry) => entry.url)).size, ids.length);
  } finally { h.close(); }
});

test("a restarted service worker restores delayed queue work from storage", async () => {
  const h = await setup();
  try {
    await h.request({ type: "START", shipmentIds: "S2609001,S2609002,S2609003,S2609004" });
    await h.finish(h.worker(2));
    await h.restartWorker();
    assert.equal(h.timers.size, 0);
    await h.request({ type: "GET_STATE" });
    assert.equal(h.timers.size, 1);
    await h.tick();
    assert.equal(h.worker(2).index, 3);
    assert.equal(h.worker(1).index, 0);
    assert.equal(h.worker(3).index, 2);
  } finally { h.close(); }
});

test("a partial tab creation failure pauses and Resume reuses the tab already created", async () => {
  const h = await setup();
  try {
    const create = globalThis.chrome.tabs.create;
    let creates = 0;
    globalThis.chrome.tabs.create = async (options) => {
      if (++creates === 2) throw new Error("Cannot create tab");
      return create(options);
    };
    assert.equal((await h.request({ type: "START", shipmentIds: "S2609001,S2609002,S2609003" })).ok, false);
    assert.equal(h.state().status, "paused");
    assert.equal(h.tabs.size, 2);
    globalThis.chrome.tabs.create = create;
    assert.equal((await h.request({ type: "RESUME" })).ok, true);
    assert.equal(h.tabs.size, 3);
    assert.equal(h.state().workers[1].tabId, 42);
  } finally { h.close(); }
});

test("a retry does not block another tab and stale results cannot complete a retried job", async () => {
  const h = await setup();
  try {
    await h.request({ type: "START", shipmentIds: "S2609001,S2609002,S2609003,S2609004" });
    const first = h.worker(1), second = h.worker(2);
    const fail = (worker) => h.request({ type: "FREIGHTEK_EXTRACTION_ERROR", payload: {
      shipmentId: "S2609001", jobId: worker.jobId, code: "TABLE_TIMEOUT", message: "Timed out",
    } }, { tab: { id: worker.tabId } });
    assert.equal((await fail(first)).retrying, true);
    assert.equal((await h.finish(second)).accepted, true);
    assert.equal((await h.finish(first)).ignored, true);
    await h.tick();
    const retry = h.worker(1);
    assert.notEqual(retry.jobId, first.jobId);
    assert.equal((await fail(retry)).retrying, true);
    await h.tick();
    assert.equal((await fail(h.worker(1))).failed, true);
    assert.equal(h.state().failures.S2609001.attempts, 3);
    assert.equal(h.state().status, "running");
  } finally { h.close(); }
});

test("Pause cancels delayed work and Resume reuses three tabs without recollecting successes", async () => {
  const h = await setup();
  try {
    await h.request({ type: "START", shipmentIds: "S2609001,S2609002,S2609003,S2609004,S2609005" });
    const first = h.worker(1), oldSecond = h.worker(2);
    await h.finish(first);
    assert.ok(h.timers.size > 0);
    assert.equal((await h.request({ type: "PAUSE" })).state.status, "paused");
    const navigationCount = h.navigations.length;
    await h.tick();
    assert.equal(h.navigations.length, navigationCount);
    assert.equal((await h.finish(oldSecond)).ignored, true);
    assert.equal((await h.request({ type: "RESUME" })).ok, true);
    assert.equal(h.tabs.size, 3);
    assert.equal(Object.keys(h.state().results).length, 1);
    assert.deepEqual(h.state().workers.map((worker) => worker.index), [1, 2, 3]);
    assert.equal((await h.finish(oldSecond)).ignored, true);
  } finally { h.close(); }
});

test("short lists only open the tabs they need", async () => {
  for (const count of [1, 2]) {
    const h = await setup();
    try {
      await h.request({ type: "START", shipmentIds: Array.from({ length: count }, (_, index) => `S${2609001 + index}`).join(",") });
      assert.equal(h.tabs.size, count);
    } finally { h.close(); }
  }
});

test("authentication recovery belongs to its tab and a closed tab pauses safely before Resume", async () => {
  const h = await setup();
  try {
    await h.request({ type: "START", shipmentIds: "S2609001,S2609002,S2609003,S2609004" });
    const first = h.worker(1), second = h.worker(2);
    h.tabs.get(first.tabId).url = "https://seatrans.freightek.com/auth/callback";
    h.listeners.updated(first.tabId, { url: h.tabs.get(first.tabId).url }, h.tabs.get(first.tabId));
    await h.request({ type: "GET_STATE" });
    assert.equal((await h.finish(second)).accepted, true);
    while (h.worker(1).action) await h.tick();
    assert.equal(h.tabs.get(first.tabId).url, buildInstructionUrl("S2609001"));
    h.tabs.delete(h.worker(3).tabId);
    h.listeners.removed(h.worker(3).tabId);
    assert.equal((await h.request({ type: "GET_STATE" })).state.status, "paused");
    assert.equal((await h.request({ type: "RESUME" })).ok, true);
    assert.equal(new Set(h.state().workers.map((worker) => worker.tabId)).size, 3);
  } finally { h.close(); }
});
