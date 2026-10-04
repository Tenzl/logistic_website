# FreightEK shipment collector

Chrome extension for collecting every live instruction-form and per-container
value from FreightEK shipment instruction pages selected by pasted Shipment IDs.
It uses the Chrome
profile that is already logged in; it does not use Playwright, export cookies or
store credentials.

## Captured fields

Each result contains a structured page snapshot grouped by the live FreightEK
section and field label. It reads current `input.value`, `textarea.value`,
select display values, checkbox/radio `checked` state, contenteditable text and
control metadata such as disabled, readonly, required and placeholder. Controls
inside hidden dropdowns/dialogs and duplicate fixed table wrappers are excluded.

The container table remains a separate structured collection. Each container
record retains the source row number and every raw table cell.
The current FreightEK table has 13 named values; an older table variant may add
`Over Weight`, which the collector also captures when present:

1. Type
2. Container No.
3. Seal No.
4. Gross Weight
5. Measurement (CBM)
6. Tare
7. Package type
8. No of Pkgs
9. Net Weight
10. Max Gross Weight
11. VGM
12. Note
13. Method

Optional legacy field: Over Weight.

If the table has multiple pages, the extractor first requests the smallest
available page size that can show the total and otherwise walks the Next button
until every row is collected.

## Load in the existing Chrome

1. Open `chrome://extensions` in the Chrome profile already logged in to
   FreightEK.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose
   `D:\University\Seatrans-website\seatrans\tools\freightek-container-import`.
   The `chrome-extension` subdirectory can also be loaded directly.
4. Open any authenticated `https://seatrans.freightek.com` page.
5. Open the extension and paste your comma-separated list into **Shipment IDs**,
   for example `S2609001, S2609002, S2609003`.
6. Select **Collect entered IDs**.

The tool only collects Shipment IDs you enter. Long lists are supported.
IDs must follow `S` plus seven digits. Spaces around IDs and line
breaks are accepted; lowercase IDs are normalized and duplicates are removed
while keeping their first occurrence. Any invalid ID blocks collection until
it is corrected. The popup shows the number of unique IDs and saves the draft
locally when it is edited.

**Pause** and **Resume** keep the active list and progress. Starting the same
list skips already processed shipments. Starting a different list replaces
the previous progress; use **Export JSON** first if you need those results.
**Reset progress** clears results for the current list.
Booking metadata is retained for IDs in the current list when available;
new IDs can be collected without supplying a Booking No.

After updating the tool, reload its card in `chrome://extensions` and reopen
the popup. Current extension version: **1.4.0**.
Previous fixed queues are archived locally and no longer run or appear as the
active list. A draft matching an old fixed queue is cleared; user-edited drafts
and progress for manually entered lists are retained.

If Chrome previously reported **Manifest file is missing or unreadable** for
the tool folder, click **Retry** or select **Load unpacked** again with the path
above. Both supported directories now contain a `manifest.json`; the root
manifest points to the files in `chrome-extension`.

The extension runs up to **three FreightEK tabs concurrently**. It reuses the
active tab and opens the remaining tabs in the background. Short lists only
open as many tabs as they need. Each tab claims one unprocessed ID from the
shared queue; after finishing, it waits 2.5–4 seconds and claims the next ID
without waiting for the other tabs.

Queue claims and checkpoint writes run through a single serialized transition
chain. An ID that belongs to a worker cannot be assigned to another worker.
Every page read has a unique job ID; incoming progress, results and errors must
match both the assigned tab and job ID. Duplicate or stale responses are ignored.
The popup shows each thread's current shipment and step alongside total progress.

Retries run within the affected thread, up to three attempts. Authentication
callbacks wait fifteen seconds before reopening that thread's shipment.
Pause stops scheduling for all three threads; Resume reuses surviving tabs,
recreates missing tabs and requeues unfinished IDs. Closing a collection tab or
an authentication/reader configuration error pauses the queue until Resume.
Results from completed shipments are preserved. The collector only marks the
queue completed once every ID has a success or terminal failure.

Checkpoints include worker assignments and delayed actions in
`chrome.storage.local`. Pending delays are restored when the service worker
receives another event after restarting. Extension updates and browser restarts
pause collection until you press Resume.

Use **Export JSON** to save a checksummed result file. Database migration is a
separate guarded step and is not performed by this extension.

## Development verification

```powershell
pnpm install --lockfile=false
pnpm test
pnpm run check
```
