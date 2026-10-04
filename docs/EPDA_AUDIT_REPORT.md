# Báo cáo rà soát toàn diện — Mục EPDA

| | |
|---|---|
| **Ngày lập** | 2026-09-04 |
| **Commit gốc** | `7fa1b1f` (kèm các thay đổi chưa commit trong working tree) |
| **Phạm vi** | 3 mục của nhóm menu EPDA trong `dashboard_admin`, cộng toàn bộ phần server tương ứng trong `backend2.0` |
| **Phương pháp** | Đọc mã tĩnh. Bốn luồng rà soát song song (Create EPDA, Inquiry, Parameter, Backend), sau đó đối chiếu lại thủ công các phát hiện mức HIGH |

Nhóm menu EPDA được định nghĩa tại `dashboard_admin/src/config/dashboard-catalog.ts:47-69`, gồm đúng ba mục:

| Mục | Route | Mã nguồn chính |
|---|---|---|
| Create EPDA | `/epda/create-epda` | `features/admin/sections/epda-editor/**` |
| Inquiry (History record) | `/epda/inquiry` | `modules/users/components/history/**` |
| Parameter | `/epda/parameter` | `features/admin/epda-parameters/**` |

**Lưu ý về số dòng.** Tại thời điểm rà soát, working tree có thay đổi chưa commit ở `EpdaEditorFields.tsx`, `PortOverridesCard.tsx`, `quoteParameters.ts`, `epdaParametersService.ts` và một số file transport-document không liên quan. Số dòng trích dẫn bám theo trạng thái working tree hiện tại và có thể lệch sau khi rebase.

> **Cập nhật triển khai 2026-09-04:** các phần 1–6 bên dưới được giữ làm bằng chứng audit tại thời điểm phát hiện. Trạng thái sửa và các đính chính có hiệu lực hiện tại nằm ở **Phần 7**; không dùng riêng bảng tóm tắt ban đầu để kết luận trạng thái code mới.

---

## Tóm tắt điều hành

Mười vấn đề đáng xử lý trước, xếp theo mức độ tác động tới dữ liệu thật:

| # | Vấn đề | Mục | Mức | Bằng chứng |
|---|---|---|---|---|
| 1 | Lần Create đầu tiên làm mất 4 trường tiền: `boatHireAmount`, `tallyFeeAmount`, `transportLs`, `transportQuarantine` | Create | HIGH | `epdaApiMappers.ts:130-144` so với `152-216` |
| 2 | Inquiry đã khoá vẫn sửa được qua hai route PATCH cũ (`/hours`, `/form`) | Backend | HIGH | `service-inquiry.service.ts:374-414` |
| 3 | Lưu port override có thể ghi đè bảng cước hàng hoá bằng một mảng rỗng/zero mà giao diện port không hề hiển thị | Parameter | HIGH | `PortOverridesCard.tsx:133-141` |
| 4 | Sửa dữ liệu trong lúc form đang tải bị coi là "sạch", cảnh báo rời trang không bật | Create | HIGH | `EpdaEditorScreen.tsx:378-392` |
| 5 | Sắp xếp cột trong bảng lịch sử chỉ sắp xếp trang hiện tại, không phải toàn bộ dữ liệu | Inquiry | HIGH | `useInquiryData.ts:262-266` |
| 6 | Máy tính thử trong màn Parameter dùng thuật toán dò bậc khác với báo giá và PDF | Parameter | HIGH | `EpdaCalculatorPrimitives.tsx:52-64` so với `quoteParameters.ts:637-642` |
| 7 | Bản nháp port override bị xoá không cảnh báo khi lưu vùng hoặc đổi cảng | Parameter | HIGH | `EpdaParametersScreen.tsx:274-275` |
| 8 | Xoá bulk trong lịch sử thất bại trong im lặng | Inquiry | HIGH | `InquiryDataTable.tsx:164-177` |
| 9 | Override chứa mảng rỗng xoá sạch bậc cước kế thừa | Backend | MEDIUM | `epda-parameter-resolution.ts:210-227` |
| 10 | Bộ số liệu mặc định bị chép đôi giữa backend và frontend | Xuyên suốt | MEDIUM | `epda-parameter-resolution.ts:63-169` và `quoteParameters.ts:119-226` |

Hai điểm sáng đáng ghi nhận: `mergeParameterValues` xử lý đúng giá trị `0` và mảng rỗng nhờ dùng `??` thay vì `||` (`quoteParameters.ts:750-756`), và bộ số mặc định giữa hai tầng **hiện chưa lệch nhau** dù được khai báo độc lập.

---

## Phần 1 — Create EPDA

### 1.1 Lỗi tiềm ẩn

#### C-1 (HIGH) — Payload tạo mới thiếu trường so với payload cập nhật

Đường lưu tách làm hai nhánh: tạo mới dùng `buildInternalCreatePayload`, cập nhật dùng `buildEpdaPatchPayload` (`useEpdaPersistence.ts:31-49`). Bốn trường chỉ có ở nhánh cập nhật:

| Trường | Có trong patch | Có trong create |
|---|---|---|
| `boatHireAmount` | `epdaApiMappers.ts:130` | không |
| `tallyFeeAmount` | `epdaApiMappers.ts:131` | không |
| `transportLs` | `epdaApiMappers.ts:140` | không |
| `transportQuarantine` | `epdaApiMappers.ts:141-144` | không |

Hệ quả: nhân viên điền boat hire, tally fee, transport LS hoặc quarantine trên một EPDA mới, bấm Create thành công, nhưng các giá trị đó không bao giờ được ghi. Lần lưu thứ hai (đã chuyển sang nhánh patch) mới ghi được. Tệ hơn, ngay sau khi tạo, luồng hydration đọc lại bản ghi từ server và ghi đè form (`useEpdaInquiryHydration.ts:130`), nên người dùng **nhìn thấy dữ liệu vừa nhập biến mất**.

*Đã đối chiếu thủ công: bốn tên trường chỉ xuất hiện ở vùng dòng 130-144 và vùng hydration 331-353, không xuất hiện trong thân hàm create.*

#### C-2 (HIGH) — `epdaWorkingParams` không được gửi khi tạo mới

`epdaWorkingParams` chỉ được gán vào `patchBody` (`useEpdaPersistence.ts:31-33`), mà `patchBody` chỉ dùng ở nhánh cập nhật. Bản nháp vừa tạo vì thế không có ảnh chụp tham số đang dùng. Lần mở lại sau đó, `useEpdaParameterApplySkip` rơi xuống nhánh gieo ngầm kiểu cũ (`useEpdaParameterApplySkip.ts:202-215`) thay vì đối chiếu Apply/Skip đúng nghĩa.

#### C-3 (HIGH) — Trạng thái "đã sửa" bỏ sót giai đoạn đang tải

```
isDirty = savedDraftSnapshot !== null && savedDraftSnapshot !== currentDraftSnapshot && !isFormReadOnly
```
(`EpdaEditorScreen.tsx:378-381`)

`savedDraftSnapshot` chỉ được đặt sau khi `isFormBusy` tắt (`EpdaEditorScreen.tsx:386-392`), mà `isFormBusy` bao gồm cả việc tải cargo, port và inquiry (`362-367`). Mọi chỉnh sửa trong khoảng đó bị nướng thẳng vào baseline đầu tiên, nên `isDirty` không bao giờ bật cho chúng. Cả `beforeunload` (`398-406`) lẫn chặn điều hướng nội bộ (`408-447`) đều dựa trên `isDirtyRef`, nên **cảnh báo mất dữ liệu bị bỏ qua**.

#### C-4 (HIGH) — Đua điều kiện khi hydrate: dữ liệu cũ ghi đè form sau khi đã huỷ

Trong `useEpdaInquiryHydration.ts:120-130`, các điểm `await` trước đó đều kiểm tra cờ `cancelled` (dòng 87, 125), riêng lời gọi cuối `applyAdminInquiryToForm` thì không. Nếu `inquiryId` đổi nhanh, một request chậm hơn từ trước vẫn ghi được state vào form sau khi cleanup đã chạy.

#### C-5 (MEDIUM) — Đổi nơi dỡ hàng làm tải lại biểu cước và reset số giờ

`dischargeLoadingLocation` nằm trong mảng phụ thuộc của effect tải tham số (`useEpdaReferenceData.ts:193`) dù chỉ ảnh hưởng tới phí rác. Mỗi lần chuyển Berth ↔ Anchorage ở chế độ tạo mới, effect gọi lại `getEffective` rồi `applyNewParameterDefaults`, và hàm này luôn reset berth/anchorage/garbage về mặc định (`EpdaEditorScreen.tsx:186-188`). Số giờ người dùng tự nhập bị mất.

#### C-6 (MEDIUM) — Lỗi tải biểu cước bị coi là "đã áp dụng"

```
} catch {
  ...
  setDecision('applied')
```
(`useEpdaParameterApplySkip.ts:241-253`)

Với bản nháp đã liên kết, khi `getEffective` lỗi, quyết định được đặt thành `'applied'`, `isParamDecisionPending` tắt, Save và Preview chạy tiếp mà không báo gì. Người dùng có thể lưu một báo giá dựa trên tham số cũ trên form mà không biết.

#### C-7 (MEDIUM) — Không có kiểm soát đồng thời khi lưu inquiry EPDA

`shippingAgencyEpdaService.updateEpda` không gửi `expectedVersion`, và kiểu `ShippingAgencyAdminInquiry` không có trường version. Trong khi đó phía Parameter lại có (`epdaParametersService.ts:63-66`). Hai tab cùng sửa một bản nháp sẽ ghi đè nhau âm thầm.

#### C-8 (MEDIUM) — Gọi `setState` ngay trong thân render

`EpdaEditorScreen.tsx:114-124` cập nhật state đồng bộ trong render khi `linkedInquiryId` đổi, chẳng hạn ngay sau lần create đầu tiên. Việc này gây thêm lượt render và dễ sinh lỗi thứ tự với các effect hydration/so sánh tham số.

### 1.2 Cơ hội gộp hàm

| Hàm chung đề xuất | Nơi đang trùng | Nên đặt ở |
|---|---|---|
| `buildEpdaApiPayload(params, mode)` | `epdaApiMappers.ts:75-150` và `152-217` — trùng khoảng 80% | `epdaApiMappers.ts` |
| `sortJsonForStableCompare(value)` | `epdaDraftStateRules.ts:14-27` và `epdaParameterDiff.ts:67-84` | `shared/utils/` |
| `resolveGarbageUsdRateForDischarge()` | `EpdaEditorScreen.tsx:182-186`, `useEpdaEditorFormModel.ts:242-246`, `useEpdaParameterApplySkip.ts:346-353` | `modules/inquiries/components/common/` |
| `hydratePendingInquiryCargo()` | `useEpdaInquiryHydration.ts:156-199` và `useEpdaReferenceData.ts:121-140` | `epdaReferenceDataRules.ts` |
| `normalizeDischargeLocation()` | `epdaApiMappers.ts:277-280`, `useEpdaEditorFormModel.ts:239-240`, `EpdaEditorScreen.tsx:751-754` | `quoteForm.ts` |
| `mapAgencyOtherExpensesForApi()` | `epdaApiMappers.ts:117-128` và `195-207` | `epdaApiMappers.ts` |

Gộp mục đầu tiên chính là cách sửa tận gốc lỗi C-1: hai hàm dựng payload tách rời là nguyên nhân khiến bốn trường bị bỏ quên.

### 1.3 Nâng cấp

- `useEpdaPreview` khai báo 9 tham số nhưng chỉ dùng 4; `selectedArea`, `selectedPortId`, `isLocked`, `frozenParams`, `onEffectiveParamsChange` là tham số chết (`useEpdaPreview.ts:13-30`).
- `shouldRefreshPreviewParameters` được định nghĩa và có test nhưng không nơi nào import (`epdaPreviewRules.ts:21-27`).
- `agencyFeeSummary.ts:29-31` dùng `Number()` thô trong khi phần còn lại dùng `parseFiniteNumber`; chuỗi có dấu phẩy sẽ cho kết quả khác giữa phần tóm tắt và PDF.
- `EpdaEditorScreen.tsx` dài khoảng 950 dòng, gánh 7 hook, 4 dialog và toàn bộ logic dirty/leave. Đây là nơi test tích hợp sẽ có lời nhất.

---

## Phần 2 — Inquiry (History record)

### 2.1 Lỗi tiềm ẩn

#### I-1 (HIGH) — Sắp xếp cột chỉ tác dụng trên trang hiện tại

Tiêu đề cột có nút sắp xếp (`inquiryHistoryColumns.tsx:38-91`) và bảng bật `manualSorting: true` (`InquiryDataTable.tsx:132-133`), nhưng việc sắp xếp thực hiện sau khi fetch, chỉ trên mảng của trang hiện tại (`useInquiryData.ts:262-266`). API luôn trả `submitted_at DESC` và DTO không nhận tham số sort (`inquiry-query.service.ts:384-385`, `list-inquiries-query.dto.ts:17-90`). Người dùng tin rằng đang sắp xếp toàn bộ dữ liệu, thực tế không phải.

Đi kèm là một sai lệch nhỏ hơn: khoá sắp xếp dùng `accessorKey` thô (`mv`, `fullName`) trong khi ô hiển thị lại dùng chuỗi fallback (`vesselName`, `contactName`, ...) từ `inquiryHistoryRules.ts:27-40`, nên có hàng nhìn như sắp xếp sai.

#### I-2 (HIGH) — Đổi trang là bảng trắng xoá

`isLoading` gộp cả `isFetching` (`useInquiryData.ts:386`) và không có `placeholderData: keepPreviousData`. Khi đổi trang, query key đổi, dữ liệu cache bị bỏ, bảng rỗng và spinner toàn trang hiện lên (`InquiryHistoryCard.tsx:107-110`). Màn Booking history cùng repo đã làm đúng (`BookingHistoryScreen.tsx:94`), nên đây là lệch chuẩn nội bộ.

#### I-3 (HIGH) — Xoá nhiều bản ghi thất bại trong im lặng

`InquiryDataTable.tsx:164-177` có khối `catch` rỗng với ghi chú rằng caller sẽ báo lỗi, nhưng `handleBulkDelete` ở `BaseInquiryHistoryLayout.tsx:80-88` không có `try/catch` cũng không có `toast.error`. Xoá đơn lẻ thì lại báo lỗi đầy đủ (`useInquiryHistoryActions.ts:95-106`).

Nặng hơn: xoá bulk phát N request DELETE tuần tự (`useInquiryData.ts:342-363`). Lỗi giữa chừng để lại trạng thái xoá dở và `invalidateInquiries()` không chạy. Repo đã có sẵn endpoint xoá theo lô nhưng không dùng (`api.config.ts:216-221`, `admin-inquiry.controller.ts:56-71`).

#### I-4 (HIGH) — Danh sách cũ sau khi sửa trong Create EPDA

`INQUIRIES_QUERY_ROOT` chỉ được invalidate bên trong `useInquiryData`. Không có lời gọi nào từ phía editor. Với `staleTime` toàn cục 10 giây (`providers.tsx:37`), quay lại danh sách ngay sau khi lưu sẽ thấy `status` và `epdaLockedAt` cũ, kéo theo nút hành động hiển thị sai.

#### I-5 (MEDIUM) — Ngày giờ không được bảo vệ

`inquiryHistoryColumns.tsx:92-95` gọi thẳng `new Date(...).toLocaleString()` không kiểm tra, nên giá trị null hoặc hỏng sẽ hiện "Invalid Date". Bảng booking đã chặn trường hợp này (`bookingHistoryColumns.tsx:112-114`).

Ngoài ra bộ lọc ngày chuyển giá trị local sang ISO UTC trước khi gửi (`useInquiryData.ts:113-121`), so với cột `timestamptz` phía backend. Ở UTC+7 sẽ có lệch biên ngày.

#### I-6 (MEDIUM) — Lịch sử thay đổi trường nuốt lỗi

Trong `EpdaFieldChangeHistory.tsx`, lỗi fetch reset danh sách về rỗng không báo gì (`63-73`), lỗi `loadMore` chỉ tắt cờ loading (`106-108`), và component trả `null` khi danh sách rỗng (`112`). Kết quả là "tải lỗi" và "không có lịch sử" trông giống hệt nhau.

#### I-7 (MEDIUM) — Quyền khoá bản ghi không được siết ở server

Giao diện chỉ cho admin mở khoá (`BaseInquiryHistoryLayout.tsx:49-52`), còn khoá thì chỉ cần `isAdmin` (`inquiryHistoryRules.ts:49-61`). Phía backend, mở khoá có `@ApiAdminOnly()` (`admin-inquiry.controller.ts:130-132`) nhưng khoá thì không có guard tương đương. Nhân viên gọi thẳng API vẫn khoá được bản ghi.

### 2.2 Cơ hội gộp hàm

Màn Inquiry history và màn Transport-document history gần như song sinh — chính chú thích trong mã đã thừa nhận điều đó (`TransportDocumentHistoryDataTable.tsx:46-47`). Đây là khối trùng lặp lớn nhất trong toàn bộ đợt rà soát:

| Hàm/Component chung đề xuất | Nơi đang trùng |
|---|---|
| `ServerPaginatedHistoryTable<T>` | `InquiryDataTable.tsx:45-373` và `TransportDocumentHistoryDataTable.tsx:49-245` |
| `useHistoryMutationActions<T>()` | `useInquiryHistoryActions.ts:28-191` và `useTransportDocumentHistoryActions.ts:11-138` |
| `HistoryMutationDialogs` | `InquiryMutationDialogs.tsx:37-160` và `TransportDocumentMutationDialogs.tsx:32-160` |
| `getHistoryRowCapabilities()` | `inquiryHistoryRules.ts:79-107` và `transportDocumentHistoryRules.ts:114-127` |
| `renderSortableHeader` | `inquiryHistoryColumns.tsx:112-118` và `bookingHistoryColumns.tsx:86-92` — repo đã có sẵn `shared/hooks/useTableSortHeader.tsx` |
| `HISTORY_ACTION_BUTTON_CLASSES` | `InquiryHistoryRowActions.tsx:24-29` và `TransportDocumentHistoryActions.tsx:17-22` |
| `inquiryServiceCatalog.ts` | Ba bảng ánh xạ slug/tên dịch vụ rời rạc: `shared/domain/inquiryService.ts:10-28`, `modules/inquiries/services/inquiryService.ts:6-12`, `useInquiryData.ts:51-65` |
| `unwrapPageResponse<T>()` | `useInquiryData.ts:74-110` tự cài `extractPage` trong khi nơi khác dùng `unwrapApiResponse` |

### 2.3 Nâng cấp

- Kiểu dữ liệu bản ghi quá lỏng: `InquiryRecord = Record<string, unknown> & { id: number; ... }` (`useInquiryData.ts:26-35`), kèm ép kiểu `as InquiryHistoryRecord[]` (`BaseInquiryHistoryLayout.tsx:54`).
- Prop `searchKey='mv'` gây hiểu nhầm: tìm kiếm luôn gửi tham số `q`, prop này chỉ bật/tắt ô nhập (`useInquiryData.ts:185-186`, `InquiryDataTable.tsx:185-191`). Nên đổi tên thành `showSearch`.
- Query key nhúng nguyên object `currentUser` (`useInquiryData.ts:238`), dễ refetch thừa nếu hook trả object mới mỗi lần render.
- Lựa chọn hàng không được xoá khi đổi trang (`InquiryDataTable.tsx:91,142`).

---

## Phần 3 — Parameter

Bối cảnh: lỗi `moorUnmoorBerthTiers maxGrt boundaries must be strictly increasing` đã được xử lý bằng `withSortedTiers` / `sortGrtTiers` / `sortLoaTiers` trong `quoteParameters.ts`, áp dụng tại `prepareValuesForWrite` (`epdaParametersService.ts`) và trước bước diff trong `PortOverridesCard.tsx`. Phần dưới là những vấn đề **còn lại**.

### 3.1 Lỗi tiềm ẩn

#### P-1 (HIGH) — Lưu port override có thể sinh ghi đè `cargoAgencyRates` ngoài ý muốn

Khi lưu, phía dữ liệu đã sửa được canonicalize còn phía baseline thì không (`PortOverridesCard.tsx:133-141`). Nếu baseline vùng có `cargoAgencyRates: []` — chính là mặc định (`quoteParameters.ts:191-193`) — thì `canonicalizeCargoAgencyRates` bung ra một hàng cho mỗi loại hàng hoá (`cargoAgencyRateRules.ts:15-27`), diff thấy khác nhau và ghi cả mảng vào override (`parameterOverrides.ts:41-54`).

Đây là ghi đè **vô hình**: màn port chỉ cho sửa `pilotage | tug | moor | garbage` (`epdaParameterSections.ts:9-14`). Vì merge thay nguyên mảng (`quoteParameters.ts:756`), mọi cấu hình cước hàng hoá đặt ở cấp vùng về sau sẽ bị mảng zero cấp cảng che mất.

#### P-2 (HIGH) — Máy tính thử dùng thuật toán dò bậc khác với báo giá

`resolveGrtBand` duyệt bậc theo đúng thứ tự mảng (`EpdaCalculatorPrimitives.tsx:52-64`), trong khi `resolveGrtTier` dùng cho báo giá và PDF sắp xếp trước rồi mới duyệt (`quoteParameters.ts:637-642`). Hai máy tính thử trong màn Parameter đều gọi bản không sắp xếp (`EpdaDuesCalculators.tsx:323-324`, `EpdaAgencyCalculators.tsx:106`). Khi bảng bậc đang được sửa và chưa lưu, con số hiển thị cho nhân viên có thể khác con số thật trong Create EPDA.

#### P-3 (HIGH) — Override cấp GROUP ảnh hưởng kết quả nhưng không xem hay sửa được

Dữ liệu GROUP được nạp và trộn vào baseline của cảng (`EpdaParametersScreen.tsx:282-284`, `PortOverridesCard.tsx:100-107`), nhưng không component nào trong `dashboard_admin/src` gọi `createGroup`, `updateGroup`, `deleteGroup` hay `listGroups`, dù service đã có đủ (`epdaParametersService.ts:218-282`). Admin đang chỉnh override cảng trên một nền mà họ không nhìn thấy và không quản lý được.

Thêm một lệch pha: client chọn nhóm bằng `groups.find` lấy kết quả đầu tiên (`PortOverridesCard.tsx:104-107`), còn backend phân giải qua bảng thành viên (`epda-parameters.service.ts:343-356`). Nếu thứ tự trả về khác nhau, baseline trên màn hình sẽ khác `getEffective`.

#### P-4 (HIGH) — Bản nháp port override bị xoá không cảnh báo

`PortOverridesCard` không có cơ chế theo dõi dirty. Card được gắn một `key` ghép từ vùng và `areaValuesKey` (`EpdaParametersScreen.tsx:274-275`), nên chỉ cần lưu thẻ vùng là query invalidate, `areaValuesKey` đổi, card remount và bản nháp đang mở bay sạch. Đổi cảng cũng gọi thẳng `beginEdit` không hỏi lại (`PortOverridesCard.tsx:117-122`).

#### P-5 (HIGH) — Sửa giá trị về đúng bằng giá trị kế thừa sẽ xoá override

Diff rỗng trên một override đang tồn tại sẽ được lên kế hoạch thành lệnh xoá (`epdaParametersService.ts:120-127`) và thực thi `deletePort` (`PortOverridesCard.tsx:147-149`). Người dùng chỉ định hoàn tác một ô về giá trị cũ, nhưng hệ quả là toàn bộ override của cảng bị gỡ, không có bước xác nhận nào.

#### P-6 (HIGH) — Vẫn còn các đường sinh ra bậc trùng hoặc nhãn rỗng

Việc sắp xếp giữ nguyên các biên bằng nhau, mà backend từ chối `maxGrt <= previousBoundary`. Các đường còn hở:

- Bảng agency không bật `autoLabels` (`EpdaValuesEditor.tsx:302-306`), nên hàng mới có `label: ''`, vi phạm `validateLabel` phía server (`epda-parameter-values.validation.ts:38-41`). Kiểm tra phía client `assertSerializableParameterValues` không xét nhãn (`quoteParameters.ts:336-347`).
- `LoaTierTable` khi thêm hàng luôn đặt `minLoa: 0` (`EpdaEditorFields.tsx:174`), trùng ngay với bậc đầu tiên của QN (`quoteParameters.ts:219`).
- `nextGrtTierBoundary` chỉ chạy lúc thêm hàng, không chạy khi người dùng gõ trùng giá trị vào hàng có sẵn.

#### P-7 (MEDIUM) — Xung đột phiên bản 409 chỉ hiện toast

Thông báo 409 được ánh xạ thành câu "hãy tải lại" (`epdaParametersService.ts:69-74`), nhưng cả hai màn chỉ gọi `toast.error` (`EpdaParametersScreen.tsx:121-122`, `PortOverridesCard.tsx:169-170`). Query không được invalidate, bản nháp không reset, nên người dùng giữ nguyên `version` cũ và bấm lưu lại sẽ lỗi tiếp.

#### P-8 (MEDIUM) — Mục bị ẩn ở cấp vùng vẫn được ghi

`AREA_SET_HIDDEN_SECTION_IDS` ẩn `pilotage`, `tug`, `moor`, `garbage` khỏi trình sửa cấp vùng (`epdaParameterSections.ts:2-7`), nhưng lệnh lưu vẫn gửi nguyên `draft` (`EpdaParametersScreen.tsx:103-115`). Các giá trị mặc định đó được ghi xuống và trở thành baseline cho mọi cảng, dù admin không hề nhìn thấy chúng.

#### P-9 (MEDIUM) — `getOverrideSectionLabels` báo thiếu

Hàm chỉ nhận diện coeff dạng pilotage, garbage/clearance, moor và tug (`parameterOverrides.ts:72-91`). Override chỉ chứa `quarantine`, `agencyFeeTiers`, `cargoAgencyRates` hay coeff khác sẽ hiện là "kế thừa từ vùng" dù thực tế có dữ liệu riêng.

### 3.2 Cơ hội gộp hàm

| Hàm chung đề xuất | Nơi đang trùng |
|---|---|
| Bỏ `resolveGrtBand`, dùng `resolveGrtTier` | `EpdaCalculatorPrimitives.tsx:52-65`, gọi ở `EpdaDuesCalculators.tsx:323-324`, `EpdaAgencyCalculators.tsx:106` |
| Dùng `resolveLoaTier` cho máy tính tug | `EpdaQuarantineCalculators.tsx:155-171` chép lại logic của `quoteParameters.ts:677-703` |
| `GrtTierScratchpad` / `LoaTierScratchpad` | `EpdaDuesCalculators.tsx:335-364`, `EpdaAgencyCalculators.tsx:108-137`, `EpdaQuarantineCalculators.tsx:181-224` |
| `createCalculatorInputField` | `EpdaDuesCalculators.tsx:45-61` và `393-409`, `EpdaAgencyCalculators.tsx:66-76`, `EpdaQuarantineCalculators.tsx:60-69` |
| `saveEpdaParametersMutationCallbacks` | `EpdaParametersScreen.tsx:116-122` và `PortOverridesCard.tsx:158-189` |
| `canonicalizeCargoForSave` | `EpdaParametersScreen.tsx:109-112` và `PortOverridesCard.tsx:137-140` — gộp lại cũng là cách sửa P-1 |
| `nextLoaTierBoundary` | Chưa tồn tại; cần đối xứng với `nextGrtTierBoundary` để sửa P-6 |
| Vỏ bảng bậc dùng chung | `GrtTierTable` và `LoaTierTable` gần như đối xứng (`EpdaEditorFields.tsx:59-242`) |

### 3.3 Nâng cấp

- **Kiểm tra hợp lệ phía client kèm báo lỗi tại chỗ.** Đây là nâng cấp đáng giá nhất của mục này: soi chiếu đúng bộ quy tắc của `epda-parameter-values.validation.ts:44-88` ngay trong bảng bậc, thay vì để người dùng nhận một toast chung chung từ server. Nó xử lý luôn phần đuôi của P-6.
- Hàng của bảng bậc dùng `key={i}` trong khi hàng xoá được (`EpdaEditorFields.tsx:112`, `205`), dễ để lại state DOM của bậc khác.
- Nút xoá hàng thiếu `aria-label` (`EpdaEditorFields.tsx:143-150`, `226-233`), trong khi `PortOverridesCard.tsx:263` đã làm đúng.
- Mảng `sections` dựng lại mỗi lần render trong `ValuesEditor` với `useMemo` đang bị tắt kiểm tra dependency (`EpdaValuesEditor.tsx:423-424`).

---

## Phần 4 — Backend (xuyên suốt cả ba mục)

### 4.1 Lỗi tiềm ẩn

#### B-1 (HIGH) — Inquiry đã khoá vẫn sửa được qua hai route cũ

`ShippingAgencyEpdaService` chặn đúng bằng `assertEpdaUnlocked` (`shipping-agency-epda.service.ts:549-554`), nhưng hai route cũ vẫn sửa được chính những trường đó mà không kiểm tra khoá:

| Route | Service | Trường bị ảnh hưởng |
|---|---|---|
| `PATCH :serviceType/:id/hours` | `service-inquiry.service.ts:390-414` | `berthHours`, `anchorageHours`, `pilotage3rdMiles` |
| `PATCH :serviceType/:id/form` | `service-inquiry.service.ts:374-387` | `quoteForm` |

*Đã đối chiếu thủ công: trong toàn bộ `service-inquiry.service.ts`, chuỗi `epdaLockedAt` chỉ xuất hiện một lần, tại dòng 553 thuộc nhánh xoá cứng.* Nghĩa là xoá thì tôn trọng khoá, còn sửa thì không. Nhân viên có quyền vào mục `epda-inquiry` có thể thay đổi đầu vào của một báo giá đã chốt mà không cần mở khoá.

Hai route này còn không ghi log thay đổi trường, trong khi route EPDA chính thì có (`shipping-agency-epda.service.ts:299-306`). Các sửa đổi đi đường này là vô hình với `GET .../epda/field-changes`.

#### B-2 (MEDIUM) — Override chứa mảng rỗng xoá sạch bậc cước kế thừa

Validator cho phép `[]` một cách có chủ đích (`epda-parameter-values.validation.ts:75-81`), còn tầng phân giải coi mọi mảng kể cả rỗng là thay thế toàn phần (`epda-parameter-resolution.ts:210-227`). Một document như `{ moorUnmoorBerthTiers: [] }` sẽ được chấp nhận, lưu lại, và khiến `getEffective` trả về bảng bậc rỗng. Phép tính phía sau suy giảm âm thầm chứ không báo lỗi.

#### B-3 (MEDIUM) — Thay đổi `epdaWorkingParams` không được ghi vết

`applyAuthoritativeWorkingParams` ghi lại `row.epdaWorkingParams` ở mỗi lần lưu (`shipping-agency-epda.service.ts:288-294`), nhưng `epdaFieldSnapshot` không bao gồm trường này (`shipping-agency-epda-audit.ts:41-78`), mà log thay đổi chỉ diff theo các khoá của snapshot đó. Việc ghim hay làm mới biểu cước — đổi cảng, chọn Apply hay Skip — không để lại dấu vết nào.

#### B-4 (MEDIUM) — Đường đọc có thể lan truyền `NaN`

Khi ghi, `validateObjectNumbers` chặn giá trị không hữu hạn (`epda-parameter-values.validation.ts:16-19`). Khi đọc, `sanitizeEpdaHours` lại dùng `Number()` trần không kiểm tra trước khi trộn vào kết quả (`epda-parameter-resolution.ts:179-199`). Dữ liệu JSONB hỏng hoặc cũ sẽ cho ra `NaN` trong `getEffective` mà không có lỗi nào được ném.

#### B-5 (MEDIUM) — Môi trường không phải production cho phép ghi đè mất dữ liệu

Khi thiếu `expectedVersion` và `NODE_ENV !== 'production'`, `assertExpectedVersion` chỉ log cảnh báo rồi đi tiếp (`epda-parameter-version-control.ts:31-44`). AREA và PORT cũng không dùng advisory lock như GROUP (`epda-parameters.service.ts:605-612`). Staging vì thế có thể mất dữ liệu theo kiểu last-write-wins.

#### B-6 (LOW) — Validator sửa đổi object của caller

`epda-parameter-values.validation.ts:99-103` gọi `delete` trực tiếp trên `values.hours` để bỏ khoá cũ. Việc đột biến tại chỗ một tham chiếu DTO dùng chung là bất ngờ nếu object đó còn được dùng lại sau khi validate.

### 4.2 Cơ hội gộp hàm

#### Bộ số mặc định bị chép đôi — rủi ro trôi lệch cao nhất

`defaultValuesForArea` phía backend (`epda-parameter-resolution.ts:63-169`) và `hcmDefaults` / `qnDefaults` phía frontend (`quoteParameters.ts:119-226`) khai báo độc lập cùng một bộ biểu cước.

**Kết quả đối chiếu hôm nay: chưa lệch.** Tất cả scalar và hàng bậc đã so đều khớp — `AGENCY_FEE_TIERS`, garbage/navigation/clearance của QN, bảng moor và tug của QN. Nhưng đây là trạng thái may mắn chứ không phải bảo đảm: bất kỳ ai sửa một bên mà quên bên kia sẽ tạo ra chênh lệch giữa số hiển thị trên form và số backend dùng để phân giải, và không có test nào bắt được.

Đề xuất: tách một module dùng chung (ví dụ `packages/epda-parameters`) export bộ mặc định đã định kiểu, cho cả `backend2.0` và `dashboard_admin` cùng dùng.

| Hàm chung đề xuất | Nơi đang trùng |
|---|---|
| `mergeEpdaParameterValues(base, ...layers)` | `epda-parameter-resolution.ts:188-238` và `quoteParameters.ts:740-758` — cùng ngữ nghĩa: scalar trộn nông, mảng thay toàn phần |
| Lõi `resolveCargoAgencyRate` | `epda-parameter-resolution.ts:30-57` và `quoteParameters.ts:655-674`, chỉ khác kiểu trả về |
| `sanitizeEpdaHoursDocument(hours)` | `dto/upsert-epda-parameter-set.dto.ts:17-24` và `epda-parameter-values.validation.ts:99-103` |
| `EPDA_RATIO_COEFF_KEYS` | `epda-parameter-values.validation.ts:10` và `quoteParameters.ts:238-242` |
| `cloneEpdaOverrideDocument` cho cả PORT và GROUP | PORT dùng (`epda-parameters.service.ts:236`), GROUP gán thẳng `patch.values` (`:427`) |

Lưu ý một khác biệt **cố ý, không nên gộp máy móc**: AREA lưu document đã merge đầy đủ, còn PORT và GROUP lưu document từng phần. Chỉ nên thống nhất PORT với GROUP.

### 4.3 Nâng cấp

- `epdaSnapshot` được khai báo trong DTO cập nhật nhưng không nơi nào đọc (`update-shipping-agency-epda.dto.ts:258-261`); snapshot chỉ được ghi lúc khoá. Đây là bề mặt API chết.
- `normalizeEpdaWorkingParams` chỉ kiểm tra khả năng serialize và giới hạn 256 KiB (`shipping-agency-epda-working-params.ts:10-27`), không kiểm tra cấu trúc. Nên tái dùng `validateEpdaParameterValues`.
- Lỗi vùng không hợp lệ trả về không nhất quán: `getAreaSet` ném `BadRequestException` (`epda-parameters.service.ts:100`) còn `upsertArea` ném `NotFoundException` (`:141`).
- `listAll` nạp toàn bộ parameter set không phân trang (`epda-parameters.service.ts:87-91`).

---

## Phần 5 — Khoảng trống kiểm thử

Toàn hệ đang có 502 test và đều pass, nhưng phân bố lệch: các module quy tắc thuần tuý được phủ tốt, còn các hook điều phối và luồng lưu thì gần như trống.

| Vùng | Hiện trạng | Đường rủi ro chưa có test |
|---|---|---|
| Create EPDA | Có test cho `epdaDraftStateRules`, `epdaEditorRules`, `epdaParameterDiff`, `epdaReferenceDataRules`, `epdaPreviewRules` | Không có test cho `useEpdaPersistence`, `useEpdaInquiryHydration`, `useEpdaEditorFormModel`, `useEpdaReferenceData`, `useEpdaPreview`. Không có test đối chiếu payload create so với patch (C-1) |
| Inquiry | `inquiryHistoryRules` phủ tốt; `InquiryHistoryRowActions` một kịch bản; `EpdaFieldChangeHistory` chỉ happy path | `useInquiryData`, `InquiryDataTable`, `BaseInquiryHistoryLayout`, `useInquiryHistoryActions`, xử lý lỗi xoá bulk, cache cũ sau khi sửa |
| Parameter | `parameterOverrides`, `epdaParametersService`, `quoteParameters`, `EpdaEditorFields` đều có test | Diff cargo sinh override thừa (P-1), xoá override khi hoàn tác (P-5), baseline GROUP, 409, dirty guard, `resolveGrtBand` so với `resolveGrtTier` (P-2) |
| Backend | Service, resolution, validation, version control, migration đều có spec | `updateHours` / `updateForm` trên bản ghi đã khoá (B-1 — không có test nào), `getEffective` sau override mảng rỗng (B-2), `sanitizeEpdaHours` với dữ liệu hỏng (B-4), ghi vết `epdaWorkingParams` (B-3) |

---

## Phần 6 — Thứ tự xử lý đề nghị

**Đợt 1 — chặn mất mát dữ liệu.** C-1 và C-2 (gộp hai hàm dựng payload rồi thêm test đối chiếu), B-1 (thêm `assertEpdaUnlocked` vào `updateHours` và `updateForm`), P-1 (canonicalize cả hai phía trước khi diff, hoặc loại `cargoAgencyRates` khỏi diff cấp cảng).

**Đợt 2 — chặn mất công sức người dùng.** C-3 và C-4 (baseline dirty và cờ huỷ khi hydrate), P-4 và P-5 (dirty guard cho port override, xác nhận trước khi xoá override), I-3 (báo lỗi xoá bulk và chuyển sang endpoint theo lô).

**Đợt 3 — đúng đắn hiển thị.** P-2 (bỏ `resolveGrtBand`), I-1 (bỏ nút sắp xếp hoặc đẩy sort xuống API), I-2 (`keepPreviousData`), P-6 kèm nâng cấp kiểm tra hợp lệ tại chỗ.

**Đợt 4 — nợ cấu trúc.** Tách module mặc định dùng chung giữa backend và frontend, gom nhóm history table/dialog/hook, gom nhóm calculator, và P-3 (giao diện quản lý GROUP hoặc ít nhất một bảng chỉ đọc "kế thừa từ nhóm X").

---

## Phần 7 — Trạng thái triển khai kế hoạch nhất quán EPDA

### 7.1 Đã hoàn tất trong mã nguồn

| Đợt | Trạng thái | Kết quả chính |
|---|---|---|
| 1 — Save và hợp đồng 400/409 | **Đã sửa** | Create/Patch dùng chung mapper và giữ đủ bốn trường tiền; phân biệt `undefined`, `null`, `0`; tham số tải từ server không còn bị sửa nhãn/biên hoặc loại bậc giá `0`; Create kiểm tra bộ tham số đang dùng; snapshot nhận `commodity_type_id` và `tug_assistance_trips`; lỗi tải biểu cước chặn Save/Preview và có Retry. |
| 2 — Bản ghi, phiên sửa, snapshot | **Đã sửa trong ứng dụng** | Thêm `epdaRevision` và `expectedEpdaRevision` cho Save/Lock/Unlock/các route EPDA cũ; trả `428` khi thiếu và `409` khi cũ; `/hours`, `/form`, `/status` của Shipping Agency đi qua cùng service, transaction, lock guard, validation và audit; Lock dựng snapshot phiên bản hóa từ bản ghi đã lưu; audit tham số bằng fingerprint; batch delete kiểm tra và khoá toàn bộ hàng trước khi xoá trong một transaction. |
| 3 — Quy tắc Form/Calculator/Preview/PDF | **Đã sửa** | Dùng chung resolver GRT/LOA; điều kiện tug là `LOA > max`; phí `0` vẫn là bậc hợp lệ; Processing được phép thiếu dữ liệu hoàn tất, còn Completed/Preview/PDF/Lock bị chặn; backend cũng bắt buộc phí tug dương khi thật sự vượt ngưỡng; Apply latest tính từ đối tượng mới; Preview/Hydration cũ không được ghi đè request mới; đổi Berth/Anchorage không reset giờ đã nhập. |
| 4 — Parameter editor | **Đã sửa** | Port chỉ diff section được phép và bảo toàn override ẩn; baseline/version được chụp khi bắt đầu sửa; refetch không tự thay phiên draft; Save giữ card port đang edit mở; có dirty guard/xác nhận về kế thừa; đã bỏ các nút “Reload saved values” ở AREA và PORT; trạng thái input trống tách khỏi vô hạn; chỉ Max GRT của catch-all cuối bị disable; validation tại dòng chặn biên trùng/sai thứ tự, catch-all sai vị trí, nhãn rỗng và bảng áp dụng rỗng; GROUP hiển thị chỉ đọc; dữ liệu cũ không phát tán `NaN`, validator không mutate DTO. |
| 5 — Inquiry History | **Đã sửa** | Sorting chạy ở API với allowlist, hướng sort và ID tie-break; giữ trang cũ trong lúc fetch nhưng vô hiệu thao tác; selection dùng ID ổn định và reset đúng lúc; dialog giữ nguyên tập ID cần xoá; dùng batch endpoint và báo lỗi; editor invalidate history sau mutation; lịch sử thay đổi phân biệt rỗng/lỗi và có Retry; ngày hỏng hiển thị an toàn; bảng rộng cuộn ngang bên trong card thay vì làm tràn bố cục. |
| 6 — Utilities fee of wharf | **Đã sửa** | Cả HCM/HN/QN có checkbox tùy chọn trong Port dues and charges; chỉ tính tại Berth theo `rate × GRT × berth hours × ship rate factor`, áp VAT như Berth due và cộng vào Total A/grand total. Rate AREA mặc định `0.0004 USD/GRT/hour` có thể chỉnh trong Parameter và calculator. Create/Patch/Hydration/Audit lưu đúng lựa chọn; Anchorage ép về `false`; snapshot mới là v3, còn dữ liệu cũ thiếu field giữ nghĩa `false`. |

Các đính chính đã được áp dụng khi sửa: không giới hạn Lock thành ADMIN-only; GROUP chỉ đọc; AREA tiếp tục lưu document đầy đủ nhưng bảo toàn phần ẩn; bậc phí `0` không bị xem là rỗng; ngày EPDA tiếp tục dựa trên ngày tạo inquiry; không tự sửa snapshot đã khoá hay tự biến biên cuối thành vô hạn trong đường đọc.

### 7.2 Artefact triển khai và dữ liệu cũ

- Migration bổ sung revision: `backend2.0/scripts/migrations/2026-09-04_epda_revision_expand.sql`. Migration chỉ thêm cột, không viết lại tariff hoặc snapshot.
- Migration bổ sung lựa chọn Utilities fee of wharf: `backend2.0/scripts/migrations/2026-09-05_epda_utilities_wharf_expand.sql`. Migration chỉ thêm cột `utilities_wharf_enabled boolean NOT NULL DEFAULT false`, chạy lặp an toàn và không viết lại tariff, working parameters hoặc snapshot JSONB.
- **Migration Utilities fee of wharf đã áp vào database development đang cấu hình trong `backend2.0/.env`:** trước migration có 9 inquiry và chưa có cột; sau migration vẫn có 9 inquiry, cột là `boolean NOT NULL DEFAULT false`, cả 9 giá trị legacy là `false`, không có `NULL`. Migration được chạy lại lần hai thành công để xác nhận idempotent; chưa áp vào production.
- Backup trước migration Utilities fee of wharf: `tmp/shipping_agency_inquiries_before_utilities_wharf_20260905_0017.dump`, 18.784 byte, SHA-256 `A7F0FBC5DC1A4026D1BA51BECD5F1F8E0A69CE41E76602E84A7611A9E533F046`. Danh mục archive đã được kiểm tra có dữ liệu bảng `shipping_agency_inquiries`.
- Audit legacy chỉ đọc: `backend2.0/scripts/audit-epda-legacy-data.mjs`, chạy qua script `db:audit:epda-legacy`. Báo cáo các biên trùng, mảng áp dụng rỗng, cargo override zero, working parameters hỏng và snapshot không tương thích.
- **Audit database development đã chạy ở transaction `READ ONLY`:** quét 12 parameter set và 5 inquiry có working/snapshot; phát hiện 2 lỗi `non_increasing_grt_boundary`. Cụ thể parameter set `#16` và working parameters của inquiry `#22` đều có `moorUnmoorBerthTiers[3].maxGrt = 1000` đứng sau biên `5000`. Audit chạy lại sau migration cho cùng kết quả, xác nhận migration không thay đổi tariff/snapshot.
- **Migration đã áp vào database development đang cấu hình trong `backend2.0/.env`:** trước migration có 9 inquiry và chưa có cột revision; sau migration vẫn có 9 inquiry, `epda_revision` là `NOT NULL DEFAULT 1`, toàn bộ giá trị hiện tại bằng `1`.
- Backup trước migration: `tmp/shipping_agency_inquiries_before_epda_revision_20260904.dump`, 18.655 byte, SHA-256 `6290E774D162C10BC26C7153A985E08F30BAA15A96FDF03527EC49D3FDBE52A6`. Archive đã được restore vào PostgreSQL local độc lập và khôi phục đủ 9 hàng với schema trước migration.
- Migration cũng được rehearsal trên PostgreSQL 18 local: giữ nguyên 2/2 fixture, chạy lại idempotent thành công, và backup trước migration restore được đúng schema không có revision.

### 7.3 Kết quả kiểm tra sau sửa

| Kiểm tra | Kết quả |
|---|---|
| Frontend unit/component | **106 files, 552 tests pass** |
| Backend unit/flow | **103 suites, 803 tests pass** |
| Migration regression | **251 Node tests + 22 Jest tests pass** |
| Frontend typecheck | **Pass** |
| Frontend production build | **Pass** |
| Backend build | **Pass** |
| Frontend lint toàn `src` | **Pass** |
| Frontend Prettier `format:check` toàn repo | **Pass — 35 file lệch chuẩn đã được định dạng lại** |
| Backend lint toàn bộ `src`, `apps`, `libs`, `tests` | **Pass — 0 lỗi, 0 cảnh báo** |
| `git diff --check` hai project | **Pass** |
| PostgreSQL migration rehearsal/restore | **Pass** |
| PostgreSQL Save–Save race | **Pass — đúng một thao tác thắng, thao tác còn lại nhận revision conflict** |
| PostgreSQL Save–Lock race | **Pass — không thể cùng ghi với cùng revision** |
| PostgreSQL Delete–Lock race | **Pass — không thể vừa xoá vừa khoá cùng bản ghi** |
| Batch có ID thiếu hoặc EPDA khoá | **Pass — transaction rollback, không xoá dở** |

Đợt dọn lint tiếp theo đã xử lý đủ **69 lỗi backend**: 57 lỗi Prettier, 2 type assertion thừa và 10 lỗi cần sửa thủ công (`require-await`, `no-unsafe-assignment`, `no-unsafe-return`). Các biên cookie/CSRF và raw result của TypeORM nay được thu hẹp từ `unknown`; queue vẫn giữ hợp đồng lỗi bất đồng bộ qua Promise. Sau khi bổ sung Utilities fee of wharf, lint toàn backend, build và toàn bộ 803 test đều pass.

### 7.4 Việc còn lại trước khi phát hành production

1. Duyệt và sửa có chủ đích hai bản ghi legacy `#16` và `#22`; không tự sửa inquiry snapshot/working parameters khi chưa xác nhận biểu cước đúng.
2. Khi phát hành production, deploy migration `2026-09-05_epda_utilities_wharf_expand.sql` và backend trước frontend; sau đó yêu cầu client cũ reload vì revision đã trở thành bắt buộc. Cả migration revision và Utilities fee of wharf hiện mới được áp trên database development từ `.env`, chưa phải xác nhận phát hành production.
3. Smoke test ba route `/epda/create-epda`, `/epda/parameter`, `/epda/inquiry` với dữ liệu HCM/HN/QN, cả trạng thái Berth/Anchorage, và quyền staff Lock/ADMIN Unlock trước khi mở lại cho người dùng.
