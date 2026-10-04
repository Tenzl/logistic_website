import assert from "node:assert/strict";
import test from "node:test";
import * as queue from "../chrome-extension/lib/queue.js";

test("comma-separated shipment input creates a queue and removes duplicates in order", () => {
  const entries = queue.parseShipmentIds(" s2609001, S2609002,\nS2609001,, S2609003, ");
  assert.deepEqual(entries.map((entry) => entry.shipmentId), ["S2609001", "S2609002", "S2609003"]);
  assert.equal(entries[0].bookingNo, null);
  assert.equal(entries[0].url, queue.buildInstructionUrl("S2609001"));
});

test("long pasted lists retain every unique Shipment ID", () => {
  const ids = Array.from({ length: 2000 }, (_, index) => `S${String(2600000 + index)}`);
  assert.deepEqual(queue.parseShipmentIds(ids.join(", ")).map((entry) => entry.shipmentId), ids);
});

test("blank or malformed shipment input rejects the entire list", () => {
  for (const value of ["", " , ,\n", undefined]) {
    assert.throws(() => queue.parseShipmentIds(value), /Enter at least one Shipment ID/);
  }
  for (const value of ["S2609001,invalid", "S2609001,../../login", "S2609001 S2609002", "S123"]) {
    assert.throws(() => queue.parseShipmentIds(value), /Invalid Shipment ID/);
  }
});
