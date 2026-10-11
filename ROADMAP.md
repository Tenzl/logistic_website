# Port Operations UX roadmap

Direction: [PRODUCT.md](PRODUCT.md).

## Now
Deliver manual Arrive, ETA priority/colors, a location board and one fixed TON quantity locked at Depart. Remove the old worker, duplicate quantity handling and In port table/panel. Validate migration rollback, occupancy concurrency, filtering and Report exports.

The shared table presentation and simplified Port Operations forms are implemented. Verify long names, keyboard tooltips, inline Commodity search/retry and cargo entry with an operator. Cargo operation types have an audited removal migration and rollback.

## Next
Run the PRODUCT.md tasks with an operator. Record wrong-screen navigation, missed ETA alerts, hidden-occupancy misunderstandings and draft loss; adjust based on observations.

## Later
Consider a waiting queue or visual port map if the location board cannot answer real capacity-planning questions.

## Review rule
Keep verified decisions and distinguish automated correctness checks from user validation. No production analytics collection is added.

## In port transfer validation
Automated checks cover inline Transfer, fresh versions, inactive destinations, shared occupancy, stale calls, duplicate saves, retained choices after save failures, cancellation and board refresh. Desktop and mobile browser previews verify selecting a destination and canceling the form with sample data. An operator walkthrough with live calls remains pending: use Transfer from PS to Berth, test an occupied location and verify errors preserve the current location. Validate keyboard/touch saving with an operator.

Transfer tests verify automatic technical-warning acknowledgment on the first request and no confirmation UI. Operator validation: transfer into a berth with incomplete dimensions and verify inactive locations remain unavailable and occupied active locations accept another vessel.


Port Operations (2026-10-04): Line-up replaces Cancel port call with Delete port call. Confirmation removes a PLANNED call from visible queries using deleted_at, preserving cargo, visits and event history. Backend locks and checks the current version and rejects In port/Departed calls or open visits. The existing section audit records deletion; legacy CANCELLED history remains.

In port controls (2026-10-04): removed vessel search and ETA From/To controls. Board always displays all vessels in the selected port, including with legacy filter URLs. Reuses PortSearchSelect with New and Edit hidden, defaulting to Quy Nhon on a fresh visit while honoring explicit port links; Reload and location Transfer remain available.

In port redesign (2026-10-09): grouped location specifications/counts, selected-vessel panel, Info → Edit and Depart implemented. Arrival reversal is removed from runtime and the configured database, with affected history archived and valid data fingerprints preserved. Operator review should validate finding a vessel by location, reading details, retaining an edit draft after a version conflict, and departing with actual cargo.
