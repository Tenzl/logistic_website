# ⚠️ QUAN TRỌNG: Gallery Images Migration

## Vấn đề

Bảng `gallery_images` có foreign key tới `provinces`:
```sql
FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE RESTRICT
```

## Ảnh hưởng khi Migration

### Scenario 1: Gallery Images có province_id CŨ

**TRƯỚC migration:**
```
gallery_images:
- image_id: 1, province_id: 13  (Thanh Hóa cũ)
- image_id: 2, province_id: 14  (Nghệ An cũ)
- image_id: 3, province_id: 29  (TP.HCM cũ)
```

**SAU migration:**
```
provinces mới:
- id: 38 (Thanh Hóa)  // ma_tinh: 38
- id: 40 (Nghệ An)    // ma_tinh: 40  
- id: 79 (TP.HCM)     // ma_tinh: 79
```

**Kết quả:**
- ❌ gallery_images với province_id: 13, 14, 29 sẽ **BỊ XÓA**
- ⚠️ Dữ liệu gallery sẽ **MẤT** nếu không remap

## Giải pháp

### Option 1: Backup và Clear (Recommended cho lần đầu)

Migration script hiện tại sẽ:
1. ✅ Backup `gallery_images` → `gallery_images_backup`
2. ✅ Delete gallery_images có province_id
3. ✅ Insert provinces mới với ID = ma_tinh
4. ⚠️ **Gallery images sẽ trống**, cần upload lại

```sql
-- Gallery images will be empty after migration
-- You need to re-upload images for provinces
```

### Option 2: Remap Province IDs (Nếu muốn giữ gallery images)

**Nếu bạn muốn giữ gallery images hiện tại**, chạy script này **TRƯỚC khi migration**:

```sql
-- REMAP GALLERY IMAGES PROVINCE IDs
-- Run this BEFORE migration to preserve gallery_images

-- Create mapping of old ID to new ID (ma_tinh)
-- You need to identify which old IDs map to which provinces

START TRANSACTION;

-- Example: Update based on your current province mappings
-- Old ID 13 (Thanh Hóa) -> New ID 38 (ma_tinh: 38)
UPDATE gallery_images SET province_id = 38 WHERE province_id = 13;

-- Old ID 14 (Nghệ An) -> New ID 40 (ma_tinh: 40)
UPDATE gallery_images SET province_id = 40 WHERE province_id = 14;

-- Old ID 15 (Hà Tĩnh) -> New ID 42 (ma_tinh: 42)
UPDATE gallery_images SET province_id = 42 WHERE province_id = 15;

-- Old ID 18 (Huế) -> New ID 46 (ma_tinh: 46)
UPDATE gallery_images SET province_id = 46 WHERE province_id = 18;

-- Old ID 19 (Quảng Nam - NOT IN 34) -> New ID 48 (Đà Nẵng)
UPDATE gallery_images SET province_id = 48 WHERE province_id = 19;

-- Old ID 25 (Quảng Ninh) -> New ID 22 (ma_tinh: 22)
UPDATE gallery_images SET province_id = 22 WHERE province_id = 25;

-- Old ID 28 (BR-VT - NOT IN 34) -> New ID 75 (Đồng Nai)
UPDATE gallery_images SET province_id = 75 WHERE province_id = 28;

-- Old ID 29 (TP.HCM) -> New ID 79 (ma_tinh: 79)
UPDATE gallery_images SET province_id = 79 WHERE province_id = 29;

-- Add more mappings for other provinces...

-- Verify before commit
SELECT province_id, COUNT(*) 
FROM gallery_images 
GROUP BY province_id;

-- If looks good:
COMMIT;

-- If something wrong:
-- ROLLBACK;
```

### Option 3: Set province_id to NULL (Temporary)

```sql
-- Temporarily remove province associations
UPDATE gallery_images SET province_id = NULL;

-- Then run migration
-- Later, manually re-associate images with provinces
```

## Recommendation

### For Production (có gallery images quan trọng)

1. **Backup toàn bộ database** trước
```bash
mysqldump -u user -p seatrans > full_backup_before_migration.sql
```

2. **Export gallery_images với province names**
```sql
SELECT 
    gi.*,
    p.name as province_name
FROM gallery_images gi
LEFT JOIN provinces p ON gi.province_id = p.id
INTO OUTFILE '/tmp/gallery_images_export.csv';
```

3. **Run migration** (gallery_images sẽ bị clear)

4. **Re-import** và map lại với ID mới

### For Development/Testing

Chạy migration trực tiếp, gallery_images sẽ trống và có thể upload lại.

## Migration Script đã handle

```sql
-- Migration script automatically:
DELETE FROM gallery_images WHERE province_id IS NOT NULL;  -- Clear data
-- Then provinces are deleted and re-inserted with new IDs
```

**Backup có trong:**
- `gallery_images_backup` table (if you ran backup_before_migration.sql)
- Full database backup (if you ran mysqldump)

## Restore Gallery Images từ Backup

```sql
-- After migration, if you want to restore gallery_images
-- (but they will still have old province_ids)

INSERT INTO gallery_images 
SELECT * FROM gallery_images_backup 
WHERE province_id IS NULL;  -- Only restore items without province_id

-- For items with province_id, you need manual remapping
```

## Checklist

- [ ] Backup database trước khi migration
- [ ] Export gallery_images với province names (nếu cần)
- [ ] Quyết định strategy: Clear or Remap
- [ ] Nếu Remap: Chạy remap script TRƯỚC migration
- [ ] Nếu Clear: Chuẩn bị re-upload images sau migration
- [ ] Verify gallery_images sau migration

## Important Notes

1. **Migration script sẽ DELETE gallery_images** có province_id
2. **Backup tự động** được tạo trong `gallery_images_backup`
3. **Province IDs thay đổi** từ sequential sang ma_tinh
4. **Cannot preserve FK relationships** without remapping
5. **Consider re-uploading** nếu số lượng images không nhiều

---

**Recommendation:** Nếu gallery_images ít, run migration và re-upload. Nếu nhiều, export data và remap carefully.



