# Dự Án Hệ Thống Logistics - Cấu Trúc Chi Tiết

## 1. Tổng Quan Dự Án

### Mục đích:
Xây dựng hệ thống quản lý logistics đa dịch vụ với 4 dịch vụ chính, hệ thống tính giá tự động, và quản lý người dùng theo role.

### Công nghệ:
- Backend: Spring Boot (Java)
- Database: MySQL/PostgreSQL
- Architecture: RESTful API, Layered Architecture

---

## 2. Phân Tích Roles (4 Loại Người Dùng)

### 2.1. GUEST (Khách vãng lai)
**Đặc điểm:**
- Chưa đăng ký tài khoản
- Truy cập hạn chế

**Quyền hạn:**
- ✅ Xem thông tin dịch vụ
- ✅ Xem bảng giá công khai
- ✅ Tính toán giá ước lượng (calculator)
- ✅ Xem thông tin công ty
- ❌ Đặt dịch vụ
- ❌ Xem lịch sử
- ❌ Lưu thông tin

**Use Cases:**
- Tìm hiểu về dịch vụ
- So sánh giá
- Tính toán chi phí dự kiến
- Đăng ký tài khoản để sử dụng dịch vụ

---

### 2.2. CUSTOMER (Khách hàng)
**Đặc điểm:**
- Đã đăng ký tài khoản
- Sử dụng dịch vụ

**Quyền hạn:**
- ✅ Tất cả quyền của GUEST
- ✅ Đặt dịch vụ (tạo booking/order)
- ✅ Xem lịch sử đơn hàng
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Xem hóa đơn
- ✅ Thanh toán online
- ✅ Đánh giá dịch vụ
- ✅ Quản lý thông tin cá nhân
- ❌ Truy cập quản trị hệ thống

**Thông tin lưu trữ:**
- Thông tin cá nhân/công ty
- Địa chỉ
- Lịch sử đơn hàng
- Lịch sử thanh toán
- Điểm tích lũy (loyalty points)

**Use Cases:**
- Đặt dịch vụ vận chuyển
- Theo dõi hàng hóa
- Thanh toán hóa đơn
- Xem báo cáo chi phí
- Liên hệ hỗ trợ

---

### 2.3. EMPLOYEE (Nhân viên)
**Đặc điểm:**
- Nhân viên công ty
- Xử lý nghiệp vụ

**Quyền hạn:**
- ✅ Tất cả quyền của CUSTOMER
- ✅ Xem danh sách đơn hàng của khách
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Tạo báo giá cho khách hàng
- ✅ Xác nhận thanh toán
- ✅ Quản lý thông tin vận chuyển
- ✅ Liên hệ với đối tác (tàu, cảng, etc.)
- ✅ Tạo hóa đơn
- ✅ Xem báo cáo doanh thu (của mình)
- ❌ Xóa đơn hàng
- ❌ Sửa giá (cần approval)
- ❌ Truy cập quản trị hệ thống

**Thông tin lưu trữ:**
- Mã nhân viên
- Phòng ban
- Chức vụ
- Khu vực phụ trách
- Hiệu suất làm việc

**Use Cases:**
- Tiếp nhận yêu cầu khách hàng
- Tạo báo giá
- Xử lý đơn hàng
- Cập nhật tiến độ vận chuyển
- Liên hệ đối tác
- Báo cáo công việc

---

### 2.4. ADMIN (Quản trị viên)
**Đặc điểm:**
- Quản lý toàn bộ hệ thống
- Quyền cao nhất

**Quyền hạn:**
- ✅ Tất cả quyền của EMPLOYEE
- ✅ Quản lý người dùng (tạo, sửa, xóa, khóa)
- ✅ Quản lý nhân viên
- ✅ Cấu hình công thức tính giá
- ✅ Thêm/sửa/xóa dịch vụ
- ✅ Quản lý đối tác
- ✅ Xem tất cả báo cáo
- ✅ Xem dashboard tổng quan
- ✅ Quản lý hệ thống thanh toán
- ✅ Cấu hình hệ thống
- ✅ Xem logs/audit trail

**Thông tin lưu trữ:**
- Quyền truy cập cấp cao
- Lịch sử thao tác
- Audit logs

**Use Cases:**
- Quản lý toàn bộ hệ thống
- Phê duyệt giá đặc biệt
- Xem báo cáo kinh doanh
- Quản lý tài chính
- Cấu hình giá dịch vụ
- Quản lý nhân sự

---

## 3. Database Design - Roles & Users

### 3.1. Bảng Users (Chung)
```
users
├── id (PK)
├── username (unique)
├── email (unique)
├── password (hashed)
├── full_name
├── phone
├── created_at
├── updated_at
├── is_active
└── last_login
```

### 3.2. Bảng Roles
```
roles
├── id (PK)
├── name (ROLE_GUEST, ROLE_CUSTOMER, ROLE_EMPLOYEE, ROLE_ADMIN)
├── description
└── role_group (INTERNAL, EXTERNAL)
```

**Role Groups:**
- INTERNAL: ADMIN, EMPLOYEE (nhân viên công ty)
- EXTERNAL: CUSTOMER, GUEST (khách hàng)

### 3.3. Bảng User_Roles (Many-to-Many)
```
user_roles
├── user_id (FK -> users)
├── role_id (FK -> roles)
└── assigned_at
```

### 3.4. Bảng Customers (Thông tin chi tiết khách hàng)
```
customers
├── id (PK)
├── user_id (FK -> users)
├── customer_code (unique, auto-generated)
├── company_name
├── tax_code
├── address
├── city
├── country
├── postal_code
├── customer_type (INDIVIDUAL, COMPANY)
├── loyalty_points
├── membership_level (BRONZE, SILVER, GOLD, PLATINUM)
└── credit_limit
```

### 3.5. Bảng Employees (Thông tin chi tiết nhân viên)
```
employees
├── id (PK)
├── user_id (FK -> users)
├── employee_code (unique)
├── department (SALES, OPERATIONS, FINANCE, CUSTOMER_SERVICE)
├── position
├── hire_date
├── manager_id (FK -> employees)
├── salary
└── commission_rate
```

---

## 4. Phân Tích 4 Services (Dịch Vụ Chính)

### 4.1. SHIPPING AGENCY (Đại lý tàu)
**Mô tả:**
Dịch vụ đại diện cho chủ tàu trong việc xử lý các thủ tục cảng, hải quan, và hỗ trợ tàu khi cập cảng.

**Nghiệp vụ:**
- Làm thủ tục nhập/xuất cảng cho tàu
- Hải quan cho tàu
- Sắp xếp dịch vụ cảng (neo đậu, dẫn tàu, kéo tàu)
- Cung cấp nhiên liệu, nước ngọt
- Sửa chữa và bảo trì tàu
- Quản lý thủy thủ đoàn (visa, y tế)

**Các yếu tố ảnh hưởng đến giá:**
- Loại tàu (container, bulk carrier, tanker, etc.)
- Trọng tải tàu (DWT - Deadweight Tonnage)
- Thời gian lưu cảng
- Số lượng thủ tục
- Cảng cập (chi phí cảng khác nhau)
- Dịch vụ phụ (pilotage, tugboat, etc.)
- Thời gian khẩn cấp (express service)

---

### 4.2. CHARTERING (Thuê tàu)
**Mô tả:**
Dịch vụ môi giới và sắp xếp hợp đồng thuê tàu giữa chủ hàng và chủ tàu.

**Nghiệp vụ:**
- Tìm kiếm tàu phù hợp cho khách hàng
- Đàm phán hợp đồng thuê tàu
- Sắp xếp lịch trình
- Quản lý hợp đồng

**Loại hình thuê tàu:**
1. **Voyage Charter** (Thuê chuyến)
   - Thuê tàu cho một chuyến đi cụ thể
   
2. **Time Charter** (Thuê theo thời gian)
   - Thuê tàu theo ngày/tháng/năm
   
3. **Bareboat Charter** (Thuê không thuyền viên)
   - Thuê tàu trống, tự quản lý

**Các yếu tố ảnh hưởng đến giá:**
- Loại hình thuê
- Loại tàu và trọng tải
- Thời gian thuê
- Tuyến đường
- Khoảng cách
- Giá nhiên liệu (bunker)
- Mùa vụ (peak season, low season)
- Loại hàng hóa
- Tốc độ tàu
- Điều kiện thời tiết
- Phí hoa hồng

---

### 4.3. SHIP-BROKING (Môi giới tàu)
**Mô tả:**
Dịch vụ môi giới mua bán tàu, tư vấn thị trường tàu biển.

**Nghiệp vụ:**
- Môi giới mua bán tàu mới
- Môi giới mua bán tàu cũ
- Đánh giá giá trị tàu
- Tư vấn đầu tư tàu biển
- Môi giới phá dỡ tàu

**Các yếu tố ảnh hưởng đến giá:**
- Giá trị tàu
- Loại giao dịch (mua/bán/phá dỡ)
- Tuổi tàu
- Tình trạng tàu
- Thị trường tàu biển
- Phí hoa hồng (% giá trị tàu)
- Dịch vụ tư vấn
- Đánh giá và kiểm định
- Thủ tục pháp lý

---

### 4.4. TOTAL LOGISTICS (Logistics tổng hợp)
**Mô tả:**
Dịch vụ logistics đầu cuối, quản lý toàn bộ chuỗi cung ứng từ điểm đi đến điểm đến.

**Nghiệp vụ:**
- Vận chuyển đa phương thức (sea, air, road, rail)
- Quản lý kho bãi
- Đóng gói và phân phối
- Hải quan xuất nhập khẩu
- Bảo hiểm hàng hóa
- Theo dõi và giám sát hàng hóa
- Tư vấn chuỗi cung ứng

**Loại hình dịch vụ:**
1. **FCL** (Full Container Load) - Nguyên container
2. **LCL** (Less than Container Load) - Lẻ container
3. **Break Bulk** - Hàng rời
4. **Door to Door** - Từ kho đến kho
5. **Port to Port** - Từ cảng đến cảng
6. **Multimodal** - Đa phương thức

**Các yếu tố ảnh hưởng đến giá:**
- Loại hàng hóa
- Trọng lượng (weight)
- Thể tích (volume/CBM)
- Kích thước
- Loại container (20ft, 40ft, 40HC, reefer, etc.)
- Điểm đi - điểm đến
- Khoảng cách
- Phương thức vận chuyển
- Incoterms (EXW, FOB, CIF, DDP, etc.)
- Dịch vụ hải quan
- Bảo hiểm
- Thuế
- Phí kho bãi
- Thời gian giao hàng (standard, express)
- Hàng nguy hiểm (surcharge)

---

## 5. Công Thức Tính Giá (Pricing Formula)

### 5.1. Cấu Trúc Chung Của Mỗi Service

```
TOTAL_PRICE = BASE_PRICE + SUM(SURCHARGES) + TAXES - DISCOUNTS
```

**Các thành phần:**
1. **BASE_PRICE**: Giá cơ bản (tính theo công thức riêng của từng service)
2. **SURCHARGES**: Các phí phụ thu
3. **TAXES**: Thuế và phí
4. **DISCOUNTS**: Giảm giá (theo customer level, volume, etc.)

---

### 5.2. SHIPPING AGENCY - Công Thức Tính Giá

#### Input Fields (PORT D/A INQUIRY):
```
User inputs:
├── Full name
├── Phone/Fax/Mobile or E-mail
├── DWT (Deadweight Tonnage - trọng tải tàu)
├── GRT (Gross Register Tonnage)
├── LOA (Length Overall - chiều dài tàu)
├── Cargo/Quantity (Loại hàng và số lượng)
├── Port of call (Haiphong or Ho Chi Minh)
└── Other information (optional)
```

#### Base Price Formula:
```
BASE_PRICE = PORT_FEES + AGENCY_FEE + AUTHORITY_FEES
```

#### Các công thức con:

**1. PORT_FEES (Phí cảng) - Dựa trên DWT, GRT, LOA, Port:**
```
PORT_FEES = BERTH_FEE + PILOTAGE_FEE + TUGBOAT_FEE + MOORING_FEE
```

- **BERTH_FEE** (Phí neo đậu):
  ```
  BERTH_FEE = DWT × PORT_BERTH_RATE × ESTIMATED_HOURS
  
  PORT_BERTH_RATE (USD/DWT/hour):
  - Haiphong: 0.015
  - Ho Chi Minh: 0.018
  
  ESTIMATED_HOURS (based on Cargo/Quantity):
  - Light cargo: 12-24 hours
  - Medium cargo: 24-48 hours
  - Heavy cargo: 48-72 hours
  ```

- **PILOTAGE_FEE** (Phí dẫn tàu - dựa trên GRT):
  ```
  PILOTAGE_FEE = BASE_PILOT_FEE + (GRT × PILOT_RATE_PER_GRT)
  
  Port-based rates:
  - Haiphong: BASE = $300, RATE = $0.05/GRT
  - Ho Chi Minh: BASE = $350, RATE = $0.06/GRT
  ```

- **TUGBOAT_FEE** (Phí kéo tàu - dựa trên LOA và Port):
  ```
  TUGBOAT_FEE = NUMBER_OF_TUGS × TUG_HOURLY_RATE × HOURS
  
  NUMBER_OF_TUGS (based on LOA):
  - LOA < 100m: 1 tug
  - LOA 100-200m: 2 tugs
  - LOA > 200m: 3 tugs
  
  TUG_HOURLY_RATE:
  - Haiphong: $200/hour
  - Ho Chi Minh: $250/hour
  
  HOURS: typically 2-4 hours
  ```

- **MOORING_FEE** (Phí buộc dây - dựa trên LOA):
  ```
  MOORING_FEE = FIXED_FEE + (LOA × LOA_RATE)
  
  FIXED_FEE: $150
  LOA_RATE: $2/meter
  ```

**2. AGENCY_FEE (Phí đại lý):**
```
AGENCY_FEE = BASE_AGENCY_FEE + DOCUMENT_FEE + COMMUNICATION_FEE

BASE_AGENCY_FEE:
- Standard service: $800
- Port: Haiphong +$100, Ho Chi Minh +$150

DOCUMENT_FEE: $200 (fixed)
COMMUNICATION_FEE: $100 (fixed)
```

**3. AUTHORITY_FEES (Phí cơ quan - dựa trên GRT và Port):**
```
AUTHORITY_FEES = CUSTOMS_FEE + IMMIGRATION_FEE + HEALTH_FEE + SECURITY_FEE

CUSTOMS_FEE = GRT × 0.08
IMMIGRATION_FEE = $50 per crew member (assume 20 average)
HEALTH_FEE = $150 (fixed)
SECURITY_FEE = $100 (fixed)
```

**4. CARGO_SURCHARGE (Phụ thu theo loại hàng):**
```
Based on Cargo/Quantity input:
- Dangerous goods: +30%
- Perishable goods: +20%
- Heavy cargo (>500 tons): +15%
- Special handling: +10%
```

**5. SURCHARGES (Phụ thu khác):**
```
SURCHARGES = 
  + BUNKER_SURCHARGE (phí nhiên liệu: 5% of PORT_FEES)
  + WATER_SUPPLY_FEE ($200 fixed)
  + WASTE_DISPOSAL_FEE ($150 fixed)
  + WEEKEND_SURCHARGE (nếu cập cảng cuối tuần: +20%)
  + HOLIDAY_SURCHARGE (nếu cập cảng ngày lễ: +50%)
```

**6. DISCOUNT (Giảm giá):**
```
DISCOUNT = 
  + VOLUME_DISCOUNT (nhiều tàu/tháng: 5-15%)
  + LOYALTY_DISCOUNT (khách hàng thân thiết: 5-10%)
  + LONG_TERM_CONTRACT (hợp đồng dài hạn: 10%)
```

**7. CALCULATION EXAMPLE:**
```
Input:
- DWT: 50,000
- GRT: 30,000
- LOA: 180m
- Cargo: Container / 1,000 TEU
- Port: Ho Chi Minh

Calculation:
BERTH_FEE = 50,000 × 0.018 × 36 hours = $32,400
PILOTAGE_FEE = 350 + (30,000 × 0.06) = $2,150
TUGBOAT_FEE = 2 tugs × 250 × 3 hours = $1,500
MOORING_FEE = 150 + (180 × 2) = $510
PORT_FEES = $36,560

AGENCY_FEE = 800 + 150 + 200 + 100 = $1,250

AUTHORITY_FEES = (30,000 × 0.08) + (20 × 50) + 150 + 100 = $3,650

SUBTOTAL = $41,460
SURCHARGES = $2,073 + 200 + 150 = $2,423
TOTAL BEFORE DISCOUNT = $43,883

If 10% loyalty discount: FINAL = $39,495
```

---

### 5.3. CHARTERING & SHIP-BROKING - Công Thức Tính Giá

#### Input Fields (TONNAGE/VESSEL ORDER):
```
User inputs:
├── Full name
├── Phone/Fax/Mobile or E-mail
├── Cargo/Quantity (Loại hàng và số lượng)
├── Loading port (Cảng xếp)
├── Discharging port (Cảng dỡ)
├── LAY CAN (Laycan period - khoảng thời gian)
│   ├── From date
│   └── To date
└── Other information (optional)
```

**Note:** Chartering và Ship-broking được gộp chung form vì cùng liên quan đến thuê/môi giới tàu.

#### Base Price Formula:
```
BASE_PRICE = VOYAGE_FREIGHT + PORT_CHARGES + BUNKER_COST + BROKER_COMMISSION
```

#### Các công thức con:

**1. VOYAGE_FREIGHT (Cước vận chuyển):**
```
VOYAGE_FREIGHT = FREIGHT_RATE × CARGO_QUANTITY

FREIGHT_RATE = BASE_RATE × ROUTE_MULTIPLIER × SEASON_MULTIPLIER × CARGO_TYPE_MULTIPLIER

BASE_RATE: $20-50 per ton (tùy loại hàng)
CARGO_QUANTITY: từ input (tấn)
```

**2. ROUTE_MULTIPLIER (Hệ số tuyến đường):**
```
Calculate distance between Loading port and Discharging port:

DISTANCE = calculate_nautical_miles(loading_port, discharging_port)

Common routes (nautical miles):
- Haiphong to Singapore: ~1,400 nm
- Haiphong to Hong Kong: ~500 nm
- HCMC to Singapore: ~700 nm
- HCMC to Japan: ~2,500 nm

ROUTE_MULTIPLIER:
if DISTANCE < 500 nm:
  MULTIPLIER = 1.0
else if DISTANCE < 1,500 nm:
  MULTIPLIER = 1.2
else if DISTANCE < 3,000 nm:
  MULTIPLIER = 1.5
else:
  MULTIPLIER = 2.0
```

**3. SEASON_MULTIPLIER (Hệ số mùa vụ - dựa trên LAY CAN dates):**
```
Extract month from "From date":

if MONTH in [6,7,8,9,12]:  // Peak season
  MULTIPLIER = 1.3
else if MONTH in [2,3,4]:  // Low season
  MULTIPLIER = 0.8
else:  // Normal season
  MULTIPLIER = 1.0
```

**4. CARGO_TYPE_MULTIPLIER (Hệ số loại hàng):**
```
Based on Cargo/Quantity input (parse cargo type):

Cargo types:
- Bulk (coal, grain, ore): 1.0
- Container: 1.2
- Liquid (oil, chemicals): 1.3
- General cargo: 1.1
- Heavy/Project cargo: 1.5
- Dangerous goods: 1.6
```

**5. PORT_CHARGES (Phí cảng):**
```
PORT_CHARGES = LOADING_PORT_FEE + DISCHARGING_PORT_FEE

PORT_FEE = BASE_PORT_FEE + (CARGO_QUANTITY × PORT_RATE_PER_TON)

Major ports rates:
Loading port:
- Haiphong: BASE = $2,000, RATE = $5/ton
- HCMC: BASE = $2,500, RATE = $6/ton
- Danang: BASE = $1,800, RATE = $4.5/ton

Discharging port:
- Singapore: BASE = $3,000, RATE = $7/ton
- Hong Kong: BASE = $3,500, RATE = $8/ton
- Japan: BASE = $4,000, RATE = $10/ton
- China: BASE = $2,800, RATE = $6/ton
```

**6. BUNKER_COST (Chi phí nhiên liệu):**
```
BUNKER_COST = (DISTANCE / SPEED) × DAILY_FUEL_CONSUMPTION × FUEL_PRICE

Assumptions:
- SPEED: 12-15 knots (average)
- DAILY_FUEL_CONSUMPTION: 20-40 tons/day (depending on vessel size)
- FUEL_PRICE: $500-600/ton (current market)

Formula:
VOYAGE_DAYS = DISTANCE / (SPEED × 24)
BUNKER_COST = VOYAGE_DAYS × 30 tons × $550
```

**7. LAYCAN_DURATION_FEE (Phí theo thời gian Laycan):**
```
LAYCAN_DAYS = calculate_days_between(from_date, to_date)

if LAYCAN_DAYS > 30:
  LONG_LAYCAN_SURCHARGE = $500 per extra day
else:
  LONG_LAYCAN_SURCHARGE = 0
```

**8. BROKER_COMMISSION (Phí môi giới):**
```
BROKER_COMMISSION = (VOYAGE_FREIGHT + PORT_CHARGES + BUNKER_COST) × COMMISSION_RATE

COMMISSION_RATE:
- Chartering: 1.25% - 2.5%
- Ship-broking (if vessel sale involved): 1% - 2%
- Address commission (if applicable): 2.5%
```

**9. SURCHARGES (Phụ thu):**
```
SURCHARGES = 
  + WAR_RISK_SURCHARGE (khu vực chiến tranh: +5-10%)
  + PIRACY_SURCHARGE (khu vực cướp biển: +3-5%)
  + CANAL_FEES (nếu qua Suez/Panama: $300,000-500,000)
  + WEATHER_DELAY (mùa bão: +$1,000/day)
  + URGENT_LAYCAN (LAY CAN < 7 days: +20%)
```

**10. DISCOUNT (Giảm giá):**
```
DISCOUNT = 
  + VOLUME_DISCOUNT (>5,000 tons: 5%, >10,000 tons: 10%)
  + REGULAR_CUSTOMER (khách quen: 5-10%)
  + LONG_TERM_CONTRACT (hợp đồng dài hạn: 10-15%)
  + BACKHAUL (tàu về rỗng: 20-30%)
```

**11. CALCULATION EXAMPLE:**
```
Input:
- Cargo: Bulk coal / 10,000 tons
- Loading port: Haiphong
- Discharging port: Japan
- LAY CAN: 2025-01-15 to 2025-02-15 (31 days)

Calculation:
DISTANCE = 2,500 nm
FREIGHT_RATE = $35 × 1.5 (route) × 1.0 (season Jan) × 1.0 (bulk) = $52.5/ton
VOYAGE_FREIGHT = $52.5 × 10,000 = $525,000

LOADING_PORT_FEE = $2,000 + (10,000 × $5) = $52,000
DISCHARGING_PORT_FEE = $4,000 + (10,000 × $10) = $104,000
PORT_CHARGES = $156,000

VOYAGE_DAYS = 2,500 / (12 × 24) = 8.68 days
BUNKER_COST = 8.68 × 30 × $550 = $143,220

LAYCAN_SURCHARGE = 1 day × $500 = $500

SUBTOTAL = $525,000 + $156,000 + $143,220 + $500 = $824,720
BROKER_COMMISSION = $824,720 × 2% = $16,494

TOTAL = $841,214

If 10% volume discount: FINAL = $757,093
```

---

### 5.4. FREIGHT FORWARDING & TOTAL LOGISTICS - Công Thức Tính Giá

#### Base Price Formula:
```
BASE_PRICE = OCEAN_FREIGHT + INLAND_TRANSPORT + CUSTOMS_FEE + WAREHOUSE_FEE
```

#### Các công thức con:

**1. OCEAN_FREIGHT (Cước biển):**

**For FCL (Full Container Load):**
```
OCEAN_FREIGHT = CONTAINER_RATE × NUMBER_OF_CONTAINERS
```

- **CONTAINER_RATE** (theo loại):
  ```
  RATES = {
    "20GP": BASE_RATE_20,
    "40GP": BASE_RATE_40,
    "40HC": BASE_RATE_40HC,
    "20RF": BASE_RATE_20 × 1.5,  // Reefer container
    "40RF": BASE_RATE_40 × 1.5
  }
  ```

**For LCL (Less than Container Load):**
```
OCEAN_FREIGHT = max(WEIGHT_CHARGE, VOLUME_CHARGE)
```

- **WEIGHT_CHARGE**:
  ```
  WEIGHT_CHARGE = GROSS_WEIGHT × RATE_PER_KG
  ```

- **VOLUME_CHARGE**:
  ```
  VOLUME_CHARGE = CBM × RATE_PER_CBM
  ```
  - CBM (Cubic Meter) = Length(m) × Width(m) × Height(m)

**2. INLAND_TRANSPORT (Vận chuyển nội địa):**

**Pickup/Delivery:**
```
INLAND_TRANSPORT = BASE_TRANSPORT_FEE + (DISTANCE × RATE_PER_KM)
```

- Nếu có nhiều điểm:
  ```
  MULTI_STOP_FEE = BASE_FEE + (NUMBER_OF_STOPS × STOP_FEE)
  ```

**3. CUSTOMS_FEE (Phí hải quan):**
```
CUSTOMS_FEE = CUSTOMS_CLEARANCE_FEE + CUSTOMS_DECLARATION_FEE + INSPECTION_FEE
```

- **CUSTOMS_DECLARATION_FEE**: Fixed per shipment
- **INSPECTION_FEE**: Nếu hàng bị kiểm tra
- **DOCUMENT_FEE**: Phí xử lý giấy tờ

**4. WAREHOUSE_FEE (Phí kho bãi):**
```
WAREHOUSE_FEE = 
  + HANDLING_FEE (phí bốc xếp)
  + STORAGE_FEE (phí lưu kho)
  + PACKING_FEE (phí đóng gói)
```

- **HANDLING_FEE**:
  ```
  HANDLING_FEE = WEIGHT × HANDLING_RATE_PER_TON
  ```

- **STORAGE_FEE**:
  ```
  STORAGE_FEE = CBM × DAILY_RATE × NUMBER_OF_DAYS
  
  Free days: 3-7 days (miễn phí)
  After free days: charge applies
  ```

**5. SURCHARGES (Phụ thu):**
```
SURCHARGES = 
  + BAF (Bunker Adjustment Factor - phụ thu nhiên liệu)
  + CAF (Currency Adjustment Factor - phụ thu tỷ giá)
  + PSS (Peak Season Surcharge - phụ thu cao điểm)
  + GRI (General Rate Increase - tăng giá chung)
  + EBS (Emergency Bunker Surcharge - phụ thu nhiên liệu khẩn cấp)
  + THC (Terminal Handling Charge - phí xử lý container tại cảng)
  + CFS_CHARGE (Container Freight Station - phí trung chuyển LCL)
  + DANGEROUS_GOODS_SURCHARGE (hàng nguy hiểm: +50-100%)
  + OVERWEIGHT_SURCHARGE (quá tải)
  + OVERSIZED_SURCHARGE (quá khổ)
  + REMOTE_AREA_SURCHARGE (khu vực xa: +$50-200)
```

**6. INSURANCE (Bảo hiểm):**
```
INSURANCE_FEE = CARGO_VALUE × INSURANCE_RATE × COVERAGE_MULTIPLIER
```

- INSURANCE_RATE: thường 0.3% - 0.5%
- COVERAGE_MULTIPLIER:
  ```
  Basic coverage: 1.0
  All-risk coverage: 1.5
  War risk: 2.0
  ```

**7. TAXES (Thuế):**
```
TAXES = IMPORT_TAX + VAT + OTHER_DUTIES
```

- **IMPORT_TAX**:
  ```
  IMPORT_TAX = CARGO_VALUE × TAX_RATE (tùy loại hàng)
  ```

- **VAT**:
  ```
  VAT = (CARGO_VALUE + OCEAN_FREIGHT + IMPORT_TAX) × VAT_RATE
  ```

**8. INCOTERMS CALCULATION (Điều kiện giao hàng):**

```
if INCOTERM = "EXW":
  CUSTOMER_PAYS = TOTAL_PRICE
  
else if INCOTERM = "FOB":
  CUSTOMER_PAYS = OCEAN_FREIGHT + DESTINATION_CHARGES
  
else if INCOTERM = "CIF":
  CUSTOMER_PAYS = DESTINATION_CUSTOMS + INLAND_DELIVERY
  
else if INCOTERM = "DDP":
  CUSTOMER_PAYS = 0 (all inclusive)
```

**9. VOLUMETRIC WEIGHT (Trọng lượng quy đổi):**
```
VOLUMETRIC_WEIGHT = (Length × Width × Height) / DIMENSIONAL_FACTOR

DIMENSIONAL_FACTOR:
- Sea freight: 1,000
- Air freight: 6,000

CHARGEABLE_WEIGHT = max(ACTUAL_WEIGHT, VOLUMETRIC_WEIGHT)
```

**10. DISCOUNT (Giảm giá):**
```
DISCOUNT = 
  + VOLUME_DISCOUNT (số lượng lớn: 5-20%)
  + REGULAR_CUSTOMER_DISCOUNT (khách quen: 5-10%)
  + LONG_TERM_CONTRACT (hợp đồng dài hạn: 10-15%)
  + BACKHAUL_DISCOUNT (hàng về: 20-30%)
  + SEASONAL_DISCOUNT (mùa thấp điểm: 10%)
```

---

## 6. Database Design - Services

### 6.1. Bảng Services (Dịch vụ)
```
services
├── id (PK)
├── service_code (unique: SA, CH, SB, TL)
├── service_name
├── description
├── is_active
└── created_at
```

**Data:**
- SA: Shipping Agency
- CH: Chartering
- SB: Ship-Broking
- TL: Total Logistics

### 6.2. Bảng Service_Types (Loại dịch vụ con)
```
service_types
├── id (PK)
├── service_id (FK -> services)
├── type_code
├── type_name
├── description
└── is_active
```

**Ví dụ cho Total Logistics:**
- FCL
- LCL
- Door-to-Door
- Port-to-Port

### 6.3. Bảng Pricing_Formulas (Công thức tính giá)
```
pricing_formulas
├── id (PK)
├── service_id (FK -> services)
├── formula_name
├── formula_code (unique)
├── formula_expression (JSON hoặc text)
├── description
├── priority
├── is_active
└── created_at
```

### 6.4. Bảng Formula_Components (Thành phần công thức)
```
formula_components
├── id (PK)
├── formula_id (FK -> pricing_formulas)
├── component_name
├── component_code
├── component_type (FIXED, VARIABLE, PERCENTAGE, FORMULA)
├── base_value
├── calculation_method (ADD, MULTIPLY, PERCENTAGE, CUSTOM)
├── depends_on (JSON array: các component phụ thuộc)
├── conditions (JSON: điều kiện áp dụng)
└── order_index
```

### 6.5. Bảng Rate_Tables (Bảng giá)
```
rate_tables
├── id (PK)
├── service_id (FK -> services)
├── rate_type (VESSEL_TYPE, PORT, ROUTE, CONTAINER, etc.)
├── rate_name
├── base_rate
├── unit (USD, per_ton, per_cbm, per_day, etc.)
├── effective_from
├── effective_to
└── is_active
```

### 6.6. Bảng Surcharges (Phụ thu)
```
surcharges
├── id (PK)
├── service_id (FK -> services)
├── surcharge_code
├── surcharge_name
├── charge_type (FIXED, PERCENTAGE)
├── charge_value
├── conditions (JSON: điều kiện áp dụng)
├── is_mandatory
└── is_active
```

### 6.7. Bảng Discounts (Giảm giá)
```
discounts
├── id (PK)
├── discount_code
├── discount_name
├── discount_type (PERCENTAGE, FIXED_AMOUNT)
├── discount_value
├── applicable_services (JSON array)
├── min_order_value
├── customer_level (BRONZE, SILVER, GOLD, PLATINUM, ALL)
├── valid_from
├── valid_to
└── is_active
```

---

## 7. Database Design - Orders & Bookings

### 7.1. Bảng Orders (Đơn hàng)
```
orders
├── id (PK)
├── order_code (unique, auto: ORD-YYYYMMDD-XXXX)
├── customer_id (FK -> customers)
├── service_id (FK -> services)
├── service_type_id (FK -> service_types)
├── employee_id (FK -> employees, nhân viên phụ trách)
├── order_date
├── status (DRAFT, PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
├── total_amount
├── discount_amount
├── tax_amount
├── final_amount
├── currency (USD, VND, EUR)
├── payment_status (UNPAID, PARTIAL, PAID)
├── notes
├── created_at
├── updated_at
└── completed_at
```

### 7.2. Bảng Order_Items (Chi tiết đơn hàng)
```
order_items
├── id (PK)
├── order_id (FK -> orders)
├── item_description
├── quantity
├── unit_price
├── total_price
└── notes
```

### 7.3. Bảng Order_Calculations (Chi tiết tính giá)
```
order_calculations
├── id (PK)
├── order_id (FK -> orders)
├── component_name (BASE_PRICE, SURCHARGE_XXX, DISCOUNT_YYY, etc.)
├── component_value
├── calculation_note
└── calculated_at
```

**Lưu lại từng bước tính toán để:**
- Audit trail
- Giải thích giá cho khách hàng
- Debug khi có vấn đề

### 7.4. Bảng Quotations (Báo giá)
```
quotations
├── id (PK)
├── quote_code (unique: QT-YYYYMMDD-XXXX)
├── customer_id (FK -> customers)
├── employee_id (FK -> employees)
├── service_id (FK -> services)
├── quote_date
├── valid_until
├── status (DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED)
├── total_amount
├── notes
├── created_at
└── updated_at
```

### 7.5. Bảng Shipments (Vận chuyển - cho Total Logistics)
```
shipments
├── id (PK)
├── order_id (FK -> orders)
├── shipment_code (unique: SHP-YYYYMMDD-XXXX)
├── origin_address
├── origin_port
├── destination_address
├── destination_port
├── departure_date
├── estimated_arrival_date
├── actual_arrival_date
├── status (PENDING, IN_TRANSIT, ARRIVED, CUSTOMS, DELIVERED)
├── tracking_number
├── carrier_name
├── vessel_name
└── container_numbers (JSON array)
```

### 7.6. Bảng Cargo_Details (Thông tin hàng hóa)
```
cargo_details
├── id (PK)
├── shipment_id (FK -> shipments)
├── cargo_type (GENERAL, DANGEROUS, PERISHABLE, FRAGILE)
├── description
├── hs_code (mã HS hải quan)
├── quantity
├── unit (pieces, boxes, pallets)
├── gross_weight (kg)
├── net_weight (kg)
├── volume (cbm)
├── dimensions (JSON: length, width, height)
├── container_type (20GP, 40HC, etc.)
├── is_dangerous_goods
└── special_requirements
```

---

## 8. Workflow - Quy Trình Nghiệp Vụ

### 8.1. Customer Journey (Hành trình khách hàng)

```
1. GUEST visits website
   ↓
2. View services & pricing calculator
   ↓
3. Register account → become CUSTOMER
   ↓
4. Login & submit service request
   ↓
5. EMPLOYEE receives request
   ↓
6. EMPLOYEE creates quotation
   ↓
7. System calculates price (using formulas)
   ↓
8. EMPLOYEE sends quotation to CUSTOMER
   ↓
9. CUSTOMER reviews & accepts/rejects
   ↓
10. If accepted → Order created
   ↓
11. CUSTOMER makes payment
   ↓
12. EMPLOYEE processes order
   ↓
13. Service execution (shipping, logistics, etc.)
   ↓
14. CUSTOMER tracks status
   ↓
15. Service completed
   ↓
16. Invoice issued & payment confirmed
   ↓
17. CUSTOMER reviews service
```

### 8.2. Order Status Flow

```
DRAFT (Nháp)
  ↓
PENDING (Chờ xác nhận)
  ↓
CONFIRMED (Đã xác nhận) ← Payment required
  ↓
IN_PROGRESS (Đang xử lý)
  ↓
COMPLETED (Hoàn thành)

Or:
  → CANCELLED (Hủy) - có thể từ bất kỳ trạng thái nào
```

### 8.3. Payment Flow

```
Order Created
  ↓
Invoice Generated
  ↓
Payment Method Selected (Bank Transfer, Credit Card, E-wallet)
  ↓
Payment Submitted
  ↓
Payment Verification (by EMPLOYEE or auto)
  ↓
Payment Confirmed
  ↓
Receipt Issued
```

---

## 9. Tính Năng Hệ Thống Theo Role

### 9.1. GUEST Features
- 🔍 Browse services
- 📊 View public pricing
- 🧮 Use pricing calculator
- 📞 Contact form
- 📝 Register account

### 9.2. CUSTOMER Features
- ✅ All GUEST features
- 📦 Submit service request
- 💰 Request quotation
- 📋 View order history
- 🚚 Track shipments
- 💳 Make payments
- 📄 Download invoices
- ⭐ Rate & review services
- 👤 Manage profile
- 💬 Live chat with support

### 9.3. EMPLOYEE Features
- ✅ All CUSTOMER features
- 👥 View customer list
- 📋 Manage orders/quotations
- ✍️ Create quotations
- 💵 Create invoices
- ✔️ Confirm payments
- 📊 Update order status
- 📞 Contact customers
- 📈 View personal performance
- 🔔 Notifications for new requests

### 9.4. ADMIN Features
- ✅ All EMPLOYEE features
- 👨‍💼 Manage all users (CRUD)
- 👥 Manage employees
- 💼 Assign orders to employees
- ⚙️ Configure pricing formulas
- 💲 Manage rate tables
- 📊 View all reports & analytics
- 📈 Dashboard (revenue, orders, customers)
- 🔧 System configuration
- 🔍 Audit logs
- 💰 Financial reports
- 📉 Performance analytics

---

## 10. Các Module Chính Của Hệ Thống

### 10.1. Authentication & Authorization Module
- Login/Logout
- Register
- Password reset
- Role-based access control (RBAC)
- Session management
- JWT tokens

### 10.2. User Management Module
- Customer management
- Employee management
- Profile management
- Role assignment

### 10.3. Service Management Module
- Service catalog
- Service types
- Pricing calculator (public)

### 10.4. Pricing Engine Module
- Formula management
- Rate tables
- Surcharges
- Discounts
- Price calculation logic

### 10.5. Order Management Module
- Order creation
- Order processing
- Status tracking
- Order history

### 10.6. Quotation Module
- Create quotation
- Send quotation
- Accept/Reject
- Convert to order

### 10.7. Shipment Tracking Module (for Total Logistics)
- Shipment status
- Real-time tracking
- Notifications
- Document management

### 10.8. Payment Module
- Payment methods
- Payment processing
- Payment history
- Refunds

### 10.9. Invoice Module
- Invoice generation
- Invoice templates
- PDF export
- Email invoice

### 10.10. Reporting & Analytics Module
- Revenue reports
- Order reports
- Customer reports
- Employee performance
- Service analytics

### 10.11. Notification Module
- Email notifications
- SMS notifications
- In-app notifications
- Push notifications

---

## 11. API Endpoints Structure (Preview)

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users
```
GET    /api/users                    [ADMIN]
GET    /api/users/{id}               [ADMIN, EMPLOYEE, SELF]
POST   /api/users                    [ADMIN]
PUT    /api/users/{id}               [ADMIN, SELF]
DELETE /api/users/{id}               [ADMIN]
GET    /api/users/customers          [ADMIN, EMPLOYEE]
GET    /api/users/employees          [ADMIN]
```

### Services
```
GET    /api/services                 [ALL]
GET    /api/services/{id}            [ALL]
POST   /api/services                 [ADMIN]
PUT    /api/services/{id}            [ADMIN]
DELETE /api/services/{id}            [ADMIN]
```

### Pricing
```
POST   /api/pricing/calculate        [ALL] - Calculator
GET    /api/pricing/formulas         [ADMIN]
POST   /api/pricing/formulas         [ADMIN]
PUT    /api/pricing/formulas/{id}    [ADMIN]
GET    /api/pricing/rates            [ADMIN, EMPLOYEE]
POST   /api/pricing/rates            [ADMIN]
```

### Orders
```
GET    /api/orders                   [ADMIN, EMPLOYEE, CUSTOMER(own)]
GET    /api/orders/{id}              [ADMIN, EMPLOYEE, CUSTOMER(own)]
POST   /api/orders                   [CUSTOMER, EMPLOYEE]
PUT    /api/orders/{id}              [ADMIN, EMPLOYEE]
DELETE /api/orders/{id}              [ADMIN]
PATCH  /api/orders/{id}/status       [EMPLOYEE]
```

### Quotations
```
GET    /api/quotations               [ADMIN, EMPLOYEE, CUSTOMER(own)]
GET    /api/quotations/{id}          [ADMIN, EMPLOYEE, CUSTOMER(own)]
POST   /api/quotations               [EMPLOYEE]
PUT    /api/quotations/{id}          [EMPLOYEE]
PATCH  /api/quotations/{id}/accept   [CUSTOMER]
PATCH  /api/quotations/{id}/reject   [CUSTOMER]
```

### Shipments (Total Logistics)
```
GET    /api/shipments                [ADMIN, EMPLOYEE, CUSTOMER(own)]
GET    /api/shipments/{id}           [ADMIN, EMPLOYEE, CUSTOMER(own)]
GET    /api/shipments/track/{code}   [ALL]
POST   /api/shipments                [EMPLOYEE]
PUT    /api/shipments/{id}           [EMPLOYEE]
PATCH  /api/shipments/{id}/status    [EMPLOYEE]
```

### Payments
```
GET    /api/payments                 [ADMIN, EMPLOYEE, CUSTOMER(own)]
GET    /api/payments/{id}            [ADMIN, EMPLOYEE, CUSTOMER(own)]
POST   /api/payments                 [CUSTOMER]
PATCH  /api/payments/{id}/confirm    [EMPLOYEE]
```

### Reports
```
GET    /api/reports/revenue          [ADMIN]
GET    /api/reports/orders           [ADMIN, EMPLOYEE]
GET    /api/reports/customers        [ADMIN]
GET    /api/reports/performance      [ADMIN]
```

---

## 12. Business Rules & Validations

### 12.1. User Rules
- Username: unique, 6-50 characters, alphanumeric
- Email: unique, valid format
- Password: min 8 characters, must contain uppercase, lowercase, number
- Phone: valid format
- Customer code: auto-generated (CUST-YYYYMMDD-XXXX)
- Employee code: auto-generated (EMP-YYYYMMDD-XXXX)

### 12.2. Order Rules
- Order code: auto-generated (ORD-YYYYMMDD-XXXX)
- Customer must be logged in to create order
- Employee must be assigned to process order
- Order can only be cancelled if status is DRAFT or PENDING
- Payment must be confirmed before status changes to IN_PROGRESS
- Total amount must be > 0

### 12.3. Quotation Rules
- Quote code: auto-generated (QT-YYYYMMDD-XXXX)
- Valid period: default 30 days from quote_date
- Can only be accepted if status is SENT and not expired
- Accepted quotation automatically creates order
- Rejected quotation cannot be reused

### 12.4. Pricing Rules
- All rates must have effective dates
- Overlapping rates: use the most recent one
- Discounts cannot exceed 100%
- Final price cannot be negative
- Currency conversion: use daily exchange rate

### 12.5. Shipment Rules (Total Logistics)
- Shipment code: auto-generated (SHP-YYYYMMDD-XXXX)
- Departure date must be >= order date
- Estimated arrival must be > departure date
- Tracking number must be unique
- Container numbers: validate format

---

## 13. Data Validation & Constraints

### 13.1. Cargo Validation
- Gross weight must be >= Net weight
- Volume (CBM) must match dimensions (L × W × H)
- Dangerous goods require special certificates
- Weight and volume limits per container type:
  ```
  20GP: max 28,000 kg, max 33 cbm
  40GP: max 28,000 kg, max 67 cbm
  40HC: max 28,000 kg, max 76 cbm
  ```

### 13.2. Date Validation
- Order date <= Today
- Valid until (quotation) > Quote date
- Departure date >= Order date
- Estimated arrival > Departure date
- Effective_from < Effective_to (for rates)

### 13.3. Financial Validation
- All amounts must be >= 0
- Discount cannot exceed total amount
- Tax rate: 0-100%
- Exchange rates must be > 0
- Payment amount <= Outstanding amount

---

## 14. Security Requirements

### 14.1. Authentication
- JWT token-based authentication
- Token expiration: 1 hour (access token), 7 days (refresh token)
- Password hashing: BCrypt
- Failed login attempts: max 5, then lock account for 15 minutes

### 14.2. Authorization
- Role-based access control (RBAC)
- Each endpoint checks user role
- Users can only access their own data (except ADMIN/EMPLOYEE)
- ADMIN can access all data
- EMPLOYEE can access customer data and orders

### 14.3. Data Protection
- Encrypt sensitive data (passwords, payment info)
- HTTPS only
- SQL injection prevention (use PreparedStatement)
- XSS prevention
- CORS configuration

### 14.4. Audit Trail
- Log all CRUD operations
- Log user login/logout
- Log order status changes
- Log payment transactions
- Log pricing formula changes

---

## 15. Next Steps - Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [x] Project structure analysis (this document)
- [ ] Setup Spring Boot project
- [ ] Database schema creation
- [ ] Entity classes
- [ ] Repository layer

### Phase 2: Core Features (Weeks 3-4)
- [ ] Authentication & Authorization
- [ ] User Management (CRUD)
- [ ] Role Management
- [ ] Service Management

### Phase 3: Pricing Engine (Weeks 5-6)
- [ ] Formula management
- [ ] Rate tables
- [ ] Surcharge logic
- [ ] Discount logic
- [ ] Calculator API

### Phase 4: Order Management (Weeks 7-8)
- [ ] Order creation
- [ ] Quotation system
- [ ] Status workflow
- [ ] Order tracking

### Phase 5: Payment & Invoice (Weeks 9-10)
- [ ] Payment processing
- [ ] Invoice generation
- [ ] PDF export
- [ ] Email notifications

### Phase 6: Reporting & Analytics (Weeks 11-12)
- [ ] Dashboard
- [ ] Reports
- [ ] Analytics
- [ ] Export data

### Phase 7: Testing & Deployment (Weeks 13-14)
- [ ] Unit testing
- [ ] Integration testing
- [ ] User acceptance testing
- [ ] Deployment

---

## 16. Tech Stack Summary

### Backend
- Java 17+
- Spring Boot 3.x
- Spring Security (Authentication & Authorization)
- Spring Data JPA (Database)
- MySQL/PostgreSQL
- JWT (Token-based auth)
- Lombok (Reduce boilerplate)
- ModelMapper (DTO mapping)

### Tools
- Maven (Build tool)
- Git (Version control)
- Postman (API testing)
- Swagger/OpenAPI (API documentation)
- JUnit + Mockito (Testing)

### Optional
- Redis (Caching)
- RabbitMQ (Message queue)
- Email service (SendGrid, AWS SES)
- Payment gateway integration
- PDF generation library (iText, Apache PDFBox)

---

## 17. Notes & Considerations

### Scalability
- Pricing formulas stored as JSON for flexibility
- Use caching for frequently accessed data (rates, formulas)
- Index database properly (user.email, order.order_code, etc.)
- Pagination for all list APIs

### Maintainability
- Clear separation of concerns (Controller → Service → Repository)
- DTO pattern for API responses
- Exception handling (GlobalExceptionHandler)
- Logging (SLF4J, Logback)
- Documentation (Javadoc, Swagger)

### Business Logic
- Pricing engine should be flexible to accommodate formula changes
- Support multiple currencies
- Consider exchange rate fluctuations
- Allow admin to override calculated prices (with justification)
- Support discount codes/promotions

### Future Enhancements
- Mobile app
- Real-time shipment tracking (GPS integration)
- Integration with shipping lines APIs
- Automated invoice generation
- Customer portal (self-service)
- Employee mobile app
- AI-powered price prediction
- Multi-language support
- Multi-currency support

---

## 18. Questions to Consider Before Coding

### Business Questions:
1. Giá có thay đổi theo thời gian thực hay cố định theo bảng giá?
2. Customer có thể đàm phán giá không?
3. Có discount codes/coupons không?
4. Payment methods nào được hỗ trợ?
5. Refund policy như thế nào?
6. Tracking real-time có cần thiết ngay không?
7. Có cần multi-language không?
8. Có cần multi-currency không?

### Technical Questions:
1. Database nào: MySQL hay PostgreSQL?
2. Deploy ở đâu: Cloud (AWS, Azure) hay On-premise?
3. Có cần caching không (Redis)?
4. Email service nào?
5. File storage: local hay cloud (S3)?
6. CI/CD setup như thế nào?

---

**Document Version**: 1.0  
**Created**: December 2, 2025  
**Status**: Planning Phase  
**Next Action**: Review and approve before implementation
