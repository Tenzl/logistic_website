# Database Refactor Summary - Backend & Frontend Updates

## 🎯 Schema Changes Overview

### 1. **ConditionalTier/Rule → FormulaLine Ownership (Option A)**
- `conditional_tiers.formula_line_id` → **NOT NULL** (required)
- `conditional_rules.formula_line_id` → **NOT NULL** (required)
- **REMOVED**: `conditional_tiers.rate_table_config_id`
- ConditionalTier/Rule are now **exclusively owned by FormulaLine**

### 2. **New Rate Table System (RateTier/RateRule)**
- **NEW TABLE**: `rate_tiers` - for rate table lookup (separate from ConditionalTier)
- **NEW TABLE**: `rate_rules` - sub-conditions for rate tiers
- Used for: LOA+DWT ranges, pilotage segments with berth_position, etc.

### 3. **Admin Invoice-Only Fields System**
- **NEW TABLE**: `invoice_admin_fields` - field definitions (admin-only)
- **NEW TABLE**: `invoice_admin_values` - values entered by admin per invoice
- Examples: `berth_position`, `pilotage_remaining_miles`
- **NOT user inputs** - only admin fills these when viewing invoice

### 4. **RateTableConfig Enhancements**
- **NEW**: `lookup_mode` ENUM ('SELECT' | 'TIERED')
- **NEW**: `axis_var_key` - main variable for range matching (e.g., 'loa_m', 'grt')
- **CHANGED**: `tiers` relationship now uses `RateTier` instead of `ConditionalTier`

---

## 📁 Backend Files Created

### New Entities
1. `RateTier.java` - Rate table tier with result_value
2. `RateRule.java` - Sub-conditions for rate tiers
3. `InvoiceAdminField.java` - Admin field definitions
4. `InvoiceAdminValue.java` - Admin values per invoice

### New Repositories
1. `RateTierRepository.java`
2. `RateRuleRepository.java`
3. `InvoiceAdminFieldRepository.java`
4. `InvoiceAdminValueRepository.java`

### Updated Entities
1. `ConditionalTier.java` - Removed `rateTableConfig`, made `formulaLine` NOT NULL
2. `ConditionalRule.java` - Made `formulaLine` NOT NULL, added `valueJson`
3. `RateTableConfig.java` - Added `lookupMode`, `axisVarKey`, changed `tiers` to `rateTiers`

### Updated Services
1. `PricingGroupService.java` - Uses RateTier/RateRule for rate tables

---

## 🗄️ Migration Files

### Migration Script
**File**: `database/migration_final_pricing_refactor.sql`

**What it does**:
1. Makes `formula_line_id` NOT NULL in conditional_tiers/rules
2. Removes `rate_table_config_id` from conditional_tiers
3. Creates `rate_tiers` and `rate_rules` tables
4. Adds `lookup_mode` and `axis_var_key` to rate_table_configs
5. Creates `invoice_admin_fields` and `invoice_admin_values` tables

### Rollback Script
**File**: `database/rollback_final_pricing_refactor.sql`

---

## 🔧 Frontend Updates Needed

### 1. Update TypeScript Types
**File**: `z_Seatrans_Redesign/src/features/admin/components/FormulaConfig/types.ts`

#### Add New Types:
```typescript
export interface RateTier {
  id: string
  orderNo: number
  minValue?: number
  maxValue?: number
  resultValue: number  // The rate/coefficient returned
  note?: string
  rules: RateRule[]
}

export interface RateRule {
  id: string
  orderNo: number
  varKey: string  // e.g., 'dwt', 'berth_position'
  op: '<=' | '>=' | 'between' | 'eq' | 'in'
  value?: string
  minValue?: number
  maxValue?: number
  note?: string
}

export interface InvoiceAdminField {
  id: string
  varKey: string
  label: string
  inputType: 'NUMBER' | 'SELECT' | 'TEXT' | 'BOOLEAN'
  required: boolean
  unit?: string
  optionsJson?: string
  orderNo: number
  note?: string
}

export interface InvoiceAdminValue {
  id: string
  estimateId: string
  adminFieldId: string
  valueNumber?: number
  valueText?: string
  valueBool?: boolean
  valueJson?: string
  updatedBy?: string
}
```

#### Update Existing Types:
```typescript
export interface RateTable {
  id: string
  code: string
  displayName: string
  description?: string
  basis: 'select' | 'tier'
  lookupMode: 'SELECT' | 'TIERED'  // NEW
  axisVarKey?: string               // NEW (e.g., 'loa_m', 'grt')
  currency: string
  primaryVarKey: string
  flatAmount?: number
  selectValues?: SelectValue[]
  rateTiers?: RateTier[]  // CHANGED from 'tiers?: ConditionalTierRow[]'
}

export interface PricingGroup {
  id: string
  name: string
  isDefault: boolean
  portIds: string[]
  formulaLines: FormulaLine[]
  adminInputs: AdminInput[]
  invoiceAdminFields?: InvoiceAdminField[]  // NEW
  rateTables: RateTable[]
}
```

### 2. Update API Calls
**File**: `z_Seatrans_Redesign/src/features/admin/hooks/useFormulaConfig.ts`

No changes needed to endpoints - they remain the same. Only response types change.

### 3. Update UI Components
**Files to check**:
- `z_Seatrans_Redesign/src/features/admin/components/FormulaConfig/RateTableEditor.tsx`
- Any component displaying/editing rate tables

**Changes needed**:
- Replace `tier.price` with `tier.resultValue`
- Handle `RateRule` instead of `ConditionalRule` for rate table sub-conditions
- Display `lookupMode` and `axisVarKey` in UI

---

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Backup first
mysqldump -u root -p seatrans > backup_before_final_refactor_$(date +%Y%m%d_%H%M%S).sql

# Run migration
mysql -u root -p seatrans < database/migration_final_pricing_refactor.sql

# Verify
mysql -u root -p seatrans < database/migration_final_pricing_refactor.sql
# (Check the verification queries at the end)
```

### 2. Backend Deployment
```bash
cd d:/University/Actual/seatrans
./mvnw clean package -DskipTests
# Deploy the jar file
```

### 3. Frontend Updates
```bash
cd z_Seatrans_Redesign
# Update types.ts as described above
# Update components if needed
npm run build
# Deploy
```

---

## ⚠️ Breaking Changes

### API Response Changes
1. **Rate Table DTOs**: `tiers` now contains `RateTier` objects with `resultValue` instead of `ConditionalTier` with `price`
2. **Rate Rules**: Sub-conditions in rate tables are now `RateRule` objects (different from `ConditionalRule`)

### Database Schema
1. **ConditionalTier**: Cannot be orphaned (must have `formula_line_id`)
2. **Rate Table Tiers**: Now use separate `rate_tiers` table
3. **Admin Inputs**: Legacy `admin_inputs` table unchanged, but new invoice-only fields use `invoice_admin_fields`

---

## 📋 Example Use Cases

### Tug Assistance (LOA + DWT)
```
RateTableConfig: tug_assistance_rate
  - lookupMode: TIERED
  - axisVarKey: loa_m
  - rateTiers:
    - Tier 1: LOA 0-100m
      - RateRule: DWT 0-5000 → resultValue: 100
      - RateRule: DWT 5001-10000 → resultValue: 150
    - Tier 2: LOA 101-200m
      - RateRule: DWT 0-5000 → resultValue: 200
      - RateRule: DWT 5001-10000 → resultValue: 250
```

### Pilotage (Segments + Berth Position)
```
InvoiceAdminFields:
  - berth_position (SELECT: "INNER" | "OUTER")
  - pilotage_remaining_miles (NUMBER)

RateTableConfig: pilotage_rate
  - lookupMode: TIERED
  - axisVarKey: segment
  - rateTiers:
    - Tier: FIRST_10
      - RateRule: berth_position = "INNER" → resultValue: 2.5
      - RateRule: berth_position = "OUTER" → resultValue: 3.0
    - Tier: SECOND_20
      - RateRule: berth_position = "INNER" → resultValue: 2.0
      - RateRule: berth_position = "OUTER" → resultValue: 2.5
```

---

## ✅ Verification Checklist

- [ ] Database migration completed without errors
- [ ] All backend services compile
- [ ] Rate table CRUD operations work
- [ ] Frontend types updated
- [ ] Frontend components display rate tables correctly
- [ ] Invoice admin fields system functional
- [ ] Pricing calculations work with new structure
- [ ] Test with sample data (tug assistance, pilotage)

---

## 🆘 Rollback Procedure

If issues occur:

```bash
# Stop application
# Restore database
mysql -u root -p seatrans < backup_before_final_refactor_YYYYMMDD_HHMMSS.sql

# OR run rollback script
mysql -u root -p seatrans < database/rollback_final_pricing_refactor.sql

# Revert code changes
git revert <commit-hash>
```
