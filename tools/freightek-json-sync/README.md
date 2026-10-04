# FreightEK JSON Sync

Tool này đối chiếu JSON được xuất từ `freightek-container-import` với database
Seatrans và dựng kế hoạch cập nhật Booking Documents.

## Sử dụng

Chạy kiểm tra read-only trước:

```powershell
node tools/freightek-json-sync/index.mjs `
  --json "C:\Users\DEV\Downloads\seatrans\freightek-shipments.json"
```

Đọc `report.md` tại đường dẫn tool in ra. Khi báo cáo không còn shipment chưa
map và không có blocker, chạy apply:

```powershell
node tools/freightek-json-sync/index.mjs `
  --json "C:\Users\DEV\Downloads\seatrans\freightek-shipments.json" `
  --mode apply
```

Trước lần `apply` đầu tiên sau khi thay đổi backend, chạy
`pnpm --dir backend2.0 build`. Tool sẽ từ chối ghi nếu runtime đã build còn
thiếu. Chrome extension collector cũng cần được reload để các JSON xuất mới có
thêm `bookingNo` đọc trực tiếp từ trang FreightEK.

Nếu báo cáo có container thừa trong database, tool mặc định **không xóa**. Chỉ
sau khi xác nhận JSON chứa đầy đủ toàn bộ container mới chạy:

```powershell
node tools/freightek-json-sync/index.mjs `
  --json "C:\Users\DEV\Downloads\seatrans\freightek-shipments.json" `
  --mode apply `
  --allow-container-deletes
```

## Quy tắc map

- Ưu tiên Booking No. có trong JSON.
- Nếu JSON không có Booking No., dùng HBL/FBL live trên trang để tìm BL rồi lấy
  Booking liên kết.
- Booking No. và HBL trỏ sang hai Booking khác nhau: dừng, không đoán.
- Giá trị trống trong JSON không xóa dữ liệu database.
- Booking `Vessel / Voyage` lấy Feeder Vessel/Voyage.
- BL `Ocean Vessel` lấy Mother Vessel/Voyage.
- Port và Partner chỉ gắn master ID khi khớp duy nhất. Không khớp thì giữ
  snapshot từ JSON và để ID trống.
- Container map theo số container trước, sau đó mới xét thứ tự nguồn.
- Tool có thể tạo BL còn thiếu cho Export, hoặc AN/DO còn thiếu cho Import theo
  workflow hiện tại.

## An toàn production

- `plan` là mặc định và hoàn toàn read-only.
- `apply` luôn tạo full `pg_dump` và checksum.
- Toàn bộ thay đổi được rehearsal trong transaction rồi `ROLLBACK`.
- Tool so sánh lại database và kế hoạch trước khi commit để phát hiện concurrent
  update.
- Báo cáo, before-image và result nằm trong
  `migration-backups/freightek-json-sync/` (đã được git-ignore).
- Mỗi lần apply được ghi vào `app_schema_migrations` theo SHA-256 của JSON.
- Khi cần rollback, dùng full dump được ghi trong `result.json`; không sửa tay
  database production.
