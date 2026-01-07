# Province ID Mapping - ma_tinh from newvn.geojson

## Quan trọng

**Province ID trong database = `ma_tinh` từ newvn.geojson**

Điều này đảm bảo:
- ✅ ID khớp với mã tỉnh chuẩn GSO (General Statistics Office)
- ✅ Dễ maintain và debug
- ✅ Khớp trực tiếp với geojson data

## Complete Province ID Mapping

| ID | Tên Tỉnh | ma_tinh | Region |
|----|----------|---------|--------|
| 1 | Hà Nội | 01 | Miền Bắc |
| 4 | Cao Bằng | 04 | Miền Bắc |
| 8 | Tuyên Quang | 08 | Miền Bắc |
| 11 | Điện Biên | 11 | Miền Bắc |
| 12 | Lai Châu | 12 | Miền Bắc |
| 14 | Sơn La | 14 | Miền Bắc |
| 15 | Lào Cai | 15 | Miền Bắc |
| 19 | Thái Nguyên | 19 | Miền Bắc |
| 20 | Lạng Sơn | 20 | Miền Bắc |
| 22 | Quảng Ninh | 22 | Miền Bắc |
| 24 | Bắc Ninh | 24 | Miền Bắc |
| 25 | Phú Thọ | 25 | Miền Bắc |
| 31 | Hải Phòng | 31 | Miền Bắc |
| 33 | Hưng Yên | 33 | Miền Bắc |
| 37 | Ninh Bình | 37 | Miền Bắc |
| 38 | Thanh Hóa | 38 | Miền Trung |
| 40 | Nghệ An | 40 | Miền Trung |
| 42 | Hà Tĩnh | 42 | Miền Trung |
| 44 | Quảng Trị | 44 | Miền Trung |
| 46 | Huế | 46 | Miền Trung |
| 48 | Đà Nẵng | 48 | Miền Trung |
| 51 | Quảng Ngãi | 51 | Miền Trung |
| 52 | Gia Lai | 52 | Miền Trung |
| 56 | Khánh Hòa | 56 | Miền Trung |
| 66 | Đắk Lắk | 66 | Miền Trung |
| 68 | Lâm Đồng | 68 | Miền Trung |
| 75 | Đồng Nai | 75 | Miền Nam |
| 79 | TP. Hồ Chí Minh | 79 | Miền Nam |
| 80 | Tây Ninh | 80 | Miền Nam |
| 82 | Đồng Tháp | 82 | Miền Nam |
| 86 | Vĩnh Long | 86 | Miền Nam |
| 91 | An Giang | 91 | Miền Nam |
| 92 | Cần Thơ | 92 | Miền Nam |
| 96 | Cà Mau | 96 | Miền Nam |

## Port Mappings với Province ID mới

| Port | Province | Province ID (ma_tinh) |
|------|----------|----------------------|
| Hà Nội (if any) | Hà Nội | 1 |
| Hải Phòng Port | Hải Phòng | 31 |
| Cái Lân (Cai Lan Port) | Quảng Ninh | 22 |
| Nghi Sơn Port | Thanh Hóa | 38 |
| Cửa Lò Port | Nghệ An | 40 |
| Vũng Áng Port | Hà Tĩnh | 42 |
| Chân Mây Port | Huế | 46 |
| Tiên Sa Port | Đà Nẵng | 48 |
| Chu Lai Port | Đà Nẵng ⚠️ | 48 |
| Dung Quất Port | Quảng Ngãi | 51 |
| Quy Nhơn Port | Khánh Hòa ⚠️ | 56 |
| Cam Ranh Port | Khánh Hòa | 56 |
| Phu My Port | Đồng Nai ⚠️ | 75 |
| ODA Thị Vải | Đồng Nai ⚠️ | 75 |
| SP-PSA | Đồng Nai ⚠️ | 75 |
| SP-ITC | TP. Hồ Chí Minh | 79 |
| Nhà Bè Port | TP. Hồ Chí Minh | 79 |
| Cát Lái Port | TP. Hồ Chí Minh | 79 |
| Cần Thơ Port | Cần Thơ | 92 |

⚠️ = Mapped to nearby province (original province not in 34-province list)

## ID Gaps

Lưu ý có gaps trong ID sequence:
- 1, 4, 8, 11, 12, 14, 15, 19, 20, 22, 24, 25...
- Không có: 2, 3, 5, 6, 7, 9, 10, 13...

**Đây là BÌNH THƯỜNG** vì ID = ma_tinh từ GSO, không phải sequential.

## API Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": 1,          // ma_tinh: "01"
      "name": "Hà Nội",
      "is_active": true,
      "ports": [...]
    },
    {
      "id": 4,          // ma_tinh: "04"
      "name": "Cao Bằng",
      "is_active": true,
      "ports": []
    },
    {
      "id": 79,         // ma_tinh: "79"
      "name": "TP. Hồ Chí Minh",
      "is_active": true,
      "ports": ["SP-ITC", "Nhà Bè Port", "Cát Lái Port"]
    }
  ]
}
```

## Frontend Integration

Coverage.tsx sẽ:
1. Fetch provinces từ API (với ID = ma_tinh)
2. Tìm feature trong geojson bằng **tên tỉnh** (không phải ID)
3. Calculate centroid để hiển thị marker

```typescript
// Coverage.tsx already handles this correctly
const feature = findProvinceFeature(vnGeo, p.name)
// Matches by name, not by ID
```

## Database Schema

```sql
CREATE TABLE provinces (
    id BIGINT PRIMARY KEY,        -- Matches ma_tinh from geojson
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME
);

-- Example records:
-- (1, 'Hà Nội', 1, ...)
-- (4, 'Cao Bằng', 1, ...)
-- (79, 'TP. Hồ Chí Minh', 1, ...)
```

## Important Notes

1. **AUTO_INCREMENT is NOT used** - IDs are explicitly set to match ma_tinh
2. **ID gaps are expected** - This is normal for ma_tinh-based IDs
3. **Frontend matches by name** - ID is only for database relations
4. **Port foreign keys** use province ID (ma_tinh values)

## Verification

```sql
-- Check ID matches ma_tinh pattern
SELECT id, name FROM provinces ORDER BY id;

-- Should see gaps like: 1, 4, 8, 11, 12, 14, 15, 19, 20, 22...
-- This confirms IDs match ma_tinh from geojson ✓
```

---

**Last Updated:** 2026-01-01  
**Status:** ID mapping matches ma_tinh from newvn.geojson ✅



