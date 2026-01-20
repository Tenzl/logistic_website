# Migration từ vn.json sang newvn.geojson

## Tổng quan

Đã cập nhật toàn bộ hệ thống để sử dụng `newvn.geojson` thay vì `vn.json` cũ.

## Sự khác biệt giữa vn.json và newvn.geojson

### vn.json (CŨ)
```json
{
  "features": [
    {
      "id": 1,
      "properties": {
        "id": "VN01",
        "name": "Lai Chau"
      },
      "geometry": {...}
    }
  ]
}
```
- **63 tỉnh/thành phố**
- `id` ở cấp feature (number)
- `properties.id`: Mã tỉnh dạng string (VN01, VN02, VNHN, etc.)
- `properties.name`: Tên tỉnh bằng tiếng Anh không dấu

### newvn.geojson (MỚI)
```json
{
  "features": [
    {
      "properties": {
        "ma_tinh": "01",
        "ten_tinh": "Hà Nội",
        "sap_nhap": "...",
        "quy_mo": "...",
        "dtich_km2": 3328.9,
        "dan_so": 8053663
      },
      "geometry": {...}
    }
  ]
}
```
- **34 tỉnh/thành phố**
- Không có `id` ở cấp feature
- `properties.ma_tinh`: Mã tỉnh theo GSO (01, 48, 79, etc.)
- `properties.ten_tinh`: Tên tỉnh bằng tiếng Việt có dấu
- Bổ sung thông tin: diện tích, dân số, quy mô, sáp nhập

## Các thay đổi đã thực hiện

### 1. Frontend Components

#### ✅ Coverage.tsx
- **Thay đổi import**: `vn.json` → `newvn.geojson`
- **Cập nhật logic mapping**: 
  - Trước: Match bằng `feature.id === province.id`
  - Sau: Match bằng `feature.properties.ten_tinh === province.name`
- **Thêm normalize function** để xử lý các biến thể tên tỉnh (TP., Thành phố, etc.)

#### ✅ Utility Functions (src/utils/provinceMapping.ts)
Tạo các helper functions:
- `normalizeProvinceName()`: Chuẩn hóa tên tỉnh
- `findProvinceFeature()`: Tìm feature trong geojson theo tên
- `listGeoJsonProvinces()`: List tất cả tỉnh trong geojson
- `checkMappingCoverage()`: Kiểm tra coverage mapping
- `PROVINCE_NAME_MAPPING`: Mapping table cho các tên khác nhau

### 2. Scripts

#### ✅ extractProvinces.js
- Cập nhật để đọc `newvn.geojson` với `fs.readFileSync`
- Thay đổi mapping: `properties.id` → `properties.ma_tinh`
- Thay đổi mapping: `properties.name` → `properties.ten_tinh`

#### ✅ testProvinceMapping.js (MỚI)
Script test để verify mapping giữa database và geojson
- Kiểm tra tất cả 34 tỉnh
- **Kết quả: 100% matched** ✓

### 3. Database

#### ✅ migration_update_provinces_newvn.sql
Script migration để cập nhật database:
- Truncate bảng `provinces` và `ports`
- Insert 34 tỉnh mới
- Cập nhật port mappings

#### ✅ Database Comments
- `migration_gallery_images.sql`: Cập nhật comment
- `init_provinces_simple.sql`: Cập nhật comment

## Danh sách 34 tỉnh/thành phố

| ID | Tên | Mã tỉnh | Database ✓ | GeoJSON ✓ |
|----|-----|---------|-----------|-----------|
| 1 | An Giang | 91 | ✓ | ✓ |
| 2 | Bắc Ninh | 24 | ✓ | ✓ |
| 3 | Cà Mau | 96 | ✓ | ✓ |
| 4 | Cao Bằng | 04 | ✓ | ✓ |
| 5 | Cần Thơ | 92 | ✓ | ✓ |
| 6 | Đà Nẵng | 48 | ✓ | ✓ |
| 7 | Đắk Lắk | 66 | ✓ | ✓ |
| 8 | Điện Biên | 11 | ✓ | ✓ |
| 9 | Đồng Nai | 75 | ✓ | ✓ |
| 10 | Đồng Tháp | 82 | ✓ | ✓ |
| 11 | Gia Lai | 52 | ✓ | ✓ |
| 12 | Hà Nội | 01 | ✓ | ✓ |
| 13 | Hà Tĩnh | 42 | ✓ | ✓ |
| 14 | Hải Phòng | 31 | ✓ | ✓ |
| 15 | Huế | 46 | ✓ | ✓ |
| 16 | Hưng Yên | 33 | ✓ | ✓ |
| 17 | Khánh Hòa | 56 | ✓ | ✓ |
| 18 | Lai Châu | 12 | ✓ | ✓ |
| 19 | Lạng Sơn | 20 | ✓ | ✓ |
| 20 | Lào Cai | 15 | ✓ | ✓ |
| 21 | Lâm Đồng | 68 | ✓ | ✓ |
| 22 | Nghệ An | 40 | ✓ | ✓ |
| 23 | Ninh Bình | 37 | ✓ | ✓ |
| 24 | Phú Thọ | 25 | ✓ | ✓ |
| 25 | Quảng Ngãi | 51 | ✓ | ✓ |
| 26 | Quảng Ninh | 22 | ✓ | ✓ |
| 27 | Quảng Trị | 44 | ✓ | ✓ |
| 28 | Sơn La | 14 | ✓ | ✓ |
| 29 | Tây Ninh | 80 | ✓ | ✓ |
| 30 | Thái Nguyên | 19 | ✓ | ✓ |
| 31 | Thanh Hóa | 38 | ✓ | ✓ |
| 32 | TP. Hồ Chí Minh | 79 | ✓ | ✓ |
| 33 | Tuyên Quang | 08 | ✓ | ✓ |
| 34 | Vĩnh Long | 86 | ✓ | ✓ |

**Mapping Coverage: 34/34 (100%)** ✅

## Testing & Verification

### Test Mapping
```bash
cd z_Seatrans_Redesign
node testProvinceMapping.js
```

**Kết quả:**
- ✓ Matched: 34/34
- ✗ Unmatched: 0/34
- 🎯 Coverage: 100%

### Extract Province Data
```bash
cd z_Seatrans_Redesign
node extractProvinces.js
```

## Deployment Checklist

### Backend
- [ ] Backup database hiện tại
- [ ] Chạy migration: `mysql -u user -p db < database/migration_update_provinces_newvn.sql`
- [ ] Verify: `SELECT COUNT(*) FROM provinces;` (phải = 34)
- [ ] Kiểm tra API: `/api/provinces/active`

### Frontend
- [ ] Build production: `npm run build`
- [ ] Test map hiển thị đúng 34 tỉnh
- [ ] Test hover/click trên markers
- [ ] Verify console không có warning về missing provinces

### Testing
- [ ] Test trên development environment trước
- [ ] Verify tất cả province markers hiển thị
- [ ] Check coordinate mapping chính xác
- [ ] Test responsive trên mobile

## Lợi ích của newvn.geojson

### Ưu điểm
1. ✅ **Dữ liệu chi tiết hơn**: Có thông tin diện tích, dân số
2. ✅ **Tên tỉnh chuẩn**: Tiếng Việt có dấu, chuẩn hóa
3. ✅ **Phù hợp thực tế**: 34 tỉnh chính thay vì 63
4. ✅ **Geometry chính xác hơn**: Bản đồ chi tiết hơn

### Nhược điểm
1. ⚠️ **Ít tỉnh hơn**: 34 so với 63 (giảm 46%)
2. ⚠️ **Breaking change**: Cần migration database
3. ⚠️ **Logic thay đổi**: Match bằng tên thay vì ID

## Rollback Plan

Nếu cần quay lại vn.json:

### 1. Frontend
```typescript
// Coverage.tsx
import vnGeo from '@/assets/vn.json'
// Restore old logic: f.id === p.id
```

### 2. Database
```sql
-- Restore from backup
INSERT INTO provinces SELECT * FROM provinces_backup;
INSERT INTO ports SELECT * FROM ports_backup;
```

### 3. Scripts
```javascript
// extractProvinces.js
const vnGeo = require('./src/assets/vn.json');
// Use properties.id and properties.name
```

## Support & Maintenance

### Debug Commands
```bash
# Test mapping
node z_Seatrans_Redesign/testProvinceMapping.js

# Extract provinces
node z_Seatrans_Redesign/extractProvinces.js

# Check geojson structure
node -e "console.log(JSON.parse(require('fs').readFileSync('z_Seatrans_Redesign/src/assets/newvn.geojson', 'utf8')).features[0])"
```

### Common Issues

**Issue: Province không hiển thị trên map**
- Check console warning về missing geometry
- Verify tên tỉnh trong database match với geojson
- Run `testProvinceMapping.js` để check coverage

**Issue: Coordinates [0, 0]**
- Province không có trong geojson
- Tên tỉnh không match
- Geometry invalid

**Issue: Map bị zoom sai**
- Kiểm tra `projectionConfig` trong Coverage.tsx
- Adjust `center` và `scale` nếu cần

## Tài liệu liên quan

- 📄 `database/README_MIGRATION.md` - Hướng dẫn migration database
- 📄 `src/utils/provinceMapping.ts` - Utility functions
- 📄 `extractProvinces.js` - Script extract data
- 📄 `testProvinceMapping.js` - Script test mapping

---

**Completed:** ✅ All changes implemented and tested
**Status:** Ready for production deployment
**Last Updated:** 2026-01-01



