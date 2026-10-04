# Port Operations experience

Operators plan a call, confirm its arrival at a location, then finalize cargo and depart.

## Decisions
- Three separate entries: Line-up, In port, Departed. Preserve existing URLs and the legacy Berth Operations redirect.
- ETA is a reminder, never an automatic arrival. Line-up prioritizes overdue, today, then future; overdue rows are red and today's rows green using Vietnam calendar dates with text labels.
- Arrive records ATA with the server clock. Capacity and technical checks still apply.
- In port shows all location types as cards, including empty Berths and pilot stations (PS). Every vessel in a shared location has its own actions.
- Filters hide vessel cards but never reduce occupancy counts. Explain hidden vessels explicitly.
- A single Cargo quantity (TON) is editable until Depart, then locked by the API and database. Report/export use that finalized value; zero is valid.
- New/Edit is a grouped side panel; child master editors preserve drafts. Move and Depart inputs remain date-only.
- Successful actions stay on the current screen, refresh related data and offer a destination link.

## Evidence and validation
The user explicitly requested manual arrivals, location cards and a single quantity locked at departure. Repository tests and isolated PostgreSQL lifecycle checks validate behavior. A separate mock browser walkthrough confirmed search/occupancy, Arrive into a berth, Move to PS, Not arrived and Depart with zero quantity, including a small viewport. No usage analytics is connected. An operator walkthrough remains necessary to validate usability: find a due vessel, Arrive without a planned location, edit cargo In port, Move to PS, Not arrived, then Arrive and Depart with zero or positive cargo. Record observed wrong clicks and errors without inventing metrics.

## Boundaries
Preserve permissions and master pickers. Migrations archive previous settings/quantities and reconcile departed totals; do not convert non-TON legacy cargo silently. No waiting queue, map or analytics system is added.

## Shared table and simpler Port Operations (2026-10-03)
- Shared tables use 14px text, centered headers and number/date cells, left-aligned text, fixed column widths and ellipsis with hover/keyboard tooltips. Actions are last, centered in the header, right-aligned in cells and sized to their controls.
- Port Call detail viewing is removed; fresh detail reads remain for versioned edits and lifecycle commands. Vessel selection no longer shows a separate technical-details block.
- Cargo entry is one searchable Commodity selector per row, quantity in TON and Remove. Search lives inside each popup; selected values survive filtered results and retries.
- Load/Discharge/Transit is removed from the operational API/schema. Historical values are retained in cargo_operation_archive; quantities and departure locking are unchanged.

## In port location drag and drop (2026-10-03)
The whole vessel card is draggable on desktop. A drop loads the latest call and immediately saves the new location; no confirmation dialog or Move location button remains. Only the moving card is locked while saving; a failed save displays the reason without moving it. Inactive, current and occupied single-vessel locations reject drops, counting vessels hidden by filters. Existing version/capacity checks remain authoritative. Native drag-and-drop requires a supported pointer/browser; touch and keyboard transfer need separate validation. No polling or new lifecycle state is added.

## Transfer technical warnings
Dragging a vessel transfers immediately and sends acknowledgeCapacityWarnings=true, as requested on 2026-10-04. Missing dimensions/DWT and reception-limit warnings require no extra click; no inline acceptance control remains. Master specifications are not fabricated or changed. Occupancy, inactive-location and concurrent-version restrictions remain enforced by the backend.

## DWT validation (2026-10-04)
Port Operations does not check missing vessel DWT/length or compare them against location DWT/length limits when arriving or transferring. Existing DWT master values remain available. Draft, cargo capability, occupancy and active-location checks remain unchanged.


Port Operations (2026-10-04): Line-up replaces Cancel port call with Delete port call. Confirmation removes a PLANNED call from visible queries using deleted_at, preserving cargo, visits and event history. Backend locks and checks the current version and rejects In port/Departed calls or open visits. The existing section audit records deletion; legacy CANCELLED history remains.

In port controls (2026-10-04): removed vessel search and ETA From/To controls. Board always displays all vessels in the selected port, including with legacy filter URLs. Reuses PortSearchSelect with New and Edit hidden, defaulting to Quy Nhon on a fresh visit while honoring explicit port links; Reload and location drag/drop remain available.
