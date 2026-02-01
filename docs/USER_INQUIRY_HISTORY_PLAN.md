# User Inquiry History Views Plan

## Mục tiêu
- Tách lịch sử inquiry của **user** thành 5 view giống admin dashboard: Shipping Agency, Chartering & Broking, Freight Forwarding, Total Logistics, Special Request.
- Dùng chung khung UI/logic để tránh lặp, tách rõ quyền user vs admin.

## Hiện trạng
- Admin đã có các tab inquiry + upload invoice + preview invoice (Quote-hcm/Quote-qn) + lịch sử.
- User hiện xem lịch sử trong `UserInquiryHistoryTab.tsx` (gộp chung, fields hiển thị chung).

## Kiến trúc đề xuất
- Tạo **một bộ khung chung** + tách cấu hình per-service:
  - `BaseInquiryHistoryLayout` (shared):
    - Toolbar: filter theo trạng thái, thời gian, từ khóa.
    - **DataTable component** (base: table-09.tsx pattern):
      - Multi-select checkboxes: chọn nhiều inquiry (từ table-09).
      - Bulk delete: nút delete khi có ít nhất 1 row được chọn với AlertDialog confirm.
      - Date filter: DatePicker chọn khoảng ngày submit (custom addition).
      - User filter (admin only): dropdown chọn user (custom addition).
      - Pagination, sorting, column toggling (từ table-09).
    - Drawer/Modal chi tiết + Invoice Preview.
  - `InquiryDetailPanel` (shared):
    - Khối metadata chung (service name, status, submitted at).
    - Vùng “Provided Details” render theo schema cấu hình (không hard-code ETA cho Special Request).
  - `InvoicePreview` (re-use `QuotePreview` iframe) + nút Download/Print, data đã escape.
  - `ServiceConfigs` (per-service): khai báo schema field, nhãn, ẩn/hiện.

## Quyền & API
- **User**: chỉ xem inquiry của chính mình. Backend endpoint cần filter theo `userId` từ JWT, không nhận `userId` từ query (tránh spoof).
- **Admin**: xem tất cả, có filter `serviceType`, `status`, `assignee`, v.v.
- Đề xuất endpoint (user):
  - `GET /api/v1/inquiries/me?serviceType=...&status=...&page=...&size=...`
  - `GET /api/v1/inquiries/me/{id}` trả chi tiết + documents (invoice list)
- Hạn chế: không trả về trường không cần thiết cho user (PII của người khác, internal notes).

## Cấu hình schema per-service (ví dụ)
- Shipping Agency: mv, dwt, grt, loa, eta, cargoType, cargoName, quantity, portOfCall, dischargeLoadingLocation.
- Chartering: mv, laycanFrom/To, cargoQuantity, loadingPort, dischargingPort.
- Freight Forwarding / Total Logistics: cargoName, deliveryTerm, container20/40, loadingPort, dischargingPort, shipmentFrom/To.
- Special Request: subject, message (không hiển thị ETA).

## Tại sao User chưa có 5 History Views?
**Hiện trạng**: User hiện chỉ có 1 view tổng hợp (`UserInquiryHistoryTab.tsx`) hiển thị tất cả inquiries của họ từ mọi service type, không phân tách theo từng service như admin.

**Lý do**:
- Admin cần quản lý inquiries từ nhiều users cho từng service → cần tabs riêng biệt
- User ban đầu chỉ cần xem lịch sử của chính mình → 1 view thống nhất đơn giản hơn
- Chưa implement routing/tabs cho user dashboard tương tự admin

**Mục tiêu**: Nâng cấp user experience để giống admin - mỗi service có tab riêng với schema fields phù hợp.

## Implementation Phases

### 📋 Phase 1: Foundation (COMPLETED ✅)
**Mục tiêu**: Xây dựng shared components và DataTable infrastructure

- [x] Tạo `InquiryDataTable.tsx` component base trên table-09 pattern
  - Multi-select checkboxes
  - Sortable columns với ArrowUpDown
  - Pagination
  - Column visibility toggle
  - Bulk delete với AlertDialog
  - Date range filter (from/to)
  - User filter (admin only)
- [x] Refactor `UserInquiryHistoryTab.tsx` để dùng DataTable
- [x] Refactor `Admin InquiryManagement.tsx` để dùng DataTable
- [x] Test DataTable với single unified view

### 📦 Phase 2: Schema Configuration
**Mục tiêu**: Định nghĩa field schemas cho từng service type

- [x] **Tạo `serviceInquirySchemas.ts`**:
  - ✅ InquiryFieldSchema interface với key, label, type, format
  - ✅ SERVICE_SCHEMAS cho 5 service types:
    - shipping-agency: 16 fields (mv, dwt, grt, loa, eta, cargo, port, hours)
    - chartering: 11 fields (vessel info, laycan, cargo, ports) - NO ETA
    - freight-forwarding: 10 fields (cargo, containers, ports, delivery term)
    - total-logistic: 11 fields (similar to freight + port of call)
    - special-request: 2 fields (subject, message) - NO vessel/ETA/ports
  - ✅ Helper functions: getSchemaForService, getServiceSlugFromInquiry, getFieldValue
  - ✅ Format functions: formatDate, formatNumber, formatText, formatBoolean

- [x] **Refactor `renderDetails` function**:
  - ✅ Dùng getServiceSlugFromInquiry để xác định service type
  - ✅ Lấy schema tương ứng từ SERVICE_SCHEMAS
  - ✅ Loop qua schema fields, extract values với getFieldValue
  - ✅ Apply formatters theo field type
  - ✅ Skip undefined/null/empty values
  - ✅ Render grid với labels từ schema (không hard-code)
  
**Result**: Special Request sẽ chỉ hiển thị Subject & Message, không có ETA hay vessel fields.

### 🏗️ Phase 3: Shared Base Layout
**Mục tiêu**: Tạo reusable layout component cho inquiry history

- [x] **Tạo `BaseInquiryHistoryLayout.tsx`**:
  - ✅ Props: serviceType, serviceLabel, isAdmin, users, title, description
  - ✅ Render InquiryDataTable với filters phù hợp (admin có user filter)
  - ✅ Tích hợp useInquiryData hook để fetch/delete
  - ✅ Tích hợp useInvoicePreview hook để xem invoice
  - ✅ Columns definition với sortable headers
  - ✅ Detail drawer + Invoice preview dialog
  
- [x] **Tạo `InquiryDetailDrawer.tsx`**:
  - ✅ Sheet component (right drawer) hiển thị inquiry details
  - ✅ Nhận inquiry object và schema
  - ✅ Render metadata (service, status, submitted date, contact info)
  - ✅ Render fields theo schema với getFieldValue + formatters
  - ✅ Skip undefined/null/empty values
  - ✅ Actions: View Invoice button (chỉ hiện khi QUOTED/COMPLETED)
  - ✅ Responsive grid layout (2 columns on desktop)

- [x] **Extract shared logic**:
  - ✅ `useInquiryData` hook:
    - fetch inquiries (user: `/inquiries/me`, admin: `/inquiries`)
    - filter by serviceType
    - deleteInquiries with batch endpoint
    - refreshInquiries helper
    - isLoading, error states
  - ✅ `useInvoicePreview` hook:
    - ensureQuoteTemplate (lazy load from /templates/quote.html)
    - generateInvoicePreview (HCM vs QN renderer)
    - buildQuoteData helper (normalize details JSON)
    - quoteHtml state
    - clearPreview helper
  - ✅ Status badge rendering (already in BaseInquiryHistoryLayout)

**Result**: Có thể tái sử dụng BaseInquiryHistoryLayout cho cả user và admin, chỉ cần pass props khác nhau.

### 🎯 Phase 4: Create 5 User History Views
**Mục tiêu**: Tạo 5 views riêng biệt cho user, mỗi service 1 view

- [ ] **Tạo tab structure trong user dashboard**:
  - `app/(protected)/dashboard/inquiries/layout.tsx` - tab navigation
  - `app/(protected)/dashboard/inquiries/shipping-agency/page.tsx`
  - `app/(protected)/dashboard/inquiries/chartering/page.tsx`
  - `app/(protected)/dashboard/inquiries/freight-forwarding/page.tsx`
  - `app/(protected)/dashboard/inquiries/total-logistic/page.tsx`
  - `app/(protected)/dashboard/inquiries/special-request/page.tsx`

- [ ] **Mỗi page component**:
  ```tsx
  export default function ShippingAgencyHistoryPage() {
    const schema = SERVICE_SCHEMAS['shipping-agency']
    const { data, loading, error, deleteInquiries } = useInquiryData('shipping-agency')
    
    return (
      <BaseInquiryHistoryLayout
        serviceType="shipping-agency"
        schema={schema}
        data={data}
        loading={loading}
        onDelete={deleteInquiries}
        isAdmin={false}
      />
    )
  }
  ```

- [ ] **Update navigation**:
  - Sidebar/menu thêm "My Inquiries" với 5 sub-items
  - Badge hiển thị số lượng pending inquiries per service

### 🔌 Phase 5: Backend API Support
**Mục tiêu**: Backend endpoints hỗ trợ filter theo service type và user

- [ ] **User endpoints** (JWT-protected, auto-filter by userId):
  - `GET /api/v1/inquiries/me?serviceType=shipping-agency&status=PENDING&page=0&size=20`
  - `GET /api/v1/inquiries/me/{id}` - detail + documents
  - `DELETE /api/v1/inquiries/me/batch` - body: `{ ids: [1,2,3] }`
  - Security: Always filter by JWT userId, ignore any userId in query params

- [ ] **Admin endpoints** (keep existing):
  - `GET /api/v1/inquiries?serviceType=...&userId=...&status=...`
  - `DELETE /api/v1/inquiries/batch` - với permission check

- [ ] **Validation**:
  - User chỉ được delete inquiries của chính mình
  - Admin có thể delete bất kỳ
  - Rate limiting cho bulk operations

### 🧪 Phase 6: Testing & Rollout
**Mục tiêu**: Đảm bảo quality và UX tốt

- [ ] **Unit tests**:
  - Schema mapping functions
  - renderDetails với different schemas
  - Date filtering logic
  - Permission checks

- [ ] **Integration tests**:
  - User chỉ thấy inquiries của mình
  - Admin thấy tất cả
  - Bulk delete permissions
  - Service type filtering

- [ ] **Manual testing checklist**:
  - [ ] Mỗi service có ít nhất 1 inquiry sample
  - [ ] Fields hiển thị đúng theo schema (Special Request không có ETA)
  - [ ] Invoice preview mở được cho QUOTED/COMPLETED
  - [ ] Date filter hoạt động (from/to)
  - [ ] User filter chỉ hiện cho admin
  - [ ] Bulk delete confirmation dialog
  - [ ] Sorting mỗi column
  - [ ] Pagination
  - [ ] Column visibility toggle
  - [ ] Mobile responsive

- [ ] **Performance**:
  - Pagination giảm initial load
  - Lazy load invoice templates
  - Debounce search input

- [ ] **Rollout**:
  - Feature flag cho user 5-view mode
  - Beta test với small user group
  - Monitor error rates
  - Collect feedback
  - Full rollout

## Current Status: Phase 1 Complete ✅
Đã hoàn thành DataTable infrastructure. Tiếp theo: Phase 2 - Schema Configuration.

## Có nên tạo khung chung? — **Có**
- Giảm lặp UI/logic, chỉ thay cấu hình field và nguồn dữ liệu.
- Dễ bảo trì khi đổi màu status, filter, hay thêm invoice actions: sửa một nơi.
- Phân quyền rõ: user dùng `/me` endpoints; admin dùng endpoints hiện có.

## Tránh lỗi hiển thị sai (VD: ETA trong Special Request)
- Không dùng danh sách field cứng. Luôn map theo schema per-service.
- Không set default giá trị (như `eta = 'TBN'`) cho service không cần; để `undefined/null` để bị ẩn.

## File/code gợi ý
- **Base template**: `frontend/src/shared/components/ui/table-09.tsx` - shadcn DataTable pattern với multi-select, sorting, filtering
- `frontend/src/modules/users/components/history/BaseInquiryHistoryLayout.tsx` (mới) - sử dụng table-09 pattern
- `frontend/src/modules/users/components/history/InquiryDataTable.tsx` (mới) - DataTable component extends table-09 với:
  - Multi-select checkboxes (từ table-09)
  - Bulk delete với AlertDialog
  - Date filter với DatePicker (from/to)
  - User filter dropdown (admin only)
- `frontend/src/modules/users/components/history/serviceInquirySchemas.ts` (mới) - schema config
- Update `UserInquiryHistoryTab.tsx` để dùng columns pattern từ table-09 + custom filters.
- Backend: endpoint `DELETE /api/v1/inquiries/me/batch` hoặc `DELETE /api/v1/inquiries/batch?ids=1,2,3` (admin) với kiểm tra quyền.

## Kiểm thử & rollout
- Unit test hàm format/schema mapping.
- Manual test 5 service, 3 trạng thái (Processing/Done/Rejected), có/không invoice.
- Kiểm tra ẩn/hiện ETA đúng từng service.
