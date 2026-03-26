# PLAN - REFACTOR CREATE INVOICE TAB

Date: 2026-03-26
Scope: frontend CreateInvoiceTab (EPDA) - split shared form + QN/HCM variants

## 1) Objective

- Tao 1 form chung de dung lai logic trung lap.
- Tach rieng phan khac nhau cua QN va HCM de de bao tri.
- Giu nguyen behavior hien tai (khong thay doi ket qua Preview/PDF).

## 2) Current Issues

- JSX bi lap lai lon giua 2 nhanh QN/HCM.
- Validation va required UI de bi lech khi sua 1 ben ma quen ben con lai.
- Sua 1 truong chung phai cham 2 block code.

## 3) Target Architecture

- Container: `CreateInvoiceTab`
  - Quan ly state chung, load data, preview, save pdf, reset, validation trigger.
- Shared components:
  - `InvoiceCommonGeneralSection`
  - `InvoiceCommonPortDueSection`
  - `InvoiceCommonAgencyFeeSection`
- Variant components:
  - `InvoiceQnVariantFields`
  - `InvoiceHcmVariantFields`
- Mapping layer:
  - `buildInvoiceQuoteData(variant, formState)`

## 4) Implementation Phases

### Phase 1 - Prepare and freeze behavior

1. Chot danh sach field bat buoc va optional (theo UI hien tai).
2. Liet ke diem khac nhau QN vs HCM (id, label, pilotage field, defaults).
3. Tao checklist regression cho preview html va row AA/BB.

Deliverable:
- Danh sach field matrix QN/HCM + required map.

### Phase 2 - Extract shared types and validation

1. Tao type `InvoiceFormState` + `RequiredFieldKey`.
2. Dua logic required validation vao helper:
   - `getMissingRequiredFields(formState)`
3. Giu co che "chi hien do sau khi bam Preview".

Deliverable:
- Validation dung chung, khong phu thuoc JSX.

### Phase 3 - Extract shared sections

1. Tach section General Information (phan chung).
2. Tach section Port Due and Charge (phan chung).
3. Tach section Agency Fee (phan chung).
4. Truyen props ro rang, khong de component con tu goi API.

Deliverable:
- `CreateInvoiceTab` giam do dai, khong lap JSX lon.

### Phase 4 - Add variant-specific blocks

1. Tao `InvoiceQnVariantFields` cho truong rieng QN.
2. Tao `InvoiceHcmVariantFields` cho truong rieng HCM.
3. Du dung 1 interface props cho 2 variant de de test.

Deliverable:
- QN/HCM tach rieng, phan khac nhau ro rang.

### Phase 5 - Quote data mapping cleanup

1. Tach mapping payload sang util:
   - `buildInvoiceQuoteData.ts`
2. Mapping theo variant (QN/HCM) cho pilotage fields.
3. Dam bao khong doi business formula hien tai.

Deliverable:
- `handlePreview` ngan gon, de review.

### Phase 6 - QA and regression

1. Manual test matrix:
   - Required fields validation
   - QN/HCM template switch theo area
   - Preview + Save PDF
2. Verify output html khong thay doi voi case baseline.
3. Chay lint/typecheck frontend.

Deliverable:
- Refactor xong, behavior giu nguyen.

## 5) File Plan (expected)

- Update:
  - `frontend/src/features/admin/components/CreateInvoiceTab.tsx`
- Add:
  - `frontend/src/features/admin/components/invoice/InvoiceCommonGeneralSection.tsx`
  - `frontend/src/features/admin/components/invoice/InvoiceCommonPortDueSection.tsx`
  - `frontend/src/features/admin/components/invoice/InvoiceCommonAgencyFeeSection.tsx`
  - `frontend/src/features/admin/components/invoice/InvoiceQnVariantFields.tsx`
  - `frontend/src/features/admin/components/invoice/InvoiceHcmVariantFields.tsx`
  - `frontend/src/features/admin/components/invoice/buildInvoiceQuoteData.ts`
  - `frontend/src/features/admin/components/invoice/invoiceValidation.ts`

## 6) Risks and Mitigation

- Risk: Sai mapping payload khi tach file.
  - Mitigation: tao baseline cases, compare html output truoc/sau.
- Risk: Mismatch id/selector anh huong enter-navigation.
  - Mitigation: test keyboard flow sau moi phase.
- Risk: Tang so props, kho doc.
  - Mitigation: gom props theo nhom object (`formValues`, `setters`, `validation`).

## 7) Definition of Done

- Khong con duplicate JSX lon giua QN/HCM.
- Required validation van dung dung nhu hien tai.
- Preview/PDF output khong bi regression.
- Typecheck/lint pass.
- Code de mo rong them variant moi neu can.
