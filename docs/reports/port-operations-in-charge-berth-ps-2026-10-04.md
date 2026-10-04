# Rà soát cầu bến và điểm đón/trả hoa tiêu của các cảng `in_charge`

Ngày rà soát: 04/10/2026. Phạm vi: 38 bản ghi `ports.is_active = true, in_charge = true` trong database Port Operations; đối chiếu thông tin công khai của Cục Hàng hải và Đường thủy Việt Nam (VIMAWA), website đơn vị khai thác và Hiệp hội Cảng biển Việt Nam (VPA). Báo cáo gốc là khảo sát; trạng thái nhập dữ liệu được cập nhật dưới đây.

**Cập nhật nhập dữ liệu 04/10/2026:** Đã thêm 31 `BERTH` ở 10 cảng: 24 cầu từ phiếu đề xuất bên dưới và 7 cầu số 1–7 của `CAI LAN PORT` (`VNCLN`). Mã, tên, chiều dài và DWT theo VIMAWA được ghi qua hai migration `2026-10-04_in_charge_verified_berths_v1` và `2026-10-04_cai_lan_berths_v1`, đã kiểm tra lại trong database. Theo xác nhận của người dùng, bản ghi Cái Lân đại diện toàn bộ khu Cái Lân. Không nhập cầu tạm Cái Lân, Mỹ Thới (mã `MY_THOI` tự đặt), các cầu có mã/thông số mâu thuẫn, P/S dùng chung, độ sâu hoặc `max_draft_m`. Quy Nhơn không thay đổi.

## Kết luận nhanh

- Tại thời điểm khảo sát ban đầu, chỉ Quy Nhơn (`VNUIH`) đã có `port_locations`: một `PILOT_STATION` (`QNP_PS`) và bảy `BERTH` (`1A`, `1B`, `1C`, `2`, `3`, `4`, `5`). Sau cập nhật nêu trên, 10 cảng khác đã có thêm 31 cầu.
- Điều này **không có nghĩa** các cảng ngoài thực tế không có cầu/P/S. Nguồn chính thức xác nhận nhiều nơi có cả hai; bảng dưới phân biệt tài liệu tìm được với dữ liệu đã nhập.
- Điểm đón/trả hoa tiêu (P/S) thường thuộc **luồng/khu vực hàng hải**, có thể dùng chung cho nhiều terminal; không nên tự tạo một P/S riêng cho mỗi dòng `ports`. Phao số 0 có thể được dùng để mô tả điểm đón hoa tiêu, nhưng không phải mọi phao/anchorage đều là P/S.
- Trong 38 cảng, 20 cảng có Port Call trong DB (3.717 chuyến, gồm Quy Nhơn 3.344 và các cảng khác 373); 18 cảng chưa có Port Call. Số chuyến chỉ phục vụ ưu tiên rà soát, không xác thực cấu hình cầu.

## Cảng có Port Call — đối chiếu ưu tiên

Ký hiệu: **Có** = tìm được tài liệu có thể đối chiếu đúng đơn vị/bến; **Vùng** = có P/S cho luồng/khu vực nhưng chưa chốt mã location riêng cho terminal; **Cần đối chiếu** = tên/đơn vị/cấu trúc chưa đủ chắc để nhập; **Không áp dụng** = bản ghi là khu neo, không phải bến cầu. Các thông số trong tài liệu công khai có thể cũ; đây chưa phải danh sách sẵn sàng nhập thẳng.

| Bản ghi DB (`code`) | Calls | Cầu bến ngoài thực tế | P/S ngoài thực tế | Bằng chứng / lưu ý |
|---|---:|---|---|---|
| QUY NHON PORT (`VNUIH`) | 3.344 | Có; 7 location đã nhập | Có; `QNP_PS` đã nhập | Mốc so sánh của module. |
| CAI LAN PORT (`VNCLN`) | 71 | Có; đã nhập cầu 1–7 dưới bản ghi đại diện toàn khu theo xác nhận người dùng | Có; khu Hòn Cam, chưa nhập P/S | [VIMAWA danh mục 2026](https://www.vimawa.gov.vn/f/QD%20cong%20bo%20Danh%20muc%20ben%20cang%20cau%20cang%20thuoc%20cang%20bien%20VN%202026.pdf), [VIMAWA thông số từng cầu](https://vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-cai-lan), [VPA Cái Lân](https://www.vpa.org.vn/cai-lan-international-container-terminal-lcc/). Danh mục 2026 phân nhóm 1, 2–4, 5–7; cầu tạm không nhập. |
| GO DAU B TERMINAL (`VNGDB`) | 64 | Có; khu B có các bến tổng hợp/cầu số | Có; P/S vùng Đồng Nai/Thị Vải | [VIMAWA Gò Dầu B](https://www.vimawa.gov.vn/vi/node/7943), [VPA Cảng Đồng Nai](https://www.vpa.org.vn/dong-nai-port/). |
| CUA LO PORT (`VNCUA`) | 60 | Có; VIMAWA liệt kê cầu 1–4 và một cầu chưa ghi số | Có; VPA ghi P/S tại phao số 0 | [VIMAWA Cửa Lò](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-cua-lo), [VPA Cửa Lò](https://www.vpa.org.vn/cua-lo-port/). VPA ghi cầu số 5; cần chốt danh mục hiện hành trước khi nhập. |
| SP-ITC PHU HUU (`VNITC`) | 57 | Có; SP-ITC#1/#2 | Có; VPA ghi tọa độ điểm đón hoa tiêu | [VIMAWA SP-ITC](https://vimawa.gov.vn/vi/noi-dung/ben-cang-container-quoc-te-sp-itc), [VPA SP-ITC](https://www.vpa.org.vn/sp-itc-international-container-terminal/). |
| CHAN MAY PORT (`VNCMY`) | 55 | Có; bến số 1/2 | Có; website cảng công bố vị trí đón hoa tiêu | [VIMAWA Chân Mây](https://vimawa.gov.vn/vi/node/7815), [Cảng Chân Mây](https://www.chanmayport.com.vn/gioi-thieu/gioi-thieu/vi-tri-dia-ly/vi-tri-dia-ly.html). **Tọa độ P/S trên website cảng và [VPA](https://www.vpa.org.vn/chan-may-port/) khác nhau; phải xác minh lại bản hiện hành.** |
| NGHI SON PORT (`VNNGH`) | 13 | Có, nhưng tên này bao trùm nhiều bến/đơn vị khác nhau | Vùng; chưa gắn được một P/S cho đúng terminal | [VIMAWA bến tổng hợp](https://vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-nghi-son), [VIMAWA bến tổng hợp quốc tế](https://vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-quoc-te-nghi-son), [VIMAWA lọc hóa dầu](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-nha-may-loc-hoa-dau-nghi-son). Không gộp mọi cầu Nghi Sơn dưới một port record khi chưa biết terminal của chuyến. |
| THI VAI GENERAL PORT (`VNTVA`) | 13 | Có; bến tổng hợp Thị Vải (ODA) | Vùng Vũng Tàu–Thị Vải; chưa chốt location riêng | [VIMAWA bến tổng hợp Thị Vải](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-thi-vai-oda), [VPA khu Thị Vải](https://www.vpa.org.vn/cong-ty-tnhh-mtv-cang-tan-cang-cai-mep-thi-vai/). Không lấy cầu của terminal TCTT làm cầu của VNTVA. |
| CHU LAI PORT (chưa có code) | 8 | Có; VIMAWA liệt kê cầu Chu Lai | Vùng Kỳ Hà/Chu Lai; cần xác minh điểm dùng cho Chu Lai | [VIMAWA Chu Lai](https://vimawa.gov.vn/vi/noi-dung/ben-cang-chu-lai), [VPA Kỳ Hà](https://www.vpa.org.vn/ky-ha-chu-lai-port/). Kỳ Hà và Chu Lai là hai bến khác nhau. |
| GO GIA ANCHORAGE (chưa có code) | 7 | Không áp dụng cho bản ghi khu neo | Cần đối chiếu | [VIMAWA quy hoạch khu Gò Gia](https://vimawa.gov.vn/vi/tin-tuc/phe-duyet-quy-hoach-tong-phat-trien-he-thong-cang-bien-viet-nam). Không lấy cầu của cảng lân cận gán cho khu neo. |
| LONG AN INTERNATIONAL PORT (`VNLAP`) | 6 | Có; website cảng công bố 7 bến hiện hữu | Có; VPA ghi phao số 0 Vũng Tàu | [Đơn vị khai thác](https://longanport.com/port-overview/facilities-and-equipment/), [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-quoc-te-long-thuoc-tinh-long), [VPA](https://www.vpa.org.vn/long-an-international-port/). Trang VIMAWA chỉ liệt kê một phần số cầu; không suy diễn phần còn lại. |
| THI NAI PORT (`VNTNA`) | 4 | Có; TN1, TN2 | Có; VPA công bố điểm đón hoa tiêu | [VIMAWA Thị Nại](https://vimawa.gov.vn/vi/noi-dung/ben-cang-thi-nai), [VPA Thị Nại](https://www.vpa.org.vn/thi-nai-port/). |
| VINH HUNG PORT (chưa có code) | 4 | Có; website đơn vị khai thác mô tả 2 bến/tổng chiều dài 360 m | Có thông tin điểm neo/tiếp cận; **chưa xác nhận đó là P/S được công bố** | [Vĩnh Hưng Port](https://www.vhgroup.com.vn/port). Trang còn dùng ngôn ngữ “phase II” theo kế hoạch; cần xác nhận tình trạng vận hành hiện tại. |
| VUNG ANG PORT (`VNVAG`) | 3 | Có; cầu 1 và 2 trên VIMAWA | Có nguồn VPA, nhưng tọa độ ghi phút `80` không hợp lệ | [VIMAWA Vũng Áng](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-vung-ang), [VPA Lào–Việt](https://www.vpa.org.vn/viet-lao-international-port/). **Không nhập tọa độ P/S từ bản VPA này.** |
| SONGLAM INTERNATIONAL PORT (chưa có code) | 2 | Cần đối chiếu: VIMAWA có bến Vissai của Công ty Xi măng Sông Lam | Chưa xác minh | [VIMAWA Vissai](https://vimawa.gov.vn/vi/noi-dung/ben-cang-chuyen-dung-vissai). Chưa chứng minh tên DB tương ứng chính xác bến Vissai. |
| THIENG LIENG ANCHORAGE (chưa có code) | 2 | Không áp dụng cho bản ghi khu neo | Chưa xác minh | [VPA Cảng Sài Gòn](https://www.vpa.org.vn/saigon-port/) mô tả Thiềng Liềng là khu chuyển tải/bến phao, không phải cầu bến. |
| HAU GIANG PORT / VIMC (`VNVHG`) | 1 | Có; VIMAWA ghi một cầu 150 m; VIMC nói đã đưa cầu số 2 vào sử dụng | Có; website đơn vị khai thác ghi điểm lấy hoa tiêu | [VIMAWA VIMC Hậu Giang](https://vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-vimc-hau-giang), [VIMC về cầu số 2](https://vimc.co/vimc-hau-giang-15-nam-nang-cao-nang-luc-chat-luong-dich-vu-phuc-vu-khach-hang/), [đơn vị khai thác](https://vimchaugiang.vn/2016/12/30/nang-luc-cong-ty/). Danh mục số cầu theo thời điểm chưa thống nhất. |
| LONG THANH PORT (`VNLTH`) | 1 | Cần đối chiếu: hồ sơ VPA ghi cầu số 2 thuộc **Gò Dầu A** | Có nguồn VPA | [VPA Long Thành](https://www.vpa.org.vn/long-thanh-port-joint-stock-company/). Không tạo cầu đó dưới cả Long Thành và Gò Dầu A. |
| MY THOI PORT (`VNMTH`) | 1 | Có; một cầu và nhiều **bến phao** MT01… | Có; VPA ghi điểm đón hoa tiêu | [VIMAWA Mỹ Thới](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-my-thoi), [VPA Cảng An Giang](https://www.vpa.org.vn/an-giang-port/). Bến phao không nên gộp thành `BERTH` cầu cứng. |
| NAM VAN PHONG PORT (chưa có code) | 1 | Có; danh mục 2026 ghi cầu số 1/2 | Có; tài liệu khai thác của cảng nêu vùng đón hoa tiêu | [VIMAWA danh mục 2026](https://www.vimawa.gov.vn/f/QD%20cong%20bo%20Danh%20muc%20ben%20cang%20cau%20cang%20thuoc%20cang%20bien%20VN%202026.pdf), [tài liệu đơn vị khai thác](https://svpp.vn/vnt_upload/service/09_2019/241001vb-150cqtnvpcap-nhat-lai-thong-bao-dieu-kien-khai-thac-ben-cang-tong-hop-nam-van-phong.pdf). |

## 18 cảng `in_charge` chưa có Port Call

| Bản ghi DB (`code`) | Kết quả tài liệu công khai | Nguồn / việc còn phải xác minh |
|---|---|---|
| BA NGOI (`VNBNO`) | Có cầu BN1/BN2/BN3/BN5; P/S khu Cam Ranh có trong hồ sơ VPA | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-ba-ngoi), [VPA Cam Ranh](https://www.vpa.org.vn/cam-ranh-port/). |
| BAC VAN PHONG PORT | Chưa ghép được một bến đang khai thác cụ thể | [Quy hoạch vùng Bắc Vân Phong](https://www.vimawa.gov.vn/f/content/5.Tong%20hop%20giai%20trinh%20-%20Bo%2C%20nganh%20dia%20phuong.pdf) không đủ để tạo berth master hiện hữu. |
| CAM PHA ANCHORAGE | Bản ghi là khu neo; không gán cầu của cảng than Cẩm Phả | [VIMAWA bến than Cẩm Phả](https://vimawa.gov.vn/vi/node/7730) chỉ chứng minh cầu của terminal khác. |
| CAN THO PORT (`VNVCA`) | Có cầu Cái Cui/Hoàng Diệu và P/S | [VPA Cần Thơ](https://www.vpa.org.vn/can-tho-port/). Cần chọn terminal khi nhập. |
| CUA NGO SAI GON PORT (`VNSGN`) | Chưa xác minh danh tính bến; trùng code với `SAI GON PORT` trong DB | Không gán cầu/P/S theo code đơn thuần. |
| DONG NAI PORT (`VNDNA`) | Có nhiều terminal và P/S khu vực | [VPA Cảng Đồng Nai](https://www.vpa.org.vn/dong-nai-port/). |
| GEMADEPT TERMINAL, DUNG QUAT (`VNDQT`) | Có cầu; P/S Dung Quất cần xác minh cụ thể | [VIMAWA Gemadept](https://vimawa.gov.vn/vi/noi-dung/ben-cang-germadept). Trang VIMAWA có giá trị DWT bất thường, không lấy thông số DWT chưa kiểm chứng. |
| GO DAU A TERMINAL (`VNGDA`) | Có cầu và P/S vùng; phân biệt với Gò Dầu B/Long Thành | [VIMAWA Gò Dầu A](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-go-dau), [VPA Cảng Đồng Nai](https://www.vpa.org.vn/dong-nai-port/). |
| HAI PHONG PORT (`VNHPH`) | Có nhiều terminal, cầu và P/S | [VPA Cảng Hải Phòng](https://www.vpa.org.vn/hai-phong-port/). Không tạo một danh sách cầu chung nếu chưa tách Hoàng Diệu/Chùa Vẽ/Tân Vũ. |
| HAO HUNG PORT, DUNGQUAT | Có cầu; P/S Dung Quất cần xác minh cụ thể | [VIMAWA Hào Hưng](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-tong-hop-hao-hung). |
| NHA BE ANCHORAGE | Khu neo; chưa có cầu riêng xác minh | Không gán các cầu Nha Bè của terminal khác. |
| PTSC PHU MY PORT (`VNVUT`) | Có các bến PTSC/Phú Mỹ trong danh mục khu vực, nhưng tên DB chưa ghép duy nhất với terminal | [VIMAWA cảng biển Vũng Tàu](https://vimawa.gov.vn/vi/cang-bien/cang-bien-vung-tau). |
| PTSC TERMINAL, DUNG QUAT (`VNCDQ`) | Có cầu PTSC; P/S Dung Quất cần xác minh | [VIMAWA PTSC Quảng Ngãi](https://www.vimawa.gov.vn/en/node/7833). |
| SAI GON PORT (`VNSGN`) | Có cầu và P/S khu Sài Gòn trên VPA, nhưng **code DB trùng `CUA NGO SAI GON`** | [VPA Cảng Sài Gòn](https://www.vpa.org.vn/saigon-port/). Sửa đối chiếu định danh trước khi nhập. |
| SOUTHERN STEEL PORT (`VNTMN`) | Có nguồn đơn vị thuê khai thác cầu; chưa xác minh mã cầu và P/S cụ thể | [Báo cáo Cảng Sài Gòn](https://saigonport.vn/wp-content/uploads/2025/02/EN_ReportOnCorporateGovernance_2024-Abridged-version-1.pdf). |
| SP-PSA INTERNATIONAL PORT (`VNSIP`) | Có cầu 1/2 và P/S Vũng Tàu | [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-quoc-te-sp-psa), [VPA](https://www.vpa.org.vn/sp-psa-international-port/). |
| TAN CANG MIEN TRUNG PORT (`VNTMT`) | Có một cầu theo VIMAWA; P/S cần xác minh thuộc vùng Quy Nhơn | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-quan-su-quy-nhon). Không dùng lại cầu 1A–5 của Cảng Quy Nhơn. |
| THI VAI INTERNATIONAL PORT (`VNTVI`) | Chưa ghép được đúng terminal/cầu/P/S từ tên DB | Khu Thị Vải có nhiều đơn vị khác nhau; chưa nhập theo tên gần giống. |

## Khuyến nghị trước khi đưa vào master data

1. Chốt `port_id` **theo đơn vị khai thác/bến cụ thể**, không chỉ theo tên vùng/cảng biển hoặc UN/LOCODE; giải quyết trước hai bản ghi `VNSGN`, Long Thành/Gò Dầu A, Nghi Sơn và các bản ghi `ANCHORAGE`.
2. Với mỗi cầu, lưu mã, chiều dài, độ sâu và nguồn kèm ngày hiệu lực; tách `water_depth_m` khỏi `max_draft_m`. Khi nguồn nhà nước và website cảng khác nhau, hỏi đơn vị khai thác/cảng vụ trước khi dùng giới hạn an toàn.
3. Với P/S, xác minh **quyết định/thông báo hàng hải hiện hành và tọa độ** theo vùng luồng. Không mặc định mỗi cảng có một P/S riêng; không coi phao neo, khu neo và P/S là một loại.
4. Không tự tạo location từ `DiemDau` trống trong API line-up cũ. Mã nguồn `5` của một chuyến Hồ Chí Minh chưa đủ để nhận là cầu 5 của terminal nào.

Nguồn ưu tiên: VIMAWA và thông báo/quyết định cảng vụ → tài liệu điều kiện khai thác của chính cảng → hồ sơ hội viên VPA để đối chiếu. Các dòng ghi “cần xác minh” có nghĩa **chưa đủ bằng chứng để nhập**, không có nghĩa ngoài thực tế không tồn tại.

## Phiếu đề xuất để duyệt nhập đợt 1 (chưa ghi DB)

Các dòng dưới đây khớp tên **terminal** trong DB với hồ sơ VIMAWA. Đề xuất tạo `port_locations.type=BERTH`, `is_active=true`, `code` như cột mã; `name` là “Cầu ” + mã (riêng SP-ITC02 là “Cầu SP-ITC02”). `length_m` và `max_dwt_mt` là số công bố trong hồ sơ. `water_depth_m`, `max_draft_m`, `cargo_capabilities` để trống vì các nguồn dưới không đủ căn cứ cho những thuộc tính này. DWT/chiều dài chưa được xác nhận ngày hiệu lực 2026; cần kiểm tra lại trước khi dùng làm giới hạn an toàn vận hành.

| Cảng DB (port_id) | Mã cầu → chiều dài m / DWT tấn | Nguồn |
|---|---|---|
| CỬA LÒ (36) | `1` 160/15.000; `2` 160/15.000; `3` 168/25.000; `4` 168/25.000 | [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-cua-lo) |
| GÒ DẦU B (63) | `1` 250/30.000; `2` 73/6.500; `3` 184/12.000; `4` 105/15.000 | [VIMAWA](https://www.vimawa.gov.vn/vi/node/7943) |
| THỊ NẠI (55) | `TN1` 163/30.000; `TN2` 123/5.000 | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-thi-nai) |
| VŨNG ÁNG (37) | `1` 185,5/45.000; `2` 270/61.671 | [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-vung-ang) |
| SP-ITC PHÚ HỮU (47) | `SP-ITC02` 300/36.000 | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-container-quoc-te-sp-itc) |
| CHU LAI (48057) | `1` 417/20.000 | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-chu-lai) |
| LONG AN INTERNATIONAL (60) | `1` 210/30.000; `2` 210/50.000; `3` 210/50.000; `7` 260/70.000 | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-quoc-te-long-thuoc-tinh-long); cầu `6` hoãn vì [VPA](https://www.vpa.org.vn/long-an-international-port/) ghi 300 m, VIMAWA ghi 260 m |
| BA NGÒI (36024) | `BN1` 182/30.000; `BN2` 180/50.000; `BN3` 126,5/5.000; `BN5` 116/3.000 | [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-ba-ngoi) |
| SP-PSA (36054) | `1` 300/117.000; `2` 300/117.000 | [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-quoc-te-sp-psa) |
| MỸ THỚI (36043) | `MY_THOI` 106/5.000 (VIMAWA không ghi mã riêng; **mã `MY_THOI` là đề xuất nội bộ**) | [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-my-thoi) |

Tổng: **25 cầu ở 10 cảng**, trong đó 24 cầu có mã nguồn rõ ràng; riêng mã nội bộ Mỹ Thới cần duyệt. Không tạo cầu số 5 Cửa Lò, cầu số 5 Gò Dầu B, SP-ITC01, Chu Lai 2, Long An 4/5/6, SP-PSA 3/4 hoặc bến phao Mỹ Thới trong đợt chắc chắn này.

### Chờ người dùng chốt

1. Nhập ngay nhóm 24 cầu có mã gốc rõ ràng, và có dùng `length_m/max_dwt_mt` công bố như trên không; hay chỉ nhập mã/tên, để thông số trống cho đến khi xác nhận điều kiện khai thác hiện hành? Cầu Mỹ Thới chỉ có tên, cần chốt mã nội bộ.
2. P/S vùng dùng chung cho nhiều terminal. `port_locations` hiện bắt buộc một `port_id`; chấp nhận tạo location P/S riêng dưới mỗi port (có thể trùng điểm thực) hay bổ sung mô hình P/S vùng + bảng liên kết nhiều port? Không tự nhân bản P/S trước khi chốt.
3. Các hồ sơ lệch/thiếu: Cửa Lò cầu 5 (VIMAWA 225 m không ghi số, VPA 300 m), Gò Dầu B cầu 5, SP-ITC01, Long An 4/5 và cầu 6 (VIMAWA 260 m, VPA 300 m), Chu Lai 2, Hậu Giang 2. Đề nghị hoãn những cầu này cho đến khi có thông báo điều kiện khai thác mới nhất từ cảng/cảng vụ.
4. `CAI LAN PORT` đã được người dùng xác nhận đại diện toàn khu và nhập cầu 1–7. `NGHI SON PORT`, `HAI PHONG PORT`, `CAN THO PORT`, `DONG NAI PORT` vẫn là tên vùng hoặc đơn vị nhiều terminal cần đối chiếu; `VNSGN` bị trùng trong DB; Long Thành/Gò Dầu A có khả năng trùng cầu; các bản ghi `ANCHORAGE` không phải terminal.
5. Có nhập `BUOY` MT01/02/03/04/05/07/0 dưới Mỹ Thới không? Không đưa chúng thành `BERTH` vì thực tế là bến phao.

**Quy tắc nhập sau chốt:** preflight lại `port_id` + `code`, chỉ thêm thiếu hoặc cập nhật bản ghi đúng cặp khóa, không tạo assignment/visits/Port Call, không sửa Quy Nhơn. Lưu snapshot giá trị cũ và nguồn tra cứu để có thể hoàn nguyên. Không điền tọa độ P/S vì schema location hiện chưa có cột tọa độ.

## Đối chiếu trực tiếp MarineTraffic (Edge, tài khoản Essential trial, 04/10/2026)

- [LONG AN / VNLAP](https://www.marinetraffic.com/en/ais/details/ports/24809/name=LONG-AN) hiện hiển thị **1 terminal, 1 berth**. [Terminal LAIP](https://www.marinetraffic.com/en/ais/details/terminals/1861) cũng ghi 1 berth; trang Berth Calls lọc LONG AN trong 02–03/10/2026 có một sự kiện tàu `HAI BINH` tại `LAIP-01` vào `2026-10-03 09:36 UTC`. Đây là bằng chứng mã `LAIP-01` đang được hệ thống AIS dùng, **không chứng minh cảng chỉ có một cầu**. MarineTraffic hiển thị max length 135 m / max DWT 9.500 cho cảng; trái với danh mục [VIMAWA](https://vimawa.gov.vn/vi/noi-dung/ben-cang-quoc-te-long-thuoc-tinh-long), nên không dùng các max này để cập nhật master.
- [NGHE AN CUA LO / VNCUA](https://www.marinetraffic.com/en/ais/details/ports/25591) hiển thị **0 terminal, 0 berth**, dù [VIMAWA](https://www.vimawa.gov.vn/vi/noi-dung/ben-cang-cua-lo) liệt kê nhiều cầu. `0` ở MarineTraffic là **thiếu phân giải location trong hệ thống này**, không có nghĩa cảng không có cầu.
- [Cai Lan ICT](https://www.marinetraffic.com/en/ais/details/terminals/3251/) hiển thị **3 berth**, phù hợp với mô tả 2/3/4 của [VPA](https://www.vpa.org.vn/cai-lan-international-container-terminal-lcc/), nhưng MarineTraffic gắn terminal này dưới **HON GAI / VNHON**, không phải mã `VNCLN` của dòng `CAI LAN PORT` trong DB. Do đó phải đối chiếu terminal theo tên/đơn vị khai thác, không join theo UN/LOCODE đơn thuần.
- Ở trang terminal, các mục **Terminal Events**, **Berth Location** và analytics hiện có nút “Unlock”; gói Essential trial chưa cho xem chi tiết đó. Berth Calls vẫn xem được một phần. Không mua/nâng gói, không dùng dữ liệu AIS suy diễn như giới hạn kỹ thuật cầu, và không nhập DB chỉ vì một location có trên MarineTraffic.
