# Port Operations legacy line-up sync

The manual sync reads the legacy line-up endpoint for every ID from 104 to the current high-water mark (at least 4398). It never creates Port Calls. It links only a unique match by vessel, local ETA date, port, cargo name, and quantity; all other rows are included in the generated report.

## First-time setup

From `backend2.0`, run the migration preflight:

```powershell
node scripts/run-port-operations-legacy-lineup-migration.mjs
```

Apply it only to the database configured in `.env` by passing that exact database name and the confirmation token printed in the script:

```powershell
node scripts/run-port-operations-legacy-lineup-migration.mjs --apply --target-db=<database-name> --confirm=APPLY_PORT_OPERATIONS_LEGACY_LINEUP_20261001
```

Preview the source-to-Port-Call matching and berth assignments:

```powershell
node scripts/run-port-operations-legacy-lineup-sync.mjs --plan
```

Apply a fresh scan after reviewing the report:

```powershell
node scripts/run-port-operations-legacy-lineup-sync.mjs --apply
```

## Rules

- `Ngay2` is ETA. Dates before today in `Asia/Ho_Chi_Minh` become `DEPARTED`; today and future become `PLANNED`.
- The sync does not infer ATD or overwrite cargo/agency/customer. ETA changes are recorded in schedule history; each source row and status action is annotated with the legacy API ID.
- A known berth code creates a one-day assignment based on the ETA date. Past calls become `COMPLETED` assignments with `times_inferred=true`; current/future calls become `PLANNED` assignments.
- Missing points, missing berth master, conflicts, no match, and ambiguous match are reported rather than guessed. Berth master rows are never created by this sync.
- The sync can be rerun. Source IDs are unique in staging and assignments; Port Calls are never inserted.

Reports are written to `migration-backups/port-operations-legacy-lineup-<mode>-<timestamp>.json` in the repository root.
