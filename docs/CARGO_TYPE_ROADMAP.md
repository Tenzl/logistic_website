# Cargo Type Implementation Roadmap (Backend -> Frontend)

## Goal
Add a new field cargoType for commodity/image type management with exactly 2 allowed values:
- IN_BULK (display: in bulk)
- IN_BAG_PACK (display: in bag/pack)

This roadmap is split into phases so the rollout is safe and testable end-to-end.

## Scope
- Database schema + migration
- Backend entity, DTO, validation, API responses
- Backend business rules and compatibility behavior
- Frontend types, forms, filtering, display text
- Testing and rollout

## Non-Goals
- No redesign of existing commodity module
- No breaking API version bump unless required

## Progress Update (2026-03-15)
- Status: In progress
- Completed:
  - Backend model + DTO + mapper wired with cargoType
  - Admin commodity UI wired with cargoType selector and table column
  - Create EPDA cargo type restricted to 2 values and cargo name loaded from DB by selected type
  - Manual SQL migration script added at docs/sql/2026-03-15_add_cargo_type_to_image_types.sql
  - Data sync SQL for Shipping Agency commodity names/cargo types added at docs/sql/2026-03-15_sync_shipping_agency_commodities.sql
  - Hard replace SQL added at docs/sql/2026-03-15_replace_shipping_agency_commodities.sql
- In progress:
  - Backend validation polish + error messaging consistency
  - Execute SQL on target database and verify final catalog
- Pending:
  - Automated tests for backend/frontend
  - Production rollout sequence

## Progress Update (2026-03-17)
- Status: In progress (new UX flow)
- Phase A (done):
  - Added cargo type catalog SQL script: `docs/sql/2026-03-17_create_cargo_type_catalog.sql`
  - Catalog now includes `service_type_type` discriminator for separating cargo type sets by service
  - Added migration helper for existing catalog table: `docs/sql/2026-03-17_alter_cargo_types_add_service_type_type.sql`
  - Added migration to expand `image_types.cargo_type` to dynamic string: `docs/sql/2026-03-17_expand_image_type_cargo_type_to_varchar.sql`
  - Added ready-to-run seed by service type type: `docs/sql/2026-03-17_seed_cargo_types_by_service_type.sql`
- Phase B (done):
  - Admin commodity UI removed cargo type input from add/edit form in `ImageTypeManagement`
  - Cargo type is now shown as badge in table rows (read-only from existing record)
- Phase C (done):
  - Replaced commodity list heading with cargo-type badge controls
  - Clicking each cargo-type badge filters commodity list by selected cargo type
  - Added `All` badge to clear cargo-type filter
- Phase D (done):
  - Backend removed fixed `CargoType` enum and now stores cargo type as dynamic string
  - Added admin API `GET /api/v1/admin/image-types/cargo-types` with `serviceTypeId` / `serviceTypeType` filtering
  - Frontend now fetches cargo type badges dynamically from catalog API by selected service type
- Phase E (pending):
  - Add tests for badge filter flow and create/update behavior after removing cargo type input

---

## Phase 0 - Design Lock
### What to do
- Confirm technical values stored in DB: IN_BULK, IN_BAG_PACK
- Confirm display labels in UI: in bulk, in bag/pack
- Decide nullability strategy for existing rows:
  - Option A: temporarily nullable, then backfill + enforce NOT NULL
  - Option B: set default immediately (IN_BULK) and enforce NOT NULL
- Decide whether this applies only to image_types (current commodities source) or additional tables.

### Deliverables
- Final value mapping table approved
- Migration strategy approved

### Acceptance Criteria
- Team agrees on enum values, defaults, and nullability before coding

---

## Phase 1 - Database Migration
### What to do
- Add column cargo_type to image_types
- Constrain allowed values to exactly two options

### Suggested SQL (PostgreSQL)
```sql
ALTER TABLE image_types
ADD COLUMN cargo_type VARCHAR(20);

UPDATE image_types
SET cargo_type = 'IN_BULK'
WHERE cargo_type IS NULL;

ALTER TABLE image_types
ALTER COLUMN cargo_type SET NOT NULL;

ALTER TABLE image_types
ADD CONSTRAINT chk_image_types_cargo_type
CHECK (cargo_type IN ('IN_BULK', 'IN_BAG_PACK'));
```

### Optional optimization
- Add index if filtering by cargo type is frequent:
```sql
CREATE INDEX idx_image_types_cargo_type ON image_types (cargo_type);
```

### Deliverables
- Versioned migration script committed
- Rollback script prepared

### Acceptance Criteria
- Schema applied successfully
- Existing data backfilled without nulls
- Constraint blocks invalid values

---

## Phase 2 - Backend Domain Model
### What to do
- Add enum in backend (example: CargoType { IN_BULK, IN_BAG_PACK })
- Add field to entity (ImageTypeEntity) mapped to cargo_type
- Update request/response DTOs:
  - CreateImageTypeRequest
  - ImageTypeDTO
- Update mapper (EntityMapper) to map cargoType both directions

### Validation rules
- Reject null/unknown cargo type on create and update
- Return clear validation message for invalid values

### Deliverables
- Entity + DTO + mapper updates
- Validation annotations or service-layer checks

### Acceptance Criteria
- API returns/stores cargo type correctly
- Invalid values are rejected with 4xx

---

## Phase 3 - Backend Service and API Behavior
### What to do
- Update ImageTypeAdminService#createImageType and update method to persist cargoType
- Keep duplicate checks logic intact (name + serviceTypeId)
- Ensure list/get endpoints include cargoType in payload
- Optional: add query param filter by cargo type for admin/public endpoints

### Compatibility
- If old clients omit cargoType, define transition behavior:
  - During transition window: fallback to default IN_BULK
  - After cutoff: require explicit field

### Deliverables
- Service logic updated
- API contract documented

### Acceptance Criteria
- CRUD works with cargo type end-to-end
- No regression in existing commodity flow

---

## Phase 4 - Frontend Data Layer
### What to do
- Update frontend types/interfaces for image type payloads
- Add cargo type to create/update request objects
- Add constants/mapping utility:
  - IN_BULK -> in bulk
  - IN_BAG_PACK -> in bag/pack

### Deliverables
- Updated TypeScript types and services

### Acceptance Criteria
- FE service calls compile and include new field

---

## Phase 5 - Frontend UI (Commodity Management)
### What to do
- In commodity form (Manage Commodity Types), add Cargo Type selector with 2 options:
  - in bulk
  - in bag/pack
- Show cargo type column in list/table
- Enable edit of cargo type
- Optional: add filter chips/dropdown by cargo type

### UX details
- Default selection aligned with backend default (recommended: in bulk)
- Validation message when not selected (if required in FE)

### Deliverables
- Updated admin commodity management UI

### Acceptance Criteria
- User can create/edit/delete commodity type with cargo type visible and persisted

---

## Phase 6 - Testing
### Backend tests
- Migration test: column exists, constraints enforced
- Service tests:
  - create with IN_BULK and IN_BAG_PACK
  - reject invalid value
  - update preserves/changes cargo type correctly

### Frontend tests
- Form submits selected cargo type
- Table renders label correctly
- Edit flow updates cargo type

### Manual E2E checklist
- Create commodity type with each cargo type
- Reload page and verify persisted value
- Update cargo type and verify changes
- API response contains expected enum value

### Acceptance Criteria
- All tests pass
- No regression in commodity/image flow

---

## Phase 7 - Rollout and Observability
### What to do
- Deploy migration first, then backend, then frontend
- Monitor API validation errors and DB constraint violations
- Prepare quick rollback path:
  - frontend rollback
  - backend rollback
  - DB rollback (if safe and planned)

### Acceptance Criteria
- Stable deployment with no blocking errors
- No data inconsistency for cargo_type

---

## Suggested Implementation Order (Practical)
1. DB migration + backfill
2. Backend enum/entity/DTO/mapper/service
3. Backend tests
4. Frontend types/services
5. Frontend UI updates
6. E2E validation and release

## Risk Notes
- Existing records without cargo type must be backfilled before NOT NULL enforcement
- FE and BE must agree on enum values exactly (IN_BULK, IN_BAG_PACK)
- If backend enforces immediately, old FE clients may fail create/update requests

## Quick API Contract Example
### Create request payload
```json
{
  "serviceTypeId": 1,
  "name": "BULK_CARRIER",
  "displayName": "Bulk Carrier",
  "description": "...",
  "requiredImageCount": 18,
  "cargoType": "IN_BULK"
}
```

### Response payload snippet
```json
{
  "id": 10,
  "serviceTypeId": 1,
  "name": "BULK_CARRIER",
  "displayName": "Bulk Carrier",
  "requiredImageCount": 18,
  "cargoType": "IN_BULK",
  "isActive": true
}
```
