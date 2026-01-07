# Migration Script - Giải thích chi tiết

## ❌ KHÔNG XÓA DATABASE

Migration script **KHÔNG** xóa database. Nó chỉ cập nhật dữ liệu trong 2 bảng.

## 📊 Trước và Sau Migration

### Database Structure (KHÔNG THAY ĐỔI) ✅

```
database: seatrans
├── provinces         ← Chỉ cập nhật DATA, không xóa table
├── ports            ← Chỉ cập nhật DATA, không xóa table
├── users            ← KHÔNG ĐỤng đến
├── orders           ← KHÔNG ĐỤng đến
├── services         ← KHÔNG ĐỤng đến
├── inquiries        ← KHÔNG ĐỤng đến
├── gallery_images   ← KHÔNG ĐỤng đến
└── ... (other tables) ← KHÔNG ĐỤng đến
```

### Provinces Table

**TRƯỚC Migration:**
```
provinces (63 records)
├── id: 1-63
├── name: "Lai Châu", "Lào Cai", ... (63 tỉnh)
├── is_active: 0/1
└── ... other columns
```

**SAU Migration:**
```
provinces (34 records)
├── id: 1-34
├── name: "An Giang", "Bắc Ninh", ... (34 tỉnh)
├── is_active: 1 (all active)
└── ... other columns (vẫn giữ nguyên cấu trúc)
```

### Ports Table

**TRƯỚC Migration:**
```
ports (13 records với old province_id)
├── id: 1-13
├── province_id: 13, 14, 15, 18, 19, 25, 28, 29, 41, 42, ...
└── ... other columns
```

**SAU Migration:**
```
ports (18 records với new province_id)
├── id: 1-18
├── province_id: 5, 6, 9, 13, 14, 15, 17, 22, 25, 26, 31, 32
└── ... other columns (vẫn giữ nguyên cấu trúc)
```

## 🔍 Chi tiết từng bước

### Bước 1: Backup (An toàn)
```sql
-- Tạo bảng backup
CREATE TABLE provinces_backup AS SELECT * FROM provinces;
CREATE TABLE ports_backup AS SELECT * FROM ports;
```
📝 **Giải thích:** Sao chép toàn bộ data sang 2 bảng mới để backup

### Bước 2: Xóa dữ liệu CŨ (KHÔNG xóa table)
```sql
DELETE FROM ports;      -- Xóa dữ liệu, KHÔNG xóa table
DELETE FROM provinces;  -- Xóa dữ liệu, KHÔNG xóa table
```
📝 **Giải thích:** Giống như xóa hết file trong folder, nhưng folder vẫn còn

### Bước 3: Thêm dữ liệu MỚI
```sql
INSERT INTO provinces (id, name, is_active) VALUES
(1, 'An Giang', 1),
...
```
📝 **Giải thích:** Thêm 34 tỉnh mới vào bảng (đã tồn tại)

### Bước 4: Thêm cảng MỚI
```sql
INSERT INTO ports (name, province_id, is_active) VALUES
('Cái Lân', 26, 1),
...
```
📝 **Giải thích:** Thêm 18 cảng với province_id đã cập nhật

## 🛡️ So sánh với các thao tác khác

| Thao tác | Migration Script | DROP DATABASE |
|----------|------------------|---------------|
| Xóa database | ❌ KHÔNG | ✅ CÓ |
| Xóa tables | ❌ KHÔNG | ✅ CÓ |
| Xóa table structure | ❌ KHÔNG | ✅ CÓ |
| Xóa data trong provinces | ✅ CÓ | ✅ CÓ |
| Xóa data trong ports | ✅ CÓ | ✅ CÓ |
| Xóa data trong users | ❌ KHÔNG | ✅ CÓ |
| Xóa data trong orders | ❌ KHÔNG | ✅ CÓ |
| Có thể rollback | ✅ CÓ (từ backup) | ❌ KHÔNG (trừ khi có backup database) |

## ✅ Những gì BỊ THAY ĐỔI

1. ✅ Dữ liệu trong bảng `provinces` (63 → 34 records)
2. ✅ Dữ liệu trong bảng `ports` (13 → 18 records)
3. ✅ `province_id` của các cảng (để match với 34 tỉnh mới)

## ❌ Những gì KHÔNG BỊ THAY ĐỔI

1. ❌ Database name
2. ❌ Table structure (columns, data types, indexes)
3. ❌ Foreign key constraints
4. ❌ Tất cả các bảng khác (users, orders, services, etc.)
5. ❌ Stored procedures, views, triggers (nếu có)
6. ❌ Database users và permissions

## 🔧 Cách chạy AN TOÀN với Transaction

### Option 1: Automatic (Recommended) ⭐
```bash
mysql -u username -p database_name < database/migration_safe_mode.sql
```

Script sẽ:
1. Tự động backup
2. Xóa và insert dữ liệu mới
3. Hiển thị summary
4. **CHỜ bạn xác nhận:** `COMMIT;` hoặc `ROLLBACK;`

### Option 2: Manual Step-by-Step
```sql
-- 1. Start transaction
START TRANSACTION;

-- 2. Backup
CREATE TABLE provinces_backup AS SELECT * FROM provinces;
CREATE TABLE ports_backup AS SELECT * FROM ports;

-- 3. Clear old data
DELETE FROM ports;
DELETE FROM provinces;

-- 4. Insert new data
INSERT INTO provinces (id, name, is_active) VALUES ...
INSERT INTO ports (name, province_id, is_active) VALUES ...

-- 5. Check results
SELECT COUNT(*) FROM provinces;  -- Should be 34
SELECT COUNT(*) FROM ports;      -- Should be 18

-- 6. Commit or rollback
COMMIT;     -- If OK
-- OR
ROLLBACK;   -- If something wrong
```

## 🆘 Nếu có sự cố

### Scenario 1: Migration chạy xong nhưng không đúng
```sql
-- Rollback từ backup tables
DELETE FROM ports;
DELETE FROM provinces;
INSERT INTO provinces SELECT * FROM provinces_backup;
INSERT INTO ports SELECT * FROM ports_backup;
```

### Scenario 2: Migration đang chạy và gặp lỗi
```sql
-- Nếu đang trong transaction
ROLLBACK;

-- Nếu không có transaction, restore từ backup
-- (Giống scenario 1)
```

## 📋 Checklist trước khi chạy

- [ ] Đã backup database bằng mysqldump (optional nhưng recommended)
- [ ] Đã đọc hiểu script sẽ làm gì
- [ ] Đã test trên development environment
- [ ] Database connection ổn định
- [ ] Có quyền DELETE, INSERT trên provinces và ports tables
- [ ] Không có user nào đang truy cập vào hệ thống

## 🎯 Kết luận

**Migration này:**
- ✅ **An toàn**: Chỉ cập nhật 2 bảng
- ✅ **Có backup**: Tự động tạo backup trước khi chạy
- ✅ **Có thể rollback**: Restore từ backup bất cứ lúc nào
- ✅ **Không phá vỡ hệ thống**: Các bảng khác không bị ảnh hưởng
- ✅ **Có transaction**: Có thể undo nếu có vấn đề (với safe mode)

**KHÔNG cần:**
- ❌ Xóa database
- ❌ Tạo lại database
- ❌ Drop và recreate tables
- ❌ Export/import toàn bộ database

---

**TL;DR:** Chỉ cần chạy script, nó sẽ tự động backup và cập nhật 2 bảng. Các bảng khác an toàn 100%. 🎉



