# Service Inquiry System – Step-by-Step Guide

## 1) Database Migration
1. Create file `database/init_inquiry_system.sql` with the schema (service_inquiries + shipping_agency_inquiries + chartering_broking_inquiries + freight_forwarding_inquiries + indexes). Use the latest script from the design notes.
2. Run the script on your MySQL instance.
3. Verify tables:
   - `SHOW TABLES LIKE '%inquiries';`
   - `DESCRIBE service_inquiries;`

## 2) Domain Models (Entities)
1. Enum `InquiryStatus` with: PENDING, PROCESSING, QUOTED, COMPLETED, CANCELLED.
2. Entity `ServiceInquiry` (common fields): id, serviceType (FK), fullName, contactInfo, status (enum), submittedAt, updatedAt, processedBy (FK user), notes. Annotations: `@Entity`, `@Table`, `@Id @GeneratedValue`, `@ManyToOne` serviceType, `@Enumerated` status.
3. Service-specific entities (each `@OneToOne` with ServiceInquiry via `@JoinColumn(name = "inquiry_id")`, cascade ALL):
   - `ShippingAgencyInquiry`: dwt, grt, loa, cargoType, cargoQuantity, portId (FK ports), portOfCall, portName, otherInfo.
   - `CharteringBrokingInquiry`: cargoQuantity, loadingPort, dischargingPort, laycanFrom, laycanTo, otherInfo.
   - `FreightForwardingInquiry`: cargoName, deliveryTerm, container20ft (int), container40ft (int), loadingPort, dischargingPort, shipmentFrom, shipmentTo.

## 3) DTOs
1. Request DTOs (validate with `@NotNull/@NotBlank/@Email/@Min`…):
   - `ShippingAgencyInquiryRequest`
   - `CharteringBrokingInquiryRequest`
   - `FreightForwardingInquiryRequest`
2. Response DTO `InquiryResponse` (flattened, includes common fields + detail fields as needed). Optionally separate response DTOs per service.

## 4) Repositories
- `InquiryRepository extends JpaRepository<ServiceInquiry, Long>` with finders: byServiceTypeId, byStatus, byServiceTypeIdAndStatus(Pageable).
- Detail repos as needed: `ShippingAgencyInquiryRepository`, `CharteringBrokingInquiryRepository`, `FreightForwardingInquiryRepository` (JpaRepository<Entity, Long>).

## 5) Service Layer
- Interface `InquiryService` with methods: submitShippingAgency(...), submitChartering(...), submitFreightForwarding(...), getAll(...), updateStatus(...), delete(...).
- Implementation `InquiryServiceImpl` (annotate `@Service`, methods `@Transactional`).
- Sample flow for submitShippingAgency:
  1) Map request -> ServiceInquiry (set serviceTypeId, fullName, contactInfo, status=PENDING).
  2) Map request -> ShippingAgencyInquiry detail.
  3) Link detail to inquiry (`inquiry.setShippingAgencyDetail(detail)`; detail.setInquiry(inquiry)).
  4) `inquiryRepository.save(inquiry);` (cascade saves detail).
  5) Convert to response DTO and return.

## 6) Controllers (REST)
- Public (no auth): `@RestController @RequestMapping("/api/inquiries")`
  - POST `/shipping-agency`
  - POST `/chartering-broking`
  - POST `/freight-forwarding`
- Admin (auth): `@RestController @RequestMapping("/api/admin/inquiries")`
  - GET list with optional filters: serviceTypeId, status, pageable
  - PUT `/{id}/status` to update status
  - DELETE `/{id}` to remove inquiry (and cascade detail)

## 7) Frontend Types & Service (TS)
1. Define request types matching backend DTOs (one per service) in `src/features/inquiry/types/`.
2. Create `inquiryService.ts` with functions calling `/api/inquiries/...` using `fetch`/`axios` and JSON body.

## 8) Wire Up Forms (Next.js)
- In each service config component (ShippingAgencyConfig, CharteringBrokingConfig, FreightForwardingConfig), replace the current `onSubmit` console.log with an async call to the matching inquiryService function.
- Handle success/error with toast, and optionally reset form.

## 9) Admin UI (optional but recommended)
- Create `ManageInquiriesTab.tsx` to list inquiries with filters (service type, status), pagination, and actions (view detail, update status, delete).
- Add detail dialog to show all fields (common + service-specific) and allow status updates/notes.

## 10) Testing Checklist
- Backend: unit tests for service mapping, integration tests for controllers (happy path + validation errors).
- Frontend: submit each form, verify records in DB; test validation messages.
- Performance: ensure indexes exist (status, service_type_id, submitted_at, route, shipment_from/to).

## Build Order Recommendation
1) Database migration
2) Entities + Enums
3) DTOs
4) Repositories
5) Service implementation
6) Controllers
7) Frontend types + API service
8) Hook forms to API
9) Admin UI
10) Tests
