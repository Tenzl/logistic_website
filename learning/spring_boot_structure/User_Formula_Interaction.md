# User - Formula Interaction Structure

## Tổng Quan

Tài liệu này mô tả cách người dùng tương tác với hệ thống tính giá, từ việc nhập liệu, lưu trữ bản ghi, đến quản lý quotation và order.

---

## 1. User Journey & Workflow

### 1.1. Guest User Journey

```
GUEST visits website
    ↓
Browse services & view pricing info
    ↓
Use Pricing Calculator (public)
    ↓
[Fill form → Get FINAL estimated price only]
    ↓
Download PDF Estimate (no breakdown shown)
    ↓
Want to proceed?
    ├─ No → Exit (PDF saved locally)
    └─ Yes → Must Register/Login for official quotation
```

**Guest Capabilities:**
- ✅ View service information
- ✅ Use calculator to get final price only
- ✅ Download PDF estimate (no calculation details)
- ❌ Cannot see price breakdown
- ❌ Cannot see calculation formula
- ❌ Cannot save quotations in system
- ❌ Cannot create orders
- ❌ Cannot access history

**Privacy Policy:**
- 🔒 Calculation formulas are confidential business secrets
- 🔒 Only final price is shown to guests and customers
- 🔒 Detailed breakdown is for internal use only (employees/admin)

---

### 1.2. Customer User Journey

```
CUSTOMER logs in
    ↓
Select Service Type
    ├─ Shipping Agency
    ├─ Chartering & Ship-broking
    └─ Freight Forwarding & Logistics
    ↓
Fill Service Request Form
    ↓
[Submit Request]
    ↓
System generates Quotation (internal calculation)
    ↓
Customer receives Quotation PDF
    ├─ Shows: FINAL PRICE only
    ├─ Shows: Service details, validity period
    └─ Hides: Price breakdown, formula details
    ↓
Customer reviews Quotation
    ├─ Accept → Create Order
    ├─ Reject → End or revise
    └─ Request Revision → Back to Employee
    ↓
If Accepted: Proceed to Payment
    ↓
Track Order Status
    ↓
Receive Service
    ↓
View Invoice (FINAL AMOUNT only) & Complete Payment
    ↓
Rate & Review Service
```

**Customer Capabilities:**
- ✅ Submit service requests
- ✅ Receive quotation PDF with final price
- ✅ Accept/Reject quotations
- ✅ Track orders
- ✅ View invoices (final amount only)
- ❌ Cannot see price calculation breakdown
- ❌ Cannot see internal formula
- ❌ Cannot see rate tables

**Confidentiality:**
- 🔒 All pricing formulas are proprietary
- 🔒 Customers only see final price and service details
- 🔒 No access to cost breakdown or profit margins

---

### 1.3. Employee User Journey

```
EMPLOYEE receives Service Request
    ↓
Review Customer Request
    ↓
Verify & Adjust Input Data (if needed)
    ↓
Generate Quotation
    ├─ Use Auto-calculation
    └─ Override price (with justification)
    ↓
Send Quotation to Customer
    ↓
Customer accepts?
    ├─ Yes → Convert to Order
    └─ No → Revise or Archive
    ↓
Process Order
    ↓
Update Order Status
    ↓
Generate Invoice
    ↓
Confirm Payment
    ↓
Complete Order
```

---

### 1.4. Admin User Journey - Fee Configuration Management

```
ADMIN accesses Admin Panel
    ↓
Navigate to Fee Configuration Management
    ↓
Select Service Type
    ├─ Shipping Agency
    ├─ Chartering
    └─ Freight Forwarding
    ↓
View Current Fee List (ordered by display_order)
    ↓
Admin Actions:
    ├─ CREATE New Fee
    │   ├─ Enter fee name, code
    │   ├─ Select formula type
    │   ├─ Enter formula (JSON/expression)
    │   ├─ Set display order
    │   ├─ Set status (ACTIVE/INACTIVE)
    │   ├─ Apply to specific port (optional)
    │   └─ Save configuration
    │
    ├─ UPDATE Existing Fee
    │   ├─ Modify fee name
    │   ├─ Change formula type
    │   ├─ Update formula
    │   ├─ Adjust display order
    │   ├─ Change status
    │   └─ Save changes
    │
    ├─ REORDER Fees
    │   ├─ Drag and drop fees
    │   ├─ System updates display_order
    │   └─ Save new sequence
    │
    ├─ DELETE Fee
    │   ├─ Confirm deletion
    │   ├─ Archive or hard delete
    │   └─ Update dependent calculations
    │
    └─ PREVIEW Calculation
        ├─ Test with sample data
        ├─ Verify formula accuracy
        └─ Validate before activation
    ↓
Changes Applied
    ↓
Pricing System Uses Updated Configuration
```

**Admin Capabilities:**
- ✅ Full CRUD operations on fee configurations
- ✅ Reorder fees (drag-and-drop display sequence)
- ✅ Change calculation formulas dynamically
- ✅ Enable/Disable fees without deletion
- ✅ Test formulas before activation
- ✅ View calculation audit trail
- ✅ Port-specific fee configuration
- ✅ View all internal pricing details

**Admin Responsibilities:**
- 🔑 Maintain pricing formula accuracy
- 🔑 Test changes before deployment
- 🔑 Document formula changes
- 🔑 Ensure compliance with business rules
- 🔑 Monitor pricing strategy effectiveness

---

## 2. Data Flow & Storage Structure

### 2.1. Request → Quotation → Order Flow

```
Service Request (Draft)
    ↓ [Save]
service_requests table
    ↓ [Calculate Price]
Quotation Generated (uses fee_configurations)
    ↓ [Save]
quotations table + price_calculations table
    ↓ [Accept]
Order Created
    ↓ [Save]
orders table (copy quotation data)
    ↓ [Process]
Order Items + Shipments
```

### 2.2. Fee Configuration → Price Calculation Flow

```
Admin Configures Fees
    ↓ [Save]
fee_configurations table
    ↓ [Active Fees]
System loads ACTIVE fees by service_type
    ↓ [Display Order]
Fees applied in sequence (display_order ASC)
    ↓ [Calculate]
Each fee formula executed with input data
    ↓ [Aggregate]
Total price = SUM(all fee calculations)
    ↓ [Audit]
Save to price_calculations table
```

---

## 3. Database Schema - User Input Storage

### 3.1. Fee Configurations Table (ADMIN MANAGED - NEW)

```sql
CREATE TABLE fee_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Fee identification
    fee_name VARCHAR(200) NOT NULL,              -- Display name: "Tonnage Fee"
    fee_code VARCHAR(50) UNIQUE NOT NULL,        -- Unique code: "TONNAGE_FEE"
    
    -- Service classification
    service_type ENUM('SHIPPING_AGENCY', 'CHARTERING', 'FREIGHT_FORWARDING') NOT NULL,
    
    -- Formula configuration
    formula_type ENUM(
        'SIMPLE_MULTIPLICATION',  -- GRT × rate × days
        'BASE_PLUS_VARIABLE',     -- base + (GRT × rate)
        'PERCENTAGE',             -- value × percentage
        'FIXED',                  -- fixed amount
        'CONDITIONAL',            -- if-then-else logic
        'COMPLEX_FORMULA',        -- custom expression
        'TIERED_PRICING'          -- tier-based rates
    ) NOT NULL,
    
    formula TEXT NOT NULL,                       -- JSON or expression
    formula_description TEXT,                    -- Human-readable explanation
    
    -- Display configuration
    display_order INTEGER NOT NULL DEFAULT 0,   -- Sort order in UI/PDF
    
    -- Status
    status ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    
    -- Port-specific configuration
    applicable_port VARCHAR(100),                -- NULL = all ports, or specific port
    
    -- Conditional application
    conditions TEXT,                             -- JSON: {"minDWT": 10000, "maxDWT": 50000}
    
    -- Admin notes
    notes VARCHAR(500),
    
    -- Timestamps
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_display_order (display_order),
    INDEX idx_port (applicable_port)
) ENGINE=InnoDB;
```

**Example Fee Configuration Records:**

```sql
-- Example 1: Simple Multiplication
INSERT INTO fee_configurations (fee_name, fee_code, service_type, formula_type, formula, display_order, status)
VALUES (
    'Tonnage Fee',
    'TONNAGE_FEE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"baseRateHaiphong": 0.025, "baseRateHochiminh": 0.028, "multiplier": "GRT", "daysMultiplier": true}',
    1,
    'ACTIVE'
);

-- Example 2: Percentage
INSERT INTO fee_configurations (fee_name, fee_code, service_type, formula_type, formula, display_order, status)
VALUES (
    'Ocean Freight Tax (5%)',
    'OCEAN_FREIGHT_TAX',
    'SHIPPING_AGENCY',
    'PERCENTAGE',
    '{"percentage": 5, "appliedTo": ["TONNAGE_FEE", "NAVIGATION_DUE", "BERTH_DUE"]}',
    9,
    'ACTIVE'
);

-- Example 3: Fixed Amount
INSERT INTO fee_configurations (fee_name, fee_code, service_type, formula_type, formula, display_order, status)
VALUES (
    'Clearance Fees',
    'CLEARANCE_FEES',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 530, "fixedAmountHochiminh": 650}',
    12,
    'ACTIVE'
);

-- Example 4: Conditional
INSERT INTO fee_configurations (fee_name, fee_code, service_type, formula_type, formula, display_order, status)
VALUES (
    'Berthing B.4 Application',
    'BERTHING_B4',
    'SHIPPING_AGENCY',
    'CONDITIONAL',
    '{"fixedBase": 300, "dwtThreshold": 30000, "excessRate": 0.01, "condition": "DWT > threshold"}',
    11,
    'ACTIVE'
);
```

### 3.2. Service Requests Table (User Input Storage)

```sql
CREATE TABLE service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_code VARCHAR(50) UNIQUE NOT NULL,  -- REQ-YYYYMMDD-XXXX
    customer_id BIGINT NOT NULL,
    service_type VARCHAR(50) NOT NULL,  -- 'SHIPPING_AGENCY', 'CHARTERING', 'LOGISTICS'
    request_status VARCHAR(20) DEFAULT 'DRAFT',  -- 'DRAFT', 'SUBMITTED', 'QUOTED', 'REJECTED', 'EXPIRED'
    
    -- Common fields
    full_name VARCHAR(200) NOT NULL,
    contact_info VARCHAR(500) NOT NULL,  -- Phone/Fax/Email
    other_information TEXT,
    
    -- Service-specific data (JSON for flexibility)
    service_data JSON NOT NULL,
    
    -- Metadata
    submitted_at TIMESTAMP,
    quoted_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (request_status),
    INDEX idx_service (service_type),
    INDEX idx_submitted (submitted_at)
);
```

### 3.2. Service Data JSON Structure

#### A. Shipping Agency Request
```json
{
  "service_type": "SHIPPING_AGENCY",
  "dwt": 50000,
  "grt": 30000,
  "loa": 180.5,
  "cargo_quantity": "Container / 1,000 TEU",
  "port_of_call": "Ho Chi Minh",
  "estimated_arrival_date": "2025-12-15",
  "vessel_name": "MV Sea Dragon",
  "vessel_type": "Container Ship",
  "flag": "Panama"
}
```

#### B. Chartering Request
```json
{
  "service_type": "CHARTERING",
  "cargo_quantity": "Bulk coal / 10,000 tons",
  "loading_port": "Haiphong",
  "discharging_port": "Japan",
  "laycan_from": "2025-01-15",
  "laycan_to": "2025-02-15",
  "charter_type": "VOYAGE",
  "cargo_type": "BULK",
  "special_requirements": "Need weather insurance"
}
```

#### C. Freight Forwarding & Logistics Request
```json
{
  "service_type": "FREIGHT_FORWARDING",
  "cargo_name": "Electronics",
  "delivery_term": "CY/CY",
  "container_20": 2,
  "container_40": 3,
  "loading_port": "Haiphong",
  "discharging_port": "Singapore",
  "shipment_date_from": "2025-01-15",
  "shipment_date_to": "2025-02-01",
  "cargo_description": "Consumer electronics, non-hazardous",
  "hs_code": "8517.12.00",
  "insurance_required": true,
  "incoterm": "CIF",
  "container_type": "DRY",
  "special_requirements": null
}
```

**Alternative service types under Logistics:**
- `FREIGHT_FORWARDING` - Main freight forwarding service
- `TOTAL_LOGISTICS` - Full logistics solution (warehouse + distribution)
- `CUSTOMS_CLEARANCE` - Customs brokerage only
- `WAREHOUSING` - Storage and distribution

### 3.3. Quotations Table

```sql
CREATE TABLE quotations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quote_code VARCHAR(50) UNIQUE NOT NULL,  -- QT-YYYYMMDD-XXXX
    request_id BIGINT,  -- FK to service_requests
    customer_id BIGINT NOT NULL,
    employee_id BIGINT,  -- Who created the quote
    service_type VARCHAR(50) NOT NULL,
    
    -- Quote status
    quote_status VARCHAR(20) DEFAULT 'DRAFT',  -- 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'
    
    -- Pricing breakdown (INTERNAL USE ONLY - NOT SHOWN TO CUSTOMER)
    base_price DECIMAL(12,2) NOT NULL,
    total_surcharges DECIMAL(12,2) DEFAULT 0,
    total_discounts DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,  -- ONLY THIS IS SHOWN TO CUSTOMER
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Price override (if employee manually adjusted)
    is_price_overridden BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    original_calculated_price DECIMAL(12,2),
    
    -- Validity
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,  -- Usually quote_date + 30 days
    
    -- Service-specific input data (copied from request)
    service_input_data JSON NOT NULL,
    
    -- Customer actions
    customer_response VARCHAR(20),  -- 'ACCEPTED', 'REJECTED', 'REVISION_REQUESTED'
    customer_response_date TIMESTAMP,
    customer_notes TEXT,
    
    -- Timestamps
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_customer (customer_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (quote_status),
    INDEX idx_valid (valid_until),
    INDEX idx_quote_date (quote_date)
);
```

### 3.4. Quotation Items Table (INTERNAL USE ONLY - Price Breakdown Details)

```sql
CREATE TABLE quotation_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quotation_id BIGINT NOT NULL,
    item_category VARCHAR(100) NOT NULL,  -- 'BASE_PRICE', 'SURCHARGE', 'DISCOUNT', 'TAX'
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2) NOT NULL,
    calculation_note TEXT,
    display_order INTEGER DEFAULT 0,
    
    -- Access control
    is_internal_only BOOLEAN DEFAULT TRUE,  -- Never show to customers
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id),
    INDEX idx_category (item_category)
);
```

**⚠️ CONFIDENTIAL: Example Quotation Items (INTERNAL VIEW ONLY)**

This data is **NEVER** exposed to customers through API or PDF:

| item_category | item_name | description | quantity | unit_price | total_price |
|---------------|-----------|-------------|----------|------------|-------------|
| BASE_PRICE | Ocean Freight 20' | Haiphong to Singapore | 2 | 300.00 | 600.00 |
| BASE_PRICE | Ocean Freight 40' | Haiphong to Singapore | 3 | 500.00 | 1,500.00 |
### 3.5. Price Calculations Table (CONFIDENTIAL AUDIT TRAIL)

```sql
CREATE TABLE price_calculations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quotation_id BIGINT NOT NULL,
    calculation_step VARCHAR(100) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    
    -- Formula details (HIGHLY CONFIDENTIAL - TRADE SECRET)
    formula_used TEXT,
    input_values JSON,  -- Store all input values used
    base_value DECIMAL(12,2),
    rate_applied DECIMAL(10,4),
    multiplier DECIMAL(10,4),
    calculated_value DECIMAL(12,2) NOT NULL,
    
    currency VARCHAR(3) DEFAULT 'USD',
    calculation_notes TEXT,
    step_order INTEGER DEFAULT 0,
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id),
    INDEX idx_step (calculation_step)
);
```

**🔒 TRADE SECRET - INTERNAL USE ONLY:**
- This table contains proprietary pricing formulas
- Access restricted to Admin and authorized employees only
- Never exposed through customer-facing APIs
- Used for audit, analysis, and pricing strategy
- Protected by database-level access control 
    currency VARCHAR(3) DEFAULT 'USD',
    calculation_notes TEXT,
    step_order INTEGER DEFAULT 0,
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id),
    INDEX idx_step (calculation_step)
);
```

**Example Price Calculations:**

| calculation_step | component_name | formula_used | input_values | calculated_value |
|------------------|----------------|--------------|--------------|------------------|
| 1_BASE_OCEAN_FREIGHT | Ocean Freight 20' | RATE_20 × QTY_20 | {"rate": 300, "qty": 2} | 600.00 |
| 2_BASE_OCEAN_FREIGHT | Ocean Freight 40' | RATE_40 × QTY_40 | {"rate": 500, "qty": 3} | 1,500.00 |
| 3_THC_ORIGIN | THC Origin 20' | THC_20 × QTY_20 | {"thc": 80, "qty": 2} | 160.00 |
| 4_SURCHARGE_BAF | BAF | OCEAN_FREIGHT × 0.10 | {"ocean_freight": 2100, "rate": 0.10} | 210.00 |
| 5_DISCOUNT_VOLUME | Volume Discount | SUBTOTAL × 0.05 | {"subtotal": 4710, "rate": 0.05} | -236.00 |

### 3.6. Orders Table

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,  -- ORD-YYYYMMDD-XXXX
    quotation_id BIGINT NOT NULL,  -- Reference to accepted quotation
    customer_id BIGINT NOT NULL,
    employee_id BIGINT,  -- Assigned employee
    service_type VARCHAR(50) NOT NULL,
    
    -- Order status
    order_status VARCHAR(20) DEFAULT 'PENDING',  
    -- 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    
    -- Pricing (copied from quotation at time of order creation)
    base_price DECIMAL(12,2) NOT NULL,
    total_surcharges DECIMAL(12,2) DEFAULT 0,
    total_discounts DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment
    payment_status VARCHAR(20) DEFAULT 'UNPAID',  
    -- 'UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50),
    
    -- Service data (immutable copy from quotation)
    service_data JSON NOT NULL,
    
    -- Dates
    order_date DATE NOT NULL,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_customer (customer_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (order_status),
    INDEX idx_payment (payment_status),
    INDEX idx_order_date (order_date)
);
```

### 3.7. Order Items Table

```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
);
```

### 3.8. Saved Estimates Table (For Guest Users - Optional)

```sql
CREATE TABLE saved_estimates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    estimate_code VARCHAR(50) UNIQUE NOT NULL,  -- EST-YYYYMMDD-XXXX
    service_type VARCHAR(50) NOT NULL,
    
    -- Anonymous user tracking (optional)
    session_id VARCHAR(100),
    email VARCHAR(255),  -- If user provides email to save estimate
    
    -- Input data
    service_input_data JSON NOT NULL,
    
    -- Calculated price (snapshot)
    estimated_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Validity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- Auto-delete after 30 days
    
    -- Conversion tracking
    converted_to_request_id BIGINT,  -- If user registers and converts
    
    INDEX idx_session (session_id),
    INDEX idx_email (email),
    INDEX idx_service (service_type),
    INDEX idx_expires (expires_at)
);
```

---

## 4. User Interaction Flow - Detailed Examples

### 4.1. Guest User - Price Estimation

**Step 1: Guest fills calculator form**

Frontend captures:
```json
{
  "service_type": "LOGISTICS",
  "cargo_name": "Electronics",
  "container_20": 2,
  "container_40": 3,
  "loading_port": "Haiphong",
  "discharging_port": "Singapore",
  "shipment_date_from": "2025-01-15",
  "shipment_date_to": "2025-02-01"
}
```

**Step 2: Backend calculates estimate**

```java
// PriceCalculatorController
@PostMapping("/api/public/calculator/logistics")
public ResponseEntity<EstimateDTO> calculateEstimate(@RequestBody LogisticsEstimateRequest request) {
    // Calculate price (no database save for guest)
    EstimateDTO estimate = priceCalculationService.calculateLogisticsEstimate(request);
    return ResponseEntity.ok(estimate);
}
```

**Step 3: Response returned to guest (FINAL PRICE ONLY)**

```json
{
  "estimate_code": "EST-20251204-0001",
  "service_type": "LOGISTICS",
  "estimated_price": 4474.00,
  "currency": "USD",
  "service_summary": {
    "cargo": "Electronics",
    "containers": "2×20' + 3×40'",
    "route": "Haiphong → Singapore",
    "delivery_term": "CY/CY"
  },
  "valid_for_days": 7,
  "pdf_download_url": "/api/public/estimates/EST-20251204-0001/pdf",
  "note": "This is an estimate only. Register to get official quotation."
}
```

**Note:** No breakdown, no formula details. Only final price is shown.

**Step 4: Guest downloads PDF estimate**

```java
@GetMapping("/api/public/estimates/{code}/pdf")
public ResponseEntity<byte[]> downloadEstimatePdf(@PathVariable String code) {
    EstimateDTO estimate = estimateService.getEstimate(code);
    
    // Generate PDF with FINAL PRICE ONLY (no breakdown)
    byte[] pdfBytes = pdfService.generateGuestEstimatePdf(estimate);
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDispositionFormData("attachment", "estimate-" + code + ".pdf");
    
    return ResponseEntity.ok()
        .headers(headers)
        .body(pdfBytes);
}
```

**PDF Content (Guest/Customer View):**
```
═══════════════════════════════════════════
           PRICE ESTIMATE
═══════════════════════════════════════════

Estimate Code: EST-20251204-0001
Date: December 4, 2025
Valid Until: December 11, 2025

SERVICE DETAILS
─────────────────────────────────────────
Service Type: Freight Forwarding & Logistics
Cargo: Electronics
Containers: 2×20' + 3×40'
Route: Haiphong → Singapore
Delivery Term: CY/CY
Shipment Period: Jan 15, 2025 - Feb 1, 2025

PRICING
─────────────────────────────────────────
Total Price:                    USD 4,474.00

═══════════════════════════════════════════

Note: This is an estimate only. Actual price may vary.
      Register for official quotation and booking.

Contact: sales@seatrans.com | +84 123 456 789
═══════════════════════════════════════════
```

**Step 5: Guest can optionally save estimate (with email)**

```sql
INSERT INTO saved_estimates (
    estimate_code, service_type, session_id, email, 
    service_input_data, estimated_price, expires_at
) VALUES (
    'EST-20251204-0001', 'LOGISTICS', 'sess_xyz123', 'guest@example.com',
    '{"cargo_name": "Electronics", "container_20": 2, ...}',
    4474.00, '2025-12-11 00:00:00'
);
```

---

### 4.2. Customer User - Full Request Flow

**Step 1: Customer logs in and submits request**

Frontend POST to `/api/requests`:
```json
{
  "service_type": "LOGISTICS",
  "full_name": "Nguyen Van A",
  "contact_info": "0912345678 / nguyenvana@company.com",
  "cargo_name": "Electronics",
  "delivery_term": "CY/CY",
  "container_20": 2,
  "container_40": 3,
  "loading_port": "Haiphong",
  "discharging_port": "Singapore",
  "shipment_date_from": "2025-01-15",
  "shipment_date_to": "2025-02-01",
  "other_information": "Need insurance coverage"
}
```

**Step 2: Backend saves service request**

```java
// ServiceRequestService
@Transactional
public ServiceRequestDTO createRequest(LogisticsRequestDTO dto, Long customerId) {
    ServiceRequest request = new ServiceRequest();
    request.setRequestCode(generateRequestCode()); // REQ-20251204-0001
    request.setCustomerId(customerId);
    request.setServiceType("LOGISTICS");
    request.setRequestStatus("SUBMITTED");
    request.setFullName(dto.getFullName());
    request.setContactInfo(dto.getContactInfo());
    
    // Store service-specific data as JSON
    ObjectMapper mapper = new ObjectMapper();
    JsonNode serviceData = mapper.valueToTree(dto);
    request.setServiceData(serviceData);
    
    request.setSubmittedAt(LocalDateTime.now());
    request.setExpiresAt(LocalDateTime.now().plusDays(30));
    
    serviceRequestRepository.save(request);
    
    // Notify employee
    notificationService.notifyNewRequest(request);
    
    return mapToDTO(request);
}
```

**Database Record:**

```sql
-- service_requests table
INSERT INTO service_requests (
    request_code, customer_id, service_type, request_status,
    full_name, contact_info, service_data, submitted_at, expires_at
) VALUES (
    'REQ-20251204-0001', 123, 'LOGISTICS', 'SUBMITTED',
    'Nguyen Van A', '0912345678 / nguyenvana@company.com',
    '{
        "service_type": "LOGISTICS",
        "cargo_name": "Electronics",
        "container_20": 2,
        "container_40": 3,
        "loading_port": "Haiphong",
        "discharging_port": "Singapore",
        "shipment_date_from": "2025-01-15",
        "shipment_date_to": "2025-02-01",
        "other_information": "Need insurance coverage"
    }',
    '2025-12-04 10:30:00', '2026-01-03 10:30:00'
);
```

**Step 3: Employee receives notification and creates quotation**

Employee reviews request and clicks "Generate Quotation":

```java
// QuotationService
@Transactional
public QuotationDTO generateQuotation(Long requestId, Long employeeId) {
    ServiceRequest request = serviceRequestRepository.findById(requestId)
        .orElseThrow(() -> new NotFoundException("Request not found"));
    
    // Extract service data
    LogisticsRequestDTO dto = objectMapper.treeToValue(
        request.getServiceData(), LogisticsRequestDTO.class
    );
    
    // Calculate price using formula
    PriceCalculationResult result = priceCalculationService.calculateLogisticsPrice(dto);
    
    // Create quotation
    Quotation quotation = new Quotation();
    quotation.setQuoteCode(generateQuoteCode()); // QT-20251204-0001
    quotation.setRequestId(requestId);
    quotation.setCustomerId(request.getCustomerId());
    quotation.setEmployeeId(employeeId);
    quotation.setServiceType("LOGISTICS");
    quotation.setQuoteStatus("DRAFT");
    
    // Set pricing
    quotation.setBasePrice(result.getBasePrice());
    quotation.setTotalSurcharges(result.getTotalSurcharges());
    quotation.setTotalDiscounts(result.getTotalDiscounts());
    quotation.setSubtotal(result.getSubtotal());
    quotation.setTaxAmount(result.getTaxAmount());
    quotation.setFinalAmount(result.getFinalAmount());
    
    // Set validity
    quotation.setQuoteDate(LocalDate.now());
    quotation.setValidUntil(LocalDate.now().plusDays(30));
    
    // Copy service data
    quotation.setServiceInputData(request.getServiceData());
    
    quotationRepository.save(quotation);
    
    // Save quotation items (breakdown)
    saveQuotationItems(quotation.getId(), result.getBreakdown());
    
    // Save calculation audit trail
    savePriceCalculations(quotation.getId(), result.getCalculationSteps());
    
    // Update request status
    request.setRequestStatus("QUOTED");
    request.setQuotedAt(LocalDateTime.now());
    
    return mapToDTO(quotation);
}
```

**Database Records Created:**

```sql
-- quotations table
INSERT INTO quotations (
    quote_code, request_id, customer_id, employee_id, service_type,
    quote_status, base_price, total_surcharges, total_discounts,
    subtotal, tax_amount, final_amount, quote_date, valid_until,
    service_input_data
) VALUES (
    'QT-20251204-0001', 1, 123, 45, 'LOGISTICS',
    'DRAFT', 4500.00, 210.00, 236.00,
    4474.00, 0.00, 4474.00, '2025-12-04', '2026-01-03',
    '{"cargo_name": "Electronics", "container_20": 2, ...}'
);

-- quotation_items table (multiple rows)
INSERT INTO quotation_items (quotation_id, item_category, item_name, quantity, unit_price, total_price, display_order)
VALUES 
    (1, 'BASE_PRICE', 'Ocean Freight 20ft', 2, 300.00, 600.00, 1),
    (1, 'BASE_PRICE', 'Ocean Freight 40ft', 3, 500.00, 1500.00, 2),
    (1, 'BASE_PRICE', 'THC Origin', 5, 100.00, 500.00, 3),
    (1, 'BASE_PRICE', 'THC Destination', 5, 134.00, 670.00, 4),
    (1, 'BASE_PRICE', 'Documentation Fee', 1, 230.00, 230.00, 5),
    (1, 'BASE_PRICE', 'Inland Transport Origin', 5, 80.00, 400.00, 6),
    (1, 'BASE_PRICE', 'Inland Transport Destination', 5, 120.00, 600.00, 7),
    (1, 'SURCHARGE', 'BAF (10%)', 1, 210.00, 210.00, 8),
    (1, 'DISCOUNT', 'Volume Discount (5%)', 1, -236.00, -236.00, 9);

-- price_calculations table (detailed audit trail)
INSERT INTO price_calculations (
    quotation_id, calculation_step, component_name, formula_used,
    input_values, base_value, rate_applied, calculated_value, step_order
) VALUES 
    (1, '1_OCEAN_FREIGHT', 'Container 20ft Rate', 'RATE_20 × QTY_20',
     '{"route": "Haiphong-Singapore", "rate": 300, "qty": 2}', 300.00, 1.0000, 600.00, 1),
    (1, '2_OCEAN_FREIGHT', 'Container 40ft Rate', 'RATE_40 × QTY_40',
     '{"route": "Haiphong-Singapore", "rate": 500, "qty": 3}', 500.00, 1.0000, 1500.00, 2),
    (1, '3_THC', 'THC Origin 20ft', 'THC_20 × QTY_20',
     '{"port": "Haiphong", "thc": 80, "qty": 2}', 80.00, 1.0000, 160.00, 3),
    -- ... more calculation steps
    (1, '8_SURCHARGE', 'BAF', 'OCEAN_FREIGHT × 0.10',
     '{"ocean_freight": 2100, "rate": 0.10}', 2100.00, 0.1000, 210.00, 8),
    (1, '9_DISCOUNT', 'Volume Discount', 'SUBTOTAL × 0.05',
     '{"subtotal": 4710, "containers": 5, "rate": 0.05}', 4710.00, -0.0500, -236.00, 9);
```

**Step 4: Employee sends quotation to customer**

```java
@Transactional
public void sendQuotation(Long quotationId) {
    Quotation quotation = quotationRepository.findById(quotationId)
        .orElseThrow(() -> new NotFoundException("Quotation not found"));
    
    quotation.setQuoteStatus("SENT");
    quotation.setSentAt(LocalDateTime.now());
    
    // Send email to customer
    emailService.sendQuotationEmail(quotation);
    
    // Create notification
    notificationService.notifyCustomerQuotation(quotation);
}
```

**Step 5: Customer reviews and accepts quotation**

Customer clicks "Accept Quotation":

```java
@Transactional
public OrderDTO acceptQuotation(Long quotationId, String customerNotes) {
    Quotation quotation = quotationRepository.findById(quotationId)
        .orElseThrow(() -> new NotFoundException("Quotation not found"));
    
    // Validate quotation
    if (!quotation.getQuoteStatus().equals("SENT")) {
        throw new InvalidStatusException("Quotation not in SENT status");
    }
    if (quotation.getValidUntil().isBefore(LocalDate.now())) {
        throw new ExpiredQuotationException("Quotation has expired");
    }
    
    // Update quotation status
    quotation.setQuoteStatus("ACCEPTED");
    quotation.setCustomerResponse("ACCEPTED");
    quotation.setCustomerResponseDate(LocalDateTime.now());
    quotation.setCustomerNotes(customerNotes);
    
    // Create order from quotation
    Order order = createOrderFromQuotation(quotation);
    
    return mapToDTO(order);
}

private Order createOrderFromQuotation(Quotation quotation) {
    Order order = new Order();
    order.setOrderCode(generateOrderCode()); // ORD-20251204-0001
    order.setQuotationId(quotation.getId());
    order.setCustomerId(quotation.getCustomerId());
    order.setEmployeeId(quotation.getEmployeeId());
    order.setServiceType(quotation.getServiceType());
    order.setOrderStatus("PENDING");
    order.setPaymentStatus("UNPAID");
    
    // Copy pricing from quotation
    order.setBasePrice(quotation.getBasePrice());
    order.setTotalSurcharges(quotation.getTotalSurcharges());
    order.setTotalDiscounts(quotation.getTotalDiscounts());
    order.setSubtotal(quotation.getSubtotal());
    order.setTaxAmount(quotation.getTaxAmount());
    order.setFinalAmount(quotation.getFinalAmount());
    order.setCurrency(quotation.getCurrency());
    
    // Copy service data
    order.setServiceData(quotation.getServiceInputData());
    
    order.setOrderDate(LocalDate.now());
    order.setCustomerNotes(quotation.getCustomerNotes());
    
    orderRepository.save(order);
    
    // Copy quotation items to order items
    List<QuotationItem> quotationItems = quotationItemRepository.findByQuotationId(quotation.getId());
    for (QuotationItem qItem : quotationItems) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrderId(order.getId());
        orderItem.setItemCategory(qItem.getItemCategory());
        orderItem.setItemName(qItem.getItemName());
        orderItem.setDescription(qItem.getDescription());
        orderItem.setQuantity(qItem.getQuantity());
        orderItem.setUnitPrice(qItem.getUnitPrice());
        orderItem.setTotalPrice(qItem.getTotalPrice());
        orderItemRepository.save(orderItem);
    }
    
    return order;
}
```

**Database Records:**

```sql
-- Update quotation
UPDATE quotations 
SET quote_status = 'ACCEPTED',
    customer_response = 'ACCEPTED',
    customer_response_date = '2025-12-04 14:30:00',
    customer_notes = 'Please proceed with the service'
WHERE id = 1;

-- Create order
INSERT INTO orders (
    order_code, quotation_id, customer_id, employee_id, service_type,
    order_status, payment_status, base_price, total_surcharges,
    total_discounts, subtotal, tax_amount, final_amount,
    service_data, order_date, customer_notes
) VALUES (
    'ORD-20251204-0001', 1, 123, 45, 'LOGISTICS',
    'PENDING', 'UNPAID', 4500.00, 210.00, 236.00,
    4474.00, 0.00, 4474.00,
    '{"cargo_name": "Electronics", "container_20": 2, ...}',
    '2025-12-04', 'Please proceed with the service'
);

-- Copy order items from quotation items
INSERT INTO order_items (order_id, item_category, item_name, quantity, unit_price, total_price)
SELECT 1, item_category, item_name, quantity, unit_price, total_price
FROM quotation_items
WHERE quotation_id = 1;
```

---

## 5. API Endpoints Structure

### 5.1. Public Calculator APIs (Guest)

```
GET    /api/public/services                    // List available services
GET    /api/public/services/{type}             // Service details
### 5.3. Customer Quotation APIs

```
GET    /api/quotations                         // List customer's quotations
GET    /api/quotations/{id}                    // Get quotation details (FINAL PRICE ONLY)
POST   /api/quotations/{id}/accept             // Accept quotation
POST   /api/quotations/{id}/reject             // Reject quotation
POST   /api/quotations/{id}/request-revision   // Request revision
GET    /api/quotations/{id}/pdf                // Download PDF (FINAL PRICE ONLY)
```

**⚠️ REMOVED APIs (No longer exposed to customers):**
```
❌ GET /api/quotations/{id}/breakdown          // REMOVED - Trade secret
❌ GET /api/quotations/{id}/items              // REMOVED - Internal only
❌ GET /api/quotations/{id}/calculations       // REMOVED - Confidential
```

**Customer Quotation Response (Sanitized):**
```json
{
  "quote_code": "QT-20251204-0001",
  "quote_date": "2025-12-04",
  "valid_until": "2026-01-03",
### 5.5. Employee Quotation Management APIs (INTERNAL)

```
GET    /api/employee/requests                  // List all customer requests
GET    /api/employee/requests/{id}             // Get request details
POST   /api/employee/quotations                // Create quotation from request
PUT    /api/employee/quotations/{id}           // Update quotation
POST   /api/employee/quotations/{id}/calculate // Recalculate price
POST   /api/employee/quotations/{id}/override  // Override price manually
POST   /api/employee/quotations/{id}/send      // Send to customer (PDF with final price)
GET    /api/employee/quotations/{id}/breakdown // View full breakdown (INTERNAL)
GET    /api/employee/quotations/{id}/audit     // View calculation audit trail (INTERNAL)
```

**Employee Quotation Response (Full Details):**
```json
{
  "quote_code": "QT-20251204-0001",
  "customer": "Nguyen Van A",
  "service_type": "LOGISTICS",
  "status": "DRAFT",
  "final_amount": 4474.00,
  "currency": "USD",
  
  // INTERNAL ONLY - Never sent to customer
  "internal_breakdown": {
    "base_price": 4500.00,
    "surcharges": 210.00,
    "discounts": -236.00,
    "profit_margin": 892.00,
    "cost_analysis": {
      "ocean_freight": 2100.00,
      "thc": 1170.00,
      "documentation": 230.00,
      "inland": 1000.00
    }
  },
  "calculation_steps": [...],  // Full audit trail
  
### 6.1. Guest Calculator Page

```
┌────────────────────────────────────────────┐
│  Pricing Calculator                        │
│                                            │
│  Select Service: [Dropdown ▼]             │
│    ○ Shipping Agency                       │
│    ○ Chartering & Ship-broking            │
│    ● Freight Forwarding & Logistics        │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Logistics Calculator Form             │ │
│  │                                        │ │
│  │ Cargo Name: [____________]            │ │
│  │ Container 20': [__] Container 40': [__] │
│  │ Loading Port: [Dropdown ▼]            │ │
│  │ Discharging Port: [Dropdown ▼]        │ │
│  │ Shipment Date: [From] to [To]         │ │
│  │                                        │ │
│  │ [ Calculate Price ]                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 💰 Estimated Price                    │ │
│  │                                        │ │
│  │    USD 4,474.00                       │ │
│  │                                        │ │
│  │ ⚠️ This is an estimate only           │ │
│  │    Valid for 7 days                   │ │
│  │    Actual price may vary              │ │
│  │                                        │ │
│  │ [ Download PDF ] [ Register for Quote ]│
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

**Note:** No breakdown shown. Only final price displayed to protect business confidentiality.    /api/employee/requests/{id}             // Get request details
POST   /api/employee/quotations                // Create quotation from request
PUT    /api/employee/quotations/{id}           // Update quotation
POST   /api/employee/quotations/{id}/calculate // Recalculate price
POST   /api/employee/quotations/{id}/override  // Override price manually
POST   /api/employee/quotations/{id}/send      // Send to customer
GET    /api/employee/quotations/{id}/audit     // View calculation audit trail
```

### 5.6. Employee Order Management APIs

```
GET    /api/employee/orders                    // List all orders
GET    /api/employee/orders/{id}               // Get order details
PUT    /api/employee/orders/{id}/status        // Update order status
POST   /api/employee/orders/{id}/assign        // Assign to employee
POST   /api/employee/orders/{id}/invoice       // Generate invoice
POST   /api/employee/orders/{id}/confirm-payment // Confirm payment
```

---

## 6. Frontend User Interface Flow

### 6.1. Guest Calculator Page

```
┌────────────────────────────────────────────┐
│  Pricing Calculator                        │
│                                            │
│  Select Service: [Dropdown ▼]             │
│    ○ Shipping Agency                       │
│    ○ Chartering & Ship-broking            │
│    ● Freight Forwarding & Logistics        │
│                                            │
│  ┌──────────────────────────────────────┐ │
### 6.3. Customer Quotation View (SIMPLIFIED)

```
┌────────────────────────────────────────────┐
│  Quotation: QT-20251204-0001              │
│  Status: SENT  │  Valid Until: 2026-01-03 │
│                                            │
│  Service: Freight Forwarding & Logistics   │
│  Quote Date: 2025-12-04                   │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Shipment Details                      │ │
│  │ ├─ Cargo: Electronics                 │ │
│  │ ├─ Containers: 2×20' + 3×40'          │ │
│  │ ├─ Route: Haiphong → Singapore       │ │
│  │ ├─ Delivery: CY/CY                    │ │
│  │ └─ Date: 2025-01-15 to 02-01         │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 💰 QUOTATION PRICE                    │ │
│  │                                        │ │
│  │                                        │ │
│  │        USD 4,474.00                   │ │
│  │                                        │ │
│  │                                        │ │
│  │ ✓ All charges included                │ │
│  │ ✓ Valid for 30 days                   │ │
│  │ ✓ Price guaranteed upon acceptance    │ │
│  │                                        │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [ Download PDF ]                         │
│                                            │
│  Customer Notes:                          │
│  ┌────────────────────────────────────┐   │
│  │ [Your comments or questions...]    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [ Reject ]  [ Request Revision ] [Accept]│
└────────────────────────────────────────────┘
```

**What Customer Sees:**
- ✅ Final price only
- ✅ Service details
- ✅ Validity period
- ❌ No price breakdown
- ❌ No calculation details
- ❌ No cost components├─ Discharging Port: Singapore ▼         │
│  └─ Shipment Time: [2025-01-15] - [02-01] │
│                                            │
│  Additional Information (Optional)         │
│  ┌────────────────────────────────────┐   │
│  │ Need insurance coverage            │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [ Save as Draft ]  [ Submit Request ]    │
### 6.4. Customer Order Tracking

```
┌────────────────────────────────────────────┐
│  Order: ORD-20251204-0001                 │
│  Status: IN_PROGRESS ●                    │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Order Timeline                        │ │
│  │                                        │ │
│  │ ● PENDING        2025-12-04 14:30     │ │
│  │ ● CONFIRMED      2025-12-04 15:00 ✓   │ │
│  │ ● IN_PROGRESS    2025-12-05 09:00 ✓   │ │
│  │ ○ COMPLETED      (In progress...)     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Service Details                          │
│  ├─ Service: Freight Forwarding           │
│  ├─ Route: Haiphong → Singapore          │
│  ├─ Containers: 2×20' + 3×40'             │
│  └─ ETD: 2025-01-15                       │
│                                            │
│  Payment Information                      │
│  ├─ Total Amount: $4,474 USD              │
│  ├─ Paid: $2,000                          │
│  ├─ Outstanding: $2,474                   │
│  └─ Status: PARTIAL                       │
│                                            │
│  [ Download Invoice PDF ] [ Make Payment ]│
│  [ Download Documents ] [ Contact Support ]│
└────────────────────────────────────────────┘
```

**Invoice PDF Content (Customer View):**
```
═══════════════════════════════════════════
                INVOICE
═══════════════════════════════════════════

Invoice No: INV-20251204-0001
Order No: ORD-20251204-0001
Date: December 4, 2025
Due Date: December 18, 2025

BILL TO
─────────────────────────────────────────
Nguyen Van A
ABC Company Ltd.
123 Street, Hanoi, Vietnam

SERVICE PROVIDED
─────────────────────────────────────────
Freight Forwarding & Logistics
Route: Haiphong → Singapore
Containers: 2×20' + 3×40'
Delivery Term: CY/CY
Period: Jan 15 - Feb 1, 2025

AMOUNT DUE
─────────────────────────────────────────
Total Amount:                   USD 4,474.00
Payment Received:              USD 2,000.00
─────────────────────────────────────────
Balance Due:                    USD 2,474.00

═══════════════════════════════════════════

Payment Methods: Bank Transfer, Credit Card
Bank: ABC Bank | Account: 1234567890
Reference: INV-20251204-0001

Thank you for your business!
═══════════════════════════════════════════
```

**Note:** Invoice shows only final amounts, no breakdown.│  Inland Transport              $1,000│ │
│  │                        Subtotal $4,500│
│  │                                        │ │
│  │ Surcharges                            │ │
│  │  BAF (10%)                      $210 │ │
│  │                                        │ │
│  │ Discounts                             │ │
│  │  Volume Discount (5%)          -$236 │ │
│  │                                        │ │
│  │ ═══════════════════════════════════   │ │
│  │ Total Amount              USD $4,474 │ │
│  │ ═══════════════════════════════════   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Customer Notes:                          │
│  ┌────────────────────────────────────┐   │
│  │ [Your comments or questions...]    │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [ Reject ]  [ Request Revision ] [Accept]│
└────────────────────────────────────────────┘
```

### 6.4. Customer Order Tracking

```
┌────────────────────────────────────────────┐
│  Order: ORD-20251204-0001                 │
│  Status: IN_PROGRESS ●                    │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ Order Timeline                        │ │
│  │                                        │ │
│  │ ● PENDING        2025-12-04 14:30     │ │
│  │ ● CONFIRMED      2025-12-04 15:00 ✓   │ │
│  │ ● IN_PROGRESS    2025-12-05 09:00 ✓   │ │
│  │ ○ COMPLETED      (In progress...)     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Service Details                          │
│  ├─ Service: Freight Forwarding           │
│  ├─ Route: Haiphong → Singapore          │
│  ├─ Containers: 2×20' + 3×40'             │
│  └─ ETD: 2025-01-15                       │
│                                            │
│  Payment Information                      │
│  ├─ Total Amount: $4,474 USD              │
│  ├─ Paid: $2,000                          │
│  ├─ Outstanding: $2,474                   │
│  └─ Status: PARTIAL                       │
│                                            │
│  [ View Invoice ] [ Make Payment ]        │
│  [ Download Documents ] [ Contact Support ]│
└────────────────────────────────────────────┘
```

---

## 7. Data Retention & History

### 7.1. Retention Policies

| Data Type | Retention Period | Action After Period |
|-----------|------------------|---------------------|
| Saved Estimates (Guest) | 30 days | Auto-delete |
| Service Requests (Draft) | 90 days | Archive |
| Service Requests (Submitted) | 2 years | Archive |
| Quotations (All statuses) | 5 years | Permanent |
| Orders (Completed) | 10 years | Permanent |
| Orders (Cancelled) | 3 years | Archive |
| Price Calculations | Same as quotation | Same as quotation |
| Audit Logs | 7 years | Permanent |

### 7.2. Historical Price Tracking

Customers can view:
- All past quotations
- All past orders
- Price trends over time
- Comparison with current prices

```sql
-- View customer's historical logistics quotes
---

## 10. PDF Generation Service

### 10.1. PDF Service Interface

```java
public interface PdfGeneratorService {
    
    /**
     * Generate PDF for guest estimate (FINAL PRICE ONLY)
     */
    byte[] generateGuestEstimatePdf(EstimateDTO estimate);
    
    /**
     * Generate PDF for customer quotation (FINAL PRICE ONLY)
     */
    byte[] generateCustomerQuotationPdf(QuotationDTO quotation);
    
    /**
     * Generate PDF invoice for customer (FINAL AMOUNT ONLY)
     */
    byte[] generateCustomerInvoicePdf(OrderDTO order);
    
    /**
     * Generate PDF with full breakdown (INTERNAL USE - EMPLOYEE/ADMIN ONLY)
     */
    byte[] generateInternalQuotationPdf(QuotationDTO quotation, boolean includeBreakdown);
}
```

### 10.2. Guest Estimate PDF Template

```java
public byte[] generateGuestEstimatePdf(EstimateDTO estimate) {
    Document document = new Document();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PdfWriter.getInstance(document, baos);
    
    document.open();
    
    // Header
    addHeader(document, "PRICE ESTIMATE");
    
    // Estimate Info
    addText(document, "Estimate Code: " + estimate.getEstimateCode());
    addText(document, "Date: " + formatDate(estimate.getCreatedDate()));
    addText(document, "Valid Until: " + formatDate(estimate.getValidUntil()));
    
    addSeparator(document);
    
    // Service Details
    addSectionHeader(document, "SERVICE DETAILS");
    addText(document, "Service Type: " + estimate.getServiceType());
    addServiceSummary(document, estimate.getServiceSummary());
    
    addSeparator(document);
    
    // PRICE - FINAL ONLY
    addSectionHeader(document, "PRICING");
    addLargePrice(document, estimate.getEstimatedPrice(), estimate.getCurrency());
    
    addSeparator(document);
    
    // Footer
    addText(document, "Note: This is an estimate only. Actual price may vary.");
    addText(document, "Register for official quotation and booking.");
    addCompanyContact(document);
    
    document.close();
    
    return baos.toByteArray();
}
```

### 10.3. Customer Quotation PDF Template

```java
public byte[] generateCustomerQuotationPdf(QuotationDTO quotation) {
    Document document = new Document();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PdfWriter.getInstance(document, baos);
    
    document.open();
    
    // Header with company logo
    addCompanyLogo(document);
    addHeader(document, "OFFICIAL QUOTATION");
    
    // Quotation Info
    addText(document, "Quotation No: " + quotation.getQuoteCode());
    addText(document, "Date: " + formatDate(quotation.getQuoteDate()));
    addText(document, "Valid Until: " + formatDate(quotation.getValidUntil()));
    
    addSeparator(document);
    
    // Customer Info
    addSectionHeader(document, "CUSTOMER INFORMATION");
    addText(document, "Company: " + quotation.getCustomerName());
    addText(document, "Contact: " + quotation.getContactInfo());
    
    addSeparator(document);
    
    // Service Details
    addSectionHeader(document, "SERVICE DETAILS");
    addText(document, "Service Type: " + quotation.getServiceType());
    addServiceDetails(document, quotation.getServiceData());
    
    addSeparator(document);
    
    // PRICE - FINAL ONLY (NO BREAKDOWN)
    addSectionHeader(document, "QUOTATION PRICE");
    addLargePrice(document, quotation.getFinalAmount(), quotation.getCurrency());
    
    // Price notes
    addText(document, "✓ All charges included");
    addText(document, "✓ Valid for 30 days from quotation date");
    addText(document, "✓ Price guaranteed upon acceptance");
    
    addSeparator(document);
    
    // Terms & Conditions
    addSectionHeader(document, "TERMS & CONDITIONS");
    addTermsAndConditions(document);
    
    // Footer
    addCompanyFooter(document);
    
    document.close();
    
    return baos.toByteArray();
}
```

### 10.4. Internal Quotation PDF Template (EMPLOYEE/ADMIN ONLY)

```java
@PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
public byte[] generateInternalQuotationPdf(QuotationDTO quotation, boolean includeBreakdown) {
    Document document = new Document();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PdfWriter.getInstance(document, baos);
    
    document.open();
    
    // Watermark: INTERNAL USE ONLY
    addWatermark(document, "CONFIDENTIAL - INTERNAL USE ONLY");
    
    // Header
    addHeader(document, "QUOTATION - INTERNAL ANALYSIS");
    
    // Basic Info
    addQuotationBasicInfo(document, quotation);
    
    // FULL BREAKDOWN (INTERNAL ONLY)
    if (includeBreakdown) {
        addSeparator(document);
        addSectionHeader(document, "PRICE BREAKDOWN - CONFIDENTIAL");
        
        // Base Charges
        PdfPTable table = new PdfPTable(4);
        table.addCell("Category");
        table.addCell("Description");
        table.addCell("Qty");
        table.addCell("Amount");
        
        for (QuotationItemDTO item : quotation.getItems()) {
            table.addCell(item.getItemCategory());
            table.addCell(item.getItemName());
            table.addCell(String.valueOf(item.getQuantity()));
            table.addCell(formatCurrency(item.getTotalPrice()));
        }
        
        document.add(table);
        
        addSeparator(document);
        
        // Summary
        addText(document, "Base Price: " + formatCurrency(quotation.getBasePrice()));
        addText(document, "Surcharges: " + formatCurrency(quotation.getTotalSurcharges()));
        addText(document, "Discounts: " + formatCurrency(quotation.getTotalDiscounts()));
        addText(document, "Subtotal: " + formatCurrency(quotation.getSubtotal()));
        addText(document, "Tax: " + formatCurrency(quotation.getTaxAmount()));
        addBoldText(document, "Final Amount: " + formatCurrency(quotation.getFinalAmount()));
        
        addSeparator(document);
        
        // Calculation Steps
        addSectionHeader(document, "CALCULATION AUDIT TRAIL");
        for (CalculationStepDTO step : quotation.getCalculationSteps()) {
            addText(document, step.getComponentName() + ": " + step.getFormulaUsed());
            addText(document, "  Input: " + step.getInputValues());
            addText(document, "  Result: " + formatCurrency(step.getCalculatedValue()));
        }
    }
    
    // Final Price for Customer
    addSeparator(document);
    addSectionHeader(document, "CUSTOMER-FACING PRICE");
    addLargePrice(document, quotation.getFinalAmount(), quotation.getCurrency());
    addText(document, "⚠️ Only this amount is shown to customer");
    
    document.close();
    
    return baos.toByteArray();
}
```

### 10.5. Access Control for PDF Generation

```java
@RestController
@RequestMapping("/api/quotations")
public class QuotationController {
    
    // Customer-facing endpoint - FINAL PRICE ONLY
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<byte[]> downloadCustomerQuotationPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        
        QuotationDTO quotation = quotationService.getCustomerQuotation(id, user);
        
        // Generate PDF with FINAL PRICE ONLY (no breakdown)
        byte[] pdf = pdfService.generateCustomerQuotationPdf(quotation);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", 
            "quotation-" + quotation.getQuoteCode() + ".pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdf);
    }
    
    // Internal endpoint - FULL BREAKDOWN
    @GetMapping("/{id}/internal-pdf")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<byte[]> downloadInternalQuotationPdf(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean includeBreakdown) {
        
        QuotationDTO quotation = quotationService.getQuotationWithBreakdown(id);
        
        // Generate PDF with FULL DETAILS
        byte[] pdf = pdfService.generateInternalQuotationPdf(quotation, includeBreakdown);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", 
            "quotation-internal-" + quotation.getQuoteCode() + ".pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdf);
    }
}
```

---

## 11. Data Security & Access Control

### 11.1. Database-Level Security

```sql
-- Create roles with different access levels
CREATE ROLE customer_role;
CREATE ROLE employee_role;
CREATE ROLE admin_role;

-- Customer role: Can only see final prices
GRANT SELECT (id, quote_code, customer_id, service_type, quote_status, 
              final_amount, currency, quote_date, valid_until) 
ON quotations TO customer_role;

-- NO access to breakdown tables
REVOKE ALL ON quotation_items FROM customer_role;
REVOKE ALL ON price_calculations FROM customer_role;
REVOKE ALL ON rate_tables FROM customer_role;

-- Employee role: Can see everything
GRANT SELECT, INSERT, UPDATE ON quotations TO employee_role;
GRANT SELECT ON quotation_items TO employee_role;
GRANT SELECT ON price_calculations TO employee_role;
GRANT SELECT ON rate_tables TO employee_role;

-- Admin role: Full access
GRANT ALL PRIVILEGES ON ALL TABLES TO admin_role;
```

### 11.2. API-Level Security

```java
@Service
public class QuotationService {
    
    /**
     * Get quotation for customer - SANITIZED (no breakdown)
     */
    public QuotationDTO getCustomerQuotation(Long id, UserDetails user) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Quotation not found"));
        
        // Verify ownership
        if (!quotation.getCustomerId().equals(getCurrentCustomerId(user))) {
            throw new UnauthorizedException("Not your quotation");
        }
        
        // Return sanitized DTO - FINAL PRICE ONLY
        return QuotationDTO.builder()
            .quoteCode(quotation.getQuoteCode())
            .quoteDate(quotation.getQuoteDate())
            .validUntil(quotation.getValidUntil())
            .status(quotation.getQuoteStatus())
            .serviceType(quotation.getServiceType())
            .serviceSummary(extractServiceSummary(quotation))
            .finalAmount(quotation.getFinalAmount())  // ONLY THIS
            .currency(quotation.getCurrency())
            .pdfUrl("/api/quotations/" + id + "/pdf")
            .build();
        // NO breakdown, NO items, NO calculations
    }
    
    /**
     * Get full quotation with breakdown - INTERNAL ONLY
     */
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public QuotationDTO getQuotationWithBreakdown(Long id) {
        Quotation quotation = quotationRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Quotation not found"));
        
        // Fetch all related data
        List<QuotationItem> items = quotationItemRepository.findByQuotationId(id);
        List<PriceCalculation> calculations = priceCalculationRepository.findByQuotationId(id);
        
        // Return FULL DTO with all details
        return QuotationDTO.builder()
            .quoteCode(quotation.getQuoteCode())
            // ... all basic fields ...
            .finalAmount(quotation.getFinalAmount())
            // INTERNAL ONLY:
            .basePrice(quotation.getBasePrice())
            .totalSurcharges(quotation.getTotalSurcharges())
            .totalDiscounts(quotation.getTotalDiscounts())
            .items(mapItems(items))
            .calculationSteps(mapCalculations(calculations))
            .profitMargin(calculateProfitMargin(quotation))
            .costAnalysis(calculateCostAnalysis(quotation))
            .build();
    }
}
```

### 11.3. Frontend Security

```typescript
// Customer view - Only show final price
interface CustomerQuotationView {
  quoteCode: string;
  quoteDate: string;
  validUntil: string;
  serviceType: string;
  serviceSummary: ServiceSummary;
  finalAmount: number;
  currency: string;
  pdfUrl: string;
}

// Employee/Admin view - Full details
interface InternalQuotationView extends CustomerQuotationView {
  basePrice: number;
  totalSurcharges: number;
  totalDiscounts: number;
  breakdown: QuotationItem[];
  calculationSteps: CalculationStep[];
  profitMargin: number;
  costAnalysis: CostAnalysis;
}

// Component logic
const QuotationView: React.FC = () => {
  const { user } = useAuth();
  const [quotation, setQuotation] = useState<any>(null);
  
  useEffect(() => {
    if (user.role === 'CUSTOMER') {
      // Fetch sanitized quotation
      fetch(`/api/quotations/${id}`)
        .then(res => res.json())
        .then(data => setQuotation(data));
    } else if (user.role === 'EMPLOYEE' || user.role === 'ADMIN') {
      // Fetch full quotation with breakdown
      fetch(`/api/employee/quotations/${id}/breakdown`)
        .then(res => res.json())
        .then(data => setQuotation(data));
    }
  }, []);
  
  return (
    <div>
      {/* Always show final price */}
      <div className="final-price">
        {quotation.currency} {quotation.finalAmount}
      </div>
      
      {/* Only show breakdown to employees */}
      {(user.role === 'EMPLOYEE' || user.role === 'ADMIN') && (
        <div className="internal-breakdown">
          <h3>Internal Breakdown (Confidential)</h3>
          {/* Show full details */}
        </div>
      )}
    </div>
  );
};
```

---

## 12. Notifications & Alerts
    q.final_amount,
    JSON_EXTRACT(q.service_input_data, '$.loading_port') as loading_port,
    JSON_EXTRACT(q.service_input_data, '$.discharging_port') as discharging_port,
    JSON_EXTRACT(q.service_input_data, '$.container_20') as cont_20,
    JSON_EXTRACT(q.service_input_data, '$.container_40') as cont_40
FROM quotations q
WHERE q.customer_id = 123
  AND q.service_type = 'LOGISTICS'
ORDER BY q.quote_date DESC;
```

---

## 8. Price Recalculation Scenarios

### 8.1. When to Recalculate

1. **Customer requests revision**
   - Employee can adjust inputs
   - System recalculates automatically
   - Creates new quotation version

2. **Rates change before acceptance**
   - If quotation expired, must recalculate
   - New quotation with updated rates

3. **Order modification**
   - Customer changes container quantities
   - Additional charges calculated
   - Update order with delta

### 8.2. Price Lock Mechanism

```sql
-- When quotation is sent, lock the rates used
CREATE TABLE quotation_rate_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quotation_id BIGINT NOT NULL,
    rate_table_id BIGINT NOT NULL,
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rate_value DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (rate_table_id) REFERENCES rate_tables(id),
    INDEX idx_quotation (quotation_id)
);
```

This ensures:
- Quotation price remains valid even if rates change
- Customer sees consistent pricing during validity period
- Historical accuracy for completed orders

---

## 9. Error Handling & Validation

### 9.1. Input Validation Rules

**Shipping Agency:**
- DWT: 1-500,000 (integer)
- GRT: 1-500,000 (integer)
- LOA: 10-400 meters (decimal)
- Port: Must be in allowed list
- Cargo: Required, max 500 characters

**Chartering:**
- Cargo Quantity: Must include type and amount
- Ports: Must be valid port names
- LAY CAN: To date must be after From date
- Date range: Max 90 days

**Logistics:**
- Container 20 + Container 40: Min 1, Max 100 total
- Ports: Must exist in route table
- Shipment dates: From must be future, To after From
- Date range: Max 60 days

### 9.2. Calculation Error Handling

```java
try {
    result = priceCalculationService.calculate(request);
} catch (RouteNotFoundException e) {
    return error("Route not found. Please contact support for custom quote.");
} catch (RateExpiredException e) {
    return error("Rates have changed. Please submit a new request.");
} catch (InvalidInputException e) {
    return error("Invalid input: " + e.getMessage());
} catch (CalculationException e) {
    logger.error("Calculation failed", e);
    return error("Unable to calculate price. Please try again or contact support.");
}
```

---

## 10. Notifications & Alerts

### 10.1. Customer Notifications

| Event | Channel | Template |
|-------|---------|----------|
| Request Submitted | Email + In-app | "Your request REQ-XXX has been submitted" |
| Quotation Ready | Email + In-app | "Quotation QT-XXX is ready for review" |
| Quotation Expiring | Email | "Quotation expires in 3 days" |
| Order Confirmed | Email + SMS | "Order ORD-XXX confirmed" |
| Order Status Changed | In-app | "Order status: IN_PROGRESS" |
| Payment Required | Email + In-app | "Payment due for order ORD-XXX" |
| Order Completed | Email + In-app | "Order ORD-XXX completed" |

### 10.2. Employee Notifications

| Event | Channel | Template |
|-------|---------|----------|
| New Request | Email + In-app | "New service request REQ-XXX" |
| Quotation Accepted | Email + In-app | "Customer accepted QT-XXX" |
| Quotation Rejected | In-app | "Customer rejected QT-XXX" |
| Revision Requested | Email + In-app | "Customer requests revision for QT-XXX" |
| Payment Received | In-app | "Payment received for ORD-XXX" |
| Order Due | Email | "Order ORD-XXX due date approaching" |

### 10.3. Admin Notifications (Fee Configuration Changes)

| Event | Channel | Template |
|-------|---------|----------|
| Fee Created | In-app + Log | "New fee configuration: FEE-XXX" |
| Fee Updated | In-app + Log | "Fee FEE-XXX formula updated" |
| Fee Deleted | In-app + Log | "Fee FEE-XXX deleted/archived" |
| Fee Reordered | In-app + Log | "Fee display order changed for SERVICE-XXX" |
| Formula Error | Email + In-app | "Formula validation failed for FEE-XXX" |

---

## 11. Admin Fee Configuration Management

### 11.1. Fee Configuration CRUD Operations

#### 11.1.1. Create Fee Configuration

**API Endpoint:**
```
POST /api/admin/fee-configs
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "feeName": "Port Supervision Fee",
  "feeCode": "PORT_SUPERVISION",
  "serviceType": "SHIPPING_AGENCY",
  "formulaType": "BASE_PLUS_VARIABLE",
  "formula": "{\"baseHaiphong\": 200, \"baseHochiminh\": 250, \"dailyRate\": 50}",
  "formulaDescription": "Base fee + (stay days × daily rate). Base varies by port.",
  "displayOrder": 14,
  "status": "ACTIVE",
  "applicablePort": null,
  "conditions": null,
  "notes": "New fee for 2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configuration created successfully",
  "data": {
    "id": 14,
    "feeName": "Port Supervision Fee",
    "feeCode": "PORT_SUPERVISION",
    "serviceType": "SHIPPING_AGENCY",
    "formulaType": "BASE_PLUS_VARIABLE",
    "formula": "{\"baseHaiphong\": 200, \"baseHochiminh\": 250, \"dailyRate\": 50}",
    "displayOrder": 14,
    "status": "ACTIVE",
    "createdAt": "2025-12-04T17:00:00",
    "updatedAt": null
  }
}
```

#### 11.1.2. Update Fee Configuration

**API Endpoint:**
```
PUT /api/admin/fee-configs/{id}
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "formula": "{\"baseHaiphong\": 220, \"baseHochiminh\": 270, \"dailyRate\": 55}",
  "formulaDescription": "Updated rates for 2026",
  "notes": "Rate increase effective Jan 2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configuration updated successfully",
  "data": {
    "id": 14,
    "feeName": "Port Supervision Fee",
    "formula": "{\"baseHaiphong\": 220, \"baseHochiminh\": 270, \"dailyRate\": 55}",
    "updatedAt": "2025-12-04T17:30:00"
  }
}
```

#### 11.1.3. Reorder Fees

**API Endpoint:**
```
POST /api/admin/fee-configs/reorder?serviceType=SHIPPING_AGENCY
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "feeIds": [1, 2, 3, 14, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configurations reordered successfully",
  "data": null
}
```

**Effect:**
- Fee ID 14 moved from position 14 to position 4
- All subsequent fees shifted down
- `display_order` values updated: 1, 2, 3, 4, 5, 6, ...

#### 11.1.4. Delete Fee Configuration

**API Endpoint:**
```
DELETE /api/admin/fee-configs/{id}
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configuration deleted successfully",
  "data": null
}
```

**Notes:**
- Hard delete removes from database
- Recommended: Set `status = 'ARCHIVED'` instead of deleting
- Existing quotations using this fee remain unchanged (historical data)

#### 11.1.5. Get All Fees by Service Type

**API Endpoint:**
```
GET /api/admin/fee-configs?serviceType=SHIPPING_AGENCY
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Fee configurations retrieved successfully",
  "data": [
    {
      "id": 1,
      "feeName": "Tonnage Fee",
      "feeCode": "TONNAGE_FEE",
      "formulaType": "SIMPLE_MULTIPLICATION",
      "displayOrder": 1,
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "feeName": "Navigation Due",
      "feeCode": "NAVIGATION_DUE",
      "formulaType": "SIMPLE_MULTIPLICATION",
      "displayOrder": 2,
      "status": "ACTIVE"
    }
    // ... more fees
  ]
}
```

### 11.2. Fee Configuration UI - Admin Panel

#### 11.2.1. Fee List View

```
┌────────────────────────────────────────────────────────────────┐
│  Fee Configuration Management - Shipping Agency                │
│                                                                │
│  Service Type: [Shipping Agency ▼]  [+ Add New Fee]          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ ≡ 1.  Tonnage Fee                           [ACTIVE]     │ │
│  │      Type: Simple Multiplication                          │ │
│  │      Formula: GRT × rate × days                          │ │
│  │      [ Edit ] [ Delete ] [ Preview ]                      │ │
│  │                                                            │ │
│  │ ≡ 2.  Navigation Due                         [ACTIVE]     │ │
│  │      Type: Simple Multiplication                          │ │
│  │      Formula: GRT × rate                                 │ │
│  │      [ Edit ] [ Delete ] [ Preview ]                      │ │
│  │                                                            │ │
│  │ ≡ 3.  Pilotage                              [ACTIVE]     │ │
│  │      Type: Base Plus Variable                            │ │
│  │      Formula: base + (GRT × rate) + distance             │ │
│  │      [ Edit ] [ Delete ] [ Preview ]                      │ │
│  │                                                            │ │
│  │ ≡ 4.  Tug Assistance                        [ACTIVE]     │ │
│  │      Type: Complex Formula                               │ │
│  │      Formula: tugs × rate × hours × 2                    │ │
│  │      [ Edit ] [ Delete ] [ Preview ]                      │ │
│  │                                                            │ │
│  │ ... 9 more fees ...                                       │ │
│  │                                                            │ │
│  │ [ Save Order ]  [ Reset ]  [ Bulk Actions ▼ ]            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  💡 Drag fees to reorder. Changes affect quotation display.   │
└────────────────────────────────────────────────────────────────┘
```

**Features:**
- ≡ Drag handle for reordering
- Color-coded status badges
- Inline formula preview
- Quick actions (Edit, Delete, Preview)

#### 11.2.2. Create/Edit Fee Form

```
┌────────────────────────────────────────────────────────────────┐
│  Create New Fee Configuration                                  │
│                                                                │
│  Basic Information                                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Fee Name: [____________________]  *Required               │ │
│  │ Fee Code: [____________________]  *Unique                 │ │
│  │ Service Type: [Shipping Agency ▼]                         │ │
│  │ Status: ○ Active  ○ Inactive  ○ Archived                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Formula Configuration                                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Formula Type: [Simple Multiplication ▼]                   │ │
│  │   Options:                                                 │ │
│  │   • Simple Multiplication                                  │ │
│  │   • Base Plus Variable                                     │ │
│  │   • Percentage                                            │ │
│  │   • Fixed Amount                                          │ │
│  │   • Conditional                                           │ │
│  │   • Complex Formula                                       │ │
│  │   • Tiered Pricing                                        │ │
│  │                                                            │ │
│  │ Formula (JSON):                                           │ │
│  │ ┌────────────────────────────────────────────────────┐   │ │
│  │ │ {                                                   │   │ │
│  │ │   "baseRateHaiphong": 0.025,                        │   │ │
│  │ │   "baseRateHochiminh": 0.028,                       │   │ │
│  │ │   "multiplier": "GRT",                              │   │ │
│  │ │   "daysMultiplier": true                            │   │ │
│  │ │ }                                                   │   │ │
│  │ └────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │ Formula Description:                                      │ │
│  │ [GRT × rate × stay days. Haiphong: $0.025, HCMC: $0.028]│ │
│  │                                                            │ │
│  │ [ Validate Formula ] [ Test with Sample Data ]            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Display & Conditions                                         │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Display Order: [__]  (Leave empty to add at end)         │ │
│  │ Applicable Port: [All Ports ▼]                            │ │
│  │ Conditions (JSON): [Optional]                             │ │
│  │ Notes: [______________________________]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [ Cancel ]  [ Save as Draft ]  [ Save & Activate ]          │
└────────────────────────────────────────────────────────────────┘
```

#### 11.2.3. Formula Testing Interface

```
┌────────────────────────────────────────────────────────────────┐
│  Test Formula: Tonnage Fee                                     │
│                                                                │
│  Formula Type: Simple Multiplication                          │
│  Formula: {"baseRateHaiphong": 0.025, "baseRateHochiminh": ... │
│                                                                │
│  Sample Input Data:                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ GRT: [30000]                                              │ │
│  │ Stay Days: [5]                                            │ │
│  │ Port: [Haiphong ▼]                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [ Calculate ]                                                │
│                                                                │
│  Calculation Result:                                          │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Formula: 30000 × 0.025 × 5                                │ │
│  │ Result: USD 3,750.00 ✓                                    │ │
│  │                                                            │ │
│  │ Breakdown:                                                 │ │
│  │ • GRT: 30,000                                             │ │
│  │ • Rate (Haiphong): $0.025 /GRT/day                        │ │
│  │ • Days: 5                                                 │ │
│  │ • Total: 30,000 × 0.025 × 5 = $3,750.00                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [ Test Another ] [ Close ]                                   │
└────────────────────────────────────────────────────────────────┘
```

### 11.3. Integration with Pricing Calculation

#### 11.3.1. Dynamic Fee Loading

```java
@Service
public class ShippingAgencyPriceService {
    
    private final FeeConfigurationRepository feeConfigRepository;
    
    public ShippingAgencyPriceResult calculatePrice(ShippingAgencyRequestDTO request) {
        String port = request.getPortOfCall().toUpperCase();
        
        // Load ACTIVE fee configurations for SHIPPING_AGENCY
        List<FeeConfiguration> feeConfigs = feeConfigRepository
            .findByServiceTypeAndPort(
                ServiceType.SHIPPING_AGENCY, 
                FeeStatus.ACTIVE, 
                port
            );
        
        List<PriceComponent> components = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        
        // Apply each fee configuration in display order
        for (FeeConfiguration feeConfig : feeConfigs) {
            BigDecimal feeAmount = calculateFee(feeConfig, request, port);
            
            components.add(createComponent(
                feeConfig.getFeeName(),
                feeAmount,
                feeConfig.getFormulaDescription()
            ));
            
            total = total.add(feeAmount);
        }
        
        return ShippingAgencyPriceResult.builder()
            .components(components)
            .total(total)
            .currency("USD")
            .build();
    }
    
    private BigDecimal calculateFee(FeeConfiguration config, 
                                     ShippingAgencyRequestDTO request, 
                                     String port) {
        
        // Parse formula JSON
        ObjectMapper mapper = new ObjectMapper();
        JsonNode formula = mapper.readTree(config.getFormula());
        
        switch (config.getFormulaType()) {
            case SIMPLE_MULTIPLICATION:
                return calculateSimpleMultiplication(formula, request, port);
            
            case BASE_PLUS_VARIABLE:
                return calculateBasePlusVariable(formula, request, port);
            
            case PERCENTAGE:
                return calculatePercentage(formula, components);
            
            case FIXED:
                return calculateFixed(formula, port);
            
            case CONDITIONAL:
                return calculateConditional(formula, request, port);
            
            case COMPLEX_FORMULA:
                return calculateComplexFormula(formula, request, port);
            
            case TIERED_PRICING:
                return calculateTieredPricing(formula, request, port);
            
            default:
                throw new UnsupportedOperationException(
                    "Formula type not supported: " + config.getFormulaType()
                );
        }
    }
    
    private BigDecimal calculateSimpleMultiplication(JsonNode formula, 
                                                       ShippingAgencyRequestDTO request, 
                                                       String port) {
        // Example: GRT × rate × days
        String multiplier = formula.get("multiplier").asText(); // "GRT" or "DWT"
        boolean useDays = formula.get("daysMultiplier").asBoolean();
        
        double rate = port.equals("HAIPHONG") 
            ? formula.get("baseRateHaiphong").asDouble()
            : formula.get("baseRateHochiminh").asDouble();
        
        double baseValue = multiplier.equals("GRT") 
            ? request.getGrt() 
            : request.getDwt();
        
        double result = baseValue * rate;
        
        if (useDays) {
            long days = ChronoUnit.DAYS.between(
                request.getArrivalDate(), 
                request.getDepartureDate()
            );
            result *= Math.max(days, 1);
        }
        
        return BigDecimal.valueOf(result).setScale(2, RoundingMode.HALF_UP);
    }
}
```

### 11.4. Fee Configuration Change History

```sql
CREATE TABLE fee_configuration_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fee_configuration_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE', 'REORDER'
    changed_by_user_id BIGINT NOT NULL,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Snapshot of changes
    old_value JSON,
    new_value JSON,
    
    -- Change details
    change_description TEXT,
    
    FOREIGN KEY (fee_configuration_id) REFERENCES fee_configurations(id),
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id),
    INDEX idx_fee_config (fee_configuration_id),
    INDEX idx_timestamp (change_timestamp)
);
```

**Example History Records:**

```sql
-- Fee created
INSERT INTO fee_configuration_history (
    fee_configuration_id, action, changed_by_user_id, 
    new_value, change_description
) VALUES (
    14, 'CREATE', 1,
    '{"feeName": "Port Supervision Fee", "formulaType": "BASE_PLUS_VARIABLE", ...}',
    'New fee added for 2026'
);

-- Formula updated
INSERT INTO fee_configuration_history (
    fee_configuration_id, action, changed_by_user_id,
    old_value, new_value, change_description
) VALUES (
    14, 'UPDATE', 1,
    '{"baseHaiphong": 200, "baseHochiminh": 250, "dailyRate": 50}',
    '{"baseHaiphong": 220, "baseHochiminh": 270, "dailyRate": 55}',
    'Rate increase for 2026'
);
```

### 11.5. Security & Validation

```java
@RestController
@RequestMapping("/api/admin/fee-configs")
@PreAuthorize("hasRole('ADMIN')")
public class FeeConfigurationController {
    
    @PostMapping
    public ResponseEntity<ApiResponse<FeeConfigResponseDTO>> createFeeConfig(
            @Valid @RequestBody CreateFeeConfigDTO dto) {
        
        // Validate formula syntax
        validateFormulaSyntax(dto.getFormulaType(), dto.getFormula());
        
        // Check for duplicate fee_code
        if (feeConfigService.existsByFeeCode(dto.getFeeCode())) {
            throw new DuplicateFeeCodeException("Fee code already exists");
        }
        
        FeeConfigResponseDTO result = feeConfigService.createFeeConfig(dto);
        
        // Log the change
        auditService.logFeeConfigChange("CREATE", result.getId(), null, result);
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Fee configuration created successfully", result));
    }
    
    private void validateFormulaSyntax(FeeFormulaType type, String formula) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode json = mapper.readTree(formula);
            
            // Validate based on formula type
            switch (type) {
                case SIMPLE_MULTIPLICATION:
                    if (!json.has("multiplier") || !json.has("baseRateHaiphong")) {
                        throw new InvalidFormulaException("Missing required fields");
                    }
                    break;
                
                case FIXED:
                    if (!json.has("fixedAmountHaiphong")) {
                        throw new InvalidFormulaException("Fixed amount required");
                    }
                    break;
                
                // ... more validations
            }
        } catch (JsonProcessingException e) {
            throw new InvalidFormulaException("Invalid JSON format");
        }
    }
}
```

---

## 12. Notifications & Alerts
