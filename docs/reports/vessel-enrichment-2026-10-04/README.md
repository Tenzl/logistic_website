# Vessel master enrichment — 2026-10-04

Reviewed 1,541 vessel masters. The update plan fills verified empty fields for 582 vessels; 959 vessels are left unchanged because no sufficiently reliable identity match was established. Existing nonempty values are preserved. This is a partial enrichment: a matched IMO does not imply that every technical specification is available.

## Sources and matching

- [IACS Vessels in Class](https://iacs.org.uk/membership/vessels-in-class): official Equasis-to-IACS dataset dated 2026-10-02. Match normalized current names exactly, require a single IMO and a Delivered classification record. Reject duplicate database identities and invalid IMO checksums.
- [ClassNK register](https://www.classnk.or.jp/register/): verify both vessel name and IMO before recording flag, call sign, vessel type, overall length, moulded breadth, summer draught and deadweight. Changed-name and unavailable records do not supply technical fields. Per-vessel source links are in `plan.json` and `applied.json`.
- ANA OCEAN: corroborated with [VesselFinder](https://www.vesselfinder.com/vessels/details/9441415), [MaritimeOptima](https://maritimeoptima.com/public/vessels/pages/imo%3A9441415/mmsi%3A636024239/STAR_RUNNER.html), [MyShipTracking](https://www.myshiptracking.com/vessels/ana-ocean-mmsi-636024239-imo-9441415) and [MarineTraffic](https://www.marinetraffic.com/en/ais/details/ships/shipid:713536/mmsi:636024239/imo:9441415/vessel:ANA_OCEAN). Record IMO 9441415, call sign 5LRQ7, Liberia, Bulk Carrier, DWT 57,809 and LOA 188.58 m. Leave breadth and design draught blank because the available values were not sufficiently corroborated.

MarineTraffic was checked in a separate Edge tab using the existing signed-in session. The vessel overview and search are accessible; the detailed Vessel characteristics sections display Locked content / Upgrade. No subscription changes were made and no private account data is included in the audit. Current AIS draught is deliberately excluded from static vessel master draught.

## Audit and validation

- `before.json`: database snapshot before enrichment.
- `plan.json`: selected fields and source links; `skipped.json`: unmatched or excluded records.
- `dry-run.json`: transactional update rehearsal followed by rollback (582 vessels, 2,590 fields). MarineTraffic subsequently corroborated ANA OCEAN LOA, adding one field to the final plan.
- `applied.json`: exact before/after rows, sources and commit status. Final intended count: 582 vessels and 2,591 fields, subject to concurrent-edit guards.
- `verification.json`: post-commit comparison of every vessel name, enrichment field, version and active flag against the expected snapshot plus applied changes.

The script uses parameterized SQL, row locks, an advisory transaction lock, IMO duplicate checks and version guards. It does not create or delete vessel records. Database decimal precision is retained; source precision remains in the audit. Enrichment does not re-enable DWT or length validation in Port Operations.

From `backend2.0`, use `node scripts/enrich-verified-vessels-20261004.mjs --verify` to recheck the recorded result. The script also contains an explicit `--rollback` mode which restores only changed fields when the saved post-update version still matches; it has not been executed against the committed enrichment. Do not rerun `--apply`: an existing applied audit blocks duplicate application.
