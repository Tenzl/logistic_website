# Go Gia Anchorage: nighttime fees

Implemented for canonical `public.ports.id = 48061`, verified against main database on 2026-09-08. Runtime calculations use the ID, not display-name matching.

## Usage

In Parameter, edit Go Gia Anchorage. Section 04 contains the escort tariff; Garbage moves to 05. Select GRT/DWT/LOA and the interval comparison, then enter actual rates. No escort prices were seeded or copied from tug assistance.

In section 2 of Create/Edit EPDA, independently enable Tug escorting, Canoe, and Fuel surcharge. Escort and canoe each use two trips. Fuel increases both tug charges by the entered percentage; canoe excludes fuel. Existing VAT rules apply afterward. Missing prices remain unresolved and prevent locking. Explicit zero is accepted. Changing ports clears these options, and the backend rejects enabling them outside Go Gia.

Quote rows appear below tug assistance as consecutive subrows, such as 5.1 and 5.2. The following main row remains 6. Saved inputs, working tariff parameters, field history and newly locked snapshots include the new values. Existing snapshots are not rewritten.

## Main database migration

Runner: `backend2.0/scripts/run-go-gia-night-fees.mjs`. Reads only `backend2.0/.env`; rejects test/loadtest targets and checks database, schema, connection fingerprint and canonical port identity.

Applied to `postgres/public`, fingerprint `f48c6a576455e88e`. Added five columns to `shipping_agency_inquiries`: three boolean flags defaulting to false and two nullable numeric(18,6) values. All existing fields across 12 inquiries were verified unchanged inside the transaction. There were zero locked snapshots in this database at apply time; frozen-snapshot preservation is also covered by fixtures. No parameter prices or historical JSON documents were rewritten. Existing revisions therefore remain unchanged.

Private backup: `migration-backups/2026-09-08-go-gia-night-fees.json` (git-ignored). It contains full pre-migration inquiry rows. Protect this file as production data.

Run from repository root:

```powershell
node backend2.0/scripts/run-go-gia-night-fees.mjs --dry-run
```

Apply, if needed on the verified target, using a new backup filename:

```powershell
node backend2.0/scripts/run-go-gia-night-fees.mjs --apply --target-db=postgres --fingerprint=f48c6a576455e88e --backup=migration-backups/go-gia-before-apply.json
```

Re-running against the current database is a no-op. Rollback first requires reverting the application code that depends on the new columns. Then:

```powershell
node backend2.0/scripts/run-go-gia-night-fees.mjs --rollback=migration-backups/2026-09-08-go-gia-night-fees.json --target-db=postgres --fingerprint=f48c6a576455e88e --backup=migration-backups/go-gia-before-rollback.json
```

Rollback refuses any intervening inquiry edit, inserted/deleted inquiry, used new field, or configured escort tariff. It drops only columns created by this migration. Both directions use a transaction, table lock, advisory lock, bounded lock timeout, and an exclusive backup file. No rollback was executed against main data.

## Verification

- Frontend: 120 suites, 639 tests passed.
- Backend: 114 suites, 847 tests passed.
- Migration fixtures: 7 tests passed, covering dry-run, repeat application, rollback guards, snapshot preservation and shared tariff behavior.
- Frontend/backend type checks, scoped lint, backend build and isolated Next production build passed.
- Post-apply dry-run reports no pending columns.
- Automated UI tests exercise independent checkbox behavior, visibility and explicit zero; quote tests cover the 1,100 / 440 / 100 USD example and child numbering. Interactive authenticated browser acceptance has not been completed.

Code is updated in the workspace and the main database migration is complete. This report does not assert deployment of frontend/backend artifacts to a remote hosting service.
