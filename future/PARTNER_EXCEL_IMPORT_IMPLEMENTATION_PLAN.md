# PARTNER EXCEL IMPORT IMPLEMENTATION PLAN

Date: 2026-03-28
Scope: Them tinh nang import Partner bang file Excel (.xlsx), va thiet ke bo function chung de tai su dung cho cac module khac.

## 1) Muc tieu

- Cho phep admin INTERNAL import nhieu Partner tu file `.xlsx`.
- Co che xem truoc (preview) truoc khi commit vao DB.
- Tach phan logic chung thanh reusable function (frontend + backend) de dung lai cho cac thuc the khac (Customer, Port, Office, ...).
- Bao toan quy tac business hien tai cua Partner (`customerId` backend tu sinh, validate enum, required fields).

## 2) Nguyen tac thiet ke reusable

- Chung hoa theo 3 lop:
1. `ExcelReader` (doc file va convert sang row object)
2. `RowMapper<T>` (map row object -> DTO domain)
3. `ImportExecutor<T>` (validate, upsert/create, tra ket qua)

- Moi module chi can cung cap:
1. `template schema` (danh sach cot)
2. `mapper` (mapping theo module)
3. `validator` (rule module)
4. `persist handler` (create/update service)

## 3) Kien truc de xuat

## 3.1 Frontend (xlsx)

- Su dung `xlsx` de doc file local va hien preview so bo.
- Function chung:
  - `parseExcelFile(file: File): Promise<Array<Record<string, string>>>`
  - `normalizeHeader(header: string): string`
  - `validateTemplateHeaders(requiredHeaders: string[], actualHeaders: string[]): ValidationResult`
- UI chung:
  - Reusable component `ExcelImportDialog`.
  - Truyen vao `entityConfig` (title, required headers, sample template, api endpoint).

Quy tac preview:
- Frontend preview chi de check nhanh dinh dang file/header va hien row tho.
- Ket qua preview chinh thuc (validate business, mapping, duplicate, mode behavior) phai lay tu backend `POST /preview`.
- UI luon uu tien hien ket qua tu backend neu co sai lech voi parse client.

## 3.2 Backend (Apache POI)

- Su dung Apache POI de parse file tren server (nguon su that de validate + save).
- Function chung:
  - `ExcelImportService.parse(MultipartFile file, ExcelImportSchema schema)`
  - `ExcelImportService.validateRows(List<Map<String, String>> rows, RowValidator validator)`
  - `ExcelImportService.execute(List<Map<String, String>> rows, RowImporter importer)`

- Pattern interface:
  - `RowValidator` -> validate tung row, tra list error.
  - `RowImporter` -> map row va goi service create/update.

## 4) Package can cai

## 4.1 Frontend

- Da co `xlsx` (neu mat thi cai lai):

```bash
cd frontend
npm install xlsx
```

## 4.2 Backend

Them vao [backend/pom.xml](backend/pom.xml):

```xml
<dependency>
  <groupId>org.apache.poi</groupId>
  <artifactId>poi-ooxml</artifactId>
  <version>5.4.0</version>
</dependency>
```

Sau do build:

```bash
cd backend
mvn -q -DskipTests compile
```

## 5) API contract de xuat (Partner)

Base: `/api/v1/admin/booking-management/partners/import`

1. `POST /preview` (multipart)
- Input: `file`
- Output:
  - headers detect duoc
  - rows parse duoc
  - rowErrors theo index
  - summary (total, valid, invalid)

2. `POST /commit` (multipart)
- Input: `file`, optional `mode=CREATE_ONLY|UPDATE_ONLY|UPSERT`
- Output:
  - `createdCount`, `updatedCount`, `failedCount`
  - danh sach loi theo dong

Dinh nghia mode:
- `CREATE_ONLY`: chi tao moi; neu record da ton tai thi fail row.
- `UPDATE_ONLY`: chi cap nhat record ton tai; neu khong tim thay thi fail row.
- `UPSERT`: co thi update, khong co thi create.

3. `GET /template`
- Output: file mau `.xlsx` hoac JSON schema cot.

## 6) Mapping template Partner

Field delta (so voi schema cu):
- Bo toan bo nhom truong invoice company: `invoice_company_name`, `invoice_company_address`, `invoice_company_phone`, `invoice_company_fax`, `invoice_company_email`.
- Doi ten `invoice_tax_number` thanh `tax_number`.
- Bo sung truong `fax` (tach rieng voi `phone`).

Required columns:
- `name`
- `addition_types`

Optional columns:
- `tax_number`
- `country`
- `city`
- `contact_email`
- `phone`
- `fax`
- `tracking_url`
- `address`
- `customer_status`
- `customer_type`

Business rules khi import:
- Khong cho import `customer_id`; backend tu generate.
- `addition_types` tach boi dau `,` hoac `|`.
- `customer_status` chi nhan `LEAD|WINCLIENT`.
- `customer_type` chi nhan `AGENT|DIRECT|OTHER`.
- Email/URL validate nhu form CRUD.
- `tax_number` mac dinh de optional cho import; neu business chot bat buoc thi bat qua feature flag/rule config rieng.

Header mapping va alias policy:
- Normalize header theo quy tac: lowercase + trim + thay space/dash bang underscore.
- Chap nhan alias tuong duong, vi du:
  - `addition_types`, `addition types`, `Addition Types`
  - `contact_email`, `contact email`, `Contact-Email`
  - `tax_number`, `tax number`, `Tax-Number`
- Fail template chi khi khong map duoc ve canonical key trong schema.

Duplicate detection policy:
- Duplicate check trong cung file la co che canh bao ho tro, khong la dieu kien chan tuyet doi.
- Khong hard-code business key theo `name + tax_number` neu chua duoc nghiep vu xac nhan.
- Can chot `match key` cho `UPDATE_ONLY/UPSERT` qua cau hinh (vi du: tax_number, contact_email, tracking_url, hoac rule ket hop) truoc khi implement production.

## 7) Ke hoach trien khai theo phase

## Phase A - Shared foundation

- Tao package chung backend:
  - `shared/importing/excel/ExcelImportService.java`
  - `shared/importing/excel/ExcelImportSchema.java`
  - `shared/importing/excel/ImportRowError.java`
  - `shared/importing/excel/ImportSummary.java`
- Tao utility chung frontend:
  - `frontend/src/shared/utils/excelImport.ts`
  - `frontend/src/shared/components/import/ExcelImportDialog.tsx`

Deliverable:
- Da co reusable core cho parse + validate + report.

## Phase B - Partner integration

- Backend:
  - Tao `PartnerImportMapper` + `PartnerImportValidator`.
  - Them endpoint preview/commit/template trong controller Partner.
- Frontend:
  - Them nut `Import Excel` trong PartnerManagementTab.
  - Mo dialog preview + commit.

Deliverable:
- Import Partner chay duoc tu dau den cuoi.

## Phase C - Hardening

- Gioi han kich thuoc file (`<=10MB`) va so dong (`<=5000`, config).
- Chong duplicate dong trong cung file theo co che canh bao (warning) dua tren `match key` da duoc cau hinh.
- Batch insert theo chunk (`100` rows/chunk).
- Log import audit (`importedBy`, `importedAt`, `fileName`).

Transaction/commit behavior (chot):
- Mac dinh `partial success`: row sai fail row do, row dung van commit.
- Xu ly theo chunk de toi uu hieu nang, nhung khong rollback toan file khi mot vai row loi.
- Response tra day du `createdCount`, `updatedCount`, `failedCount` va danh sach loi theo `rowIndex`.

Deliverable:
- On dinh cho production.

## Phase D - Reuse cho module khac

- Tao `entity import config` pattern:
  - `headers`
  - `mapper`
  - `validator`
  - `executor`
- Ap dung thu cho 1 module tiep theo (vi du Office).

Deliverable:
- Chung hoa import flow cho he thong.

## 8) Danh sach viec sap lam (task list)

1. Add dependency `poi-ooxml` vao [backend/pom.xml](backend/pom.xml).
2. Tao shared backend excel import core (`shared/importing/excel/*`).
3. Tao Partner import service + DTO response summary.
4. Them API `preview`, `commit`, `template` cho Partner.
5. Tao frontend utility parse/preview (`excelImport.ts`).
6. Tao reusable `ExcelImportDialog` component.
7. Tich hop nut `Import Excel` vao [frontend/src/features/admin/components/PartnerManagementTab.tsx](frontend/src/features/admin/components/PartnerManagementTab.tsx).
8. Test end-to-end voi file mau.
9. Viet test backend cho validate + commit + permission.

## 9) Test plan

- Backend:
  - Import file hop le -> tao ban ghi thanh cong.
  - Import file sai header -> tra loi chi tiet loi.
  - Import enum sai -> row error dung cot.
  - Anonymous/EXTERNAL goi API -> bi chan.
- Frontend:
  - Chon file khong phai `.xlsx` -> chan tai client.
  - Preview hien dung tong so row va loi.
  - Preview cuoi cung phu hop ket qua backend `/preview`.
  - Commit xong refresh table.

## 10) Trien khai (deployment checklist)

1. Merge code + migration (neu co bang log import).
2. Run build:

```bash
cd backend
mvn -q -DskipTests compile

cd ../frontend
npm run build
```

3. Deploy backend truoc, frontend sau.
4. Smoke test 3 API import (preview/commit/template).
5. Import 1 file nho tren production-like env de xac nhan.

## 11) Rollback strategy

- Feature flag UI: an nut Import neu backend chua san sang.
- Neu loi import production:
  - disable endpoint import tam thoi trong security config/route gate.
  - rollback frontend button.
- Du lieu import loi khong anh huong du lieu cu vi chi them moi theo transaction/batch co rollback.

## 13) File format policy

- Chi ho tro `.xlsx`.
- Khong ho tro `.xls` de giam edge case va dong bo parser FE/BE.
- Frontend check extension + mime type tu dau vao.
- Backend verify lai content signature de tranh file gia mao extension.

## 12) Ghi chu thuc te cho codebase hien tai

- Hien tai da co file upload patterns trong project (Multipart + validation).
- Partner CRUD da co service/controller rieng, phu hop de gan them import endpoint.
- roleGroups INTERNAL cho menu la dung; khong can them role string moi vao `SectionRole`.
