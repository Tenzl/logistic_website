# Freightek JSON bookings missing from database

## Reconciliation result

- Checked on: 2026-09-07
- Source: `C:/Users/DEV/Downloads/seatrans/freightek-shipments-2026-08-21T01-01-06-854Z.json`
- Successful JSON entries: 310
- Unique JSON booking numbers: 310
- Active database booking records: 319
- JSON bookings missing from the database: **0**

## Missing bookings

None. All 310 booking numbers in the JSON file currently have a matching active record in `booking_records`.

## Matching rule

Booking numbers were trimmed, converted to uppercase, and internal whitespace was removed before comparison. Soft-deleted records were checked separately; the database currently has no JSON booking that matches only a soft-deleted record.

## Note

Any earlier missing-booking list is now stale because the current database contains all 310 booking numbers from the JSON export.
