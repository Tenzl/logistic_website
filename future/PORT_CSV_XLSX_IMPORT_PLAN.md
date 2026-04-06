# PORT CSV/XLSX IMPORT — BACKEND IMPLEMENTATION PLAN

**Date:** 2026-03-30  
**Scope:** Chuyển logic đọc file CSV/XLSX của tính năng Import Ports từ Frontend sang Backend. Frontend chỉ chọn file và gửi lên; Backend dùng Apache POI + OpenCSV để parse, validate và batch-insert vào database.

---

## 1. Vấn đề hiện tại

| Hạng mục | Trạng thái hiện tại |
|---|---|
| Đọc file XLSX | Frontend dùng thư viện `xlsx` (JS) |
| Parse từng hàng | Frontend tự map cột, normalize header |
| Gửi dữ liệu | Gửi từng `POST /api/v1/ports` một (N requests cho N hàng) |
| Duplicate check | Backend check theo `name + province_id` per request |
| Bundle size | `xlsx` lib nặng (~1 MB) được import dynamic |

**Vấn đề:**
- N rows = N HTTP requests → chậm, dễ fail giữa chừng
- Frontend parsing fragile (encoding BOM, số dạng text, header casing)
- Khó test, khó maintain

---

## 2. Mục tiêu

- Frontend chỉ gửi raw file qua `multipart/form-data` lên `POST /api/v1/ports/import`
- Backend parse file bằng Apache POI (XLSX) / OpenCSV (CSV)
- Batch insert bằng `saveAll()` — một transaction duy nhất
- Duplicate check bằng cách load toàn bộ tên port hiện tại vào Set trước khi insert
- Trả về kết quả chi tiết: `imported`, `duplicates`, `skipped`, `errors`

---

## 3. Columns của file import

| Column header | Tương ứng DB | Kiểu | Bắt buộc |
|---|---|---|---|
| `name` | `ports.name` | `varchar(100)` | **Yes** (bỏ qua nếu rỗng) |
| `code` | `ports.code` | `varchar(50)` | No |
| `latitude` | `ports.latitude` | `decimal(15,8)` | No |
| `longitude` | `ports.longitude` | `decimal(15,8)` | No |
| `country_code` | `ports.country_code` | `varchar(10)` | No |
| `zone_code` | `ports.zone_code` | `varchar(50)` | No |

> Header không case-sensitive, BOM được strip.

---

## 4. Kiến trúc Backend

```
POST /api/v1/ports/import
    ↓ MultipartFile
PortController.importPorts()
    ↓
PortImportService.importFile(MultipartFile)
    ├── detect type (CSV vs XLSX by extension/MIME)
    ├── parse rows → List<Map<String,String>>
    │     ├── OpenCSV (for .csv)
    │     └── Apache POI (for .xlsx/.xls)
    ├── normalize header (trim, lowercase, BOM strip)
    ├── validate: skip rows where name is blank
    ├── duplicate check: load existing names → Set<String>
    │     → skip rows whose normalized name already in DB
    ├── build List<Port> entities
    ├── portRepository.saveAll(batch)  ← one transaction
    └── return PortImportResultDTO
```

---

## 5. DTO kết quả

```java
// PortImportResultDTO.java
public class PortImportResultDTO {
    private int imported;      // số hàng insert thành công
    private int duplicates;    // số hàng trùng tên, bị bỏ qua
    private int skipped;       // số hàng name rỗng/null, bị bỏ qua
    private int failed;        // số hàng lỗi parse
    private List<String> errors; // chi tiết lỗi (max 20 dòng)
}
```

---

## 6. Rule xử lý từng hàng

1. **Trim + normalize header**: lowercase, replace spaces → `_`, strip BOM
2. **name rỗng** → `skipped++`, bỏ qua hàng
3. **name đã tồn tại** trong DB (case-insensitive) → `duplicates++`, bỏ qua
4. **latitude/longitude** không phải số → giữ `null`, không báo lỗi
5. **code, country_code, zone_code** rỗng → giữ `null`
6. `is_active` mặc định `true`, `has_info` mặc định `0`
7. `province_id` = `null` (file không có cột này; có thể sửa sau)
8. `port_of_call` = tự sinh từ `name` theo logic chuẩn của backend

---

## 7. API Endpoint

```
POST /api/v1/ports/import
Authorization: ROLE_ADMIN / ROLE_EMPLOYEE / ROLE_INTERNAL
Content-Type: multipart/form-data

Body:
  file: <binary>

Response 200:
{
  "success": true,
  "message": "Import completed",
  "data": {
    "imported": 42,
    "duplicates": 5,
    "skipped": 2,
    "failed": 0,
    "errors": []
  }
}
```

---

## 8. Frontend thay đổi

| Hạng mục | Trước | Sau |
|---|---|---|
| Đọc file | `xlsx` dynamic import | Không đọc file |
| Gửi data | N × `POST /api/v1/ports` | 1 × `POST /api/v1/ports/import` (FormData) |
| Xử lý kết quả | Count per-row success/fail | Hiển thị `PortImportResultDTO` trả về |
| Import helpers | `normalizeHeader`, `buildImportPayload`, ... | Xoá hết |
| Bundle size | `xlsx` (~1 MB) | Giảm đáng kể |

---

## 9. Dependencies cần thêm (pom.xml)

```xml
<!-- OpenCSV for CSV parsing -->
<dependency>
    <groupId>com.opencsv</groupId>
    <artifactId>opencsv</artifactId>
    <version>5.9</version>
</dependency>
```

> Apache POI (`poi-ooxml` 5.2.5) đã có sẵn.

---

## 10. Files sẽ thay đổi / tạo mới

### Backend
| File | Action |
|---|---|
| `pom.xml` | Thêm OpenCSV |
| `features/ports/dto/PortImportResultDTO.java` | **Tạo mới** |
| `features/ports/service/PortImportService.java` | **Tạo mới** |
| `features/ports/controller/PortController.java` | Thêm `POST /import` |
| `shared/config/SecurityConfig.java` | Mở POST `/api/v1/ports/import` cho admin |

### Frontend
| File | Action |
|---|---|
| `features/admin/components/ManagePorts.tsx` | Xoá xlsx helpers, dùng FormData |
| `shared/config/api.config.ts` | Thêm `PORTS.IMPORT` |
