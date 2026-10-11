"""Evidence-based ASVS scorecard; unknown is explicit, never a synthetic pass."""
import csv,json,re
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
E=OUT/'evidence'
groups={
 'governance':('Quản trị rủi ro',5),'authentication':('Xác thực',12),'authorization':('Phân quyền',18),
 'session':('Phiên/token',10),'data':('Bảo vệ dữ liệu',10),'input':('An toàn đầu vào',10),
 'files':('Tệp/tài liệu',8),'web':('API/trình duyệt',7),'availability':('Chống lạm dụng',5),
 'logging':('Nhật ký/phát hiện',5),'deployment':('Phụ thuộc/triển khai',5),'recovery':('Phục hồi/ứng phó',5)}
chapter_group={'V1':'input','V2':'input','V3':'web','V4':'web','V5':'files','V6':'authentication','V7':'session','V8':'authorization','V9':'session','V10':'session','V11':'data','V12':'data','V13':'deployment','V14':'data','V15':'deployment','V16':'logging','V17':'web'}
default_evidence={
 'input':'backend2.0/src/config/global-validation.ts; backend2.0/src/features/post/sanitize-post-content.ts',
 'web':'backend2.0/src/configure-app.ts; dashboard_admin/next.config.mjs',
 'files':'backend2.0/src/shared/uploads/inquiry-file-validation.ts; backend2.0/src/shared/services/cloudinary.service.ts',
 'authentication':'backend2.0/src/features/auth/auth.service.ts; backend2.0/src/features/auth/auth.controller.ts',
 'session':'backend2.0/src/features/auth/strategies/jwt.strategy.ts; backend2.0/src/features/auth/session-policy.ts',
 'authorization':'backend2.0/src/shared/decorators/admin-section.decorator.ts; backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts',
 'data':'backend2.0/src/shared/database/database-ssl.ts; evidence/git-history-exact-secret-sweep.json',
 'deployment':'backend2.0/.github/workflows/backend-checks.yml; dashboard_admin/next.config.mjs',
 'logging':'backend2.0/src/shared/logging/safe-error-log.ts; backend2.0/src/shared/filters/global-exception.filter.ts'}
annotations={}
def setrows(ids,status,score,note,evidence,verification='',findings=''):
 for id in ids.split():
  annotations[id]={'status':status,'score':score,'notes_vi':note,'evidence':evidence,'verification_remaining':verification,'finding_ids':findings}
def passed(ids,note,evidence):setrows(ids,'Đạt',2,note,evidence)
def partial(ids,note,evidence,verification,findings=''):setrows(ids,'Đạt một phần',1,note,evidence,verification,findings)
def failed(ids,note,evidence,verification,findings):setrows(ids,'Không đạt',0,note,evidence,verification,findings)
def na(ids,note):setrows(ids,'Không áp dụng','',note,'evidence/source-hashes.json; kiểm kê entrypoint/module trong hai repo','Xác định lại tính áp dụng nếu bổ sung chức năng.')

na('V1.2.5 V1.2.6 V1.2.7 V1.2.8 V1.3.8 V1.3.9 V1.3.11','Không tìm thấy luồng runtime chạy lệnh OS, LDAP, XPath, LaTeX, JNDI, memcache hoặc mail; script vận hành không phải endpoint ứng dụng. Regex .exec không phải OS exec.')
na('V4.3.1 V4.3.2 V4.4.1 V4.4.2 V4.4.3 V4.4.4','Ứng dụng dùng REST; không có endpoint GraphQL/WebSocket nghiệp vụ. WebSocket dev của Next không phải chức năng production.')
na('V6.5.1 V6.5.2 V6.5.3 V6.5.4 V6.5.5 V6.6.1 V6.6.2 V6.6.3 V6.8.3','Không triển khai OTP/TOTP/lookup secrets/SMS/SAML trong phạm vi; MFA tổng thể vẫn bị chấm không đạt tại V6.3.3.')
na('V7.2.3','Phiên dùng JWT self-contained, không dùng reference session token.')
na('V8.4.1','Không có mô hình tenant nghiệp vụ riêng trong hai repo; phân quyền theo user/role/section vẫn áp dụng tại V8.2.*.')
na('V10.2.2','Chỉ có một OAuth provider Google với URL cố định, không có lựa chọn nhiều authorization server.')
na('V10.3.1 V10.3.2 V10.3.3 V10.3.4','Backend không nhận Google access token làm token phân quyền tài nguyên; chỉ dùng token với Google userinfo rồi phát hành phiên riêng. JWT riêng chấm tại V9.')
na(' '.join(f'V10.4.{n}' for n in range(1,12)),'Không triển khai OAuth authorization server; Google là dịch vụ ngoài. Không coi đây là đánh giá bảo đảm nhà cung cấp.')
na('V10.5.1 V10.5.2 V10.5.3 V10.5.4 V10.5.5 V10.6.1 V10.6.2 V10.7.1 V10.7.2 V10.7.3','Không dùng ID token/OIDC provider/back-channel logout/consent server trong ứng dụng; Google code flow + userinfo vẫn chấm tại V10.1/V10.2 và V6.8.')
na('V12.1.3','Không triển khai xác thực bằng mTLS client certificate.')
na('V17.1.1 V17.2.1 V17.2.2 V17.2.3 V17.2.4 V17.3.1 V17.3.2','Không có WebRTC/TURN/media/signaling server trong phạm vi.')

partial('V1.1.2 V1.2.1','React escape + quote renderer escapeHtml và sanitize filename đã được rà soát; CSV vẫn giữ tiền tố công thức.', 'dashboard_admin/src/modules/inquiries/components/common/quoteCommon.ts; backend2.0/src/features/port-operations/services/port-operation-report.service.ts:244; evidence/pure-reproductions.json','Kiểm tra đủ ngữ cảnh HTML/URL/header/export và trung hòa CSV formula.','F07')
partial('V1.2.2 V1.2.3 V1.2.4','URL encode/JSON serializer và SQL tham số hóa hiện diện trong luồng chính; chưa chứng minh mọi endpoint/query.', 'backend2.0/src/features/inquiry/services/inquiry-query.service.ts; backend2.0/src/features/booking-documents/booking-document-bulk-download.service.ts','Hoàn tất ma trận tất cả query/URL động và kiểm thử injection trên staging.')
partial('V1.3.1','Có sanitize-html ở server với allowlist; dependency đang có advisory, chưa xác nhận exploit với cấu hình chỉ cho phép tag hiện tại.', 'backend2.0/src/features/post/sanitize-post-content.ts; evidence/backend-dependencies.json','Nâng bản phù hợp rồi kiểm thử stored XSS theo policy tag.','F04')
passed('V1.3.2','Không có eval/new Function/SpEL trong runtime hai repo; renderer dùng hàm và template dữ liệu có escape.', 'dashboard_admin/src/modules/inquiries/components/common/quoteVariantRenderer.ts; backend2.0/src/features/post/sanitize-post-content.ts')
partial('V1.3.3 V1.3.7','Có whitelist DTO và template rendering escape; chưa phủ toàn bộ input/ngữ cảnh.', 'backend2.0/src/config/global-validation.ts; dashboard_admin/src/modules/inquiries/components/common/quoteCommon.ts','Kiểm thử ngữ cảnh nguy hiểm ở mọi renderer/export.')
partial('V1.4.2 V1.5.2','Có kiểm tra số hữu hạn, khoảng giá trị, DTO whitelist và JSON deserialize; chưa phủ mọi input.', 'backend2.0/src/config/global-validation.ts; backend2.0/src/features/epda-parameters/epda-parameter-values.validation.ts','Fuzz input, numeric overflow, prototype pollution và query pollution.')
partial('V1.4.3','apiClient cleanup đã qua test; upload song song có nhánh hoàn tất sau rollback.', 'dashboard_admin/src/shared/utils/apiClient.ts; backend2.0/src/shared/utils/map-with-concurrency.ts; evidence/pure-reproductions.json','Đợi mọi worker settle/cancel trước compensation; kiểm thử cleanup khi nhiều file lỗi.','F05')
partial('V2.2.1 V2.2.2 V2.2.3','Global whitelist/validation và ràng buộc port/commodity/tariff được thực thi tại server; chưa phủ mọi tính toán/nghiệp vụ.', 'backend2.0/src/config/global-validation.ts; backend2.0/src/features/inquiry/services/shipping-agency-epda.service.ts; evidence/backend-tests.json','Kiểm chứng tất cả endpoint và test giá trị biên.')
partial('V2.3.1 V2.3.2','Có state machine, version checks và limits; dấu vân tay idempotency bỏ qua nội dung file.', 'backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts:28; evidence/pure-reproductions.json','Bổ sung checksum file; kiểm tra retry/cùng key khác payload.','F06')
partial('V2.3.3','Có transaction và compensation, nhưng upload rollback xảy ra trước khi worker khác hoàn tất; claim idempotency hoàn tất sau commit inquiry.', 'backend2.0/src/features/inquiry/services/service-inquiry.service.ts; backend2.0/src/features/inquiry/services/inquiry-document.service.ts; evidence/pure-reproductions.json','Kiểm thử fault-injection trong mock; liên kết claim/result atomic với bản ghi.','F05 F06')
partial('V2.3.4','Có lock/optimistic version/advisory lock; các test concurrency được chọn dùng mock, không xác nhận constraint live.', 'backend2.0/src/features/epda-parameters/epda-parameters.service.ts; evidence/backend-tests.json','Kiểm tra constraint/index live bằng phiên chỉ đọc và test đồng thời trên DB cô lập.')
partial('V2.4.1','Có global throttler, login throttle, upload gate và giới hạn batch; storage đều trong process.', 'backend2.0/src/app.module.ts; backend2.0/src/features/auth/login-throttle.service.ts; backend2.0/src/shared/uploads/upload-concurrency.gate.ts','Xác nhận replica/edge và triển khai bộ đếm chung khi scale.','F10')
annotations['V2.4.1']['group_override']='availability'

partial('V3.2.1','Attachment/nosniff được đặt ở các download chính; R2/Cloudinary hop cuối chưa kiểm chứng.', 'backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts; backend2.0/src/features/booking-documents/booking-documents-admin.controller.ts','Kiểm tra header của object và file render cuối.','F03')
passed('V3.2.2','Các renderer đã đọc dùng React/text escaping; kiểm soát HTML post theo sanitizer server.', 'dashboard_admin/src/modules/inquiries/components/common/quoteCommon.ts; backend2.0/src/features/post/sanitize-post-content.ts')
partial('V3.3.1','Cookie có Secure trong production nhưng tên auth_token/oauth_state không có __Secure-/__Host- theo ASVS.', 'backend2.0/src/features/auth/auth-cookie.ts:19; backend2.0/src/features/auth/oauth-state.ts','Đổi tên/prefix và kiểm thử BFF/clear cookie tương thích.')
passed('V3.3.2 V3.3.4','Cookie session HttpOnly, SameSite=Lax; API không trả JWT trong body, client chỉ giữ profile.', 'backend2.0/src/features/auth/auth-cookie.ts; backend2.0/src/features/auth/auth.controller.ts; evidence/backend-tests.json; evidence/dashboard-tests.json')
failed('V3.3.3','Cookie session không dùng __Host- và không có tài liệu yêu cầu chia sẻ cookie khác host.', 'backend2.0/src/features/auth/auth-cookie.ts','Đổi tên cookie và kiểm thử proxy/session.','F09')
passed('V3.4.1 V3.4.4 V3.4.6','Build production trả HSTS >=1 năm includeSubDomains, nosniff và frame-ancestors none trên asset local.', 'dashboard_admin/next.config.mjs; evidence/local-unauthenticated-formula-assets.json')
passed('V3.4.2','CORS production từ allowlist; environment resolver từ chối wildcard.', 'backend2.0/src/configure-app.ts; backend2.0/src/config/environment.ts; evidence/backend-tests.json')
failed('V3.4.3','CSP dashboard chỉ có base-uri self/form-action/frame-ancestors/object-src, thiếu script-src/default-src allowlist/nonce/hash; không đạt yêu cầu ASVS.', 'dashboard_admin/next.config.mjs:31; evidence/local-unauthenticated-formula-assets.json','Thiết kế CSP script/style theo nonce/hash và kiểm tra tương thích.','F09')
partial('V3.4.5','Có strict-origin-when-cross-origin; hostname nội bộ vẫn có thể đi trong Referer; chưa có phân loại dữ liệu hostname.', 'dashboard_admin/next.config.mjs','Chọn referrer policy theo phân loại thông tin và kiểm tra tích hợp.')
passed('V3.5.1','Có Origin/Referer allowlist cho cookie mutations, auth-cookie mutation paths; test mock CSRF qua.', 'backend2.0/src/shared/security/csrf-origin.ts; evidence/backend-tests.json')
na('V3.5.2','Không chỉ dựa CORS preflight: server có middleware Origin/Referer độc lập cho cookie-auth mutations.')
partial('V3.5.3','Phần lớn mutation dùng POST/PUT/PATCH/DELETE; logout là POST; chưa rà soát mọi GET có side effect như view counter.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/features/post/posts.service.ts','Lập ma trận GET side effects và ranh giới session/security-sensitive.')
passed('V3.7.1','Dashboard dùng React/Next; không có Flash/ActiveX/applet runtime.', 'dashboard_admin/package.json; evidence/source-hashes.json')
partial('V3.7.2','OAuth redirect origin lấy allowlist cấu hình; download object có signed URL và fallback legacy cần xác minh.', 'backend2.0/src/features/auth/oauth2.controller.ts; backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts','Kiểm tra URL legacy/Cloudinary và redirect ngoài origin.','F03')
partial('V4.1.1','Nest JSON và file download có Content-Type; header của dịch vụ storage cuối chưa kiểm chứng.', 'backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts; evidence/local-unauthenticated-formula-assets.json','Kiểm tra HTTP headers mọi response dạng file và lỗi.')

partial('V5.1.1','Có allowlist/limits bằng mã; chưa có quy trình quarantine/phát hiện malware đầy đủ.', 'backend2.0/src/shared/uploads/inquiry-file-validation.ts; backend2.0/src/shared/uploads/upload-limits.ts','Tài liệu hóa xử lý malware và loại file từng chức năng.','F11')
passed('V5.2.1','Disk-backed upload, tổng byte/file/concurrency cap và test OOM protection qua.', 'backend2.0/src/shared/uploads/bounded-disk.storage.ts; backend2.0/src/shared/uploads/upload-limits.ts; evidence/backend-tests.json')
partial('V5.2.2','Inquiry kiểm tra extension/magic; gallery filter dựa MIME client, storage chấp nhận MIME client; chưa đầy đủ cho mọi upload.', 'backend2.0/src/shared/uploads/inquiry-file-validation.ts; backend2.0/src/features/gallery/gallery-admin.controller.ts; backend2.0/src/features/storage/storage-admin.controller.ts','Kiểm chứng nội dung, rewrite image và phạm vi file storage.','F11')
partial('V5.3.1','Upload lưu ở Cloudinary/R2 không phải local executable public route; content delivery cuối chưa kiểm chứng.', 'backend2.0/src/shared/services/cloudinary.service.ts; backend2.0/src/shared/services/r2-storage.service.ts','Kiểm tra object content disposition/content type và bucket policy.')
passed('V5.3.2','Storage key và attachment filename dùng validation/normalization ở server; bulk download tạo tên bằng allowlist.', 'backend2.0/src/shared/services/storage-key.util.ts; backend2.0/src/features/booking-documents/booking-document-bulk-download.service.ts; evidence/backend-tests.json')
partial('V5.4.1 V5.4.2','Inquiry/bulk download sanitizes filename; R2 hop cuối chưa xác nhận.', 'backend2.0/src/shared/uploads/inquiry-file-validation.ts; backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts','Kiểm chứng mọi kiểu download và header trên storage.')
failed('V5.4.3','Không có luồng quét malware trong upload/download; magic bytes không phải antivirus.', 'backend2.0/src/shared/uploads/inquiry-file-validation.ts; backend2.0/src/shared/services/cloudinary.service.ts','Bổ sung quarantine/quét malware trước khi cấp download.','F11')

passed('V6.2.1','Register/create/reset password DTO yêu cầu tối thiểu 8 ký tự.', 'backend2.0/src/features/auth/dto/register.dto.ts; backend2.0/src/features/users/dto/reset-user-password.dto.ts')
failed('V6.2.2 V6.2.3','Không có chức năng tự đổi mật khẩu trong backend/dashboard hiện tại; chỉ có admin reset-password.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/features/users/controllers/admin-users.controller.ts','Bổ sung self-service change password yêu cầu current/new và revoke phiên.','F08')
failed('V6.2.4 V6.2.11 V6.2.12','Không có kiểm tra danh sách mật khẩu phổ biến/breached/context-specific trong đường đặt mật khẩu.', 'backend2.0/src/features/auth/dto/register.dto.ts; backend2.0/src/features/users/dto/reset-user-password.dto.ts','Thêm kiểm tra denylist phù hợp và không log mật khẩu.','F08')
failed('V6.2.5','Register bắt buộc uppercase/lowercase/digit, trái yêu cầu ASVS không áp composition rules.', 'backend2.0/src/features/auth/dto/register.dto.ts:36','Chuyển sang length + common/breached-password policy.','F08')
passed('V6.2.6 V6.2.7','Login form có password masking và không chặn paste/password manager.', 'dashboard_admin/src/features/auth/sign-in/components/user-auth-form.tsx')
failed('V6.2.8','bcrypt trực tiếp cắt sau 72 byte; tái hiện hai mật khẩu 73 byte khác nhau vẫn compare bằng nhau.', 'backend2.0/src/features/auth/auth.service.ts; evidence/pure-reproductions.json','Dùng thuật toán không cắt ngầm hoặc migration/prehash có thiết kế và test Unicode/byte length.','F08')
partial('V6.2.9','DTO chấp nhận 64 ký tự nhưng bcrypt có giới hạn 72 byte nên chưa hỗ trợ đúng mật khẩu Unicode dài.', 'backend2.0/src/features/auth/dto/register.dto.ts; evidence/pure-reproductions.json','Kiểm thử mật khẩu 64 ký tự nhiều byte.','F08')
passed('V6.2.10','Không có bắt buộc xoay mật khẩu định kỳ trong source/runtime config đã kiểm kê.', 'backend2.0/src/features/auth/auth.service.ts; backend2.0/src/features/users/admin-users.service.ts')
partial('V6.3.1','Login cap/lockout được triển khai và test mock qua; IP trust/replica/edge live chưa kiểm chứng.', 'backend2.0/src/features/auth/login-throttle.service.ts; backend2.0/src/app.module.ts; evidence/backend-tests.json','Kiểm tra topology proxy và storage chia sẻ khi scale.','F10')
failed('V6.3.3','Không có MFA hoặc chuỗi xác thực nhiều yếu tố; Google login không kiểm tra amr/acr.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/features/auth/oauth2.controller.ts','Triển khai MFA cho nhân viên/admin và quản lý recovery tương ứng.','F08')
partial('V6.3.4','Hai pathway local/Google được kiểm kê, Google xác minh email/state; chưa bảo đảm mức xác thực tương đương/MFA.', 'backend2.0/src/features/auth/oauth2.controller.ts; backend2.0/src/features/auth/auth.controller.ts','Đánh giá assurance của mọi pathway.','F08')
failed('V6.4.1','Admin đặt mật khẩu trực tiếp, không có initial-secret expiration/force-change sau lần dùng đầu.', 'backend2.0/src/features/users/admin-users.service.ts; backend2.0/src/features/users/dto/create-internal-user.dto.ts','Thêm activation/force-change cho account mới theo policy.','F08')
passed('V6.4.2','Không có password hints/secret questions trong chức năng hiện tại.', 'backend2.0/src/features/auth/dto/register.dto.ts; dashboard_admin/src/features/auth')
failed('V6.4.3','Không có forgot-password recovery tự phục vụ; admin reset chưa có step-up MFA.', 'backend2.0/src/features/users/controllers/admin-users.controller.ts','Thiết kế recovery có identity verification, single-use expiry và MFA policy.','F08')
partial('V6.8.1','Google identity lookup dùng provider+providerId và verified email; tự động link email cần policy assurance.', 'backend2.0/src/features/auth/auth.service.ts; backend2.0/src/features/auth/oauth2.controller.ts','Kiểm chứng linking/reassignment và IdP assurance.')
partial('V6.8.2','JWT session dùng passport signature verification; Google userinfo qua HTTPS không phải assertion ID token được xác minh trực tiếp.', 'backend2.0/src/features/auth/strategies/jwt.strategy.ts; backend2.0/src/features/auth/oauth2.controller.ts','Kiểm thử JWT algorithm/issuer/audience và xác định cơ chế IdP.')
failed('V6.8.4','Không kiểm tra IdP acr/amr và không có fallback assurance được tài liệu hóa cho thao tác nhạy cảm.', 'backend2.0/src/features/auth/oauth2.controller.ts','Gắn yêu cầu step-up/recentness cho thao tác nhạy cảm.','F08')

partial('V7.1.1','Có policy idle/absolute/remember bằng mã và test; chưa có risk rationale đối chiếu NIST.', 'backend2.0/src/features/auth/session-policy.ts; evidence/backend-tests.json','Bổ sung quyết định lifetime theo rủi ro và kiểm tra cấu hình triển khai.')
passed('V7.2.1 V7.2.2','Backend xác minh JWT động, expiration/sessionVersion/current user; không dùng static API key làm session.', 'backend2.0/src/features/auth/strategies/jwt.strategy.ts; backend2.0/src/features/auth/auth.service.ts; evidence/backend-tests.json')
partial('V7.2.4','Login phát token mới nhưng không bump sessionVersion để vô hiệu token đã phát trước login.', 'backend2.0/src/features/auth/auth.service.ts','Chốt chính sách concurrent sessions và kiểm thử rotation/re-auth.')
partial('V7.3.1 V7.3.2','Idle và absolute ceiling hiện diện và test qua; risk decision/documentation chưa đầy đủ.', 'backend2.0/src/features/auth/session-policy.ts; backend2.0/src/features/auth/strategies/jwt.strategy.ts; evidence/backend-tests.json','Xác nhận runtime TTL và rationale.')
passed('V7.4.1 V7.4.2','Logout/account disable/password/role changes bump sessionVersion; validateUserContext từ DB kiểm tra isActive/version.', 'backend2.0/src/features/auth/auth.service.ts; backend2.0/src/features/users/admin-users.service.ts; evidence/backend-tests.json')
partial('V7.4.3 V7.4.5','Admin reset/disable có revoke all; người dùng chưa có UI quản lý session hoặc tự đổi password.', 'backend2.0/src/features/users/admin-users.service.ts','Bổ sung self-service session management và revoke-all rõ ràng.','F08')
passed('V7.4.4','Dashboard có logout; terminateAuthSession xóa QueryClient ngay cả khi logout HTTP thất bại.', 'dashboard_admin/src/modules/auth/services/authSession.ts; evidence/dashboard-tests.json')
failed('V7.5.2','Không có danh sách và quản lý các phiên đang hoạt động cho người dùng.', 'backend2.0/src/features/auth/auth.controller.ts; dashboard_admin/src/modules/auth/services/authService.ts','Thiết kế session inventory/re-auth/revoke.','F08')
passed('V7.6.2','Session phát sau login/register hoặc callback có state gắn user agent; không tự phát từ unauthenticated GET.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/features/auth/oauth-state.ts; evidence/backend-tests.json')

partial('V8.1.1 V8.1.2','Có section catalog/guards/mapper user vs admin; chưa có access matrix đầy đủ cho field/data.', 'backend2.0/src/shared/decorators/admin-section.decorator.ts; backend2.0/src/features/inquiry/mappers/shipping-agency-inquiry.mapper.ts','Tài liệu hóa và kiểm chứng ma trận role × endpoint × field.')
partial('V8.2.1 V8.2.2 V8.2.3 V8.3.1','JWT/INTERNAL/section guard và ownership có ở luồng chính; Cloudinary URL công khai có thể vượt API authorization.', 'backend2.0/src/shared/decorators/admin-section.decorator.ts; backend2.0/src/features/inquiry/controllers/inquiry-document.controller.ts; backend2.0/src/shared/services/cloudinary.service.ts','Kiểm tra object ACL và URL download trực tiếp; full role/IDOR matrix trên staging.','F03')
passed('V9.1.1 V9.1.3 V9.2.1','JWT signature/key dùng APP_JWT_SECRET cấu hình server, expiration bật; không đọc jku/jwk từ user.', 'backend2.0/src/features/auth/strategies/jwt.strategy.ts; evidence/backend-tests.json')
partial('V9.1.2 V9.2.2','Dựa allowlist mặc định passport/jsonwebtoken và session claims; thiếu explicit algorithms/purpose trong strategy.', 'backend2.0/src/features/auth/strategies/jwt.strategy.ts','Test none/key confusion/type confusion và đặt algorithms/type policy rõ ràng.','F08')
failed('V9.2.3','Phát/xác minh JWT không cấu hình audience; không đạt kiểm tra intended service.', 'backend2.0/src/features/auth/strategies/jwt.strategy.ts; backend2.0/src/features/auth/auth.service.ts','Thêm issuer/audience có migration token tương thích.','F08')
passed('V10.1.1','Google token được xử lý ở backend; browser nhận session qua HttpOnly cookie.', 'backend2.0/src/features/auth/oauth2.controller.ts; backend2.0/src/features/auth/auth.controller.ts')
passed('V10.1.2 V10.2.1','OAuth state randomBytes, bound cookie, timingSafeEqual, single consumption; tests qua.', 'backend2.0/src/features/auth/oauth-state.ts; evidence/backend-tests.json')

passed('V11.2.1','Dùng node:crypto, bcrypt, passport/jwt và SDK; không có primitive crypto tự viết.', 'backend2.0/src/features/auth/auth.service.ts; backend2.0/src/features/auth/oauth-state.ts; backend2.0/src/shared/uploads/uploaded-file.util.ts')
partial('V11.2.2','Secret/cost/lifetime cấu hình được; chưa có lifecycle/key rotation/re-encryption design.', 'backend2.0/src/features/auth/auth.module.ts; backend2.0/src/features/auth/auth.service.ts','Tài liệu hóa rotation, crypto inventory và migration.')
partial('V11.4.1 V11.4.3','SHA256 checksum/request hash/OAuth state; Cloudinary SDK ký URL có cơ chế riêng, chưa có inventory policy.', 'backend2.0/src/shared/uploads/uploaded-file.util.ts; backend2.0/src/features/inquiry/services/inquiry-idempotency.service.ts','Đối chiếu primitive/key length mọi use case.')
partial('V11.4.2','bcrypt có cost configurable và minimum fallback nhưng cắt mật khẩu dài; chưa đo cost trên hạ tầng đích.', 'backend2.0/src/features/auth/auth.service.ts; evidence/pure-reproductions.json','Đo cost và xử lý byte-length/algorithm migration.','F08')
passed('V11.5.1','OAuth state dùng randomBytes(32); kiểm tra signing-key entropy và identity UUID ở yêu cầu khác.', 'backend2.0/src/features/auth/oauth-state.ts; evidence/backend-tests.json')
partial('V12.3.1 V12.3.2','OAuth/storage HTTPS nhưng DB TLS cho phép encryption-only rejectUnauthorized=false và proxy target HTTP.', 'backend2.0/src/shared/database/database-ssl.ts; dashboard_admin/next.config.mjs; backend2.0/docs/loadtest-2026-09-08/REPORT.md','Xác minh TLS/certificate topology thật; không suy từ loadtest sang production.','F12')
partial('V13.3.1','Env thật được ignore, không trùng secret cục bộ trong 5370 Git blobs/build; không có bằng chứng key vault/lifecycle/ACL.', 'evidence/git-history-exact-secret-sweep.json; evidence/exact-secret-build-sweep.json; backend2.0/.gitignore','Đánh giá secret manager, ACL, rotation và quét secret độc lập. Không coi exact-match scan là sạch tuyệt đối.')
partial('V13.4.4','Nest không khai báo TRACE; proxy/server live chưa kiểm chứng.', 'backend2.0/src/configure-app.ts; dashboard_admin/next.config.mjs','GET/TRACE/header tests trên staging.')
partial('V13.4.5','Health endpoint chỉ trả ok; không có Swagger bootstrap; docs/object exposure production chưa kiểm chứng.', 'backend2.0/src/shared/health/health.controller.ts; backend2.0/src/main.ts','Kiểm tra public route/artifact/monitoring ở deployment.')

partial('V14.2.1','Session không truyền trong URL/body; signed object URL là bearer capability cần expiry thực, Cloudinary hiện không có TTL.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/shared/services/cloudinary.service.ts; evidence/pure-reproductions.json','Kiểm tra signed URL expiry và URL logging.','F03')
partial('V14.2.2','Một số export có no-store; chưa có policy chung cho auth/inquiry/parameter response và edge cache.', 'backend2.0/src/configure-app.ts; backend2.0/src/features/booking-documents/booking-documents-admin.controller.ts','Thêm anti-cache cho dữ liệu nhạy cảm và kiểm tra edge/BFF.','F09')
failed('V14.2.3 V14.2.4','Theo policy người dùng đã chốt, công thức/hệ số chỉ backend; build vẫn phát trong JS, 5 assets GET không cookie trả 200. Có CSV nghiệp vụ được commit.', 'evidence/local-unauthenticated-formula-assets.json; evidence/csv-analysis.json; backend2.0/src/features/epda-parameters/epda-parameters-admin.controller.ts','Chuyển tính toán backend; thu hẹp response và xử lý dữ liệu nghiệp vụ trong Git.','F01 F02 F13')
partial('V14.3.1','Logout clear browser profile và QueryClient đã test; session-expiry path/DOM/cross-tab toàn bộ chưa kiểm chứng.', 'dashboard_admin/src/modules/auth/services/authSession.ts; dashboard_admin/src/shared/utils/apiClient.ts; evidence/dashboard-tests.json','Kiểm thử logout/expiry/back button/cross-tab trên staging.')
failed('V14.3.2','Thiếu no-store chung trên các GET auth/inquiry/parameter/storage sensitive; chỉ một số export được đặt.', 'backend2.0/src/configure-app.ts; backend2.0/src/features/auth/auth.controller.ts; dashboard_admin/next.config.mjs','Bổ sung Cache-Control no-store cho sensitive API và kiểm chứng browser/BFF/edge.','F09')
partial('V14.3.3','JWT không lưu localStorage; profile vẫn lưu email/fullName/id và role khi remember=true.', 'dashboard_admin/src/modules/auth/services/authService.ts:29','Chốt phân loại PII, giảm profile persistent và xóa khi expiry/cross-tab.')

partial('V15.1.2','Có lockfiles/dependency inventory pnpm audit; chưa có SBOM provenance/maintenance evidence.', 'backend2.0/pnpm-lock.yaml; dashboard_admin/pnpm-lock.yaml; evidence/backend-dependencies.json; evidence/dashboard-dependencies.json','Xuất SBOM, theo dõi CVE và provenance.','F04')
failed('V15.2.3','Build production vẫn có /forgot-password và /otp: form dùng sleep/setTimeout, không gọi recovery/OTP backend nhưng báo thành công.', 'dashboard_admin/src/features/auth/forgot-password/components/forgot-password-form.tsx:45; dashboard_admin/src/features/auth/otp/components/otp-form.tsx:47; evidence/dashboard-build.log','Ẩn demo hoặc triển khai recovery/OTP thật; không coi redirect client là session authentication.','F16')
partial('V15.1.3 V15.2.2','Có pool deadline/upload cap/batch report và loadtest lịch sử; chưa đạt mọi latency target và không có số đo current deployment.', 'backend2.0/src/shared/database/database.module.ts; backend2.0/src/shared/uploads/upload-limits.ts; backend2.0/docs/loadtest-2026-09-08/REPORT.md','Đo lại staging đúng topology và dataset, không loadtest live.','F10 F14')
annotations['V15.1.3']['group_override']='availability'
annotations['V15.2.2']['group_override']='availability'
failed('V15.3.1','API effective/admin inquiry trả coeff/tariff/working snapshot cho client, trái chính sách backend-only.', 'backend2.0/src/features/epda-parameters/epda-parameters-admin.controller.ts; backend2.0/src/features/inquiry/mappers/shipping-agency-inquiry.mapper.ts','Thiết kế response chỉ trả kết quả/field được phép.','F02')
partial('V15.3.3 V15.3.5 V15.3.7','Global DTO whitelist và validation; API raw/multipart được validate riêng; chưa chứng minh mọi raw object/query.', 'backend2.0/src/config/global-validation.ts; backend2.0/src/shared/utils/validate-dto.util.ts','Kiểm thử mass assignment/type confusion/query pollution mọi endpoint.')
partial('V15.3.4','Trust proxy dùng số hop; login nhận CF-Connecting-IP trực tiếp khi bật trust proxy; chưa chứng minh origin bị chặn và header bị overwrite.', 'backend2.0/src/features/auth/login-throttle.service.ts:74; backend2.0/src/config/environment.ts','Xác nhận edge topology/header overwrite; không áp sai CVE subnet với numeric trust setting.','F10')
partial('V16.2.1','Có audit thao tác/version và slow request/query; chưa có request correlation và actor đầy đủ trong security logs.', 'backend2.0/src/shared/interceptors/request-timing.interceptor.ts; backend2.0/src/shared/database/query-metrics.logger.ts','Bổ sung correlation/security event schema và kiểm tra timeline.')
partial('V16.2.5','safeErrorForLog và QueryMetricsLogger tránh parameter/secret; một số catch vẫn logger.error(error.stack) trực tiếp.', 'backend2.0/src/shared/logging/safe-error-log.ts; backend2.0/src/features/inquiry/services/inquiry-document.service.ts:127','Áp redaction thống nhất mọi logger và kiểm thử error có credential.','F15')
failed('V16.3.1 V16.3.2','Auth controller không ghi mọi login success/failure; login throttle chỉ log lockout; authorization 4xx không được global filter ghi.', 'backend2.0/src/features/auth/auth.controller.ts; backend2.0/src/features/auth/login-throttle.service.ts; backend2.0/src/shared/filters/global-exception.filter.ts','Thêm security audit events, bảo vệ PII và correlation.','F15')
partial('V16.3.4','Global unexpected errors log redacted; không có bằng chứng mọi security-control failure được log.', 'backend2.0/src/shared/filters/global-exception.filter.ts; backend2.0/src/shared/logging/safe-error-log.ts','Kiểm chứng TLS failures/permission failures/correlation.')
partial('V16.4.1','Phần log dùng JSON; login lockout nội suy identifier/IP chưa escape newline thống nhất.', 'backend2.0/src/features/auth/login-throttle.service.ts; backend2.0/src/shared/interceptors/request-timing.interceptor.ts','Kiểm thử log injection và chuẩn hóa cấu trúc.','F15')
passed('V16.5.1','Global filter trả generic 5xx, không trả stack/query; test error/redaction qua.', 'backend2.0/src/shared/filters/global-exception.filter.ts; evidence/backend-tests.json')
partial('V16.5.2 V16.5.3','Có upstream deadlines, generic error và compensation; rollback concurrent upload còn hở.', 'backend2.0/src/shared/services/cloudinary.service.ts; backend2.0/src/shared/utils/with-timeout.ts; evidence/pure-reproductions.json','Fault-injection mock cho cleanup, circuit breaker và upstream failures.','F05')

source=list(csv.DictReader((E/'asvs-5.0.0-source.csv').open(encoding='utf-8-sig')))
rows=[]
for r in source:
 if r['L'] not in {'1','2'}:continue
 g=chapter_group[r['chapter_id']]
 a=annotations.get(r['req_id'],{'status':'Chưa kiểm chứng','score':'','notes_vi':'Chưa đủ bằng chứng để xác nhận toàn bộ yêu cầu; không suy ra đạt từ việc có thư viện/guard hoặc từ một test luồng khác.','evidence':default_evidence[g],'verification_remaining':f'Đối chiếu yêu cầu {r["req_id"]} bằng test chuyên biệt hoặc tài liệu/cấu hình triển khai; dữ liệu ngoài hai repo chưa được truy cập.','finding_ids':''})
 g=a.get('group_override',g)
 rows.append({'id':'v5.0.0-'+r['req_id'][1:],'standard':'OWASP ASVS 5.0.0','level':r['L'],'requirement':r['req_description'],'group':g,'group_vi':groups[g][0],'mandatory':'yes' if a['status']!='Không áp dụng' else 'no','applicability':'Không áp dụng' if a['status']=='Không áp dụng' else 'Áp dụng hoặc chưa xác định đầy đủ; tính vào mẫu số thận trọng',**{k:v for k,v in a.items() if k!='group_override'}})

ops=[
 ('OPS-01','governance','Có danh mục tài sản và người chịu trách nhiệm.','Chưa kiểm chứng','','Repo cho thấy module/dependency, không có asset inventory doanh nghiệp đầy đủ.','evidence/baseline.json'),
 ('OPS-02','data','Có phân loại dữ liệu và chủ sở hữu, retention/PII policy.','Đạt một phần',1,'Có field whitelist/ownership, nhưng dữ liệu nghiệp vụ được commit và công thức ở bundle.','evidence/csv-analysis.json; evidence/local-unauthenticated-formula-assets.json'),
 ('OPS-03','governance','Có risk register và kế hoạch xử lý rủi ro.','Chưa kiểm chứng','','Không có hồ sơ risk acceptance đầy đủ trong hai repo.','evidence/source-hashes.json'),
 ('OPS-04','governance','Có trách nhiệm/phân công bảo mật và quy trình duyệt quyền.','Chưa kiểm chứng','','Role/section code không chứng minh quy trình tổ chức.','backend2.0/src/shared/decorators/admin-section.decorator.ts'),
 ('OPS-05','authorization','Cấp/thu hồi quyền nhân sự và vô hiệu hóa phiên.','Đạt một phần',1,'Disable/role reset revokes sessionVersion, chưa có bằng chứng onboarding/offboarding review định kỳ.','backend2.0/src/features/users/admin-users.service.ts; evidence/backend-tests.json'),
 ('OPS-06','governance','Có đào tạo bảo mật và chống phishing.','Chưa kiểm chứng','','Không suy ra từ source hoặc unit tests.','evidence/baseline.json'),
 ('OPS-07','deployment','Tách production/staging/test và cấu hình không tự migrate.','Đạt một phần',1,'synchronize/migrationsRun=false, CI DB riêng; chưa kiểm tra deployment thật.','backend2.0/src/shared/database/database.module.ts; backend2.0/.github/workflows/backend-checks.yml'),
 ('OPS-08','deployment','Bảo vệ mạng/database, least privilege và public Data API ACL.','Chưa kiểm chứng','','Chưa kết nối DB live; không coi file migration đã áp dụng.','backend2.0/src/shared/database/database.module.ts'),
 ('OPS-09','logging','Có cảnh báo sự cố và trách nhiệm phản hồi.','Chưa kiểm chứng','','Có metrics logger, chưa có bằng chứng alert thực sự được gửi/nhận.','backend2.0/src/shared/interceptors/request-timing.interceptor.ts'),
 ('OPS-10','recovery','Có playbook ứng phó, điều tra và diễn tập sự cố.','Chưa kiểm chứng','','Không có bằng chứng diễn tập hoặc timeline xử lý.','evidence/baseline.json'),
 ('OPS-11','recovery','Có RTO/RPO và backup được bảo vệ.','Đạt một phần',1,'Có 3 dump đọc được, ignore Git; chưa xác minh encryption/ACL/retention/RTO/RPO.','evidence/snapshot-analysis.json; backend2.0/.gitignore'),
 ('OPS-12','recovery','Có khôi phục thử backup và đối chiếu dữ liệu.','Đạt một phần',1,'Có hồ sơ clone/loadtest lịch sử; chưa chứng minh DR restore current DB/RTO. Không restore trong audit này.','backend2.0/docs/loadtest-2026-09-08/REPORT.md; evidence/snapshot-analysis.json')]
for id,g,req,status,score,note,evidence in ops:
 rows.append({'id':id,'standard':'Enterprise supplementary / ISO 27001-27002 / NIST CSF aligned, not certification','level':'','requirement':req,'group':g,'group_vi':groups[g][0],'mandatory':'yes','applicability':'Áp dụng','status':status,'score':score,'notes_vi':note,'evidence':evidence,'verification_remaining':'Bổ sung hồ sơ/cấu hình/bằng chứng vận hành có kiểm chứng; database chỉ đọc.','finding_ids':''})

for row in rows:
 links=[]
 for reference in row['evidence'].split(';'):
  reference=reference.strip()
  if not reference.startswith(('backend2.0/','dashboard_admin/','evidence/')):continue
  match=re.fullmatch(r'(.+?)(?::(\d+))?',reference)
  relative,line=match.groups()
  target=(OUT/relative if relative.startswith('evidence/') else ROOT/relative)
  assert target.exists(),f'Missing evidence: {relative}'
  if line:
   assert int(line)<=len(target.read_text(encoding='utf-8',errors='replace').splitlines()),f'Invalid evidence line: {reference}'
  links.append(f'[{reference}](<{target.as_posix()}{":"+line if line else ""}>)')
 assert links,f'No file evidence links: {row["id"]}'
 row['evidence_links']='; '.join(links)

fields=['id','standard','level','requirement','group','group_vi','mandatory','applicability','status','score','notes_vi','evidence','evidence_links','verification_remaining','finding_ids']
with (OUT/'scorecard.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)

summary=[];total=0;coverage=0;weight_total=0
for key,(name,weight) in groups.items():
 active=[r for r in rows if r['group']==key and r['status']!='Không áp dụng']
 if not active:continue
 points=sum(float(r['score']) if r['score']!='' else 0 for r in active)
 checked=sum(r['status']!='Chưa kiểm chứng' for r in active)
 group_score=points/(3*len(active))*100
 group_coverage=checked/len(active)*100
 total+=weight*group_score/100;coverage+=weight*group_coverage/100;weight_total+=weight
 summary.append({'group':key,'name':name,'weight':weight,'active_requirements':len(active),'verified_requirements':checked,'score':round(group_score,2),'coverage':round(group_coverage,2)})
result={'scope':['backend2.0','dashboard_admin'],'asvs_requirements':253,'operational_requirements':12,'total_rows':len(rows),'statuses':dict(Counter(r['status'] for r in rows)),'lower_bound_score_out_of_100':round(total/weight_total*100,2),'weighted_verification_coverage_percent':round(coverage/weight_total*100,2),'groups':summary,'interpretation':'Lower-bound assurance evidence score, not percent security and not ASVS compliance. UNKNOWN stays in denominator; N/A excluded; no grade3 without recurring assurance evidence.','database':'Historical dumps read without executing SQL; current/live DB not verified.'}
(E/'score-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
# Invariants: unique identifiers, all L1+L2 retained, single primary group, valid N/A exclusion and scores.
assert len(rows)==265 and len({r['id'] for r in rows})==265
assert sum(w for _,w in groups.values())==100
assert all(r['score'] in {'',0,1,2,3} for r in rows)
assert all(r['notes_vi'] and r['evidence'] for r in rows)
assert all(r['score']=='' for r in rows if r['status'] in {'Không áp dụng','Chưa kiểm chứng'})
print(json.dumps({k:result[k] for k in ['total_rows','statuses','lower_bound_score_out_of_100','weighted_verification_coverage_percent']}))
