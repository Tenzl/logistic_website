import assert from "node:assert/strict";
import test from "node:test";
import {
  assertPlanCanApply,
  parseFreightEkDocument,
  resolveShipmentMappings,
} from "../src/core.mjs";

const entry = (shipmentId, options = {}) => ({
  shipmentId,
  bookingNo: options.bookingNo ?? null,
  hbl: options.hbl ?? null,
  status: options.status ?? "success",
  sourceUrl: `https://seatrans.freightek.com/shipments/management/${shipmentId}/instruction`,
  pageSnapshot: {
    sections: [
      {
        fields: options.liveHbl
          ? [
              {
                name: "HBL No.",
                controls: [{ type: "text", value: options.liveHbl }],
              },
            ]
          : [],
      },
    ],
  },
  containers: [],
});

test("accepts successful entries and reports failed collection rows without importing them", () => {
  const result = parseFreightEkDocument({
    schemaVersion: 4,
    entries: [entry("S2609001"), entry("S2609002", { status: "failed" })],
  });
  assert.deepEqual(
    result.entries.map((row) => row.shipmentId),
    ["S2609001"],
  );
  assert.deepEqual(result.skipped, [
    { shipmentId: "S2609002", reason: "Collection status is failed" },
  ]);
});

test("rejects duplicate shipment IDs and non-canonical FreightEK routes", () => {
  assert.throws(
    () =>
      parseFreightEkDocument({
        entries: [entry("S2609001"), entry("S2609001")],
      }),
    /Duplicate shipment ID/,
  );
  const invalid = entry("S2609001");
  invalid.sourceUrl = "https://example.com/unsafe";
  assert.throws(
    () => parseFreightEkDocument({ entries: [invalid] }),
    /instruction route/,
  );
});

test("maps by Booking No. without a separate manifest", () => {
  const resolved = resolveShipmentMappings(
    [entry("S2609001", { bookingNo: " bk-001 " })],
    {
      booking_records: [{ id: 11, booking_number: "BK-001", deleted_at: null }],
      bill_of_lading_records: [],
    },
  );
  assert.deepEqual(resolved.mappings, [
    { shipmentId: "S2609001", bookingNo: "BK-001", bookingId: 11 },
  ]);
  assert.deepEqual(resolved.unresolved, []);
});

test("falls back to the live HBL and resolves its linked Booking", () => {
  const resolved = resolveShipmentMappings(
    [entry("S2609001", { liveHbl: "STVN-260901" })],
    {
      booking_records: [{ id: 11, booking_number: "BK-001", deleted_at: null }],
      bill_of_lading_records: [
        {
          id: 21,
          booking_id: 11,
          fbl_number: "STVN-260901",
          deleted_at: null,
        },
      ],
    },
  );
  assert.deepEqual(resolved.mappings, [
    { shipmentId: "S2609001", bookingNo: "BK-001", bookingId: 11 },
  ]);
});

test("uses a durable historical Shipment-to-Booking link when an HBL was renumbered", () => {
  const resolved = resolveShipmentMappings(
    [entry("S2609003", { liveHbl: "ST2609003" })],
    {
      booking_records: [
        { id: 530, booking_number: "ASC0539708", deleted_at: null },
      ],
      bill_of_lading_records: [
        {
          id: 497,
          booking_id: 530,
          fbl_number: "STVN-260916",
          deleted_at: null,
        },
      ],
      shipment_links: [
        { shipmentId: "S2609003", bookingId: 530, source: "migration-ledger" },
      ],
    },
  );
  assert.deepEqual(resolved.mappings, [
    {
      shipmentId: "S2609003",
      bookingNo: "ASC0539708",
      bookingId: 530,
      preserveHbl: true,
    },
  ]);
  assert.deepEqual(resolved.unresolved, []);
});

test("does not guess when Booking No. and HBL point to different workflows", () => {
  const resolved = resolveShipmentMappings(
    [
      entry("S2609001", {
        bookingNo: "BK-001",
        liveHbl: "HBL-OTHER",
      }),
    ],
    {
      booking_records: [
        { id: 11, booking_number: "BK-001", deleted_at: null },
        { id: 12, booking_number: "BK-002", deleted_at: null },
      ],
      bill_of_lading_records: [
        {
          id: 22,
          booking_id: 12,
          fbl_number: "HBL-OTHER",
          deleted_at: null,
        },
      ],
    },
  );
  assert.equal(resolved.mappings.length, 0);
  assert.match(resolved.unresolved[0].reason, /different Bookings/);
});

test("apply refuses blockers and container deletion unless explicitly acknowledged", () => {
  assert.throws(
    () =>
      assertPlanCanApply(
        { blockers: [{ reason: "Locked BL" }], deletions: [] },
        { allowContainerDeletes: false },
      ),
    /blocking issue/,
  );
  assert.throws(
    () =>
      assertPlanCanApply(
        {
          blockers: [],
          deletions: [{ table: "bill_of_lading_containers", id: 5 }],
        },
        { allowContainerDeletes: false },
      ),
    /allow-container-deletes/,
  );
  assert.doesNotThrow(() =>
    assertPlanCanApply(
      {
        blockers: [],
        deletions: [{ table: "bill_of_lading_containers", id: 5 }],
      },
      { allowContainerDeletes: true },
    ),
  );
});
