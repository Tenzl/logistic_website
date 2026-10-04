import { readLiveField } from "../../../backend2.0/scripts/lib/freightek-reconcile-20260915.mjs";

const clean = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const identity = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();

const sourceUrlFor = (shipmentId) =>
  `https://seatrans.freightek.com/shipments/management/${shipmentId}/instruction`;

export function parseFreightEkDocument(document) {
  if (!document || !Array.isArray(document.entries)) {
    throw new Error("FreightEK JSON must contain an entries array");
  }
  if (document.entries.length === 0) {
    throw new Error("FreightEK JSON contains no entries");
  }
  if (document.entries.length > 2_000) {
    throw new Error("FreightEK JSON exceeds the 2,000-entry safety limit");
  }

  const seen = new Set();
  const entries = [];
  const skipped = [];
  for (const [index, entry] of document.entries.entries()) {
    const shipmentId = clean(entry?.shipmentId);
    if (!shipmentId || !/^S\d{7,}$/i.test(shipmentId)) {
      throw new Error(`entries[${index}] has an invalid shipment ID`);
    }
    const normalizedShipmentId = shipmentId.toUpperCase();
    if (seen.has(normalizedShipmentId)) {
      throw new Error(`Duplicate shipment ID ${normalizedShipmentId}`);
    }
    seen.add(normalizedShipmentId);
    if (entry.sourceUrl !== sourceUrlFor(normalizedShipmentId)) {
      throw new Error(
        `${normalizedShipmentId} does not use the canonical FreightEK instruction route`,
      );
    }
    if (entry.status !== "success") {
      skipped.push({
        shipmentId: normalizedShipmentId,
        reason: `Collection status is ${entry.status ?? "missing"}`,
      });
      continue;
    }
    entries.push({ ...entry, shipmentId: normalizedShipmentId });
  }
  if (!entries.length) {
    throw new Error("FreightEK JSON has no successful entries to process");
  }
  return { entries, skipped };
}

function uniqueRows(rows) {
  return [...new Map(rows.map((row) => [String(row.id), row])).values()];
}

export function resolveShipmentMappings(entries, database) {
  const activeBookings = (database.booking_records ?? []).filter(
    (row) => !row.deleted_at,
  );
  const activeBills = (database.bill_of_lading_records ?? []).filter(
    (row) => !row.deleted_at,
  );
  const bookingsById = new Map(
    activeBookings.map((row) => [String(row.id), row]),
  );
  const mappings = [];
  const unresolved = [];

  for (const entry of entries) {
    const sourceBookingNo = clean(entry.bookingNo);
    const topLevelHbl = clean(entry.hbl);
    const liveHbl = readLiveField(entry, "HBL No.");
    if (topLevelHbl && liveHbl && identity(topLevelHbl) !== identity(liveHbl)) {
      unresolved.push({
        shipmentId: entry.shipmentId,
        bookingNo: sourceBookingNo,
        hbl: liveHbl,
        reason: `Top-level HBL ${topLevelHbl} differs from live HBL ${liveHbl}`,
      });
      continue;
    }
    const hbl = liveHbl ?? topLevelHbl;
    const bookingMatches = sourceBookingNo
      ? activeBookings.filter(
          (row) => identity(row.booking_number) === identity(sourceBookingNo),
        )
      : [];
    const billMatches = hbl
      ? activeBills.filter((row) => identity(row.fbl_number) === identity(hbl))
      : [];
    const hblBookingMatches = uniqueRows(
      billMatches
        .map((row) => bookingsById.get(String(row.booking_id)))
        .filter(Boolean),
    );
    const shipmentBookingMatches = uniqueRows(
      (database.shipment_links ?? [])
        .filter(
          (link) => identity(link.shipmentId) === identity(entry.shipmentId),
        )
        .map((link) => bookingsById.get(String(link.bookingId)))
        .filter(Boolean),
    );

    if (
      bookingMatches.length > 1 ||
      billMatches.length > 1 ||
      shipmentBookingMatches.length > 1
    ) {
      unresolved.push({
        shipmentId: entry.shipmentId,
        bookingNo: sourceBookingNo,
        hbl,
        reason: `Ambiguous database match: ${bookingMatches.length} Bookings, ${billMatches.length} BLs, ${shipmentBookingMatches.length} shipment links`,
      });
      continue;
    }
    const distinctCandidateBookings = uniqueRows([
      ...bookingMatches,
      ...hblBookingMatches,
      ...shipmentBookingMatches,
    ]);
    if (distinctCandidateBookings.length > 1) {
      unresolved.push({
        shipmentId: entry.shipmentId,
        bookingNo: sourceBookingNo,
        hbl,
        reason:
          "Booking No., HBL, or historical Shipment link point to different Bookings",
      });
      continue;
    }
    if (sourceBookingNo && bookingMatches.length === 0) {
      unresolved.push({
        shipmentId: entry.shipmentId,
        bookingNo: sourceBookingNo,
        hbl,
        reason: `Booking No. ${sourceBookingNo} was not found`,
      });
      continue;
    }

    const booking =
      bookingMatches[0] ?? hblBookingMatches[0] ?? shipmentBookingMatches[0];
    if (!booking) {
      unresolved.push({
        shipmentId: entry.shipmentId,
        bookingNo: sourceBookingNo,
        hbl,
        reason: hbl
          ? `No active Booking or BL matched HBL ${hbl}`
          : "JSON has neither a resolvable Booking No. nor HBL",
      });
      continue;
    }
    const preserveHbl = Boolean(
      hbl &&
      shipmentBookingMatches.some(
        (candidate) => String(candidate.id) === String(booking.id),
      ) &&
      hblBookingMatches.length === 0 &&
      activeBills.some(
        (bill) =>
          String(bill.booking_id) === String(booking.id) && bill.fbl_number,
      ),
    );
    mappings.push({
      shipmentId: entry.shipmentId,
      bookingNo: booking.booking_number,
      bookingId: booking.id,
      ...(preserveHbl ? { preserveHbl: true } : {}),
    });
  }

  const duplicatedBookingIds = mappings
    .map((row) => String(row.bookingId))
    .filter((id, index, all) => all.indexOf(id) !== index);
  if (duplicatedBookingIds.length) {
    for (const bookingId of new Set(duplicatedBookingIds)) {
      for (const row of mappings.filter(
        (mapping) => String(mapping.bookingId) === bookingId,
      )) {
        unresolved.push({
          shipmentId: row.shipmentId,
          bookingNo: row.bookingNo,
          hbl: null,
          reason: `Multiple shipments resolve to Booking ID ${bookingId}`,
        });
      }
    }
    const duplicated = new Set(duplicatedBookingIds);
    return {
      mappings: mappings.filter(
        (mapping) => !duplicated.has(String(mapping.bookingId)),
      ),
      unresolved,
    };
  }
  return { mappings, unresolved };
}

const fatalBlocker = (blocker) =>
  /locked|ambiguous|duplicate|identity mismatch|no matching stored container|destination and vessel/i.test(
    blocker?.reason ?? "",
  );

export function partitionPlanBlockers(blockers = []) {
  return {
    fatal: blockers.filter(fatalBlocker),
    warnings: blockers.filter((blocker) => !fatalBlocker(blocker)),
  };
}

export function assertPlanCanApply(
  plan,
  { allowContainerDeletes = false } = {},
) {
  const blockers = partitionPlanBlockers(plan.blockers);
  if (blockers.fatal.length) {
    throw new Error(
      `Plan has ${blockers.fatal.length} blocking issue(s); resolve them before apply`,
    );
  }
  if ((plan.deletions?.length ?? 0) > 0 && !allowContainerDeletes) {
    throw new Error(
      `Plan deletes ${plan.deletions.length} container row(s); review the report and rerun with --allow-container-deletes`,
    );
  }
  return blockers;
}

export function summarizePlan(plan, parsed, resolved) {
  const countByTable = (rows) =>
    rows.reduce((result, row) => {
      result[row.table] = (result[row.table] ?? 0) + 1;
      return result;
    }, {});
  const blockers = partitionPlanBlockers(plan.blockers);
  return {
    successfulEntries: parsed.entries.length,
    skippedEntries: parsed.skipped.length,
    resolvedShipments: resolved.mappings.length,
    unresolvedShipments: resolved.unresolved.length,
    updates: countByTable(plan.updates ?? []),
    inserts: countByTable(plan.inserts ?? []),
    deletions: countByTable(plan.deletions ?? []),
    fatalBlockers: blockers.fatal.length,
    masterDataWarnings: blockers.warnings.length,
  };
}
