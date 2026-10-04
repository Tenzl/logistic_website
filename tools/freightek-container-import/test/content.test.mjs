import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

test("the page reader attaches its assigned job ID to progress and results and does not duplicate extraction on reinjection", async () => {
  const source = await readFile(new URL("../chrome-extension/content.js", import.meta.url), "utf8");
  const dom = new JSDOM("<body></body>", { url: "https://seatrans.freightek.com/shipments/management/S2609001/instruction", runScripts: "outside-only" });
  const messages = [];
  let listener, finish, reads = 0;
  dom.window.chrome = { runtime: {
    onMessage: { addListener: (fn) => { listener = fn; } },
    sendMessage: async (message) => { messages.push(message); return { ok: true, shouldExtract: true, jobId: "job-1" }; },
  } };
  dom.window.FreightEkExtractor = {
    parseShipmentId: () => "S2609001",
    extractInstructionDocument: async (_document, options) => {
      reads++;
      options.onProgress({ stage: "reading", message: "Reading table" });
      return new Promise((resolve) => { finish = resolve; });
    },
  };
  try {
    dom.window.eval(source);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(messages.find((message) => message.type === "FREIGHTEK_EXTRACTION_PROGRESS").payload.jobId, "job-1");
    dom.window.eval(source);
    listener({ type: "EXTRACT_NOW", jobId: "job-1" }, {}, () => {});
    assert.equal(reads, 1);
    finish({ containers: [] });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(messages.find((message) => message.type === "FREIGHTEK_EXTRACTION_RESULT").payload.jobId, "job-1");
    dom.window.eval(source);
    assert.equal(reads, 1, "Reinjection must wait for a job assignment");
    listener({ type: "EXTRACT_NOW" }, {}, () => {});
    assert.equal(reads, 1, "A missing job ID must not start a reader");
  } finally { dom.window.close(); }
});

test("page reader errors carry the job ID so only the owning worker can retry", async () => {
  const source = await readFile(new URL("../chrome-extension/content.js", import.meta.url), "utf8");
  const dom = new JSDOM("", { url: "https://seatrans.freightek.com/shipments/management/S2609001/instruction", runScripts: "outside-only" });
  const messages = [];
  dom.window.chrome = { runtime: {
    onMessage: { addListener: () => {} },
    sendMessage: async (message) => { messages.push(message); return { ok: true, shouldExtract: true, jobId: "job-error" }; },
  } };
  dom.window.FreightEkExtractor = {
    parseShipmentId: () => "S2609001",
    extractInstructionDocument: async () => { throw new Error("Failed to read"); },
  };
  try {
    dom.window.eval(source);
    await new Promise((resolve) => setImmediate(resolve));
    const error = messages.find((message) => message.type === "FREIGHTEK_EXTRACTION_ERROR");
    assert.equal(error.payload.jobId, "job-error");
  } finally { dom.window.close(); }
});
