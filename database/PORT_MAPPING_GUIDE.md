# Port Mapping Guide - Database Migration

## Tổng quan

Khi migrate từ database cũ (63 tỉnh) sang database mới (34 tỉnh), một số cảng cần được map sang tỉnh lân cận vì tỉnh gốc không còn trong danh sách 34 tỉnh.

## Port Mapping Table

### ✅ Direct Mapping (Tỉnh có trong 34 tỉnh mới)

| ID | Tên cảng | Tỉnh cũ | province_id cũ | Tỉnh mới | province_id mới | Status |
|----|----------|---------|----------------|----------|-----------------|---------|
| 1 | Cái Lân (Cai Lan Port) | Quảng Ninh | 25 | Quảng Ninh | **26** | ✅ Direct |
| 2 | Nghi Sơn Port | Thanh Hóa | 13 | Thanh Hóa | **31** | ✅ Direct |
| 3 | Cửa Lò Port | Nghệ An | 14 | Nghệ An | **22** | ✅ Direct |
| 4 | Vũng Áng Port | Hà Tĩnh | 15 | Hà Tĩnh | **13** | ✅ Direct |
| 5 | Chân Mây Port | Thừa Thiên - Huế | 18 | Huế | **15** | ✅ Direct |
| 7 | Dung Quất Port | Quảng Ngãi | 42 | Quảng Ngãi | **25** | ✅ Direct |
| 12 | SP-ITC | TP.HCM | 29 | TP. Hồ Chí Minh | **32** | ✅ Direct |
| 13 | Nhà Bè Port | TP.HCM | 29 | TP. Hồ Chí Minh | **32** | ✅ Direct |

### ⚠️ Approximate Mapping (Tỉnh không có trong 34 tỉnh mới)

| ID | Tên cảng | Tỉnh gốc | province_id cũ | Tỉnh mới (gần nhất) | province_id mới | Lý do |
|----|----------|----------|----------------|---------------------|-----------------|-------|
| 6 | Chu Lai Port | **Quảng Nam** | 19 | Đà Nẵng | **6** | ⚠️ Quảng Nam không có trong 34 tỉnh |
| 8 | Quy Nhơn Port | **Bình Định** | 41 | Khánh Hòa | **17** | ⚠️ Bình Định không có trong 34 tỉnh |
| 9 | Phu My Port | **Bà Rịa - Vũng Tàu** | 28 | Đồng Nai | **9** | ⚠️ BR-VT không có trong 34 tỉnh |
| 10 | ODA Thị Vải | **Bà Rịa - Vũng Tàu** | 28 | Đồng Nai | **9** | ⚠️ BR-VT không có trong 34 tỉnh |
| 11 | SP-PSA | **Bà Rịa - Vũng Tàu** | 28 | Đồng Nai | **9** | ⚠️ BR-VT không có trong 34 tỉnh |

### ➕ Additional Ports (Cảng bổ sung)

| Tên cảng | Tỉnh | province_id | Ghi chú |
|----------|------|-------------|---------|
| Hải Phòng Port | Hải Phòng | 14 | Cảng chính miền Bắc |
| Tiên Sa Port | Đà Nẵng | 6 | Cảng chính miền Trung |
| Cát Lái Port | TP. Hồ Chí Minh | 32 | Cảng container lớn |
| Cần Thơ Port | Cần Thơ | 5 | Cảng chính miền Tây |
| Cam Ranh Port | Khánh Hòa | 17 | Cảng quốc tế |

## Detailed Port Information

### 1. Miền Bắc

#### Hải Phòng (ID: 14)
- Hải Phòng Port (mới thêm)

#### Quảng Ninh (ID: 26)
- Cái Lân (Cai Lan Port)

### 2. Miền Trung

#### Thanh Hóa (ID: 31)
- Nghi Sơn Port

#### Nghệ An (ID: 22)
- Cửa Lò Port

#### Hà Tĩnh (ID: 13)
- Vũng Áng Port

#### Huế (ID: 15)
- Chân Mây Port

#### Đà Nẵng (ID: 6)
- Tiên Sa Port (mới thêm)
- Chu Lai Port (⚠️ gốc từ Quảng Nam)

#### Quảng Ngãi (ID: 25)
- Dung Quất Port

#### Khánh Hòa (ID: 17)
- Cam Ranh Port (mới thêm)
- Quy Nhơn Port (⚠️ gốc từ Bình Định)

### 3. Miền Nam

#### Đồng Nai (ID: 9)
- Phu My Port (⚠️ gốc từ Bà Rịa - Vũng Tàu)
- ODA Thị Vải (⚠️ gốc từ Bà Rịa - Vũng Tàu)
- SP-PSA (⚠️ gốc từ Bà Rịa - Vũng Tàu)

#### TP. Hồ Chí Minh (ID: 32)
- SP-ITC
- Nhà Bè Port
- Cát Lái Port (mới thêm)

#### Cần Thơ (ID: 5)
- Cần Thơ Port (mới thêm)

## Provinces Not in New 34-Province List

Các tỉnh sau không có trong danh sách 34 tỉnh mới của `newvn.geojson`:

1. **Quảng Nam** (old ID: 19)
   - Cảng gốc: Chu Lai Port
   - Map sang: Đà Nẵng (ID: 6)

2. **Bình Định** (old ID: 41)
   - Cảng gốc: Quy Nhơn Port
   - Map sang: Khánh Hòa (ID: 17)

3. **Bà Rịa - Vũng Tàu** (old ID: 28)
   - Cảng gốc: Phu My Port, ODA Thị Vải, SP-PSA
   - Map sang: Đồng Nai (ID: 9)

## Recommendations

### Option 1: Keep Current Mapping (Recommended for Quick Migration)
✅ **Ưu điểm:**
- Migration nhanh chóng
- Không làm gián đoạn service
- Có thể cập nhật sau

⚠️ **Nhược điểm:**
- Một số cảng không chính xác 100% về mặt địa lý
- Cần giải thích cho user về sự thay đổi

### Option 2: Keep Old 63-Province Structure
✅ **Ưu điểm:**
- Không cần thay đổi port mapping
- Chính xác 100% về địa lý

⚠️ **Nhược điểm:**
- Không tận dụng được data mới từ `newvn.geojson`
- Map sẽ vẫn dùng data cũ

### Option 3: Add Missing Provinces to Database
✅ **Ưu điểm:**
- Giữ được chính xác port location
- Có thể display full 63 provinces

⚠️ **Nhược điểm:**
- Một số tỉnh sẽ không có geometry trong `newvn.geojson`
- Map sẽ không hiển thị đủ 63 tỉnh

## Migration Commands

### Check Current Ports
```sql
SELECT 
    p.name as port_name, 
    pr.name as province_name, 
    p.province_id,
    pr.is_active as province_active,
    p.is_active as port_active
FROM ports p
LEFT JOIN provinces pr ON p.province_id = pr.id
ORDER BY pr.name;
```

### Verify Port Count
```sql
SELECT COUNT(*) as total_ports FROM ports;
SELECT COUNT(*) as active_ports FROM ports WHERE is_active = 1;
-- Expected: 18 total ports, 18 active ports
```

### Check Ports by Province
```sql
SELECT 
    pr.id,
    pr.name as province_name,
    COUNT(p.id) as port_count,
    GROUP_CONCAT(p.name SEPARATOR ', ') as ports
FROM provinces pr
LEFT JOIN ports p ON pr.id = p.province_id
GROUP BY pr.id, pr.name
HAVING port_count > 0
ORDER BY port_count DESC;
```

## Notes

- **Total ports**: 18 (13 original + 5 additional)
- **Active ports**: 18 (all ports are active)
- **Total provinces**: 34 (all active)
- **Provinces with ports**: 13 out of 34
- **Approximate mappings**: 5 ports (Chu Lai, Quy Nhơn, Phu My, ODA Thị Vải, SP-PSA)
- **Direct mappings**: 13 ports
- **is_active field**: All provinces and ports are set to `is_active = 1` by default

## Contact & Support

Nếu cần điều chỉnh port mapping, vui lòng:
1. Xác định tỉnh chính xác cho các cảng
2. Cập nhật `province_id` trong migration script
3. Re-run migration
4. Test frontend Coverage component

---

**Last Updated:** 2026-01-01  
**Status:** Ready for review and deployment

