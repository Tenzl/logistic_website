# Hệ Thống Công Thức Tính Giá - Cấu Trúc Chi Tiết

## Tổng Quan

Tài liệu này mô tả chi tiết cấu trúc công thức tính giá cho 3 dịch vụ chính của hệ thống logistics, dựa trên các input fields thực tế từ form người dùng.

---

## 1. SHIPPING AGENCY (Đại lý tàu)

### 1.1. Input Fields (PORT D/A INQUIRY)

**User Input Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full name | String | Yes | Tên người liên hệ |
| Phone/Fax/Mobile or E-mail | String | Yes | Thông tin liên lạc |
| DWT | Integer | Yes | Deadweight Tonnage (trọng tải tàu) |
| GRT | Integer | Yes | Gross Register Tonnage |
| LOA | Decimal | Yes | Length Overall (chiều dài tàu, meters) |
| Cargo/Quantity | String | Yes | Loại hàng và số lượng |
| Port of call | Enum | Yes | Haiphong hoặc Ho Chi Minh |
| Arrival Date | Date | Yes | Ngày tàu dự kiến đến cảng |
| Departure Date | Date | Yes | Ngày tàu dự kiến rời cảng |
| Other information | Text | No | Thông tin bổ sung |

**Calculated Fields (Backend):**
- Tonnage (based on DWT/GRT)
- Navigation due
- Pilotage
- Tug assistance charge
- Moor/Unmooring
- Berth due
- Anchorage fees (if any)
- Quarantine fee
- Ocean Freight Tax
- Transport for entry quarantine formality
- Berthing Application to B.4 (due to over DWT)
- Clearance fees
- Garbage removal fee

### 1.2. Công Thức Tính Giá Tổng

```
TOTAL_PRICE = 
  TONNAGE_FEE +
  NAVIGATION_DUE +
  PILOTAGE +
  TUG_ASSISTANCE_CHARGE +
  MOOR_UNMOOR_CHARGE +
  BERTH_DUE +
  ANCHORAGE_FEES +
  QUARANTINE_FEE +
  OCEAN_FRT_TAX +
  TRANSPORT_QUARANTINE +
  BERTHING_B4_APPLICATION +
  CLEARANCE_FEES +
  GARBAGE_REMOVAL_FEE
```

### 1.3. Chi Tiết Các Thành Phần

#### 1.3.1. TONNAGE_FEE (Phí Tấn)

```
TONNAGE_FEE = GRT × TONNAGE_RATE × STAY_DAYS
```

| Port | TONNAGE_RATE (USD/GRT/day) |
|------|----------------------------|
| Haiphong | 0.025 |
| Ho Chi Minh | 0.028 |

**STAY_DAYS:**
```
STAY_DAYS = DEPARTURE_DATE - ARRIVAL_DATE
```

**Example:**
```
GRT: 30,000
Port: Ho Chi Minh
Stay: 3 days
TONNAGE_FEE = 30,000 × 0.028 × 3 = $2,520
```

#### 1.3.2. NAVIGATION_DUE (Phí Hàng Hải)

```
NAVIGATION_DUE = GRT × NAVIGATION_RATE
```

| Port | NAVIGATION_RATE (USD/GRT) |
|------|---------------------------|
| Haiphong | 0.12 |
| Ho Chi Minh | 0.15 |

**Example:**
```
GRT: 30,000
Port: Ho Chi Minh
NAVIGATION_DUE = 30,000 × 0.15 = $4,500
```

#### 1.3.3. PILOTAGE (Phí Dẫn Tàu)

```
PILOTAGE = BASE_PILOTAGE + (GRT × PILOTAGE_RATE) + DISTANCE_CHARGE
```

**Base Pilotage Fee:**

| Port | BASE_PILOTAGE (USD) |
|------|---------------------|
| Haiphong | 400 |
| Ho Chi Minh | 500 |

**GRT-based Rate:**

| GRT Range | PILOTAGE_RATE (USD/GRT) |
|-----------|-------------------------|
| 0 - 10,000 | 0.08 |
| 10,001 - 30,000 | 0.10 |
| 30,001 - 50,000 | 0.12 |
| > 50,000 | 0.15 |

**Distance Charge:**
```
DISTANCE_CHARGE = NAUTICAL_MILES × $50
```
- Haiphong: 15-25 nm (average 20 nm)
- Ho Chi Minh: 25-35 nm (average 30 nm)

**Example:**
```
GRT: 30,000
Port: Ho Chi Minh
PILOTAGE = 500 + (30,000 × 0.10) + (30 × 50)
         = 500 + 3,000 + 1,500
         = $5,000
```

#### 1.3.4. TUG_ASSISTANCE_CHARGE (Phí Kéo Tàu)

```
TUG_ASSISTANCE_CHARGE = NUMBER_OF_TUGS × TUG_RATE × HOURS × 2
```
*Multiply by 2 for both arrival and departure*

**Number of Tugs (based on LOA and DWT):**

| LOA (meters) | DWT | Number of Tugs |
|--------------|-----|----------------|
| < 100 | Any | 1 |
| 100 - 150 | < 20,000 | 2 |
| 100 - 150 | ≥ 20,000 | 3 |
| 150 - 200 | < 30,000 | 2 |
| 150 - 200 | ≥ 30,000 | 3 |
| 200 - 250 | Any | 3 |
| > 250 | Any | 4 |

**Tug Hourly Rates:**

| Port | TUG_RATE (USD/hour) |
|------|---------------------|
| Haiphong | 350 |
| Ho Chi Minh | 450 |

**Hours:** Typically 2-3 hours per operation (default: 2.5 hours)

**Example:**
```
LOA: 180m
DWT: 50,000
Port: Ho Chi Minh
Tugs: 3
TUG_ASSISTANCE_CHARGE = 3 × 450 × 2.5 × 2 = $6,750
```

#### 1.3.5. MOOR_UNMOOR_CHARGE (Phí Buộc/Thả Dây)

```
MOOR_UNMOOR_CHARGE = MOORING_FEE + UNMOORING_FEE
```

**Mooring/Unmooring Formula:**
```
Each operation = BASE_FEE + (LOA × LOA_RATE)
```

| Port | BASE_FEE (USD) | LOA_RATE (USD/meter) |
|------|----------------|----------------------|
| Haiphong | 200 | 3.0 |
| Ho Chi Minh | 250 | 3.5 |

**Example:**
```
LOA: 180m
Port: Ho Chi Minh
MOORING_FEE = 250 + (180 × 3.5) = 250 + 630 = $880
UNMOORING_FEE = 250 + (180 × 3.5) = $880
TOTAL = $1,760
```

#### 1.3.6. BERTH_DUE (Phí Cảng)

```
BERTH_DUE = DWT × BERTH_RATE × HOURS
```

**Berth Rates:**

| Port | BERTH_RATE (USD/DWT/hour) |
|------|---------------------------|
| Haiphong | 0.018 |
| Ho Chi Minh | 0.022 |

**Hours Calculation:**
```
HOURS = (DEPARTURE_DATE - ARRIVAL_DATE) × 24
```

**Example:**
```
DWT: 50,000
Port: Ho Chi Minh
Stay: 3 days = 72 hours
BERTH_DUE = 50,000 × 0.022 × 72 = $79,200
```

#### 1.3.7. ANCHORAGE_FEES (Phí Neo Đậu Ngoài Cảng)

```
if WAITING_TIME > 0:
  ANCHORAGE_FEES = DWT × ANCHORAGE_RATE × WAITING_DAYS
else:
  ANCHORAGE_FEES = 0
```

**Anchorage Rates:**

| Port | ANCHORAGE_RATE (USD/DWT/day) |
|------|------------------------------|
| Haiphong | 0.008 |
| Ho Chi Minh | 0.010 |

**Waiting Time:** Calculated if arrival date is before berth availability
- Default: 0 days (direct berthing)
- If congestion: 1-5 days

**Example (with 2 days waiting):**
```
DWT: 50,000
Port: Ho Chi Minh
Waiting: 2 days
ANCHORAGE_FEES = 50,000 × 0.010 × 2 = $1,000
```

#### 1.3.8. QUARANTINE_FEE (Phí Kiểm Dịch)

```
QUARANTINE_FEE = BASE_QUARANTINE + (CREW_COUNT × CREW_FEE)
```

**Rates:**

| Port | BASE_QUARANTINE (USD) | CREW_FEE (USD/person) |
|------|----------------------|------------------------|
| Haiphong | 300 | 25 |
| Ho Chi Minh | 350 | 30 |

**CREW_COUNT:** Estimated based on DWT
- DWT < 10,000: 15 crew
- DWT 10,000-30,000: 20 crew
- DWT 30,001-50,000: 25 crew
- DWT > 50,000: 30 crew

**Example:**
```
DWT: 50,000 → 25 crew
Port: Ho Chi Minh
QUARANTINE_FEE = 350 + (25 × 30) = 350 + 750 = $1,100
```

#### 1.3.9. OCEAN_FRT_TAX (Thuế Vận Tải Biển)

```
OCEAN_FRT_TAX = (TONNAGE_FEE + NAVIGATION_DUE + BERTH_DUE) × TAX_RATE
```

**Tax Rate:**
- Vietnam: 5%

**Example:**
```
Base fees: $2,520 + $4,500 + $79,200 = $86,220
OCEAN_FRT_TAX = $86,220 × 0.05 = $4,311
```

#### 1.3.10. TRANSPORT_QUARANTINE (Phí Vận Chuyển Kiểm Dịch)

```
TRANSPORT_QUARANTINE = FIXED_FEE
```

| Port | TRANSPORT_QUARANTINE (USD) |
|------|----------------------------|
| Haiphong | 150 |
| Ho Chi Minh | 200 |

**Note:** Phí vận chuyển nhân viên kiểm dịch từ văn phòng đến tàu

#### 1.3.11. BERTHING_B4_APPLICATION (Phí Đơn B.4 - Tàu Vượt Trọng Tải)

```
if DWT > PORT_LIMIT:
  BERTHING_B4_APPLICATION = FIXED_FEE + (EXCESS_DWT × EXCESS_RATE)
else:
  BERTHING_B4_APPLICATION = 0
```

**Port DWT Limits and Fees:**

| Port | DWT_LIMIT | FIXED_FEE (USD) | EXCESS_RATE (USD/DWT) |
|------|-----------|-----------------|------------------------|
| Haiphong | 30,000 | 500 | 0.05 |
| Ho Chi Minh | 40,000 | 600 | 0.06 |

**Example:**
```
DWT: 50,000
Port: Ho Chi Minh
Limit: 40,000
Excess: 10,000
BERTHING_B4_APPLICATION = 600 + (10,000 × 0.06) = 600 + 600 = $1,200
```

#### 1.3.12. CLEARANCE_FEES (Phí Làm Thủ Tục Thông Quan)

```
CLEARANCE_FEES = 
  CUSTOMS_CLEARANCE +
  IMMIGRATION_CLEARANCE +
  PORT_AUTHORITY_CLEARANCE +
  CERTIFICATE_FEES
```

**Fee Breakdown:**

| Fee Type | Haiphong (USD) | Ho Chi Minh (USD) |
|----------|----------------|-------------------|
| Customs Clearance | 200 | 250 |
| Immigration Clearance | 150 | 180 |
| Port Authority Clearance | 100 | 120 |
| Certificate Fees | 80 | 100 |
| **TOTAL** | **530** | **650** |

#### 1.3.13. GARBAGE_REMOVAL_FEE (Phí Thu Gom Rác Thải)

```
GARBAGE_REMOVAL_FEE = BASE_FEE + (STAY_DAYS × DAILY_FEE)
```

**Rates:**

| Port | BASE_FEE (USD) | DAILY_FEE (USD/day) |
|------|----------------|---------------------|
| Haiphong | 150 | 30 |
| Ho Chi Minh | 180 | 35 |

**Example:**
```
Port: Ho Chi Minh
Stay: 3 days
GARBAGE_REMOVAL_FEE = 180 + (3 × 35) = 180 + 105 = $285
```

### 1.4. Calculation Example

**Input (User provides):**
```
Full name: Nguyen Van A
Contact: nguyenvana@email.com / +84-123-456-789
DWT: 50,000
GRT: 30,000
LOA: 180m
Cargo/Quantity: Container / 1,000 TEU
Port of call: Ho Chi Minh
Arrival Date: 2025-01-15
Departure Date: 2025-01-18 (3 days stay)
Other information: None
```

**Calculation (System calculates):**
```
1. TONNAGE_FEE = 30,000 × 0.028 × 3 = $2,520

2. NAVIGATION_DUE = 30,000 × 0.15 = $4,500

3. PILOTAGE = 500 + (30,000 × 0.10) + (30 × 50) = $5,000

4. TUG_ASSISTANCE_CHARGE = 3 × 450 × 2.5 × 2 = $6,750

5. MOOR_UNMOOR_CHARGE = (250 + 630) + (250 + 630) = $1,760

6. BERTH_DUE = 50,000 × 0.022 × 72 = $79,200

7. ANCHORAGE_FEES = 0 (no waiting time)

8. QUARANTINE_FEE = 350 + (25 × 30) = $1,100

9. OCEAN_FRT_TAX = (2,520 + 4,500 + 79,200) × 0.05 = $4,311

10. TRANSPORT_QUARANTINE = $200

11. BERTHING_B4_APPLICATION = 600 + (10,000 × 0.06) = $1,200

12. CLEARANCE_FEES = $650

13. GARBAGE_REMOVAL_FEE = 180 + (3 × 35) = $285

TOTAL_PRICE = $106,476
```

**Price Breakdown for Customer:**
```
===========================================
SHIPPING AGENCY QUOTATION
Port: Ho Chi Minh, Vietnam
Vessel: DWT 50,000 / GRT 30,000 / LOA 180m
Period: 2025-01-15 to 2025-01-18 (3 days)
===========================================

1. Tonnage Fee                     $2,520
2. Navigation Due                  $4,500
3. Pilotage                        $5,000
4. Tug Assistance Charge           $6,750
5. Moor/Unmooring Charge           $1,760
6. Berth Due                      $79,200
7. Anchorage Fees                      $0
8. Quarantine Fee                  $1,100
9. Ocean Freight Tax               $4,311
10. Transport for Quarantine         $200
11. Berthing B.4 Application       $1,200
12. Clearance Fees                   $650
13. Garbage Removal Fee              $285
-------------------------------------------
TOTAL AMOUNT                     $106,476
===========================================
Currency: USD
Valid until: 2025-01-30
===========================================
```

---

## 2. CHARTERING & SHIP-BROKING (Thuê tàu & Môi giới)

### 2.1. Input Fields (TONNAGE/VESSEL ORDER)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full name | String | Yes | Tên người liên hệ |
| Phone/Fax/Mobile or E-mail | String | Yes | Thông tin liên lạc |
| Cargo/Quantity | String | Yes | Loại hàng và số lượng (tons) |
| Loading port | String | Yes | Cảng xếp hàng |
| Discharging port | String | Yes | Cảng dỡ hàng |
| LAY CAN - From date | Date | Yes | Ngày bắt đầu khoảng thời gian |
| LAY CAN - To date | Date | Yes | Ngày kết thúc khoảng thời gian |
| Other information | Text | No | Thông tin bổ sung |

### 2.2. Công Thức Tính Giá Tổng

```
TOTAL_PRICE = VOYAGE_FREIGHT + PORT_CHARGES + BUNKER_COST + BROKER_COMMISSION + SURCHARGES - DISCOUNTS
```

### 2.3. Chi Tiết Các Thành Phần

#### 2.3.1. VOYAGE_FREIGHT (Cước Vận Chuyển)

```
VOYAGE_FREIGHT = FREIGHT_RATE × CARGO_QUANTITY
```

**FREIGHT_RATE:**
```
FREIGHT_RATE = BASE_RATE × ROUTE_MULTIPLIER × SEASON_MULTIPLIER × CARGO_TYPE_MULTIPLIER
```

**A. BASE_RATE (Giá cơ bản theo loại hàng)**

| Cargo Type | BASE_RATE (USD/ton) |
|------------|---------------------|
| Bulk (coal, grain, ore) | $25 |
| Container goods | $35 |
| Liquid (oil, chemicals) | $40 |
| General cargo | $30 |
| Heavy/Project cargo | $50 |
| Dangerous goods | $55 |

**B. ROUTE_MULTIPLIER (Hệ số tuyến đường)**

First, calculate distance between ports:

**Common Routes (nautical miles):**

| Route | Distance (nm) |
|-------|---------------|
| Haiphong → Singapore | 1,400 |
| Haiphong → Hong Kong | 500 |
| Haiphong → Shanghai | 1,200 |
| Haiphong → Japan | 2,500 |
| HCMC → Singapore | 700 |
| HCMC → Hong Kong | 900 |
| HCMC → Japan | 2,500 |
| HCMC → Korea | 2,300 |

**Multiplier based on distance:**
```
if DISTANCE < 500 nm:
  MULTIPLIER = 1.0
else if DISTANCE < 1,500 nm:
  MULTIPLIER = 1.2
else if DISTANCE < 3,000 nm:
  MULTIPLIER = 1.5
else:
  MULTIPLIER = 2.0
```

**C. SEASON_MULTIPLIER (Hệ số mùa vụ)**

Extract month from LAY CAN "From date":

```
if MONTH in [6,7,8,9,12]:  // Peak season
  MULTIPLIER = 1.3
else if MONTH in [2,3,4]:  // Low season
  MULTIPLIER = 0.8
else:  // Normal season
  MULTIPLIER = 1.0
```

**D. CARGO_TYPE_MULTIPLIER**

Parse `Cargo/Quantity` to identify type:

| Cargo Type | Multiplier |
|------------|------------|
| Bulk | 1.0 |
| Container | 1.2 |
| Liquid | 1.3 |
| General | 1.1 |
| Heavy/Project | 1.5 |
| Dangerous | 1.6 |

#### 2.3.2. PORT_CHARGES (Phí Cảng)

```
PORT_CHARGES = LOADING_PORT_FEE + DISCHARGING_PORT_FEE
```

**PORT_FEE Formula:**
```
PORT_FEE = BASE_PORT_FEE + (CARGO_QUANTITY × PORT_RATE_PER_TON)
```

**Loading Port Rates:**

| Port | BASE_FEE (USD) | RATE_PER_TON (USD) |
|------|----------------|---------------------|
| Haiphong | 2,000 | 5 |
| Ho Chi Minh | 2,500 | 6 |
| Danang | 1,800 | 4.5 |
| Other Vietnam ports | 1,500 | 4 |

**Discharging Port Rates:**

| Port/Region | BASE_FEE (USD) | RATE_PER_TON (USD) |
|-------------|----------------|---------------------|
| Singapore | 3,000 | 7 |
| Hong Kong | 3,500 | 8 |
| Japan | 4,000 | 10 |
| China | 2,800 | 6 |
| Korea | 3,800 | 9 |
| Thailand | 2,500 | 5 |
| Malaysia | 2,200 | 5 |

#### 2.3.3. BUNKER_COST (Chi phí nhiên liệu)

```
BUNKER_COST = VOYAGE_DAYS × DAILY_FUEL_CONSUMPTION × FUEL_PRICE
```

**VOYAGE_DAYS:**
```
VOYAGE_DAYS = DISTANCE / (SPEED × 24)
```
- SPEED: 12-15 knots (average 13 knots)
- DISTANCE: nautical miles from route table

**Constants:**
- DAILY_FUEL_CONSUMPTION: 30 tons/day (average vessel)
- FUEL_PRICE: $550/ton (current market average)

#### 2.3.4. LAYCAN_DURATION_FEE

```
LAYCAN_DAYS = TO_DATE - FROM_DATE
```

```
if LAYCAN_DAYS > 30:
  LONG_LAYCAN_SURCHARGE = (LAYCAN_DAYS - 30) × $500
else:
  LONG_LAYCAN_SURCHARGE = 0
```

#### 2.3.5. BROKER_COMMISSION

```
BROKER_COMMISSION = (VOYAGE_FREIGHT + PORT_CHARGES + BUNKER_COST) × COMMISSION_RATE
```

**COMMISSION_RATE:**
- Standard chartering: 2%
- Ship-broking (vessel sale): 1-2%
- Address commission (if applicable): +2.5%

#### 2.3.6. SURCHARGES

```
TOTAL_SURCHARGES = 
  WAR_RISK_SURCHARGE + 
  PIRACY_SURCHARGE + 
  CANAL_FEES + 
  WEATHER_DELAY + 
  URGENT_LAYCAN_SURCHARGE
```

| Surcharge Type | Rate/Amount |
|----------------|-------------|
| WAR_RISK | +5-10% for high-risk zones |
| PIRACY_RISK | +3-5% for piracy zones |
| SUEZ_CANAL | $400,000 (if applicable) |
| PANAMA_CANAL | $500,000 (if applicable) |
| WEATHER_DELAY | +$1,000/day during typhoon season |
| URGENT_LAYCAN | +20% if LAYCAN_DAYS < 7 |

#### 2.3.7. DISCOUNTS

```
TOTAL_DISCOUNT = VOLUME_DISCOUNT + REGULAR_CUSTOMER + LONG_TERM_CONTRACT + BACKHAUL
```

| Discount Type | Rate |
|---------------|------|
| VOLUME_DISCOUNT | >5,000 tons: 5%, >10,000 tons: 10% |
| REGULAR_CUSTOMER | 5-10% |
| LONG_TERM_CONTRACT | 10-15% |
| BACKHAUL | 20-30% (empty return voyage) |

### 2.4. Calculation Example

**Input:**
```
Cargo/Quantity: Bulk coal / 10,000 tons
Loading port: Haiphong
Discharging port: Japan
LAY CAN: 2025-01-15 to 2025-02-15 (31 days)
```

**Calculation:**
```
1. BASE_RATE = $25 (bulk cargo)
   DISTANCE = 2,500 nm (Haiphong to Japan)
   ROUTE_MULTIPLIER = 1.5
   SEASON_MULTIPLIER = 1.0 (January)
   CARGO_TYPE_MULTIPLIER = 1.0 (bulk)
   
   FREIGHT_RATE = $25 × 1.5 × 1.0 × 1.0 = $37.5/ton
   VOYAGE_FREIGHT = $37.5 × 10,000 = $375,000

2. LOADING_PORT_FEE = $2,000 + (10,000 × $5) = $52,000
   DISCHARGING_PORT_FEE = $4,000 + (10,000 × $10) = $104,000
   PORT_CHARGES = $156,000

3. VOYAGE_DAYS = 2,500 / (13 × 24) = 8 days
   BUNKER_COST = 8 × 30 × $550 = $132,000

4. LAYCAN_SURCHARGE = (31 - 30) × $500 = $500

5. SUBTOTAL = $375,000 + $156,000 + $132,000 + $500 = $663,500
   BROKER_COMMISSION = $663,500 × 2% = $13,270

6. TOTAL_BEFORE_DISCOUNT = $676,770

7. If 10% volume discount:
   FINAL_PRICE = $609,093
```

---

## 3. FREIGHT FORWARDING & TOTAL LOGISTICS

### 3.1. Input Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Full name | String | Yes | Tên người liên hệ |
| Phone/Fax/Mobile or E-mail | String | Yes | Thông tin liên lạc |
| Cargo name | String | Yes | Tên hàng hóa |
| Delivery term | Enum | Yes | CY/CY (default) |
| Container 20' feet | Integer | Yes | Số lượng container 20 feet |
| Container 40' feet | Integer | Yes | Số lượng container 40 feet |
| Loading port | String | Yes | Cảng xếp hàng |
| Discharging port | String | Yes | Cảng dỡ hàng |
| Shipment time - From date | Date | Yes | Ngày bắt đầu vận chuyển |
| Shipment time - To date | Date | Yes | Ngày kết thúc dự kiến |

### 3.2. Công Thức Tính Giá Tổng

```
TOTAL_PRICE = 
  OCEAN_FREIGHT + 
  THC_ORIGIN + 
  THC_DESTINATION + 
  DOCUMENTATION_FEE + 
  INLAND_ORIGIN + 
  INLAND_DESTINATION + 
  SURCHARGES - 
  DISCOUNTS
```

### 3.3. Chi Tiết Các Thành Phần

#### 3.3.1. OCEAN_FREIGHT (Cước Biển)

```
OCEAN_FREIGHT = (RATE_20 × QTY_20) + (RATE_40 × QTY_40)
```

**Container Rates by Route:**

**A. From Haiphong:**

| Destination | 20' Rate (USD) | 40' Rate (USD) |
|-------------|----------------|----------------|
| Singapore | 300 | 500 |
| Hong Kong | 400 | 650 |
| Shanghai | 350 | 600 |
| Japan (Tokyo) | 800 | 1,400 |
| Korea (Busan) | 750 | 1,300 |
| Thailand (Bangkok) | 450 | 750 |
| Malaysia (Port Klang) | 350 | 600 |
| USA (LA) | 2,500 | 4,500 |
| Europe (Rotterdam) | 2,800 | 5,000 |

**B. From Ho Chi Minh:**

| Destination | 20' Rate (USD) | 40' Rate (USD) |
|-------------|----------------|----------------|
| Singapore | 250 | 450 |
| Hong Kong | 450 | 700 |
| Shanghai | 400 | 650 |
| Japan (Tokyo) | 850 | 1,500 |
| Korea (Busan) | 800 | 1,400 |
| Thailand (Bangkok) | 400 | 700 |
| Malaysia (Port Klang) | 300 | 550 |
| USA (LA) | 2,600 | 4,700 |
| Europe (Rotterdam) | 2,900 | 5,200 |

#### 3.3.2. THC (Terminal Handling Charge)

**Origin THC:**
```
THC_ORIGIN = (THC_20_ORIGIN × QTY_20) + (THC_40_ORIGIN × QTY_40)
```

| Port | 20' THC (USD) | 40' THC (USD) |
|------|---------------|---------------|
| Haiphong | 80 | 120 |
| Ho Chi Minh | 90 | 130 |
| Danang | 75 | 110 |

**Destination THC:**
```
THC_DESTINATION = (THC_20_DEST × QTY_20) + (THC_40_DEST × QTY_40)
```

| Port/Region | 20' THC (USD) | 40' THC (USD) |
|-------------|---------------|---------------|
| Singapore | 100 | 150 |
| Hong Kong | 120 | 180 |
| China | 110 | 160 |
| Japan | 150 | 220 |
| Korea | 140 | 200 |
| Thailand | 90 | 130 |
| Malaysia | 85 | 125 |
| USA | 200 | 300 |
| Europe | 180 | 270 |

#### 3.3.3. DOCUMENTATION_FEE

```
DOCUMENTATION_FEE = 
  BILL_OF_LADING_FEE + 
  CUSTOMS_DECLARATION + 
  MANIFEST_FEE + 
  DOCUMENT_HANDLING
```

| Fee Type | Amount (USD) |
|----------|--------------|
| Bill of Lading | 50 per B/L |
| Customs Declaration | 100 per shipment |
| Manifest Fee | 30 |
| Document Handling | 50 |
| **Total Fixed** | **230** |

#### 3.3.4. INLAND_TRANSPORT (CY/CY)

```
INLAND_ORIGIN = TRUCKING_FEE_ORIGIN × (QTY_20 + QTY_40)
INLAND_DESTINATION = TRUCKING_FEE_DEST × (QTY_20 + QTY_40)
```

**Origin Trucking Rates (per container):**

| Port | Rate (USD/container) |
|------|----------------------|
| Haiphong | 80 |
| Ho Chi Minh | 100 |
| Danang | 70 |

**Destination Trucking Rates (per container):**

| Region | Rate (USD/container) |
|--------|----------------------|
| Singapore | 120 |
| Hong Kong | 150 |
| China | 100 |
| Japan | 200 |
| Korea | 180 |
| Thailand | 110 |
| Malaysia | 100 |
| USA | 250 |
| Europe | 220 |

#### 3.3.5. SEASON_SURCHARGE (PSS - Peak Season Surcharge)

Extract month from "Shipment time - From date":

```
if MONTH in [6,7,8,9,12]:  // Peak season
  PSS_20 = $100 per container
  PSS_40 = $150 per container
else:
  PSS = 0
```

```
TOTAL_PSS = (PSS_20 × QTY_20) + (PSS_40 × QTY_40)
```

#### 3.3.6. BAF (Bunker Adjustment Factor)

```
BAF = OCEAN_FREIGHT × BAF_RATE
```

**BAF_RATE:**
- Standard: 10%
- High fuel price period: 15%
- Default: 10%

#### 3.3.7. CAF (Currency Adjustment Factor)

```
if CURRENCY_FLUCTUATION > 3%:
  CAF = OCEAN_FREIGHT × 0.03
else:
  CAF = 0
```

#### 3.3.8. CARGO_TYPE_SURCHARGE

Parse "Cargo name" to identify special handling:

| Cargo Type | Surcharge |
|------------|-----------|
| Dangerous Goods (DG) | +30% of OCEAN_FREIGHT |
| Reefer (Perishable) | +40% of OCEAN_FREIGHT |
| Overweight (>28 tons) | +$200 per container |
| Fragile | +$100 per container |
| Normal cargo | 0 |

#### 3.3.9. URGENCY_SURCHARGE

```
SHIPMENT_DAYS = TO_DATE - FROM_DATE
```

```
if SHIPMENT_DAYS < 7:  // Express
  URGENCY_FEE = $300 per container
else if SHIPMENT_DAYS < 14:  // Fast
  URGENCY_FEE = $150 per container
else:  // Standard
  URGENCY_FEE = 0
```

```
TOTAL_URGENCY = URGENCY_FEE × (QTY_20 + QTY_40)
```

#### 3.3.10. INSURANCE (Optional)

```
INSURANCE_FEE = CARGO_VALUE × INSURANCE_RATE
```

**Insurance Rates:**
- Basic coverage: 0.3%
- All-risk coverage: 0.5%

**Cargo Value Estimation (if not provided):**
- 20' container: $10,000
- 40' container: $18,000

#### 3.3.11. TOTAL_SURCHARGES

```
TOTAL_SURCHARGES = 
  TOTAL_PSS + 
  BAF + 
  CAF + 
  CARGO_TYPE_SURCHARGE + 
  TOTAL_URGENCY + 
  INSURANCE_FEE
```

#### 3.3.12. DISCOUNTS

```
TOTAL_DISCOUNT = VOLUME_DISCOUNT + REGULAR_CUSTOMER + LONG_TERM_CONTRACT + SEASONAL_DISCOUNT
```

**Volume Discount (based on total containers):**
```
TOTAL_CONTAINERS = QTY_20 + QTY_40
```

| Total Containers | Discount Rate |
|------------------|---------------|
| 5-9 containers | 5% |
| 10-19 containers | 10% |
| 20+ containers | 15% |

**Other Discounts:**
- Regular customer: 5-10%
- Long-term contract: 10-15%
- Off-peak season (Feb-May): 10%

### 3.4. Calculation Example

**Input:**
```
Cargo name: Electronics
Delivery term: CY/CY
Container 20': 2
Container 40': 3
Loading port: Haiphong
Discharging port: Singapore
Shipment time: 2025-01-15 to 2025-02-01 (17 days)
```

**Calculation:**
```
1. OCEAN_FREIGHT:
   (2 × $300) + (3 × $500) = $2,100

2. THC_ORIGIN:
   (2 × $80) + (3 × $120) = $520

3. THC_DESTINATION:
   (2 × $100) + (3 × $150) = $650

4. DOCUMENTATION_FEE: $230

5. INLAND_ORIGIN:
   5 containers × $80 = $400

6. INLAND_DESTINATION:
   5 containers × $120 = $600

7. SUBTOTAL = $2,100 + $520 + $650 + $230 + $400 + $600 = $4,500

8. SURCHARGES:
   - BAF (10%) = $2,100 × 0.10 = $210
   - CAF = $0 (no major fluctuation)
   - PSS = $0 (January not peak season)
   - CARGO = $0 (normal electronics)
   - URGENCY = $0 (17 days is standard)
   
   TOTAL_SURCHARGES = $210

9. TOTAL_BEFORE_DISCOUNT = $4,500 + $210 = $4,710

10. VOLUME_DISCOUNT (5 containers) = 5%
    DISCOUNT_AMOUNT = $4,710 × 0.05 = $236

11. FINAL_PRICE = $4,710 - $236 = $4,474

12. Per Container Breakdown:
    - Cost per 20' container: ~$895
    - Cost per 40' container: ~$1,193
```

---

## 4. Database Design for Pricing System

### 4.1. Bảng Rate_Tables

```sql
CREATE TABLE rate_tables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(50) NOT NULL,  -- 'SHIPPING_AGENCY', 'CHARTERING', 'LOGISTICS'
    rate_category VARCHAR(100) NOT NULL,  -- 'OCEAN_FREIGHT', 'THC', 'PORT_FEE', etc.
    origin VARCHAR(100),  -- Port/country of origin
    destination VARCHAR(100),  -- Port/country of destination
    container_type VARCHAR(20),  -- '20GP', '40GP', '40HC', NULL for non-container
    rate_value DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    unit VARCHAR(50),  -- 'per_container', 'per_ton', 'per_grt', etc.
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_category (service_type, rate_category),
    INDEX idx_route (origin, destination),
    INDEX idx_active (is_active, effective_from, effective_to)
);
```

### 4.2. Bảng Surcharge_Rules

```sql
CREATE TABLE surcharge_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(50) NOT NULL,
    surcharge_code VARCHAR(50) NOT NULL,  -- 'BAF', 'CAF', 'PSS', 'CARGO_DG', etc.
    surcharge_name VARCHAR(200) NOT NULL,
    calculation_type VARCHAR(20) NOT NULL,  -- 'PERCENTAGE', 'FIXED', 'FORMULA'
    rate_value DECIMAL(10,4),  -- For percentage or fixed amount
    formula TEXT,  -- For complex calculations
    conditions JSON,  -- Conditions for applying surcharge
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_code (service_type, surcharge_code),
    INDEX idx_active (is_active)
);
```

**Example conditions JSON:**
```json
{
  "cargo_types": ["dangerous", "perishable"],
  "months": [6, 7, 8, 9, 12],
  "min_quantity": 0,
  "max_quantity": null,
  "ports": ["Haiphong", "Ho Chi Minh"]
}
```

### 4.3. Bảng Discount_Rules

```sql
CREATE TABLE discount_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    discount_code VARCHAR(50) UNIQUE NOT NULL,
    discount_name VARCHAR(200) NOT NULL,
    service_type VARCHAR(50),  -- NULL for all services
    discount_type VARCHAR(20) NOT NULL,  -- 'PERCENTAGE', 'FIXED_AMOUNT'
    discount_value DECIMAL(10,2) NOT NULL,
    min_containers INTEGER,  -- For volume discount
    max_containers INTEGER,
    min_order_value DECIMAL(10,2),
    customer_level VARCHAR(20),  -- 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'ALL'
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (discount_code),
    INDEX idx_active (is_active, valid_from, valid_to)
);
```

### 4.4. Bảng Price_Calculations (Audit Trail)

```sql
CREATE TABLE price_calculations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quote_id BIGINT,  -- FK to quotations table
    order_id BIGINT,  -- FK to orders table
    calculation_step VARCHAR(100) NOT NULL,  -- 'OCEAN_FREIGHT', 'THC', 'SURCHARGE_BAF', etc.
    component_name VARCHAR(200),
    base_value DECIMAL(12,2),
    rate_applied DECIMAL(10,4),
    calculated_value DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    calculation_notes TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_quote (quote_id),
    INDEX idx_order (order_id),
    INDEX idx_step (calculation_step)
);
```

### 4.5. Bảng Route_Distances

```sql
CREATE TABLE route_distances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    origin_port VARCHAR(100) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    distance_nm INTEGER NOT NULL,  -- Nautical miles
    average_voyage_days INTEGER,
    route_type VARCHAR(50),  -- 'DIRECT', 'VIA_SINGAPORE', etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_route (origin_port, destination_port),
    INDEX idx_origin (origin_port),
    INDEX idx_destination (destination_port)
);
```

---

## 5. Implementation Logic

### 5.1. Price Calculation Service Interface

```java
public interface PriceCalculationService {
    
    /**
     * Calculate price for Shipping Agency service
     */
    QuotationDTO calculateShippingAgencyPrice(ShippingAgencyRequest request);
    
    /**
     * Calculate price for Chartering service
     */
    QuotationDTO calculateCharteringPrice(CharteringRequest request);
    
    /**
     * Calculate price for Logistics service
     */
    QuotationDTO calculateLogisticsPrice(LogisticsRequest request);
}
```

### 5.2. Calculation Flow

```
1. Receive user input (Request DTO)
   ↓
2. Validate input data
   ↓
3. Fetch applicable rates from database
   ↓
4. Calculate base price components
   ↓
5. Calculate applicable surcharges
   ↓
6. Calculate applicable discounts
   ↓
7. Calculate final price
   ↓
8. Save calculation details (audit trail)
   ↓
9. Return QuotationDTO
```

### 5.3. Example Request DTO (Logistics)

```java
@Data
public class LogisticsRequest {
    private String fullName;
    private String contact;
    private String cargoName;
    private String deliveryTerm;  // "CY/CY"
    private Integer container20;
    private Integer container40;
    private String loadingPort;
    private String dischargingPort;
    private LocalDate shipmentDateFrom;
    private LocalDate shipmentDateTo;
    private String otherInformation;
    
    // Customer info for discount calculation
    private Long customerId;
    private String customerLevel;  // Optional
}
```

### 5.4. Example Response DTO

```java
@Data
public class QuotationDTO {
    private Long quoteId;
    private String quoteCode;
    private LocalDateTime quoteDate;
    
    // Price breakdown
    private BigDecimal oceanFreight;
    private BigDecimal thcOrigin;
    private BigDecimal thcDestination;
    private BigDecimal documentationFee;
    private BigDecimal inlandOrigin;
    private BigDecimal inlandDestination;
    
    // Surcharges
    private BigDecimal baf;
    private BigDecimal caf;
    private BigDecimal pss;
    private BigDecimal cargoSurcharge;
    private BigDecimal urgencySurcharge;
    private BigDecimal totalSurcharges;
    
    // Discounts
    private BigDecimal volumeDiscount;
    private BigDecimal customerDiscount;
    private BigDecimal totalDiscounts;
    
    // Final amounts
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String currency;
    
    // Calculation details
    private List<CalculationDetail> calculationSteps;
    
    // Valid period
    private LocalDate validUntil;
}
```

---

## 6. Business Rules Summary

### 6.1. Shipping Agency Rules

1. Port must be either Haiphong or Ho Chi Minh
2. DWT, GRT, LOA must be positive numbers
3. LOA determines number of tugboats automatically
4. Cargo type parsing determines surcharges
5. Weekend/Holiday surcharges based on arrival date (to be determined from other info)

### 6.2. Chartering Rules

1. Loading and Discharging ports must be valid
2. LAY CAN To date must be after From date
3. Distance calculated from route table (fallback to API if not found)
4. Season determined from LAY CAN From date
5. Cargo quantity must be positive
6. Commission rate varies by service type

### 6.3. Logistics Rules

1. At least one container (20' or 40') must be specified
2. Total containers = Container 20' + Container 40'
3. CY/CY is default delivery term (others to be added)
4. Shipment To date must be after From date
5. Routes must exist in rate table
6. Volume discount based on total containers
7. Peak season months: June, July, August, September, December

---

## 7. Configuration & Maintenance

### 7.1. Rate Updates

- Ocean freight rates: Update quarterly or when market changes
- THC rates: Update annually or when port changes rates
- Surcharge rates (BAF, CAF): Update monthly based on fuel prices and currency
- Discount rules: Configure per campaign or customer agreement

### 7.2. Formula Versioning

- Each rate change creates new record with effective dates
- Old rates remain for historical quotations
- Current rate = most recent with effective_from <= today AND (effective_to IS NULL OR effective_to >= today)

### 7.3. Admin Controls

Admins should be able to:
- Add/edit/deactivate rates
- Configure surcharge rules
- Set up discount campaigns
- Override calculated prices with justification
- View calculation audit trail
- Export rate tables

---

## 8. Future Enhancements

### 8.1. Advanced Features

1. **Dynamic Pricing**
   - Real-time bunker fuel price integration
   - Currency exchange rate API
   - Market demand-based pricing

2. **AI/ML Integration**
   - Price prediction based on historical data
   - Optimal route suggestion
   - Demand forecasting

3. **Additional Services**
   - LCL (Less than Container Load) pricing
   - Air freight pricing
   - Customs clearance pricing
   - Insurance calculation
   - Door-to-door delivery

4. **Customer Portal**
   - Self-service quotation
   - Online booking
   - Price comparison tools
   - Historical price tracking

### 8.2. Integration Points

- Port authorities for real-time fees
- Shipping lines for container availability
- Weather services for delay predictions
- Tracking systems for shipment visibility

---

**Document Version:** 1.0  
**Created:** December 3, 2025  
**Last Updated:** December 3, 2025  
**Status:** Active  
**Next Review:** Quarterly (March 2026)
