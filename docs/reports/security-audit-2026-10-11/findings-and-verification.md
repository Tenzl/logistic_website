# Phát hiện và kiểm chứng tiếp theo

Phạm vi backend2.0 + dashboard_admin; database chỉ đọc qua snapshot. Các reproduction dùng dữ liệu giả/mocks và build local, không phải exploitation production.

## Bản đồ luồng dữ liệu/công thức

| Loại dữ liệu | Lưu/xử lý | Người được truy cập theo source | Nơi xuất hiện trên client |
|---|---|---|---|
| Session/credential | AuthService, PostgreSQL users, bcrypt, JWT cookie | Authenticated user; admin quản lý user có revoke version | Cookie HttpOnly; cached display profile có email/name; không lưu JWT trong localStorage |
| Khách hàng/booking/BL/AN/DO | PostgreSQL, BookingDocuments/Partner services | INTERNAL + section; một số PIC/catalog reference là INTERNAL reads | API JSON, dashboard, PDF/ZIP; CSV exports trong Git |
| Inquiry | Các bảng inquiry theo service; user_id | Customer owner; staff theo section | Customer DTO loại epda snapshot; admin DTO có snapshot/working params |
| Tài liệu inquiry | Cloudinary metadata + object storage | API owner hoặc role hardcoded privileged; upload admin section | DTO có URL/publicId; signed/fallback download; object ACL ngoài API chưa xác minh |
| Tham số EPDA | Parameter set/group/port + frozen/working snapshots | Read effective/area/port cho INTERNAL; writes cần section | API, coeff/default trong JS, preview HTML/PDF do client tính |
| Công thức | Quote-hcm/Quote-qn/Quote-hn, tariff/VAT/pilotage/Go Gia | Hiện xử lý client; policy yêu cầu backend-only | 5 public static assets local không cần auth; source maps không cần thiết |
| R2 storage | Storage/R2 service | JWT INTERNAL + data-storage section | Signed download URL có expiresIn; ACL/config/provider thực tế chưa xác minh |
| Log/export/backup | Repo artifacts và các logger | File/repo ACL chưa xác minh | 4 CSV Git-tracked; 3 dump local bị ignore; report audit chỉ giữ aggregate |

### Ranh giới source, bundle, API, HTML/RSC và tài liệu

- Source công thức client là chắc chắn; production JS và GET public local đã kiểm chứng riêng (F01). Existing .next dev artifacts có provenance khác, không dùng kích thước dev làm số đo production.
- API coefficient/snapshot tới staff xác nhận bằng đường controller/mapper, chưa thực hiện request live (F02). User audience hiện không trả snapshot.
- Preview tạo HTML phía client, có công thức/đơn giá/remarks theo renderer; dữ liệu export khách hàng cần field policy riêng. Chưa tải PDF nghiệp vụ thật để kết luận lượng dữ liệu lộ.
- Production build dùng dummy config/no .env và Providers không render browser state trên server. Không thấy known secret trong JS/HTML/RSC đã quét. Điều này không xác nhận toàn bộ response runtime hoặc dữ liệu user trong production.
- Không phát hiện file dump/CSV nghiệp vụ trong dashboard public hiện tại. Không tự gắn CSV trong docs thành URL public website.

## Danh mục công thức, biểu phí và override

Đây là danh mục logic tìm thấy trong source, không phải biểu phí đã được nghiệp vụ phê duyệt. Không sao chép giá trị hệ số nội bộ hoặc dữ liệu khách hàng vào báo cáo. HCM dùng renderer riêng; QN dùng renderer riêng; HN dùng layout HCM và pathway pilotage single-rate qua pilotage_miles.

| Thành phần | Đầu vào/đơn vị, nhánh cần đối chiếu | Nơi xử lý hiện tại và bằng chứng |
|---|---|---|
| Tonnage, navigation | GRT, số lượt, loại tàu; coeff và tanker/bulk factor. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:144>) |
| Pilotage | GRT, khoảng cách miles, số lượt; HCM chia leg; QN/single-rate có minimum; HN chọn pathway single-rate. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:224>) |
| Tug assistance/escorting | Tariff theo GRT/DWT/LOA, số trips; escorting theo cảng và cờ lựa chọn. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:253>) |
| Moor/unmoor | Tariff berth hoặc buoy theo vị trí; biên tier và loại comparison quyết định đơn giá. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:285>) |
| Berth, anchorage, utilities, buoy | GRT × giờ và coeff; Go Gia có nhánh cargo ton; flag utilities phụ thuộc berth. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:299>) |
| Ship/cargo quarantine | Ship threshold GRT, mục đích ghé cảng, số trips, cargo mode và transport. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:385>) |
| Ocean freight tax | Cargo MT, USD/MT, tax rate và loading/export mode; đầu vào khác null/0 phải phân biệt. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:415>) |
| Garbage/clearance | Giờ lưu → ngày, ceil theo chu kỳ thu gom; rate berth/buoy, override garbage; clearance fee. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:455>) |
| Agency fee/cargo agency | GRT tier, commodityTypeId/legacy code, MT, discount/lumpsum và other expenses; thiếu rate có fallback zero cần nghiệp vụ xác nhận. | Client: [Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:769>) |
| Manual fee lines | Tally, transport, boat hire, shorecrane USD/MT, tug override, AA_ROWS/BB_ROWS; snapshot v3 không tin client totals. | Client: [quoteCommon.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/quoteCommon.ts:17>) |
| VAT và phụ phí Go Gia | Shipowner nationality quyết định VAT; port/canoe/fuel/escorting flags quyết định nhánh phụ phí. VAT có constant trong client source. | Client: [shipownerVat.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/shipownerVat.ts:14>) |
| Rounding và totals | formatAmount làm tròn lên tới cent; renderer làm tròn thời gian ra ngày và utilities giảm sai số floating point; tổng A/B và grand total cần đối chiếu trước/sau rounding. | Client: [quoteCommon.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/quoteCommon.ts:93>) |
| Tier/minimum boundaries | Legacy GRT upper tiers, minGrt < GRT <= nextMinGrt; LOA lấy tier phù hợp; tariff mới có basis GRT/DWT/LOA và hai kiểu đóng/mở biên. | Client: [epdaTariff.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/epdaTariff.ts:103>) |

Các renderer trên nằm trong client import graph của F01. Việc đã xác nhận 5 asset chứa logic/default không có nghĩa từng dòng danh mục được HTTP kiểm tra riêng; đây là truy vết source kết hợp bằng chứng bundle. Bộ tham số xuất qua API được xác nhận từ source F02, còn HTML/PDF runtime chứa bao nhiêu thông tin chưa kiểm chứng trên deployment.

**Nguồn tham số và thứ tự override:** default theo vùng → AREA → GROUP nếu có membership → PORT; scalar merge theo field, tariff/tier arrays được thay theo layer. Truy vết tại [backend2.0/src/features/epda-parameters/epda-parameters.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/epda-parameters/epda-parameters.service.ts:679>) và [backend2.0/src/features/epda-parameters/epda-parameter-resolution.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/epda-parameters/epda-parameter-resolution.ts:235>). Frontend còn normalize/default/merge tại [dashboard_admin/src/modules/inquiries/components/common/quoteParameters.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/quoteParameters.ts:921>).

**Working/frozen snapshot:** Apply phải khớp effective params hiện tại; Skip phải khớp working params đã lưu, không chấp nhận arbitrary client params. Snapshot v3 dựng input từ bản ghi server và bỏ client totals tại [backend2.0/src/features/inquiry/services/shipping-agency-epda-snapshot.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/shipping-agency-epda-snapshot.service.ts:170>). Khi render ở browser, bộ params/snapshot vẫn tới client, vì vậy các kiểm soát đúng đắn này chưa đáp ứng chính sách bảo mật công thức.

**Kết quả đối chiếu:** mặc định HCM/QN/HN khớp với backend ở ba bộ được kiểm tra; golden tests chứng minh regression của ví dụ, không xác nhận đơn giá đúng nghiệp vụ. Chưa có approved expected results cho mỗi tier boundary/minimum, USD/MT/miles/GRT/DWT/LOA, null/0, VAT, custom fee, working/frozen override và rounding tổng. Không khẳng định mọi implementation tương đương hoặc mọi nhánh đã kiểm chứng.

<a id="f01"></a>
## F01 — Công thức và hệ số EPDA được phát trong bundle công khai

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — source, production build và GET local không cookie.

Luồng client EpdaEditorScreen → useEpdaPreview → quoteVariantRenderer → Quote-hcm/Quote-qn/Quote-hn thực hiện tính toán. defaultParameterValues/coeff và bộ giải biểu phí nằm trong JS. Năm asset của production build trả HTTP 200 mà không gửi Cookie/Authorization, hash trùng artifact build. Asset có Cache-Control public, max-age=31536000, immutable. Việc ẩn menu hoặc kiểm tra đăng nhập của trang không bảo vệ các asset này. Không cần source map để đọc hoặc suy ra logic.

**Tác động và giới hạn:** Vi phạm yêu cầu công thức/hệ số chỉ backend. Mức public đã xác minh ở bản build local; chưa kiểm chứng bản triển khai production có cùng hash.

**Vị trí:**

- [dashboard_admin/src/features/admin/sections/epda-editor/EpdaEditorScreen.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/features/admin/sections/epda-editor/EpdaEditorScreen.tsx:1>)
- [dashboard_admin/src/features/admin/sections/epda-editor/controller/useEpdaPreview.ts](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/features/admin/sections/epda-editor/controller/useEpdaPreview.ts:67>)
- [dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/modules/inquiries/components/common/Quote-hcm.tsx:147>)
- [evidence/local-unauthenticated-formula-assets.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/local-unauthenticated-formula-assets.json>)

**Cách kiểm chứng an toàn:** Đọc evidence/local-unauthenticated-formula-assets.json: sent_cookie=false, sent_authorization=false, http_status=200, sha256_matches_build=true. Script verify-local-cases.py chỉ GET vào server cô lập 127.0.0.1 rồi dừng server.

**Đề xuất khắc phục:** Chuyển toàn bộ tính toán/biểu phí nội bộ sang backend; frontend nhận breakdown/kết quả được phép hiển thị. Loại import công thức/default khỏi client graph và xác minh bundle mới. Xử lý asset/CDN cũ theo chính sách lưu giữ sau khi thay đổi; mã đã phát không thể được coi là bí mật trở lại chỉ bằng minify.

**Kiểm chứng còn thiếu/acceptance:** Đối chiếu deployment commit/asset hash; kiểm tra JS/HTML/RSC/API/PDF không chứa công thức/hệ số bị cấm. Nếu tài liệu khách hàng cần hiển thị đơn giá, phải chốt riêng danh sách trường được phép.

<a id="f02"></a>
## F02 — API trả bộ tham số/biểu phí nội bộ xuống dashboard

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — đường source/mapper; chưa gọi API live.

GET /api/v1/admin/epda-parameters/effective được AuthGuard + INTERNAL RolesGuard bảo vệ nhưng trả getEffective (bộ tham số). Các GET area/port cũng trả parameter sets. Mapper audience=admin trả epdaWorkingParams và epdaSnapshot; snapshot có params. Theo policy đã chốt, cả browser quản trị cũng không được nhận bộ công thức/hệ số nội bộ.

**Tác động và giới hạn:** Người INTERNAL hợp lệ có thể nhận biểu phí qua API dù không có section epda-parameter; source ghi rõ đây là quyền đọc dùng cho Create/Edit. Đây là hành vi thiết kế hiện tại, không tự coi là bypass section. Mapper audience=user có loại trường nội bộ, nên chưa có bằng chứng customer nhận các snapshot này qua API.

**Vị trí:**

- [backend2.0/src/features/epda-parameters/epda-parameters-admin.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/epda-parameters/epda-parameters-admin.controller.ts:64>)
- [backend2.0/src/features/epda-parameters/epda-parameters.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/epda-parameters/epda-parameters.service.ts:679>)
- [backend2.0/src/features/inquiry/mappers/shipping-agency-inquiry.mapper.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/mappers/shipping-agency-inquiry.mapper.ts:71>)
- [backend2.0/src/features/inquiry/services/shipping-agency-epda-snapshot.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/shipping-agency-epda-snapshot.service.ts:83>)

**Cách kiểm chứng an toàn:** Truy vết controller → getEffective/resolveEpdaParameterValues → response; kiểm tra client epdaParametersService và mapper admin/user. Không đăng nhập hoặc gọi API production.

**Đề xuất khắc phục:** Sau khi chuyển tính toán sang server, thu hẹp response: không trả coefficient/default/table nội bộ. Nếu cần màn hình sửa biểu phí, phải xác định lại ngoại lệ với policy backend-only trước khi triển khai.

**Kiểm chứng còn thiếu/acceptance:** Role/section matrix cho anonymous, customer A/B và staff; snapshot/detail/export/PDF phải cùng tuân thủ field policy.

<a id="f03"></a>
## F03 — Cloudinary upload public mặc định và signed URL không mang TTL như dự kiến

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — source và SDK với credential giả; quyền object live chưa kiểm chứng.

pipeUpload gọi upload_stream với folder/resource_type, không đặt type=authenticated hoặc access_control. Metadata DTO trả cloudinaryUrl và cloudinaryPublicId. Download handler kiểm tra ownership nhưng tạo URL /authenticated/ từ publicId hoặc dùng URL legacy. Với SDK đang cài, buildSignedRawUrl(...,60) và (...,3600) trả cùng URL; không có expiry/auth token trong URL. expires_at của cloudinary.url không tạo một token thời hạn cho signed delivery này. Upload type mặc định upload và delivery type authenticated khác nhau còn có thể làm download qua endpoint thất bại.

**Tác động và giới hạn:** Người biết URL upload có thể vượt kiểm tra quyền API nếu asset public theo cấu hình Cloudinary. Signed URL cũng không có TTL 60 giây được chứng minh. Không có tài liệu inquiry trong ba dump đã đọc để xác minh object thật; không gửi request tới Cloudinary.

**Vị trí:**

- [backend2.0/src/shared/services/cloudinary.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/services/cloudinary.service.ts:136>)
- [backend2.0/src/shared/services/cloudinary.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/services/cloudinary.service.ts:88>)
- [backend2.0/src/features/inquiry/services/inquiry-document.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/inquiry-document.service.ts:405>)
- [backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts:150>)
- [evidence/pure-reproductions.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/pure-reproductions.json>)

**Cách kiểm chứng an toàn:** verify-local-cases.py gọi service/SDK thật với dummy secret, không upload. Kết quả different_ttl_same_url=true và url_contains_expiry=false. Đối chiếu [Cloudinary upload parameters](https://cloudinary.com/documentation/upload_parameters) và [media access control](https://cloudinary.com/documentation/control_access_to_media).

**Đề xuất khắc phục:** Dùng private/authenticated delivery nhất quán từ upload tới download; dùng cơ chế signed download/token có expiry được nhà cung cấp hỗ trợ. DTO trả endpoint backend thay vì URL public lâu dài; loại fallback public. Lập kế hoạch chuyển object cũ riêng, không thực hiện trong audit.

**Kiểm chứng còn thiếu/acceptance:** Sau khi có quyền đọc cấu hình storage: kiểm tra một object giả, URL unsigned, URL đã hết hạn, loại upload/delivery và tải của chủ sở hữu/khách khác. Không thử trên tài liệu khách hàng thật.

<a id="f04"></a>
## F04 — Dependency production có advisory High/Critical

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — pnpm lockfile audit và advisory chính thức; exploitation production chưa kiểm chứng.

pnpm audit --prod --json báo backend: 1 Critical, 12 High, 8 Moderate, 1 Low; dashboard: 2 Critical, 11 High, 7 Moderate. Đây là số cảnh báo dependency, không phải 42 lỗ hổng ứng dụng đã khai thác. Next 15.5.22 nằm trong phạm vi advisory RCE Windows và AVIF; dashboard bật AVIF image optimization. proxy-addr của Express có advisory trust subnet, nhưng code hiện chỉ cho numeric proxy hops nên điều kiện subnet cụ thể chưa thấy reachable.

**Tác động và giới hạn:** Cần xử lý dependency được dùng ở runtime theo khả năng tiếp cận. Next Windows RCE phụ thuộc OS deployment; AVIF phụ thuộc đường image optimizer/native library; proxy-addr advisory không được gắn tự động thành IP spoofing ở cấu hình numeric. sanitize-html advisory SVG không mặc định exploitable với allowlist tag hiện tại.

**Vị trí:**

- [dashboard_admin/package.json](<D:/University/Seatrans-website/seatrans/dashboard_admin/package.json:53>)
- [dashboard_admin/next.config.mjs](<D:/University/Seatrans-website/seatrans/dashboard_admin/next.config.mjs:56>)
- [backend2.0/src/config/environment.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/config/environment.ts:85>)
- [evidence/backend-dependencies.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/backend-dependencies.json>)
- [evidence/dashboard-dependencies.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/dashboard-dependencies.json>)

**Cách kiểm chứng an toàn:** Audit chỉ đọc lockfile và truy vấn registry, không chạy pnpm update/audit fix. Tham khảo [Next Windows advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36), [Next AVIF advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4), [proxy-addr advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h).

**Đề xuất khắc phục:** Ưu tiên dependency trực tiếp/reachable và chọn phiên bản vá đáp ứng tất cả advisory hiện hành; chạy compatibility/build/test trước khi deploy. Không tự sửa lockfile trong đợt audit.

**Kiểm chứng còn thiếu/acceptance:** Xác minh installed/deployed versions, OS, native image dependencies, runtime adapter và proxy configuration; tạo SBOM và lịch vá.

<a id="f05"></a>
## F05 — Rollback upload song song không chờ worker còn chạy

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — orchestrator thật, repository/storage mock.

mapWithConcurrency dùng Promise.all: một worker reject khiến hàm reject ngay, các worker khác vẫn tiếp tục. saveAttachmentsForInquiry bắt lỗi rồi duyệt persistedDocumentIds để xóa ngay. Tái hiện cho thấy submission-rejected xảy ra trước late-upload-persisted, không có rollback-delete cho file hoàn tất muộn. Caller có thể bù trừ/xóa inquiry trong khi một worker còn lưu file/metadata.

**Tác động và giới hạn:** Có thể sinh file/metadata mồ côi hoặc bộ attachment không nhất quán khi upload lỗi. Không khẳng định database/storage hiện đang có orphan; ba snapshot không có document rows để kiểm tra điều này.

**Vị trí:**

- [backend2.0/src/shared/utils/map-with-concurrency.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/utils/map-with-concurrency.ts:29>)
- [backend2.0/src/features/inquiry/services/inquiry-document.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/inquiry-document.service.ts:123>)
- [backend2.0/src/features/inquiry/services/service-inquiry.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/service-inquiry.service.ts:159>)
- [evidence/pure-reproductions.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/pure-reproductions.json>)

**Cách kiểm chứng an toàn:** Một mock upload reject ngay, mock khác resolve sau 30ms; gọi service thật và theo dõi event, không ghi DB/storage.

**Đề xuất khắc phục:** Ngừng nhận việc mới khi lỗi, hủy hoặc đợi mọi worker settle rồi mới compensation; giữ danh sách object/metadata cần xóa và retry cleanup có audit.

**Kiểm chứng còn thiếu/acceptance:** Test fast-fail + slow-success, nhiều failure, cleanup fail và timeout; xác nhận không còn late persistence sau rollback.

<a id="f06"></a>
## F06 — Idempotency không phân biệt nội dung file và có khoảng hở sau commit

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận hash collision nghiệp vụ; retry sau crash là nguy cơ từ source.

hashSubmitRequest chỉ băm DTO, originalname và size; hai file cùng tên/kích thước nhưng khác bytes có cùng request hash. Ngoài ra executeSubmitInquiry commit inquiry trước completeSubmit. Nếu completeSubmit lỗi, catch abandonSubmit có thể xóa claim trong khi inquiry đã tồn tại; retry hoặc reclaim claim sau crash có nguy cơ tạo inquiry mới.

**Tác động và giới hạn:** Có thể trả kết quả cũ cho attachment đã đổi hoặc tạo trùng sau lỗi giữa commit/result. Các snapshot không thấy duplicate ở những khóa đã kiểm tra; không xem đây là chứng cứ dữ liệu trùng đang tồn tại.

**Vị trí:**

- [backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts:25>)
- [backend2.0/src/features/inquiry/services/service-inquiry.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/service-inquiry.service.ts:89>)
- [backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts:98>)
- [evidence/pure-reproductions.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/pure-reproductions.json>)

**Cách kiểm chứng an toàn:** Gọi pure hash method thật bằng hai Buffer giả khác bytes, cùng tên/size; kết quả hash bằng nhau. Crash gap chỉ được truy vết, chưa chạy thao tác DB.

**Đề xuất khắc phục:** Băm checksum nội dung file + canonical payload; gắn claim/result với inquiry trong một giao thức atomic/transaction phù hợp, không abandon claim sau successful commit mà không giữ liên kết kết quả.

**Kiểm chứng còn thiếu/acceptance:** Mock lỗi completeSubmit sau commit, crash/retry/reclaim, DTO đổi thứ tự key và cùng tên/size khác nội dung; integration sau này chỉ dùng DB cô lập.

<a id="f07"></a>
## F07 — CSV export giữ tiền tố công thức bảng tính

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận — serializer thật với ô giả vô hại.

PortOperationReportService.toCsv chỉ quote và escape dấu nháy; chuỗi =1+1 xuất thành ô CSV vẫn bắt đầu bằng =. Dữ liệu như tên vessel/agency/customer có thể đến từ nhập/import. CSV quoting không tự trung hòa công thức khi mở bằng spreadsheet.

**Tác động và giới hạn:** Người có quyền nhập dữ liệu có thể làm file export chứa công thức không mong muốn; tác động phụ thuộc phần mềm đọc và chính sách mở file. Không mở Excel và không thực thi công thức trong audit.

**Vị trí:**

- [backend2.0/src/features/port-operations/services/port-operation-report.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/port-operations/services/port-operation-report.service.ts:244>)
- [evidence/pure-reproductions.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/pure-reproductions.json>)

**Cách kiểm chứng an toàn:** Gọi serializer với {Vessel:"=1+1"}; formula_prefix_preserved=true.

**Đề xuất khắc phục:** Áp chính sách trung hòa formula prefixes cho text cells (kể cả whitespace/control characters), giữ numeric cells đúng kiểu; kiểm thử CSV và XLSX riêng.

**Kiểm chứng còn thiếu/acceptance:** Test =,+,-,@,tab/CR trước prefix và tên bắt đầu dấu nháy; kiểm chứng bằng reader được hỗ trợ với dữ liệu giả.

<a id="f08"></a>
## F08 — Xác thực chưa đạt ASVS Level 2 và mật khẩu dài bị bcrypt cắt

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận source; password truncation tái hiện bằng bcrypt thật.

Không có MFA thực thi ở backend; Google pathway không kiểm tra acr/amr. JWT strategy/signing thiếu audience. Không có self-service change password hiện tại, denylist common/breached password hoặc session inventory cho user. Register áp composition rules trái ASVS 6.2.5. bcrypt nhận password trực tiếp và chỉ xử lý 72 byte: hai password giả 73 byte khác ký tự cuối vẫn compare bằng nhau. Admin có reset/revoke session, đây là kiểm soát tích cực nhưng không thay MFA/self-service.

**Tác động và giới hạn:** Tăng rủi ro chiếm tài khoản quản trị và giảm assurance khi thao tác nhạy cảm. JWT audience thiếu không tự chứng minh có một token từ issuer khác được dùng được; key topology production còn thiếu. Truncation ảnh hưởng mật khẩu dài/Unicode, không có bằng chứng account thật đã bị khai thác.

**Vị trí:**

- [backend2.0/src/features/auth/strategies/jwt.strategy.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/strategies/jwt.strategy.ts:50>)
- [backend2.0/src/features/auth/dto/register.dto.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/dto/register.dto.ts:25>)
- [backend2.0/src/features/users/controllers/admin-users.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/users/controllers/admin-users.controller.ts:106>)
- [evidence/pure-reproductions.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/pure-reproductions.json>)

**Cách kiểm chứng an toàn:** Kiểm kê auth routes/DTO; chạy bcrypt với dummy password chung 72 byte + suffix khác, compare=true. Không đăng nhập/reset tài khoản thật.

**Đề xuất khắc phục:** Thiết kế MFA/step-up cho staff/admin, audience/issuer/token type, self-service password/session controls và password policy phù hợp ASVS. Chuyển hashing/prehash có version/migration được kiểm thử để không cắt ngầm.

**Kiểm chứng còn thiếu/acceptance:** Test MFA mọi pathway, token sai audience/type/algorithm, password Unicode/dài, reset/revoke và profile changes cần recent auth.

<a id="f09"></a>
## F09 — CSP, cookie prefix và anti-cache chưa đầy đủ

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận source và header dashboard local; cache production chưa kiểm chứng.

CSP dashboard thiếu script-src/default-src allowlist/nonce/hash, base-uri self thay vì minimum base-uri none của ASVS. auth_token không dùng __Host-/__Secure- dù có HttpOnly/Secure/SameSite đúng mục đích. Nest không có no-store toàn cục cho sensitive GET auth/inquiry/parameter/storage; chỉ một số export có đặt.

**Tác động và giới hạn:** Thiếu lớp giảm tác động XSS, cookie shadowing và bảo đảm cache không giữ dữ liệu nhạy cảm. Chưa quan sát response của khách A bị trả cho khách B; không kết luận đã có cache leak.

**Vị trí:**

- [dashboard_admin/next.config.mjs](<D:/University/Seatrans-website/seatrans/dashboard_admin/next.config.mjs:27>)
- [backend2.0/src/features/auth/auth-cookie.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/auth-cookie.ts:3>)
- [backend2.0/src/configure-app.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/configure-app.ts:57>)
- [backend2.0/src/features/booking-documents/booking-documents-admin.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/booking-documents/booking-documents-admin.controller.ts:83>)

**Cách kiểm chứng an toàn:** Đọc cấu hình và header của static asset local; tìm nơi đặt Cache-Control trong hai repo.

**Đề xuất khắc phục:** Áp CSP phù hợp Next theo nonce/hash, cookie prefix phù hợp BFF và no-store/private cho sensitive API. Kiểm chứng cả hop proxy/CDN.

**Kiểm chứng còn thiếu/acceptance:** Header matrix cho success/error/download, back-button/logout, cache separation theo account và cookie clearing sau rename.

<a id="f10"></a>
## F10 — Giới hạn chống lạm dụng theo process và hàng đợi PDF chưa có hard cap

**Ưu tiên:** P2. **Bằng chứng:** Nguy cơ có căn cứ — source; quy mô/topology production chưa kiểm chứng.

Global throttler/login buckets/upload gate nằm trong memory từng process; scale nhiều replica nhân ngưỡng hiệu dụng. LoginThrottleService đọc CF-Connecting-IP trực tiếp khi TRUST_PROXY bật, nên cần edge overwrite và chặn đường truy cập origin. PDF renderer có concurrency cap nhưng AsyncSemaphore.waiters không có giới hạn số lượng/deadline/cancellation; payload/request có thể bị giữ khi chờ.

**Tác động và giới hạn:** Có thể lách giới hạn giữa replica hoặc tích lũy request chờ khi preview dồn dập. Không có load/soak test mới, không khẳng định hệ thống hiện đang cạn RAM hoặc nghẽn.

**Vị trí:**

- [backend2.0/src/features/auth/login-throttle.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/login-throttle.service.ts:28>)
- [backend2.0/src/features/auth/login-throttle.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/login-throttle.service.ts:67>)
- [backend2.0/src/shared/utils/async-semaphore.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/utils/async-semaphore.ts:38>)
- [backend2.0/src/features/booking-documents/rendering/booking-document-pdf.renderer.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/booking-documents/rendering/booking-document-pdf.renderer.ts:86>)

**Cách kiểm chứng an toàn:** Đọc vị trí storage limiter, trust proxy resolver và queue waiter implementation; không gửi flood/preview request.

**Đề xuất khắc phục:** Xác nhận replica/proxy trước; dùng limiter chia sẻ hoặc edge policy, validate nguồn forwarding headers, thêm queue cap/deadline/cancellation cho PDF và fail-fast khi đầy.

**Kiểm chứng còn thiếu/acceptance:** Topology review, metrics queue depth/pool wait và tải có giới hạn trên staging với payload giả.

<a id="f11"></a>
## F11 — Kiểm tra file chưa đồng nhất và chưa có malware scanning

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận phần code thiếu; bảo vệ provider chưa kiểm chứng.

Inquiry có extension/magic-byte/byte budgets. Gallery Multer filter dựa MIME client; storage có limit và key validation nhưng nhận mọi MIME. Chưa có antivirus/quarantine trong pipeline. DOC/DOCX magic header không chứng minh tài liệu không có nội dung độc hại. Không coi giới hạn file là quét malware.

**Tác động và giới hạn:** Tài liệu được nhận/phân phối mà chưa có kiểm chứng malware. Cloudinary image parsing có thể từ chối/rewrite image, nhưng audit không gọi provider nên không tự kết luận gallery nhận được file giả bất kỳ.

**Vị trí:**

- [backend2.0/src/shared/uploads/inquiry-file-validation.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/uploads/inquiry-file-validation.ts:150>)
- [backend2.0/src/shared/uploads/upload-validators.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/uploads/upload-validators.ts:12>)
- [backend2.0/src/features/storage/storage-admin.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/storage/storage-admin.controller.ts:49>)
- [backend2.0/src/features/gallery/gallery-admin.controller.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/gallery/gallery-admin.controller.ts:57>)

**Cách kiểm chứng an toàn:** Đọc pipeline từng loại upload; test inquiry magic/limits hiện có đã qua. Không upload dữ liệu thật.

**Đề xuất khắc phục:** Phân loại upload theo mục đích, kiểm chứng nội dung/rewrite image và quarantine/malware scanning trước khi phát download cho untrusted document.

**Kiểm chứng còn thiếu/acceptance:** File giả MIME/extension, PDF/DOCX có cấu trúc không hợp lệ, scan timeout/failure và object delivery headers.

<a id="f12"></a>
## F12 — Có đường cấu hình TLS database không xác minh certificate

**Ưu tiên:** P2. **Bằng chứng:** Nguy cơ có căn cứ — source và phép đo lịch sử; config live chưa kiểm chứng.

resolveDatabaseSsl cho sslmode=require hoặc DB_SSL=true dùng rejectUnauthorized=false khi không có strict flag/CA. Dashboard proxy có thể dùng HTTP origin. Báo cáo loadtest 08/09/2026 ghi đã dùng rejectUnauthorized=false vì certificate chain lỗi. Đây là môi trường đo, không phải chứng cứ production đang dùng cùng setting.

**Tác động và giới hạn:** Encryption-only TLS không xác minh server identity; backend proxy HTTP chỉ chấp nhận được khi transport/topology được bảo vệ và có quyết định rõ ràng.

**Vị trí:**

- [backend2.0/src/shared/database/database-ssl.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/database/database-ssl.ts:51>)
- [dashboard_admin/next.config.mjs](<D:/University/Seatrans-website/seatrans/dashboard_admin/next.config.mjs:9>)
- [backend2.0/docs/loadtest-2026-09-08/REPORT.md](<D:/University/Seatrans-website/seatrans/backend2.0/docs/loadtest-2026-09-08/REPORT.md:102>)

**Cách kiểm chứng an toàn:** Đọc resolver và hồ sơ đo; không dùng credential repo để kết nối live.

**Đề xuất khắc phục:** Dùng verify-full/CA hợp lệ, xác minh BFF↔backend transport và topology; tránh fallback TLS không xác minh trong production.

**Kiểm chứng còn thiếu/acceptance:** Kiểm tra config triển khai đã che secret, certificate chain, protocol/cipher và network boundary.

<a id="f13"></a>
## F13 — Bốn CSV dữ liệu nghiệp vụ thật được theo dõi trong Git

**Ưu tiên:** P1. **Bằng chứng:** Đã xác nhận — git ls-files và đọc CSV chỉ xuất aggregate.

backend2.0/docs/reports có bốn export port-call-missing-customers, mỗi file 1.042 dòng với vessel/agency/sourceCustomer/remarks và thông tin hành trình. Cả bốn được Git theo dõi và có cùng checksum; không có dòng giống hệt bị lặp trong từng file. Đây là lặp artifact export, không phải bốn lần insert database.

**Tác động và giới hạn:** Người có quyền đọc repo/history nhận dữ liệu nghiệp vụ ngoài hệ thống phân quyền ứng dụng. Chưa xác minh repo public/private hoặc quyền remote, nên không khẳng định dữ liệu đã public Internet. Những file này không nằm trong dashboard public theo kiểm kê hiện tại.

**Vị trí:**

- [evidence/csv-analysis.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/csv-analysis.json>)
- [evidence/baseline.json](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/baseline.json>)

**Cách kiểm chứng an toàn:** csv-analysis.json ghi tracked=true, rows=1042, identical_duplicate_rows=0 và hash. Không đưa tên/ID/customer/remark nguyên bản vào báo cáo.

**Đề xuất khắc phục:** Chuyển dữ liệu operational export sang nơi có ACL/retention phù hợp, dùng fixture tổng hợp trong repo; đánh giá history/remote access trước kế hoạch xử lý Git. Không xóa/history rewrite trong audit.

**Kiểm chứng còn thiếu/acceptance:** Xác minh quyền repo, nơi artifact được deploy, người được đọc và phân loại dữ liệu; secret sweep không thay kiểm tra PII.

<a id="f14"></a>
## F14 — Phép đo lịch sử xác nhận nghẽn pool/round-trip; trạng thái hiện tại chưa được đo

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận từ artifact lịch sử; chưa kiểm chứng current deployment.

Báo cáo 08/09/2026: baseline 10 RPS dùng hết pool 10, queue tới 143; optimized ở bước 10 RPS p95 khoảng 17,24s và lỗi 21,02%, bước dừng sớm. Report p95 riêng khoảng 3,12s; ở 5 RPS vẫn có endpoint vượt ngưỡng latency. Dữ liệu hiện tại khác thời điểm/dataset/topology đó; loader hiện batch 100 trong source, report lịch sử mô tả batch 200.

**Tác động và giới hạn:** Có bằng chứng thực nghiệm từng nghẽn; không thể dùng số đo cũ làm capacity/SLA cho phiên bản đang chạy. Tăng pool đơn thuần không được chứng minh là giải pháp.

**Vị trí:**

- [backend2.0/docs/loadtest-2026-09-08/REPORT.md](<D:/University/Seatrans-website/seatrans/backend2.0/docs/loadtest-2026-09-08/REPORT.md:5>)
- [backend2.0/src/features/booking-documents/booking-report-loader.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/booking-documents/booking-report-loader.ts:52>)
- [backend2.0/src/shared/database/database.module.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/database/database.module.ts:38>)

**Cách kiểm chứng an toàn:** Đối chiếu REPORT.md/measurements.json/artifact-manifest với commit/version và source hiện tại. Không chạy lại loadtest hoặc EXPLAIN ANALYZE.

**Đề xuất khắc phục:** Ưu tiên giảm round trips/connection hold, giới hạn report/export và instrument pool wait/query time/queue depth. Chọn giải pháp sau số đo đúng topology, không suy CPU thấp là DB không nghẽn.

**Kiểm chứng còn thiếu/acceptance:** Đọc metrics current (nếu có quyền), đo lại staging cùng vùng DB, dataset đại diện, soak/overload/recovery có giới hạn.

<a id="f15"></a>
## F15 — Security audit logs và redaction chưa bao phủ đầy đủ

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận thiếu coverage từ source; leak log thực tế chưa xác nhận.

Có generic 5xx, safeErrorForLog và query metrics không log parameters. Nhưng login chỉ ghi lockout, không ghi mọi success/failure; authorization 4xx không được global filter ghi. Một số compensation catch truyền cleanupError.stack trực tiếp. Identifier/IP được nội suy vào lockout message thay vì structured/sanitized log.

**Tác động và giới hạn:** Khó điều tra ai truy cập/bị từ chối; lỗi từ dịch vụ ngoài có thể mang thông tin nhạy cảm vào raw stack. Chưa xác nhận log production có secret hoặc đã bị sửa.

**Vị trí:**

- [backend2.0/src/features/auth/login-throttle.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/auth/login-throttle.service.ts:130>)
- [backend2.0/src/shared/filters/global-exception.filter.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/filters/global-exception.filter.ts:130>)
- [backend2.0/src/features/inquiry/services/inquiry-document.service.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/features/inquiry/services/inquiry-document.service.ts:130>)
- [backend2.0/src/shared/database/query-metrics.logger.ts](<D:/University/Seatrans-website/seatrans/backend2.0/src/shared/database/query-metrics.logger.ts:10>)

**Cách kiểm chứng an toàn:** Kiểm kê logger/catch ở các luồng đã truy vết; các test redaction hiện có qua nhưng không bao phủ mọi callsite.

**Đề xuất khắc phục:** Thống nhất safe structured logging/correlation, bổ sung authentication/authorization/security events, log integrity/retention/alerting; không log credential/PII không cần thiết.

**Kiểm chứng còn thiếu/acceptance:** Test synthetic error có secret/newline, login success/fail/403, gửi log tới hệ thống tách biệt và kiểm tra cảnh báo.

<a id="f16"></a>
## F16 — Forgot-password và OTP là flow mô phỏng trong production build

**Ưu tiên:** P2. **Bằng chứng:** Đã xác nhận — source và route table production build.

/forgot-password chờ sleep(2000), báo đã gửi email rồi chuyển /otp mà không gọi backend. /otp hiển thị dữ liệu qua showSubmittedData, chờ timer rồi chuyển /, không xác minh mã hay phát session. Build production có cả hai route; sign-in có link Forgot password.

**Tác động và giới hạn:** Người dùng tưởng đã được gửi email/kiểm tra OTP, nhưng recovery không hoạt động. Đây không phải bằng chứng vượt AuthGuard backend: redirect client không tạo session.

**Vị trí:**

- [dashboard_admin/src/features/auth/forgot-password/components/forgot-password-form.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/features/auth/forgot-password/components/forgot-password-form.tsx:41>)
- [dashboard_admin/src/features/auth/otp/components/otp-form.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/features/auth/otp/components/otp-form.tsx:47>)
- [dashboard_admin/src/features/auth/sign-in/components/user-auth-form.tsx](<D:/University/Seatrans-website/seatrans/dashboard_admin/src/features/auth/sign-in/components/user-auth-form.tsx:124>)
- [evidence/dashboard-build.log](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/dashboard-build.log>)

**Cách kiểm chứng an toàn:** Đọc handler và production route table. Không gửi email, nhập OTP thật hoặc tạo tài khoản.

**Đề xuất khắc phục:** Ẩn flow mô phỏng khỏi production hoặc triển khai recovery/OTP backend thật có single-use/expiry/identity proofing; thêm test rằng UI không báo thành công khi không có server result.

**Kiểm chứng còn thiếu/acceptance:** Kiểm thử với địa chỉ và OTP giả trên staging; thất bại phải hiển thị đúng, không thể nhầm demo với MFA.

## Thứ tự khắc phục đề xuất

1. F01/F02: chốt field policy và chuyển phép tính EPDA sang backend; rà bundle/API/export cũ. Không dùng ẩn route/minify làm giải pháp.
2. F03/F04/F13: kiểm tra ACL storage/repo/deployment và dependency reachable; thiết kế private delivery/TTL, quản lý operational exports.
3. F05/F06/F07: sửa compensation/idempotency/CSV và kiểm thử mock + DB cô lập trong đợt triển khai riêng.
4. F08/F09/F11/F15/F16: hoàn thiện auth/recovery, CSP/cache, file scanning và audit logs.
5. F10/F12/F14: xác minh topology/TLS, thêm metrics/cap/cancellation và đo lại staging. Không tăng tải production trong đợt audit.

## Backlog database chỉ đọc

Đợt hiện tại không tự kết nối database live từ secret repo. Nếu chọn database đang cấu hình cho backend2.0, đợt đọc tiếp theo phải dùng direct pg session đã xác minh hoặc role read-only, đặt read-only ngay lúc kết nối và BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY; timeout ngắn; ROLLBACK/close sau từng batch. Không boot Nest vì lifecycle/services có thể ghi dữ liệu.

Chỉ đọc catalog/schema/index/constraint, counts/duplicate groups/orphan aggregates, quyền table/schema và RLS/Data API role exposure, pg_stat_activity/pg_stat_statements nếu đã có. Không tạo extension, ANALYZE, EXPLAIN ANALYZE, SELECT function/procedure có side effect, advisory locks, UPDATE/INSERT/DELETE/DDL, reset stats hoặc export nguyên customer rows. EXPLAIN không ANALYZE chỉ khi cần và được giới hạn query.

Cần đối chiếu schema/migration runtime thực sự, normalized identity/document keys, ownership relations, sequence state bằng cách đọc (không nextval/setval), row counts, index usage và pool/lock waits. Bằng chứng chỉ giữ aggregate/masked samples. Nếu không có quyền catalog/statistics, ghi chưa kiểm chứng thay vì thay đổi quyền.

## Backlog kiểm chứng triển khai

- Deployment commit + asset hash/OS/versions, origin ingress/proxy header overwrite và replica count.
- API role/owner/field matrix bằng fixture staging; anonymous/customer A/B/staff không section/admin.
- Storage ACL/authenticated delivery/expiry, URL public cũ và header hop cuối.
- Current TLS certificate/CA và network ACL; không dùng ignore certificate để biến lỗi thành pass.
- Current rate/error/latency/pool wait/queue depth; staging overload/soak/recovery sau khi được chọn làm đợt riêng.
- Biểu phí mẫu đã phê duyệt, input/expected total/rounding/tier boundary/override và độ đúng PDF. Golden regression không chứng minh giá đúng nghiệp vụ.
- Security log/alert/backup ACL/encryption/retention/restore và RTO/RPO; không thực hiện restore trong đợt chỉ đọc này.

## Kết quả không được diễn giải quá mức

- Default parity ba vùng không có khác biệt không chứng minh tất cả công thức hoặc đơn giá hiện hành đúng.
- Không thấy duplicate trên snapshot không chứng minh không có race/duplicate current DB.
- Không match secret trong build/history không chứng minh chưa từng leak hoặc không có secret encoded/retired.
- Dependency Critical không tự động là ứng dụng đã bị RCE; luôn kiểm tra điều kiện reachability.
- Mock race chứng minh luồng lỗi có thể xảy ra, không chứng minh đã có object orphan trong storage thật.
- Trang OTP redirect / không phát session và không chứng minh bypass backend authentication.
