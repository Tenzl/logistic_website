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

## In port drag and drop validation
Automated checks cover immediate moves, fresh versions, blocked locations, shared occupancy, stale calls, duplicate drops, save failures and board refresh. Operator/browser validation remains pending: drag from any non-button area of a vessel card from PS to Berth, test a full location and verify errors preserve its current location. Validate keyboard/touch transfer separately.

Transfer tests verify automatic technical-warning acknowledgment on the first request and no confirmation UI. Operator validation: drag into a berth with incomplete dimensions and verify occupied single-vessel or inactive locations remain blocked.


Port Operations (2026-10-04): Line-up replaces Cancel port call with Delete port call. Confirmation removes a PLANNED call from visible queries using deleted_at, preserving cargo, visits and event history. Backend locks and checks the current version and rejects In port/Departed calls or open visits. The existing section audit records deletion; legacy CANCELLED history remains.

In port controls (2026-10-04): removed vessel search and ETA From/To controls. Board always displays all vessels in the selected port, including with legacy filter URLs. Reuses PortSearchSelect with New and Edit hidden, defaulting to Quy Nhon on a fresh visit while honoring explicit port links; Reload and location drag/drop remain available.
