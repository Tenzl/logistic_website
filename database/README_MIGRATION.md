# Database Migration - Update Provinces from newvn.geojson

## Tổng quan

File `newvn.geojson` chứa dữ liệu bản đồ Việt Nam với **34 tỉnh/thành phố** (thay vì 63 tỉnh như `vn.json` cũ).

## Thay đổi chính

### Dữ liệu cũ (vn.json)
- **63 tỉnh/thành phố** với ID từ VN01 đến VNSG
- Sử dụng mã tỉnh dạng string (VN01, VN02, etc.)

### Dữ liệu mới (newvn.geojson)
- **34 tỉnh/thành phố** 
- Sử dụng mã tỉnh số (01, 04, 08, etc.)
- Danh sách đầy đủ:
  1. An Giang (91)
  2. Bắc Ninh (24)
  3. Cà Mau (96)
  4. Cao Bằng (04)
  5. Cần Thơ (92)
  6. Đà Nẵng (48)
  7. Đắk Lắk (66)
  8. Điện Biên (11)
  9. Đồng Nai (75)
  10. Đồng Tháp (82)
  11. Gia Lai (52)
  12. Hà Nội (01)
  13. Hà Tĩnh (42)
  14. Hải Phòng (31)
  15. Huế (46)
  16. Hưng Yên (33)
  17. Khánh Hòa (56)
  18. Lai Châu (12)
  19. Lạng Sơn (20)
  20. Lào Cai (15)
  21. Lâm Đồng (68)
  22. Nghệ An (40)
  23. Ninh Bình (37)
  24. Phú Thọ (25)
  25. Quảng Ngãi (51)
  26. Quảng Ninh (22)
  27. Quảng Trị (44)
  28. Sơn La (14)
  29. Tây Ninh (80)
  30. Thái Nguyên (19)
  31. Thanh Hóa (38)
  32. TP. Hồ Chí Minh (79)
  33. Tuyên Quang (08)
  34. Vĩnh Long (86)

## Cách chạy migration

### ⚠️ Nếu gặp lỗi "Duplicate entry"

Lỗi này xảy ra khi bảng đã có dữ liệu. Xem **MIGRATION_STEPS.md** để biết cách giải quyết chi tiết.

**Quick fix:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ports;
DELETE FROM provinces;
ALTER TABLE ports AUTO_INCREMENT = 1;
ALTER TABLE provinces AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;
-- Sau đó chạy lại migration
```

### 📖 Hướng dẫn đầy đủ

👉 **Xem `MIGRATION_STEPS.md`** để có hướng dẫn chi tiết từng bước.

### Quick Start

#### 1. Backup dữ liệu

```bash
# Option A: Backup bằng script
mysql -u username -p database_name < database/backup_before_migration.sql

# Option B: Backup full database
mysqldump -u username -p database_name > backup.sql
```

#### 2. Chạy migration

```bash
mysql -u username -p database_name < database/migration_update_provinces_newvn.sql
```

### 3. Kiểm tra kết quả

```sql
-- Kiểm tra số lượng tỉnh (phải là 34)
SELECT COUNT(*) FROM provinces;
SELECT COUNT(*) FROM provinces WHERE is_active = 1;

-- Xem danh sách tỉnh
SELECT id, name, is_active FROM provinces ORDER BY name;

-- Kiểm tra ports
SELECT p.name AS province, p.is_active AS province_active, po.name AS port, po.is_active AS port_active
FROM provinces p 
LEFT JOIN ports po ON p.id = po.province_id 
ORDER BY p.name;

-- Hoặc chạy script verify đầy đủ
source database/verify_port_migration.sql;
```

## Tác động đến hệ thống

### Frontend
- File `Coverage.tsx` đã được cập nhật để sử dụng `newvn.geojson`
- Map sẽ hiển thị 34 tỉnh thay vì 63 tỉnh
- Các tỉnh không có trong `newvn.geojson` sẽ không hiển thị trên bản đồ

### Backend
- Entity `Province` giữ nguyên cấu trúc (ID kiểu Long)
- API `/api/provinces/active` sẽ trả về 34 tỉnh
- Cần kiểm tra các logic nghiệp vụ liên quan đến tỉnh

### Database
- Bảng `provinces`: 34 records (tất cả `is_active = 1`)
- Bảng `ports`: 18 records (tất cả `is_active = 1`)
- Cột `is_active` được thêm cho cả provinces và ports
- Foreign key constraints được duy trì

## Port Mapping

### Cảng được map trực tiếp (13 cảng)
Các cảng này có tỉnh tương ứng trong 34 tỉnh mới:
- Cái Lân (Quảng Ninh)
- Nghi Sơn (Thanh Hóa)
- Cửa Lò (Nghệ An)
- Vũng Áng (Hà Tĩnh)
- Chân Mây (Huế)
- Dung Quất (Quảng Ngãi)
- SP-ITC, Nhà Bè, Cát Lái (TP.HCM)
- Hải Phòng (Hải Phòng)
- Tiên Sa (Đà Nẵng)
- Cần Thơ (Cần Thơ)
- Cam Ranh (Khánh Hòa)

### ⚠️ Cảng được map gần đúng (5 cảng)
Các cảng này có tỉnh gốc không có trong 34 tỉnh mới:

| Cảng | Tỉnh gốc | Tỉnh mới (gần nhất) |
|------|----------|---------------------|
| Chu Lai Port | Quảng Nam ❌ | Đà Nẵng |
| Quy Nhơn Port | Bình Định ❌ | Khánh Hòa |
| Phu My, ODA Thị Vải, SP-PSA | Bà Rịa - Vũng Tàu ❌ | Đồng Nai |

📖 **Chi tiết**: Xem `PORT_MAPPING_GUIDE.md`

## Lưu ý

⚠️ **QUAN TRỌNG**: 
- Migration này sẽ **XÓA TẤT CẢ** dữ liệu hiện tại trong bảng `provinces` và `ports`
- Hãy đảm bảo đã backup dữ liệu trước khi chạy
- Kiểm tra kỹ các bảng khác có foreign key tới `provinces`
- **Một số cảng sẽ được map sang tỉnh lân cận** do tỉnh gốc không có trong 34 tỉnh mới
- Test trên môi trường development trước khi deploy lên production

## Rollback

Nếu cần quay lại dữ liệu cũ:

```bash
# Sử dụng script rollback
mysql -u username -p database_name < database/rollback_migration.sql

# Hoặc restore từ full backup
mysql -u username -p database_name < backup.sql
```

## Tài liệu

- 📖 **MIGRATION_STEPS.md** - Hướng dẫn chi tiết từng bước
- 📖 **PORT_MAPPING_GUIDE.md** - Chi tiết về port mapping
- 📖 **NEWVN_GEOJSON_MIGRATION.md** - Tổng quan về migration

## Scripts

- ✅ `backup_before_migration.sql` - Tạo backup
- ✅ `migration_update_provinces_newvn.sql` - Migration chính
- ✅ `verify_port_migration.sql` - Verify kết quả
- ✅ `rollback_migration.sql` - Rollback nếu cần

