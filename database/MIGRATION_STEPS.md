# Step-by-Step Migration Guide

## ⚠️ QUAN TRỌNG - ĐỌC TRƯỚC KHI CHẠY

Migration này sẽ **XÓA TẤT CẢ** dữ liệu trong bảng `provinces` và `ports` và thay thế bằng 34 tỉnh mới.

## Prerequisites

1. ✅ Đã đọc và hiểu `README_MIGRATION.md`
2. ✅ Đã đọc `PORT_MAPPING_GUIDE.md` 
3. ✅ Có quyền backup và restore database
4. ✅ Đã test trên development environment

## Migration Steps

### Step 1: Backup Current Data

```bash
# Option A: Backup toàn bộ database
mysqldump -u username -p database_name > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Option B: Chỉ backup provinces và ports tables
mysql -u username -p database_name < database/backup_before_migration.sql
```

**Verify backup:**
```sql
SELECT COUNT(*) FROM provinces_backup;
SELECT COUNT(*) FROM ports_backup;
```

### Step 2: Run Migration

```bash
mysql -u username -p database_name < database/migration_update_provinces_newvn.sql
```

**Nếu gặp lỗi "Duplicate entry":**
```sql
-- Check dữ liệu hiện tại
SELECT COUNT(*) FROM provinces;
SELECT COUNT(*) FROM ports;

-- Nếu cần, xóa thủ công:
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ports;
DELETE FROM provinces;
ALTER TABLE ports AUTO_INCREMENT = 1;
ALTER TABLE provinces AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- Sau đó chạy lại migration
```

### Step 3: Verify Migration

```bash
mysql -u username -p database_name < database/verify_port_migration.sql
```

**Expected results:**
- ✅ Total provinces: 34
- ✅ Active provinces: 34
- ✅ Total ports: 18
- ✅ Active ports: 18
- ✅ Provinces with ports: 13

**Manual checks:**
```sql
-- Check provinces count
SELECT COUNT(*) FROM provinces;
-- Expected: 34

-- Check all provinces are active
SELECT COUNT(*) FROM provinces WHERE is_active = 1;
-- Expected: 34

-- Check ports count
SELECT COUNT(*) FROM ports;
-- Expected: 18

-- Check specific mappings
SELECT p.name, pr.name 
FROM ports p 
JOIN provinces pr ON p.province_id = pr.id 
WHERE p.name = 'Phu My Port';
-- Expected: Phu My Port | Đồng Nai
```

### Step 4: Update Frontend (if needed)

```bash
cd z_Seatrans_Redesign

# Test province mapping
node testProvinceMapping.js
# Expected: Matched: 34/34

# Rebuild frontend
npm run build
```

### Step 5: Test Application

1. ✅ Backend API: `GET /api/provinces/active`
   - Should return 34 provinces
   - All should have `is_active: true`

2. ✅ Frontend Map: 
   - Should display all 34 provinces
   - Markers should appear on correct locations
   - Hover should show ports correctly

3. ✅ Port queries work correctly
   - All 18 ports are accessible
   - Province relationships are correct

## Rollback (If Needed)

**If something goes wrong, restore from backup:**

```bash
# Option A: Restore from full database backup
mysql -u username -p database_name < backup_before_migration_YYYYMMDD_HHMMSS.sql

# Option B: Restore from backup tables
mysql -u username -p database_name < database/rollback_migration.sql
```

**Verify rollback:**
```sql
SELECT COUNT(*) FROM provinces;
SELECT COUNT(*) FROM ports;
-- Should match original counts
```

## Common Issues & Solutions

### Issue 1: "Duplicate entry" error

**Cause:** Bảng chưa được xóa sạch trước khi insert

**Solution:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM ports;
DELETE FROM provinces;
ALTER TABLE ports AUTO_INCREMENT = 1;
ALTER TABLE provinces AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;
-- Then re-run migration
```

### Issue 2: Foreign key constraint fails

**Cause:** Có bảng khác reference đến `provinces`

**Solution:**
```sql
-- Find tables with FK to provinces
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'provinces';

-- Handle accordingly (backup, update, or temporarily disable FK)
```

### Issue 3: Province không hiển thị trên map

**Cause:** Tên tỉnh trong DB không match với geojson

**Solution:**
```bash
# Run mapping test
cd z_Seatrans_Redesign
node testProvinceMapping.js

# Check console in browser for warnings
# Update provinceMapping.ts if needed
```

### Issue 4: Port count không đúng

**Cause:** Migration script chưa chạy đầy đủ

**Solution:**
```sql
-- Check current ports
SELECT COUNT(*) FROM ports;

-- If less than 18, check for errors in migration log
-- Re-run just the ports insert section
```

## Post-Migration Checklist

- [ ] Provinces count = 34
- [ ] Ports count = 18
- [ ] All provinces have `is_active = 1`
- [ ] All ports have `is_active = 1`
- [ ] Backend API returns correct data
- [ ] Frontend map displays correctly
- [ ] All markers appear on map
- [ ] Port information shows correctly on hover
- [ ] No console errors in browser
- [ ] testProvinceMapping.js shows 100% matched

## Monitoring

**After deployment, monitor:**

1. API response time for `/api/provinces/active`
2. Frontend map load time
3. No JavaScript errors in production
4. User feedback about province/port coverage

## Support

**Files for reference:**
- `README_MIGRATION.md` - Overview
- `PORT_MAPPING_GUIDE.md` - Port mapping details
- `NEWVN_GEOJSON_MIGRATION.md` - Complete documentation
- `verify_port_migration.sql` - Verification queries

**Scripts:**
- `backup_before_migration.sql` - Create backup
- `migration_update_provinces_newvn.sql` - Main migration
- `verify_port_migration.sql` - Verify results
- `rollback_migration.sql` - Rollback if needed

---

**Important Notes:**
- ⚠️ Always backup before migration
- ⚠️ Test on development first
- ⚠️ Some ports are mapped to nearby provinces (see PORT_MAPPING_GUIDE.md)
- ⚠️ Keep backup tables until migration is verified in production

**Last Updated:** 2026-01-01



