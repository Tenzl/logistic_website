import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExportDocument,
  createInitialState,
  nextPendingIndex,
  summarizeState,
} from "../chrome-extension/lib/queue.js";

const manifest = [
  { shipmentId: "S2608021", bookingNo: "BOOK-1" },
  { shipmentId: "S2608020", bookingNo: "BOOK-2" },
  { shipmentId: "S2608019", bookingNo: "BOOK-3" },
];

test("resume skips checksum-verified successes and terminal failures", () => {
  const state = createInitialState(manifest);
  state.results.S2608021 = { checksum: "ok" };
  state.failures.S2608020 = { code: "FAILED" };
  assert.equal(nextPendingIndex(state), 2);
});

test("summary and export preserve the manifest mapping and statuses", () => {
  const state = createInitialState(manifest);
  state.results.S2608021 = { checksum: "sha", containers: [] };
  state.failures.S2608020 = { code: "TABLE_TIMEOUT" };
  state.currentIndex = 2;
  const summary = summarizeState(state);
  assert.deepEqual(
    {
      total: summary.total,
      success: summary.success,
      failed: summary.failed,
      processed: summary.processed,
    },
    { total: 3, success: 1, failed: 1, processed: 2 },
  );
  const exported = buildExportDocument(state);
  assert.equal(exported.schemaVersion, 2);
  assert.deepEqual(
    exported.entries.map((entry) => [
      entry.shipmentId,
      entry.bookingNo,
      entry.status,
    ]),
    [
      ["S2608021", "BOOK-1", "success"],
      ["S2608020", "BOOK-2", "failed"],
      ["S2608019", "BOOK-3", "pending"],
    ],
  );
});
