# CREATE INVOICE TAB - GAP ANALYSIS AND IMPLEMENTATION PLAN

Date: 2026-03-17
Scope: frontend CreateInvoiceTab + quote renderers (QN/HCM)

## 1) Current State (Dang co)

- Port area workflow is implemented:
  - Select area (NORTHERN/MIDDLE/SOUTHERN)
  - Filter port list by area
  - Auto-select quote template by area (MIDDLE -> QN, others -> HCM)
- Core vessel/cargo inputs exist:
  - TO, ETA, MV, DWT, GRT, LOA, cargo type/name, quantity
- AA auto formulas are implemented:
  - Berth due: USD 0.0031 / GRT / hour x hours
  - Anchorage fee: USD 0.0005 / GRT / hour x hours
- Boat-hire and transport LS optional amounts are supported.
- Preview + print PDF flow is implemented.

## 2) Gap Summary (Dang thieu / sai)

### Critical gaps identified earlier

1. Ocean Freight Tax condition was wrong source
- Previous behavior used `loading_term` from `dischargeLoadingLocation`, then compared to `export`.
- This mismatch made Ocean Freight Tax logic unreliable.

2. Purpose of calling field was missing
- Requirement needs explicit purpose taxonomy:
  - NHAP_XUAT
  - NHAP_CHUYEN_CANG
  - CHUYEN_CANG_XUAT
  - CHUYEN_CANG_CHUYEN_CANG
  - MUC_DICH_KHAC

3. Tally fee condition was too broad
- Previous UI showed tally for all non-IN_BULK cargo types.
- Requirement: tally only for IN BAGS or EQUIPMENT.

### Remaining medium/high gaps

4. Ship type input missing (BULK-SHIP / TANKER SHIP).
5. Agency fee mode still incomplete:
- Missing explicit mode selection (ON FRT / ON CARGO / TRANSPORT / LUMPSUM override)
- Current BB logic is mostly GRT + cargo + transport auto rows.
6. Backend model/storage for `purpose_of_calling` is not implemented yet.

## 3) Implemented in this first coding pass (Can sua - da lam)

### A. CreateInvoiceTab updates

- Added Purpose of Calling select (required).
- Fixed quote data mapping:
  - `loading_term` now receives `frtTaxType` (not location).
  - Added `purpose_of_calling` in quote payload for renderer logic.
- Restricted tally fee input visibility to eligible cargo only:
  - IN_BAGS or EQUIPMENT (normalized match).
- Restricted tally fee value emission in payload with same eligibility rule.
- Added purpose reset and validation in preview button disable conditions.

### B. Quote renderer updates (QN + HCM)

- Added `purpose_of_calling` to `QuoteData` type.
- Ocean Freight Tax now uses purpose-first rule:
  - Show when purpose is `NHAP_XUAT` or `CHUYEN_CANG_XUAT`.
  - Keeps fallback to `frtTaxType === export` for backward compatibility.
- Tally fee insertion now checks cargo eligibility (IN_BAGS/EQUIPMENT) before adding AA row.

## 4) Next Implementation Plan

### Phase 2 (backend alignment)

1. Add `purpose_of_calling` in shipping agency model/dto/request/response.
2. Add DB migration for persistence column.
3. Wire controller/service mapping.

### Phase 3 (missing business fields)

1. Add Ship Type field in CreateInvoiceTab and quote pipeline.
2. Decide whether Ship Type is display-only or impacts formulas.

### Phase 4 (agency fee modes)

1. Add fee mode selector in UI:
  - ON_GRT
  - ON_FRT
  - ON_CARGO
  - TRANSPORT
  - LUMPSUM
2. Extend BB logic with deterministic precedence:
  - LUMPSUM override if provided
  - Otherwise mode-based row generation
3. Add validation for mode-specific required inputs.

### Phase 5 (QA matrix)

- Purpose x frtTaxType combinations to verify Ocean Freight Tax visibility.
- Cargo type matrix for tally fee visibility and output row insertion.
- Regression checks for both templates (QN/HCM).
- Snapshot compare of generated HTML rows AA/BB for key scenarios.

## 5) Risks / open decisions

1. Should `frtTaxType` remain a separate field, or derive from purpose?
2. Should Ocean Freight Tax amount remain `PLS ADVISE` or become calculable input?
3. Final list of cargo type codes from catalog may vary; eligibility matcher currently uses normalized text contains checks.
4. Agency fee formulas for ON_FRT require clear freight base source.
