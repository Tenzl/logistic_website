# Port Operations experience

Operators plan a call, confirm its arrival at a location, then finalize cargo and depart.

## Decisions
- Three separate entries: Line-up, In port, Departed. Preserve existing URLs and the legacy Berth Operations redirect.
- ETA is a reminder, never an automatic arrival. Line-up prioritizes overdue, today, then future; overdue rows are red and today's rows green using Vietnam calendar dates with text labels.
- Arrive records ATA with the server clock. Capacity and technical checks still apply.
- In port places Type groups horizontally in a compact directory on the left, including empty Berths and pilot stations (PS). The right panel shows the selected location's specifications and vessels. Each vessel has Info, Transfer and Depart; Info contains Edit. Small screens show the detail panel first with a location selector.
- In port shows full vessel counts per location and Type without vessel filters. Selecting a location changes only the detail list.
- A single Cargo quantity (TON) is editable until Depart, then locked by the API and database. Report/export use that finalized value; zero is valid.
- New/Edit is a grouped side panel; child master editors preserve drafts. Move and Depart inputs remain date-only.
- Successful actions stay on the current screen, refresh related data and offer a destination link.

## Evidence and validation
The user explicitly requested manual arrivals, location cards and a single quantity locked at departure. Repository tests and isolated PostgreSQL lifecycle checks validate behavior. A separate mock browser walkthrough confirmed search/occupancy, Arrive into a berth, Move to PS and Depart with zero quantity, including a small viewport. No usage analytics is connected. An operator walkthrough remains necessary to validate usability: find a due vessel, Arrive without a planned location, edit cargo In port, Move to PS, then Depart with zero or positive cargo. Record observed wrong clicks and errors without inventing metrics.

## Boundaries
Preserve permissions and master pickers. Migrations archive previous settings/quantities and reconcile departed totals; do not convert non-TON legacy cargo silently. No waiting queue or map is added. Departed Summary analytics use existing operational records.

## Shared table and simpler Port Operations (2026-10-03)
- Shared tables use 14px text, centered headers and number/date cells, left-aligned text, fixed column widths and ellipsis with hover/keyboard tooltips. Actions are last, centered in the header, right-aligned in cells and sized to their controls.
- Info opens call, vessel and location-history details. Fresh detail reads remain for versioned edits and lifecycle commands. Vessel selection uses the existing master picker.
- Cargo entry is one searchable Commodity selector per row, quantity in TON and Remove. Search lives inside each popup; selected values survive filtered results and retries.
- Load/Discharge/Transit is removed from the operational API/schema. Historical values are retained in cargo_operation_archive; quantities and departure locking are unchanged.

## In port location transfer (2026-10-10)
Transfer on a vessel card opens an inline destination selector. Only active locations in the current port are available, excluding the current location. Transfer vessel fetches the latest call and saves the selected location without a confirmation dialog. Its controls are locked while saving; a failed save displays the reason and retains the destination choice and source vessel. All active locations permit shared occupancy. Existing version/capacity checks remain authoritative. Vessel dragging, drop handlers and drag state are removed. The selector and buttons support keyboard and touch interaction. No polling or new lifecycle state is added.

## Transfer technical warnings
Transfer sends acknowledgeCapacityWarnings=true, preserving the warning behavior requested on 2026-10-04. Missing dimensions/DWT and reception-limit warnings require no extra click; no inline acceptance control remains. Master specifications are not fabricated or changed. Inactive-location, same-port and concurrent-version restrictions remain enforced by the backend.

## DWT validation (2026-10-04)
Port Operations does not check missing vessel DWT/length or compare them against location DWT/length limits when arriving or transferring. Existing DWT master values remain available. Draft, cargo capability, occupancy and active-location checks remain unchanged.


Port Operations (2026-10-04): Line-up replaces Cancel port call with Delete port call. Confirmation removes a PLANNED call from visible queries using deleted_at, preserving cargo, visits and event history. Backend locks and checks the current version and rejects In port/Departed calls or open visits. The existing section audit records deletion; legacy CANCELLED history remains.

In port controls (2026-10-04): removed vessel search and ETA From/To controls. Board always displays all vessels in the selected port, including with legacy filter URLs. Reuses PortSearchSelect with New and Edit hidden, defaulting to Quy Nhon on a fresh visit while honoring explicit port links; Reload and location Transfer remain available.

## Vessel location master (2026-10-09)
Ports & Depots uses a searchable directory and a grouped location editor. Location IDs are immutable; Name is required and unique within a port after trimming and case normalization. Code, Display order and Single vessel are removed from the operational API and port_locations table. Lists use name ordering. All active locations allow multiple vessels; active/same-port/version and historical-reference protections remain. A new audited contract migration saves recovery metadata and verifies location/call/visit/cargo fingerprints.

## In port workspace (2026-10-09)
Type groups sit horizontally in the left directory with location names and counts. The compact right panel contains the selected location's specifications and vessel cards with Info, Transfer and Depart. Info opens a details popup with Edit; Depart reuses cargo finalization. Existing shadcn Card, Button, Badge, Select, Dialog and Tabs and shared tables are reused. Not arrived is removed from code and the operational database. An audited migration archives retired invalid visits/events before dropping reversal metadata, preserving valid history and preventing ghost occupancy.
