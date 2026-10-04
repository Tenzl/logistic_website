import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

test("popup restores a long draft, counts unique IDs, and sends the pasted list on Start", async () => {
  const html = await readFile(new URL("../chrome-extension/popup.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  assert.equal(dom.window.document.querySelector("#reloadManifestButton"), null);
  const messages = [];
  const drafts = [];
  const draft = Array.from({ length: 1000 }, (_, index) => `S${2600000 + index}`).join(",");
  const previous = { document: globalThis.document, chrome: globalThis.chrome, setInterval: globalThis.setInterval };
  globalThis.document = dom.window.document;
  globalThis.setInterval = () => 0;
  globalThis.chrome = {
    runtime: { sendMessage: async (message) => {
      messages.push(message);
      return { ok: true, state: { status: "idle", total: 0, processed: 0, workers: [
        { id: 1, shipmentId: "S2609001", stageMessage: "Reading table" },
        { id: 2, shipmentId: "S2609002", stageMessage: "Opening page" },
        { id: 3, shipmentId: "S2609003", stageMessage: "Retrying" },
      ] } };
    } },
    storage: { local: {
      get: async () => ({ freightekShipmentIdsDraftV1: draft }),
      set: async (value) => { drafts.push(value); },
    } },
  };
  try {
    await import(`../chrome-extension/popup.js?test=${Date.now()}`);
    await new Promise((resolve) => setImmediate(resolve));
    const input = document.querySelector("#shipmentIdsInput");
    assert.ok(input, "Shipment ID input must exist");
    assert.equal(input.value, draft);
    assert.match(document.querySelector("#shipmentIdsCount").textContent, /1000/);
    assert.equal(document.querySelectorAll("#workerList li").length, 3);
    assert.match(document.querySelector("#workerList").textContent, /S2609003/);
    input.value = "s2609001, S2609002, S2609001";
    input.dispatchEvent(new dom.window.Event("input"));
    assert.match(document.querySelector("#shipmentIdsCount").textContent, /2/);
    document.querySelector("#startButton").click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(messages.find((message) => message.type === "START"), {
      type: "START", shipmentIds: input.value,
    });
    assert.equal(drafts.at(-1).freightekShipmentIdsDraftV1, input.value);
    input.value = "S2609001,bad";
    input.dispatchEvent(new dom.window.Event("input"));
    assert.equal(document.querySelector("#startButton").disabled, true);
    assert.match(document.querySelector("#shipmentIdsError").textContent, /Invalid Shipment ID/);
  } finally {
    globalThis.document = previous.document;
    globalThis.chrome = previous.chrome;
    globalThis.setInterval = previous.setInterval;
    dom.window.close();
  }
});
