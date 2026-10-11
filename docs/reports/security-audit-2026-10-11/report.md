# Đánh giá rò rỉ dữ liệu, công thức và độ ổn định Seatrans

Ngày đánh giá: **11/10/2026, Asia/Bangkok**. Phạm vi: **backend2.0 + dashboard_admin**, bao gồm dữ liệu/bản sao/log nằm trong hai repo. Website/frontend và backend Java cũ không được đưa vào điểm hoặc phát hiện.

## Kết luận cần hành động

**Chưa đạt yêu cầu công thức chỉ backend và chưa đủ cơ sở kết luận bảo mật đầy đủ.** Công thức/hệ số EPDA có trong production bundle; 5 asset tải được không cần đăng nhập ở server local cô lập. API nhân viên cũng trả bộ tham số. Có lỗi rollback upload và dấu vân tay idempotency được tái hiện bằng mock/pure code. Database hiện tại và việc đã có người lấy dữ liệu ở production chưa được kiểm chứng.

| Câu hỏi | Kết quả | Giới hạn |
|---|---|---|
| Có dữ liệu bị lộ ở đâu? | Công thức/hệ số trong JS công khai local; CSV nghiệp vụ trong Git; đường Cloudinary có cấu hình upload/public URL đáng lo | Không xác nhận đã exfiltrate dữ liệu production hoặc repo public Internet |
| Có công thức/secret trong frontend? | Có công thức/default/coeff trong source và production JS; 5 asset GET 200 không cookie | Không thấy exact known local secrets trong artifact/history; không phải bảo đảm không có secret lạ/cũ |
| Có trùng/lỗi? | Race rollback và idempotency collision xác nhận; recovery/OTP mô phỏng | Không thấy duplicate candidate theo khóa đã kiểm tra ở 3 snapshot lịch sử; không chứng minh DB current sạch |
| Công thức có sai không? | Mặc định HCM/QN/HN khớp frontend/backend; tests được chọn qua | Không có bộ đối chiếu biểu phí nghiệp vụ đã phê duyệt/live overrides để xác nhận đúng thực tế |
| Có nghẽn/không ổn định? | Số đo 08/09 xác nhận pool/round-trip bottleneck; PDF có nguy cơ waiter không giới hạn | Không đo tải mới/current topology; không ngoại suy RPS cũ thành số người dùng hiện tại |
| Đã bảo mật đầy đủ? | Không: còn thiếu MFA, audience, CSP/anti-cache, file scanning, logs và cảnh báo dependency | Đây là assessment source/build/snapshot, không phải pentest/chứng nhận ISO/ASVS |

## Điểm và độ phủ bằng chứng

**Điểm bảo đảm tối thiểu: 25.39/100. Độ phủ kiểm chứng theo trọng số: 72.79%.** Không đọc điểm này là “chỉ an toàn 25%”; unknown góp 0, điểm 3 yêu cầu kiểm chứng duy trì định kỳ, còn điểm 2 là đạt có bằng chứng. Các kết luận có phần kiểm chứng nhưng chưa đủ toàn bộ yêu cầu được chấm 1.

Bảng gồm **253 yêu cầu ASVS 5.0.0 Level 1–2 + 12 yêu cầu vận hành = 265 dòng**: 32 đạt, 80 đạt một phần, 23 không đạt, 71 chưa kiểm chứng, 59 không áp dụng. Không có điểm 3 thiếu bằng chứng vận hành định kỳ.

| Nhóm | Trọng số | Điểm nhóm /100 | Độ phủ % | Yêu cầu trong mẫu số |
|---|---:|---:|---:|---:|
| Quản trị rủi ro | 5% | 0.00 | 0.00 | 4 |
| Xác thực | 12% | 19.23 | 80.77 | 26 |
| Phân quyền | 18% | 33.33 | 100.00 | 7 |
| Phiên/token | 10% | 39.51 | 81.48 | 27 |
| Bảo vệ dữ liệu | 10% | 15.62 | 50.00 | 32 |
| An toàn đầu vào | 10% | 22.22 | 63.33 | 30 |
| Tệp/tài liệu | 8% | 33.33 | 88.89 | 9 |
| API/trình duyệt | 7% | 36.36 | 77.27 | 22 |
| Chống lạm dụng | 5% | 33.33 | 100.00 | 3 |
| Nhật ký/phát hiện | 5% | 15.69 | 52.94 | 17 |
| Phụ thuộc/triển khai | 5% | 11.54 | 42.31 | 26 |
| Phục hồi/ứng phó | 5% | 22.22 | 66.67 | 3 |

Công thức: điểm nhóm = tổng điểm yêu cầu / (3 × số yêu cầu áp dụng); điểm tổng = tổng điểm nhóm × trọng số / tổng trọng số áp dụng. Unknown giữ trong mẫu số, N/A có lý do và bị loại; mỗi yêu cầu chỉ có một nhóm chính. Độ phủ dùng cùng trọng số và tính các yêu cầu đã có kết luận (kể cả partial/fail), không đồng nghĩa tỷ lệ pass.

Các yêu cầu bắt buộc chưa đạt/chưa kiểm chứng và các P1 khiến kết luận cuối là **chưa đạt bộ tiêu chí nội bộ**. Không gộp điểm bảo mật với đúng đắn/hiệu năng.

## Phát hiện ưu tiên

| ID | Ưu tiên | Phát hiện | Bằng chứng |
|---|---|---|---|
| [F01](findings-and-verification.md#f01) | P1 | Công thức và hệ số EPDA được phát trong bundle công khai | Đã xác nhận — source, production build và GET local không cookie |
| [F02](findings-and-verification.md#f02) | P1 | API trả bộ tham số/biểu phí nội bộ xuống dashboard | Đã xác nhận — đường source/mapper; chưa gọi API live |
| [F03](findings-and-verification.md#f03) | P1 | Cloudinary upload public mặc định và signed URL không mang TTL như dự kiến | Đã xác nhận — source và SDK với credential giả; quyền object live chưa kiểm chứng |
| [F04](findings-and-verification.md#f04) | P1 | Dependency production có advisory High/Critical | Đã xác nhận — pnpm lockfile audit và advisory chính thức; exploitation production chưa kiểm chứng |
| [F05](findings-and-verification.md#f05) | P1 | Rollback upload song song không chờ worker còn chạy | Đã xác nhận — orchestrator thật, repository/storage mock |
| [F06](findings-and-verification.md#f06) | P2 | Idempotency không phân biệt nội dung file và có khoảng hở sau commit | Đã xác nhận hash collision nghiệp vụ; retry sau crash là nguy cơ từ source |
| [F07](findings-and-verification.md#f07) | P2 | CSV export giữ tiền tố công thức bảng tính | Đã xác nhận — serializer thật với ô giả vô hại |
| [F08](findings-and-verification.md#f08) | P1 | Xác thực chưa đạt ASVS Level 2 và mật khẩu dài bị bcrypt cắt | Đã xác nhận source; password truncation tái hiện bằng bcrypt thật |
| [F09](findings-and-verification.md#f09) | P2 | CSP, cookie prefix và anti-cache chưa đầy đủ | Đã xác nhận source và header dashboard local; cache production chưa kiểm chứng |
| [F10](findings-and-verification.md#f10) | P2 | Giới hạn chống lạm dụng theo process và hàng đợi PDF chưa có hard cap | Nguy cơ có căn cứ — source; quy mô/topology production chưa kiểm chứng |
| [F11](findings-and-verification.md#f11) | P2 | Kiểm tra file chưa đồng nhất và chưa có malware scanning | Đã xác nhận phần code thiếu; bảo vệ provider chưa kiểm chứng |
| [F12](findings-and-verification.md#f12) | P2 | Có đường cấu hình TLS database không xác minh certificate | Nguy cơ có căn cứ — source và phép đo lịch sử; config live chưa kiểm chứng |
| [F13](findings-and-verification.md#f13) | P1 | Bốn CSV dữ liệu nghiệp vụ thật được theo dõi trong Git | Đã xác nhận — git ls-files và đọc CSV chỉ xuất aggregate |
| [F14](findings-and-verification.md#f14) | P2 | Phép đo lịch sử xác nhận nghẽn pool/round-trip; trạng thái hiện tại chưa được đo | Đã xác nhận từ artifact lịch sử; chưa kiểm chứng current deployment |
| [F15](findings-and-verification.md#f15) | P2 | Security audit logs và redaction chưa bao phủ đầy đủ | Đã xác nhận thiếu coverage từ source; leak log thực tế chưa xác nhận |
| [F16](findings-and-verification.md#f16) | P2 | Forgot-password và OTP là flow mô phỏng trong production build | Đã xác nhận — source và route table production build |

P1 = cần ưu tiên xử lý rủi ro/vi phạm policy; P2 = cần xử lý có kế hoạch. Priority không phải CVSS và không chứng minh exploit production. Chưa có căn cứ gắn P0 đang bị khai thác. Một phát hiện chỉ xuất hiện một lần dù liên quan nhiều tiêu chí.

## Những kiểm soát đã xác minh tích cực

- Session dùng cookie HttpOnly/Secure production/SameSite; auth response không trả JWT để lưu localStorage. Frontend chỉ lưu profile display.
- Logout/disable/đổi role/reset password dùng sessionVersion và validate current user; QueryClient clear khi logout, kể cả HTTP logout thất bại.
- Ownership check trên customer inquiry/document, data audience=user loại snapshot nội bộ; admin dùng JWT/INTERNAL/section guard. Chưa kiểm chứng mọi route hoặc storage ACL.
- DTO whitelist/validation server, query tham số hóa trong luồng rà soát, output escaping và sanitizer post.
- Upload disk-backed, byte/concurrency limits, upstream deadline, pool max/acquire/statement/lock timeouts, health/readiness và shutdown hooks.
- EPDA snapshot version 3 dựng lại từ dữ liệu lưu ở server, không tin client totals khi freeze unlocked inquiry. Chưa chuyển phép tính/render EPDA hoàn toàn sang server.

## Kiểm chứng đã thực hiện

| Kiểm chứng | Kết quả | Điều kiện |
|---|---|---|
| backend production build | exit 0 | Bản sao source; không copy .env; chặn TCP/fetch ngoài; không khởi động Nest |
| backend tests được chọn | 341 pass / 0 fail | Mock/pure unit/flow; không kết nối database/provider |
| dashboard production build | exit 0 | Bản sao source; không copy .env; chặn TCP/fetch ngoài; không khởi động Nest |
| dashboard tests được chọn | 153 pass / 0 fail | Mock/pure unit/flow; không kết nối database/provider |
| Asset formula local | 5/5 HTTP 200 không cookie/auth; hash đúng build | Chỉ GET loopback; server được dừng sau kiểm tra |
| Logic reproductions | Upload race, hash collision, CSV prefix, bcrypt truncation, Cloudinary TTL đều tái hiện | Dữ liệu giả, repository/upload mock hoặc pure SDK |
| Default parity HCM/QN/HN | Không có field khác biệt ở ba bộ mặc định | Chưa xác minh live overrides/biểu phí được phê duyệt |
| Git history | 5.370 reachable text blobs; không match known local secret/private-key marker | Exact-match + targeted regex; không fetch remote/unreachable history |
| Browser artifact secrets | Không match known local secret values | Current build/public/existing artifact; không thay chuyên dụng secret scanner |
| Dependency audit | Backend 22 / dashboard 20 advisory theo registry | Production dependency lockfile; chưa xác nhận exploitation |

Build dashboard lần đầu lỗi vì junction dependency khác ổ đĩa; test đầu tiên lệch URL do audit env override. Sau khi dùng bản sao cùng ổ đĩa và cấu hình same-origin phù hợp, build/test đều qua. Hai lỗi điều kiện audit này không được ghi thành lỗi ứng dụng.

## Database chỉ đọc và dữ liệu trùng

**Không có kết nối database live trong đợt này.** Đã đọc 3 PostgreSQL dump bằng pg_restore --file=-, phân tích COPY trong memory, không thực thi SQL/restore/migration. Không sử dụng credential repo để tự kết nối production. Các bản sao không đồng thời và không phản ánh trạng thái 11/10/2026.

| Bản sao | Số bảng COPY | Users | Booking partners | Booking records | Shipping inquiry | Inquiry documents |
|---|---:|---:|---:|---:|---:|---:|
| backend2.0/.loadtest/source.dump | 42 | 11 | 129 | 329 | 11 | 0 |
| backend2.0/migration-backups/booking-partner-address-only-2026-09-25T12-18-45-438Z.dump | 78 | 11 | 134 | 348 | 13 | 0 |
| backend2.0/migration-backups/booking-partner-approval-2026-09-23T04-05-15-023Z.dump | 78 | 11 | 134 | 348 | 13 | 0 |

Không có duplicate candidates cho các khóa tồn tại đã kiểm tra: normalized user email/username, role name, customer_id, inquiry code, booking/BL/AN/DO number, group port và location name trong port. Các bảng rỗng không cung cấp bằng chứng tính toàn vẹn. Kiểm tra orphan hiện bao phủ explicit relationships có dữ liệu/đủ cột; chưa phải kiểm tra tất cả FK/business relations. Snapshot ghi schema/index nhưng không chứng minh migration/constraint hiện tại đã áp dụng.

Bốn CSV theo dõi trong Git là cùng một export 1.042 dòng lặp lại thành file; mỗi file không có dòng giống hệt. Không dùng số file export để suy ra số bản ghi trùng database.

## Giới hạn và các phần chưa kiểm chứng

- Chưa biết deployment commit, OS, replica/edge, remote repo ACL, object ACL, TLS certificate/current env và metrics live; không tuyên bố leak/exploit production từ source riêng lẻ.
- Chưa có xác minh dataset hiện tại, full role/IDOR matrix HTTP, nghiệp vụ biểu phí đã phê duyệt, scan malware thực tế, DR restore/RTO/RPO và alert delivery.
- Tests được chọn không phải toàn bộ suite; build/test pass không thay security assessment. Chưa chạy load/soak/fuzz/pentest trên live.
- Git sweep là reachable local refs và exact known secrets; có thể bỏ sót retired/different/encoded secrets, LFS/remote-only/unreachable blobs. Không thấy match không đồng nghĩa mọi secret an toàn.
- Không có bằng chứng cho khẳng định “chưa từng bị lấy dữ liệu”; cần access/security log và investigation ngoài phạm vi repo.

## Hiện trạng và tính tái lập

- dashboard_admin: HEAD `43a95bfdca6c06bcd38770e8bfb9fbab02940d71`; 15 thay đổi/untracked tại baseline. Đánh giá source working tree, không chỉ commit.
- backend2.0: HEAD `21d30364e5acd9b5201501418650f4174cdab272`; 0 thay đổi/untracked tại baseline. Đánh giá source working tree, không chỉ commit.

Hash source tại evidence/source-hashes.json; full baseline tại evidence/baseline.json. Backend ban đầu sạch; các sửa/untracked dashboard của người dùng được giữ nguyên. Không sửa source/API/lockfile, không migration/import/seed/rotate secret/deploy. Báo cáo và script kiểm chứng nằm riêng trong thư mục này.

Scripts: collect-evidence.py → verify-isolated.py prepare/build/tests → verify-data-and-history.py → verify-local-cases.py → create-scorecard.py → create-report.py. Các runner phục vụ audit, không phải script production. Dependency audit cần registry; build/mock tests bị chặn TCP. Không chạy lại bất kỳ script migration có sẵn.

## Căn cứ và nguồn

- [OWASP ASVS 5.0.0 release](https://github.com/OWASP/ASVS/tree/v5.0.0_release); bản CSV nguồn và SHA256 tại evidence/asvs-source.json. Giữ mã yêu cầu kèm phiên bản. Nội dung chuẩn gốc thuộc OWASP, theo Creative Commons Attribution-ShareAlike 4.0; annotations là đánh giá nội bộ, không phải xác nhận OWASP.
- [ISO/IEC 27001](https://www.iso.org/standard/27001), [ISO/IEC 27002](https://www.iso.org/standard/75652.html), [NIST CSF 2.0](https://www.nist.gov/cyberframework): dùng định hướng tiêu chí vận hành, không tuyên bố chứng nhận.
- [Cloudinary media access](https://cloudinary.com/documentation/control_access_to_media), [upload parameters](https://cloudinary.com/documentation/upload_parameters): đối chiếu public/authenticated và signed download.
- Advisory links và điều kiện được ghi tại F04/evidence dependency JSON; số liệu hiệu năng là artifact lịch sử trong backend2.0, không phải phép đo mới.

## Tệp bàn giao và kiểm tra cuối

- [Bảng 265 tiêu chí; cột evidence_links dẫn tới source/bằng chứng](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/scorecard.csv>).
- [Danh mục công thức, 16 phát hiện và cách kiểm chứng](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/findings-and-verification.md>).
- [Kết quả kiểm tra độc lập điểm, liên kết, bảo toàn source và dữ liệu](<D:/University/Seatrans-website/seatrans/docs/reports/security-audit-2026-10-11/evidence/verification-summary.json>). Runner verify-deliverables.py đối chiếu lại 969 hash source, HEAD/status Git, hash dump/CSV và known secret values trong đầu ra; không kết nối database.
