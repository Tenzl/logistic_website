# Đối chiếu FreightEK và database — 15/09/2026

Trạng thái: **Đã cập nhật theo JSON và postflight khớp 100% các trường được map**.

Nguồn: C:/Users/DEV/Downloads/seatrans/freightek-shipments-2026-09-15T15-12-16-943Z.json
SHA-256: `32297bf3b77abbcfb6eb5f2e873a9654c900262500d2461f1a666cbf0275219e`

- Theo xác nhận của người dùng, JSON mới là nguồn chuẩn cho những trường được map, kể cả khác với dữ liệu Booking cũ.
- 65 Shipment ID ghép đúng Booking ID từ bảng ánh xạ đã xác minh.
- Cập nhật: {"booking_records":62,"bill_of_lading_records":48,"bill_of_lading_containers":5}.
- Tạo mới: {"bill_of_lading_records":16,"bill_of_lading_containers":17,"arrival_notice_records":1,"delivery_order_records":1,"arrival_notice_containers":1,"delivery_order_containers":1}.
- Theo xác nhận cuối của người dùng, xóa container thứ hai (row ID 5) ở BL của `EMFUIHTYO020974`, chỉ giữ container đúng JSON. Dữ liệu dòng bị xóa đã có trong backup để khôi phục khi cần.
- 665 trường nghiệp vụ thay đổi. Không thay đổi schema.
- Full pg_dump: D:\University\Seatrans-website\seatrans-db-backups\before-freightek-authoritative-1789486399238.dump
- Không suy đoán ID master: tên/mã không khớp duy nhất được giữ bằng snapshot và ID NULL.
- Các ô trống không xóa dữ liệu sẵn có. Không dùng trọng lượng container thay tổng Booking.
- Export: Booking Vessel/Voyage và BL Ocean Vessel lấy Feeder Vessel/Voyage theo mapping nhập cũ và xác nhận dùng JSON làm chuẩn; Mother Vessel/Voyage lấy trường Mother riêng. Import: lấy đúng `Vessel Name` / `Voyage No.` từ các ô live riêng của Import.
- Description of Goods xuống dòng bằng formatter hiện có, không đổi nội dung.
- Import S2607026 có số AN/DO `TA260709H16`, ngày `21/07/2026` trong các ô `A/N No.`, `A/N Date`, `D/O No.`, `D/O Date`; đã nhập đúng, không tự đặt số/ngày. AN ID 12 Completed; DO ID 7 Processing vì `D/O to` trong nguồn trống.
- Không tự điền shipment_number bằng Shipment ID kỹ thuật của FreightEK; ánh xạ này lưu riêng trong ledger.
- Document mới giữ creator của Booking nguồn; created_at là lúc nhập, document_date là ngày nguồn khi có.
- Version/update time đổi đúng một lần cho document cũ có cập nhật; trạng thái tính bằng validator/hydrator runtime.

## Kết quả kiểm tra lại nguồn sau cập nhật

- Kiểm tra lại sau đợt bổ sung: không còn cập nhật hoặc container cần xóa theo mapper nguồn. Toàn bộ 65 shipment ghép đúng Booking; 64 Export BL có 82 container, bằng đúng 82 container Export trong JSON. Import có 1 AN và 1 DO, mỗi chứng từ 1 container; các trường nguồn được map khớp.
- Tổng database: 346 Booking, 336 BL / 436 container, 1 AN / 1 container và 1 DO / 1 container. Các bản ghi ngoài 65 shipment giữ nguyên.
- 18 chứng từ mới: 6 Completed, 12 Processing. Processing phản ánh dữ liệu bắt buộc còn trống trong nguồn, không tự điền để đạt Completed.
- ETD Booking `239600083411`: `04/09/2026` → `05/09/2026`.
- ETD Booking `EMFUIHTYO020974`: `01/09/2026` → `05/09/2026`.
- BL ID 317 hiện chỉ giữ container row ID 4, số `SITU2657054`, gross weight `21,000 KGS`. Row ID 5 đã xóa theo xác nhận mới; trạng thái được tính lại thành Completed. HBL/MBL, ngày, cảng và các nội dung khác không bị thay đổi trong bước xóa này.
- 17 cảnh báo master ở lần kiểm tra ban đầu không phải 17 Booking chưa nhập. Đã bổ sung 4 Partner và liên kết Party ID còn thiếu; các Port chưa xác định duy nhất vẫn giữ snapshot đầy đủ, không tự chọn ID.

## Đợt bổ sung cuối — toàn bộ 65 shipment

Migration: `2026-09-15_freightek_finalization_v1`. Có full pg_dump mới, rehearsal ghi rồi rollback và postflight đối chiếu toàn bộ bảng, kể cả những hàng ngoài phạm vi.

- Full pg_dump: `D:\University\Seatrans-website\seatrans-db-backups\before-freightek-finalize-1789487132133.dump` (có checksum SHA-256).
- Backup chính xác và kết quả: `migration-backups/freightek-finalize-20260915-1789487132058/`.
- Thêm 4 Partner từ các ô live trong JSON; không ghi đè Partner master đang có. Address giữ toàn bộ thông tin nguồn; phone/fax, email/contact và tax number được điền khi có trong nguồn. Không tự đoán City của SATOEN.
- Liên kết 7 chứng từ và Booking Import BK-2; giữ nguyên snapshot tên/địa chỉ trên chứng từ.
- `SHIMIZU, JAPAN` ở Port of Loading của BK-2, AN 12 và DO 7 được liên kết Port `SHIMIZU`, ID 35234 / JPSMZ.
- Xóa đúng 1 container ID 5 / BL 317; không xóa hoặc sửa các container khác trong đợt bổ sung.

| Partner ID | Tên | Vai trò |
|---|---|---|
| 160 | ASIA TRANSPORTATION CO., LTD | AGENT |
| 161 | XIAMEN YIZHIYUE IMPORT AND EXPORT CO.,LTD. | CONSIGNEE |
| 162 | XIAMEN WANTONG LOGISTICS CO., LTD. | NOTIFY_PARTY |
| 163 | SATOEN VIETNAM JOINT STOCK COMPANY | CONSIGNEE, NOTIFY_PARTY |

Những Port còn cần xác nhận ở AN 12 / DO 7 của BK-2, shipment S2607026:

| Trường | Snapshot đã lưu | Vì sao chưa gán ID |
|---|---|---|
| Place of Receipt | SHIMIZU CY | Có Port SHIMIZU nhưng chưa có bản ghi CY riêng; không tự coi CY là Port |
| Port of Discharge | HAIPHONG, VIETNAM | Cùng VNHPH có ID 50 (HAI PHONG PORT) và ID 36019 (PORT OF HAIPHONG) |
| Place of Delivery / Final Destination | HAIPHONG (TAN VU TERMINAL) | Chưa có master TAN VU TERMINAL riêng; không tự thay bằng cảng Hải Phòng chung |

Đây là thiếu liên kết danh mục, không mất nội dung JSON. Các trường nguồn trống hoặc không có cột trong database vẫn bỏ qua như phạm vi đã chốt.

## Những trường thay đổi

| Shipment ID | Booking No. | Bảng / ID | Trường | Trước | Sau |
|---|---|---|---|---|---|
| S2609012 | ASC0541389 | booking_records / 543 | port_of_discharge_name | KEELUNG (CHILUNG), TW (TWKEL) | TAICHUNG, TW (TWTXG) |
| S2609012 | ASC0541389 | booking_records / 543 | port_of_discharge_id | 35972 | 35977 |
| S2609012 | ASC0541389 | booking_records / 543 | place_of_delivery_name | ∅ | TAICHUNG, TW (TWTXG) |
| S2609012 | ASC0541389 | booking_records / 543 | place_of_delivery_port_id | ∅ | 35977 |
| S2609012 | ASC0541389 | booking_records / 543 | vessel_voyage | CNC PLUTO / 0XSQMN1NC | EVER OPTIMA / 0484-049N |
| S2609011 | EMFUIHSHK021531 | booking_records / 544 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609011 | EMFUIHSHK021531 | booking_records / 544 | port_of_loading_id | 42 | 35990 |
| S2609011 | EMFUIHSHK021531 | booking_records / 544 | place_of_delivery_name | ∅ | SHEKOU, CN (CNSHK) |
| S2609011 | EMFUIHSHK021531 | booking_records / 544 | place_of_delivery_port_id | ∅ | 34466 |
| S2609010 | EMFUIHMOJ021523 | booking_records / 545 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609010 | EMFUIHMOJ021523 | booking_records / 545 | port_of_loading_id | 42 | 35990 |
| S2609010 | EMFUIHMOJ021523 | booking_records / 545 | place_of_delivery_name | ∅ | MOJI, FUKUOKA, JP (JPMOJ) |
| S2609010 | EMFUIHMOJ021523 | booking_records / 545 | place_of_delivery_port_id | ∅ | 35103 |
| S2609009 | EMFUIHOSA021524 | booking_records / 546 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609009 | EMFUIHOSA021524 | booking_records / 546 | port_of_loading_id | 42 | 35990 |
| S2609009 | EMFUIHOSA021524 | booking_records / 546 | place_of_delivery_name | ∅ | OSAKA, JP (JPOSA) |
| S2609009 | EMFUIHOSA021524 | booking_records / 546 | place_of_delivery_port_id | ∅ | 35117 |
| S2609008 | EMFUIHHKT021522 | booking_records / 547 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609008 | EMFUIHHKT021522 | booking_records / 547 | port_of_loading_id | 42 | 35990 |
| S2609008 | EMFUIHHKT021522 | booking_records / 547 | place_of_delivery_name | ∅ | HAKATA, FUKUOKA, JP (JPHKT) |
| S2609008 | EMFUIHHKT021522 | booking_records / 547 | place_of_delivery_port_id | ∅ | 35075 |
| S2609007 | ASC0540512 | booking_records / 548 | place_of_delivery_name | ∅ | KOBE, HYOGO, JP (JPUKB) |
| S2609007 | ASC0540512 | booking_records / 548 | place_of_delivery_port_id | ∅ | 35094 |
| S2609007 | ASC0540512 | booking_records / 548 | vessel_voyage | CNC PLUTO / 0XSQMN1NC | KUO LONG / 0XSQ6N1NC |
| S2609006 | SITSGKB0915G205422 | booking_records / 549 | port_of_discharge_name | KOBE, HYOGO, JP (JPUKB) | YOKOHAMA, JP (JPYOK) |
| S2609006 | SITSGKB0915G205422 | booking_records / 549 | port_of_discharge_id | 35094 | 35146 |
| S2609006 | SITSGKB0915G205422 | booking_records / 549 | place_of_delivery_name | ∅ | YOKOHAMA, JP (JPYOK) |
| S2609006 | SITSGKB0915G205422 | booking_records / 549 | place_of_delivery_port_id | ∅ | 35146 |
| S2609006 | SITSGKB0915G205422 | booking_records / 549 | vessel_voyage | SITC DALIAN / 2631N | SPIL NIRMALA / 111B |
| S2609005 | SNKO101260900516 | booking_records / 550 | port_of_discharge_name | KANAZAWA, ISHIKAWA, JP (JPKNZ) | SHIBUSHI, KAGOSHIMA, JP (JPSBS) |
| S2609005 | SNKO101260900516 | booking_records / 550 | port_of_discharge_id | 35193 | 35226 |
| S2609005 | SNKO101260900516 | booking_records / 550 | place_of_delivery_name | ∅ | SHIBUSHI, KAGOSHIMA, JP (JPSBS) |
| S2609005 | SNKO101260900516 | booking_records / 550 | place_of_delivery_port_id | ∅ | 35226 |
| S2609005 | SNKO101260900516 | booking_records / 550 | vessel_voyage | PANCON CHAMPION / 2609N | SAWASDEE INCHEON / 2609N |
| S2609004 | 239600084752 | booking_records / 551 | place_of_delivery_name | ∅ | TAICHUNG, TW (TWTXG) |
| S2609004 | 239600084752 | booking_records / 551 | place_of_delivery_port_id | ∅ | 35977 |
| S2609004 | 239600084752 | booking_records / 551 | vessel_voyage | EVER ORIENT / 0491-112N | EVER OPTIMA / 0484-049N |
| S2609003 | ASC0539708 | booking_records / 530 | port_of_discharge_name | KOBE, JP (JPUKB) | KOBE, HYOGO, JP (JPUKB) |
| S2609003 | ASC0539708 | booking_records / 530 | place_of_delivery_name | KOBE, JP (JPUKB) | KOBE, HYOGO, JP (JPUKB) |
| S2609003 | ASC0539708 | booking_records / 530 | vessel_voyage | CNC MARS/0XSQKN1NC | CNC MARS / 0XSQKN1NC |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | ocean_vessel | CNC MARS/0XSQKN1NC | CNC MARS / 0XSQKN1NC |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | notify_party_same_as_consignee | true | false |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | fbl_number | STVN-260916 | ST2609003 |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | port_of_discharge_name | KOBE, JP (JPUKB) | KOBE, HYOGO, JP (JPUKB) |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | place_of_delivery_name | KOBE, JP (JPUKB) | KOBE, HYOGO, JP (JPUKB) |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON CITY BINH DINH PROVINCE, VIETNAM TEL: +84-256-3 701 745 /FAX: +84-256-3 733 255 |
| S2609003 | ASC0539708 | bill_of_lading_records / 497 | description_of_goods | GRANITE STONES<br>HS CODE:  68010000 | STONE PRODUCTS IN PALLETS |
| S2609002 | BK-4 | booking_records / 552 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609002 | BK-4 | booking_records / 552 | port_of_loading_id | 42 | 35990 |
| S2609002 | BK-4 | booking_records / 552 | place_of_delivery_name | ∅ | TOKYO, JP (JPTYO) |
| S2609002 | BK-4 | booking_records / 552 | place_of_delivery_port_id | ∅ | 35135 |
| S2609001 | EMFUIHTYO021330 | booking_records / 553 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2609001 | EMFUIHTYO021330 | booking_records / 553 | port_of_loading_id | 42 | 35990 |
| S2609001 | EMFUIHTYO021330 | booking_records / 553 | place_of_delivery_name | ∅ | TOKYO, JP (JPTYO) |
| S2609001 | EMFUIHTYO021330 | booking_records / 553 | place_of_delivery_port_id | ∅ | 35135 |
| S2608025 | 239600083411 | booking_records / 521 | etd | 2026-09-04 | 2026-09-05 |
| S2608025 | 239600083411 | booking_records / 521 | place_of_receipt_name | QUY NHON PORT, VN (VNUIH) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | booking_records / 521 | port_of_loading_name | QUY NHON PORT, VN (VNUIH) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | booking_records / 521 | mother_vessel_voyage | WAN HAI 295 / N072 | EVER OPTIMA / 0484-049N |
| S2608025 | 239600083411 | booking_records / 521 | vessel_voyage | EVER OPTIMA 0489-049N | EVER OPTIMA / 0484-049N |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | ocean_vessel | EVER OPTIMA 0489-049N | EVER OPTIMA / 0484-049N |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | freight_terms | ∅ | FREIGHT PREPAID |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | freight_payable_at | TAICHUNG, TW (TWTXG) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | place_of_receipt_name | QUY NHON PORT, VN (VNUIH) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | port_of_loading_name | QUY NHON PORT, VN (VNUIH) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | place_of_issue_name | QUY NHON PORT, VN (VNUIH) | QUI NHON, VN (VNUIH) |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | consignor | JIANG DA CHEN COMPANY LIMITED<br>GROUP 10, AREA 7, QUY NHON TAY WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 842563520379 | JIANG DA CHEN COMPANY LIMITED GROUP 10, AREA 7, QUY NHON TAY WARD, GIA LAI PROVINCE, VIETNAM |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | consigned_to_order_of | RISHENG STONE CO<br>NO.210, LN.75, SEC.1, JIAYUAN RD., SHULIN DIST., NEW TAIPEI CITY 23877, TAIWAN (R.O.C)<br>TEL: 886986661682 | RISHENG STONE CO NO.210, LN.75, SEC.1, JIAYUAN RD., SHULIN DIST., NEW TAIPEI CITY 23877, TAIWAN (R.O.C) TEL: 986661682 |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | notify_address | RISHENG STONE CO<br>NO.210, LN.75, SEC.1, JIAYUAN RD., SHULIN DIST., NEW TAIPEI CITY 23877, TAIWAN (R.O.C)<br>TEL: 886986661682 | RISHENG STONE CO NO.210, LN.75, SEC.1, JIAYUAN RD., SHULIN DIST., NEW TAIPEI CITY 23877, TAIWAN (R.O.C) TEL: 986661682 |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | delivery_apply_to | ∅ | ASIA TRANSPORTATION CO., LTD 4F,NO.11 JIAN KANG RD,TAIPEI,TAIWAN TEL: 2-25147199 EX. 16 FAX: 2-25147499 ATTN: BRIAN |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | delivery_apply_to_party_id | ∅ | ∅ |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | bl_form_variant | non_negotiable_no_sign | original |
| S2608025 | 239600083411 | bill_of_lading_records / 490 | freight_amount_raw | ∅ | AS ARRANGED |
| S2608024 | EMFUIHNGO021077 | booking_records / 554 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608024 | EMFUIHNGO021077 | booking_records / 554 | port_of_loading_id | 42 | 35990 |
| S2608024 | EMFUIHNGO021077 | booking_records / 554 | port_of_discharge_name | NAGOYA, AICHI, JP (JPNGO) | NAGOYA, JP (JPNGO) |
| S2608024 | EMFUIHNGO021077 | booking_records / 554 | place_of_delivery_name | ∅ | NAGOYA, JP (JPNGO) |
| S2608024 | EMFUIHNGO021077 | booking_records / 554 | place_of_delivery_port_id | ∅ | 35151 |
| S2608023 | I490602506 | booking_records / 519 | place_of_receipt_name | ∅ | CAT LAI, VN (VNCLI) |
| S2608023 | I490602506 | booking_records / 519 | place_of_receipt_port_id | ∅ | 35988 |
| S2608023 | I490602506 | booking_records / 519 | port_of_discharge_name | ∅ | MOJI, JP (JPMOJ) |
| S2608023 | I490602506 | booking_records / 519 | port_of_discharge_id | ∅ | 35103 |
| S2608023 | I490602506 | booking_records / 519 | place_of_delivery_name | MOJI, FUKUOKA, JP (JPMOJ) | MOJI, JP (JPMOJ) |
| S2608023 | I490602506 | booking_records / 519 | mother_vessel_voyage | ∅ | YM CERTAINTY / 087N |
| S2608023 | I490602506 | bill_of_lading_records / 489 | ocean_vessel | SPIL NIRMALA / 111B | YM CERTAINTY / 087N |
| S2608023 | I490602506 | bill_of_lading_records / 489 | fbl_number | ST2608023 | STVN-260820 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | freight_terms | ∅ | FREIGHT COLLECT |
| S2608023 | I490602506 | bill_of_lading_records / 489 | freight_payable_at | MOJI, FUKUOKA, JP (JPMOJ) | MOJI, JP (JPMOJ) |
| S2608023 | I490602506 | bill_of_lading_records / 489 | port_of_discharge_name | ∅ | MOJI, JP (JPMOJ) |
| S2608023 | I490602506 | bill_of_lading_records / 489 | port_of_discharge_id | ∅ | 35103 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | place_of_delivery_name | MOJI, FUKUOKA, JP (JPMOJ) | MOJI, JP (JPMOJ) |
| S2608023 | I490602506 | bill_of_lading_records / 489 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2608023 | I490602506 | bill_of_lading_records / 489 | consigned_to_order_of | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | consignee_party_id | 34 | 47 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | notify_address | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | notify_party_id | 34 | 47 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | delivery_apply_to | ∅ | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | delivery_apply_to_party_id | ∅ | 46 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | description_of_goods | GRANITE STONE<br>HS CODE : 68010000<br>ORDER NUMBER: 260630-02Y | GRANITE STONES, BASALT STONES<br>HS CODE: 68010000 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | document_date | 2026-08-23 | 2026-08-28 |
| S2608023 | I490602506 | bill_of_lading_records / 489 | bl_form_variant | non_negotiable | original |
| S2608023 | I490602506 | bill_of_lading_records / 489 | freight_amount_raw | ∅ | AS ARRANGED |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | container_no | ∅ | YMMU1012106 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | seal_no | ∅ | YMAW949280 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | gross_weight_kg | ∅ | 21170 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | gross_weight_raw | ∅ | 21,170 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | measurement_cbm | ∅ | 7.84 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | measurement_raw | ∅ | 7.84 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | number_of_packages | ∅ | 22 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | number_of_packages_raw | ∅ | 22 |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | package_type_snapshot | ∅ | PALLET(S) |
| S2608023 | I490602506 | bill_of_lading_containers / 440 | package_type_id | ∅ | 177 |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | port_of_loading_id | 42 | 35990 |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | TOKYO, JP (JPTYO) |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | port_of_discharge_id | 35146 | 35135 |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | TOKYO, JP (JPTYO) |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | place_of_delivery_port_id | 35146 | 35135 |
| S2608021 | EMFUIHYOK020976 | booking_records / 345 | vessel_voyage | BIENDONG NAVIGATOR / NB2633S | BIENDONG NAVIGATOR / NB2631S |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | ocean_vessel | SITC MINHE/2623N | BIENDONG NAVIGATOR / NB2631S |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | fbl_number | STVN-260905 | ST2608021 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | freight_terms | FREIGHT PREPAID | FREIGHT COLLECT |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | freight_payable_at | QUI NHON, VN (VNUIH) | TOKYO, JP (JPTYO) |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | place_of_receipt_port_id | ∅ | 42 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | port_of_discharge_name | YOKOHAMA, JP (JPYOK) | TOKYO, JP (JPTYO) |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | port_of_discharge_id | 35146 | 35135 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | place_of_delivery_name | YOKOHAMA, JP (JPYOK) | TOKYO, JP (JPTYO) |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | place_of_delivery_port_id | 35146 | 35135 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | place_of_issue_name | QUY NHON PORT, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | place_of_issue_port_id | 42 | 35990 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | shipper_party_id | 1 | 48 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | consigned_to_order_of | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | consignee_party_id | 34 | 47 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | notify_address | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | notify_party_id | 34 | 47 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | description_of_goods | GRANITE STONE<br>HS CODE : 68010000<br>ORDER NUMBER: 260630-01A,260630-01B | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 182/PT-CT<br>HS CODE: 68010000 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | document_date | 2026-09-07 | 2026-08-23 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | clean_on_board_date | 2026-09-07 | 2026-08-23 |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | bl_form_variant | surrendered | original |
| S2608021 | EMFUIHYOK020976 | bill_of_lading_records / 315 | number_of_originals | ZERO/0 | THREE/3 |
| S2608020 | EMFUIHTYO020975 | booking_records / 346 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608020 | EMFUIHTYO020975 | booking_records / 346 | port_of_loading_id | 42 | 35990 |
| S2608020 | EMFUIHTYO020975 | booking_records / 346 | vessel_voyage | BIENDONG NAVIGATOR / NB2633S | BIENDONG NAVIGATOR / NB2631S |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | ocean_vessel | SITC MINHE/2623N | BIENDONG NAVIGATOR / NB2631S |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | fbl_number | STVN-260904 | ST2608020 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | freight_payable_at | TOKYO, JP (JPTYO) | DA NANG, VN (VNDAD) |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | place_of_receipt_port_id | ∅ | 42 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | port_of_discharge_id | ∅ | 35135 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | place_of_delivery_port_id | ∅ | 35135 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | place_of_issue_name | QUY NHON PORT, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | place_of_issue_port_id | 42 | 35990 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | shipper_party_id | 2 | 48 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81354083733  FAX: 81354083589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | description_of_goods | BASALT  STONES | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 182/PT-CT<br>HS CODE: 68010000 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | document_date | 2026-09-07 | 2026-08-23 |
| S2608020 | EMFUIHTYO020975 | bill_of_lading_records / 316 | clean_on_board_date | 2026-09-07 | 2026-08-23 |
| S2608019 | EMFUIHTYO020974 | booking_records / 347 | etd | 2026-09-01 | 2026-09-05 |
| S2608019 | EMFUIHTYO020974 | booking_records / 347 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608019 | EMFUIHTYO020974 | booking_records / 347 | port_of_loading_id | 42 | 35990 |
| S2608019 | EMFUIHTYO020974 | booking_records / 347 | mother_vessel_voyage | YOUCAN / 2625N | SITC MINHE / 2623N |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | fbl_number | ST2608019 | STVN-260907 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | mbl_number | SITGDATK078190 | SITGDATK078382 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | port_of_loading_id | 42 | 35990 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | description_of_goods | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 182/PT-CT<br>HS CODE: 68010000 | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 212/PT-CT<br>HS CODE: 68010000<br>FEEDER: BIENDONG NAVIGATOR<br>NB2633S |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | document_date | 2026-09-01 | 2026-09-07 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_records / 317 | clean_on_board_date | 2026-09-01 | 2026-09-07 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | container_no | ∅ | SITU2657054 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | seal_no | ∅ | SITB145849 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | gross_weight_kg | ∅ | 21000 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | gross_weight_raw | ∅ | 21,000 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | measurement_cbm | 10.000 | 8 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | measurement_raw | 10 | 8 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | number_of_packages | ∅ | 21 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | number_of_packages_raw | ∅ | 21 |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | package_type_snapshot | PALLET(S) | CRATE(S) |
| S2608019 | EMFUIHTYO020974 | bill_of_lading_containers / 4 | package_type_id | 177 | 145 |
| S2608018 | EMFUIHOSA020957 | booking_records / 348 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608018 | EMFUIHOSA020957 | booking_records / 348 | port_of_loading_id | 42 | 35990 |
| S2608018 | EMFUIHOSA020957 | booking_records / 348 | mother_vessel_voyage | YOUCAN / 2625N | SITC MINHE / 2623N |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | fbl_number | ST2608018 | STVN-260906 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | mbl_number | SITGDATK078190 | SITGDAOS078340 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | freight_payable_at | TOKYO, JP (JPTYO) | OSAKA, JP (JPOSA) |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | port_of_loading_id | 42 | 35990 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | description_of_goods | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 182/PT-CT<br>HS CODE: 68010000 | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 244/PT-CT<br>HS CODE: 68010000<br>FEEDER: BIENDONG NAVIGATOR<br>NB2633S |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | document_date | 2026-09-01 | 2026-09-07 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_records / 318 | clean_on_board_date | 2026-09-01 | 2026-09-07 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | container_no | ∅ | FTAU2420390 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | seal_no | ∅ | SITB145848 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | gross_weight_kg | ∅ | 21000 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | gross_weight_raw | ∅ | 21,000 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | measurement_cbm | 10.000 | 7.87 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | measurement_raw | 10 | 7.87 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | number_of_packages | ∅ | 21 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | number_of_packages_raw | ∅ | 21 |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | package_type_snapshot | PALLET(S) | CRATE(S) |
| S2608018 | EMFUIHOSA020957 | bill_of_lading_containers / 6 | package_type_id | 177 | 145 |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | port_of_loading_id | 42 | 35990 |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | port_of_discharge_name | KOBE, HYOGO, JP (JPUKB) | KOBE, JP (JPUKB) |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | place_of_delivery_name | KOBE, HYOGO, JP (JPUKB) | KOBE, JP (JPUKB) |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | mother_vessel_voyage | YOUCAN / 2625N | SITC MINHE / 2623N |
| S2608017 | EMFUIHUKB020956 | booking_records / 349 | vessel_voyage | BIENDONG NAVIGATOR / NB2633S | BIENDONG NAVIGATOR / NB2631S |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | ocean_vessel | BIENDONG NAVIGATOR / NB2633S | BIENDONG NAVIGATOR / NB2631S |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | freight_payable_at | TOKYO, JP (JPTYO) | KOBE, JP (JPUKB) |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | port_of_loading_id | 42 | 35990 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | port_of_discharge_name | KOBE, HYOGO, JP (JPUKB) | KOBE, JP (JPUKB) |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | place_of_delivery_name | KOBE, HYOGO, JP (JPUKB) | KOBE, JP (JPUKB) |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | description_of_goods | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 182/PT-CT<br>HS CODE: 68010000 | GRANITE STONES AS PER PURCHASE<br>CONTRACT NO. 2026 236/PT-CT<br>HS CODE: 68010000<br>FEEDER: BIENDONG NAVIGATOR<br>NB2633S |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | document_date | 2026-08-01 | 2026-09-07 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | clean_on_board_date | 2026-08-01 | 2026-09-07 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | bl_form_variant | surrendered | original |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_records / 319 | number_of_originals | ZERO/0 | THREE/3 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | container_no | ∅ | SITU2464939 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | seal_no | ∅ | SITR977695 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | gross_weight_kg | ∅ | 21000 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | gross_weight_raw | ∅ | 21,000 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | measurement_cbm | 10.000 | 7.69 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | measurement_raw | 10 | 7.69 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | number_of_packages | ∅ | 21 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | number_of_packages_raw | ∅ | 21 |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | package_type_snapshot | PALLET(S) | CRATE(S) |
| S2608017 | EMFUIHUKB020956 | bill_of_lading_containers / 1309 | package_type_id | 177 | 145 |
| S2608016 | EMFUIHYOK020835 | booking_records / 35 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608016 | EMFUIHYOK020835 | booking_records / 35 | port_of_loading_id | 42 | 35990 |
| S2608016 | EMFUIHYOK020835 | booking_records / 35 | mother_vessel_voyage | YOUCAN / 2625N | SITC FANGCHENG / 2617N |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | port_of_loading_id | 42 | 35990 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | document_date | 2026-08-18 | 2026-08-24 |
| S2608016 | EMFUIHYOK020835 | bill_of_lading_records / 5 | clean_on_board_date | 2026-08-18 | 2026-08-24 |
| S2608015 | EMFUIHOSA020838 | booking_records / 350 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608015 | EMFUIHOSA020838 | booking_records / 350 | port_of_loading_id | 42 | 35990 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | port_of_loading_id | 42 | 35990 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81354083733  FAX: 81354083589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | document_date | 2026-08-18 | 2026-08-23 |
| S2608015 | EMFUIHOSA020838 | bill_of_lading_records / 320 | clean_on_board_date | 2026-08-18 | 2026-08-23 |
| S2608014 | SNKO101260801031 | booking_records / 36 | mother_vessel_voyage | ∅ | SAWASDEE INCHEON / 2609N |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | notify_party_same_as_consignee | false | true |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | fbl_number | ST2608014 | STVN-260819 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | mbl_number | ∅ | SNKO101260801031 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | freight_terms | ∅ | FREIGHT PREPAID |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | freight_payable_at | ∅ | CAT LAI, VN (VNCLI) |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | place_of_issue_name | ∅ | CAT LAI, VN (VNCLI) |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | place_of_issue_port_id | ∅ | 35988 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | consigned_to_order_of | ∅ | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | consignee_party_id | ∅ | 34 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | notify_address | ∅ | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | notify_party_id | ∅ | 34 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | delivery_apply_to | ∅ | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | delivery_apply_to_party_id | ∅ | 46 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | description_of_goods | STONE PRODUCTS IN PALLETS | GRANITE STONE<br>HS CODE: 68010000<br>ORDER NUMBER: 260710KT |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | document_date | 2026-08-27 | 2026-08-31 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | clean_on_board_date | 2026-08-27 | 2026-08-31 |
| S2608014 | SNKO101260801031 | bill_of_lading_records / 6 | bl_form_variant | non_negotiable | original |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | container_no | ∅ | TEMU1133868 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | seal_no | ∅ | 514435 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | gross_weight_kg | ∅ | 21450 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | gross_weight_raw | ∅ | 21,450 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | measurement_cbm | 10.000 | 7.526 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | measurement_raw | 10 | 7.526 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | number_of_packages | ∅ | 20 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | number_of_packages_raw | ∅ | 20 |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | package_type_snapshot | PALLET(S) | CRATE(S) |
| S2608014 | SNKO101260801031 | bill_of_lading_containers / 205 | package_type_id | 177 | 145 |
| S2608013 | EMFUIHOSA020812 | booking_records / 37 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608013 | EMFUIHOSA020812 | booking_records / 37 | port_of_loading_id | 42 | 35990 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | port_of_loading_id | 42 | 35990 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | description_of_goods | GRANITE STONES, BASALT STONES<br>HS CODE: 68010000 | BASALT STONES<br>HS CODE: 68010000 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | document_date | 2026-08-18 | 2026-08-23 |
| S2608013 | EMFUIHOSA020812 | bill_of_lading_records / 7 | clean_on_board_date | 2026-08-18 | 2026-08-23 |
| S2608012 | EMFUIHYOK020815 | booking_records / 38 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608012 | EMFUIHYOK020815 | booking_records / 38 | port_of_loading_id | 42 | 35990 |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | port_of_loading_id | 42 | 35990 |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | consigned_to_order_of | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | notify_address | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | document_date | 2026-08-18 | 2026-08-24 |
| S2608012 | EMFUIHYOK020815 | bill_of_lading_records / 8 | clean_on_board_date | 2026-08-18 | 2026-08-24 |
| S2608011 | EMFUIHTYO020817 | booking_records / 351 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608011 | EMFUIHTYO020817 | booking_records / 351 | port_of_loading_id | 42 | 35990 |
| S2608011 | EMFUIHTYO020817 | booking_records / 351 | mother_vessel_voyage | YOUCAN / 2625N | SITC FANGCHENG / 2617N |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | port_of_loading_id | 42 | 35990 |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81354083733  FAX: 81354083589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | document_date | 2026-08-18 | 2026-08-24 |
| S2608011 | EMFUIHTYO020817 | bill_of_lading_records / 321 | clean_on_board_date | 2026-08-18 | 2026-08-24 |
| S2608010 | EMFUIHYOK020818 | booking_records / 352 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608010 | EMFUIHYOK020818 | booking_records / 352 | port_of_loading_id | 42 | 35990 |
| S2608010 | EMFUIHYOK020818 | booking_records / 352 | mother_vessel_voyage | YOUCAN / 2625N | SITC FANGCHENG / 2617N |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | port_of_loading_id | 42 | 35990 |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | document_date | 2026-08-18 | 2026-08-24 |
| S2608010 | EMFUIHYOK020818 | bill_of_lading_records / 322 | clean_on_board_date | 2026-08-18 | 2026-08-24 |
| S2608009 | BK-3 | booking_records / 555 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2608009 | BK-3 | booking_records / 555 | port_of_loading_id | 35988 | 35996 |
| S2608009 | BK-3 | booking_records / 555 | place_of_delivery_name | ∅ | YOKOHAMA, KANAGAWA, JP (JPYOK) |
| S2608009 | BK-3 | booking_records / 555 | place_of_delivery_port_id | ∅ | 35146 |
| S2608009 | BK-3 | booking_records / 555 | vessel_voyage | ∅ | INTERASIA TACTIC / N012 |
| S2608007 | ASC0534619 | bill_of_lading_records / 323 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2608006 | EMFUIHYOK020658 | booking_records / 354 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608006 | EMFUIHYOK020658 | booking_records / 354 | port_of_loading_id | 42 | 35990 |
| S2608006 | EMFUIHYOK020658 | bill_of_lading_records / 324 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608006 | EMFUIHYOK020658 | bill_of_lading_records / 324 | port_of_loading_id | 42 | 35990 |
| S2608006 | EMFUIHYOK020658 | bill_of_lading_records / 324 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2608005 | EMFUIHOSA020654 | booking_records / 39 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608005 | EMFUIHOSA020654 | booking_records / 39 | port_of_loading_id | 42 | 35990 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | port_of_loading_id | 42 | 35990 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | document_date | 2026-08-12 | 2026-08-19 |
| S2608005 | EMFUIHOSA020654 | bill_of_lading_records / 9 | clean_on_board_date | 2026-08-12 | 2026-08-19 |
| S2608004 | EMFUIHOSA020650 | booking_records / 355 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608004 | EMFUIHOSA020650 | booking_records / 355 | port_of_loading_id | 42 | 35990 |
| S2608004 | EMFUIHOSA020650 | bill_of_lading_records / 325 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2608004 | EMFUIHOSA020650 | bill_of_lading_records / 325 | port_of_loading_id | 42 | 35990 |
| S2608004 | EMFUIHOSA020650 | bill_of_lading_records / 325 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2608003 | I490600169 | booking_records / 40 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2608003 | I490600169 | booking_records / 40 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2608003 | I490600169 | bill_of_lading_records / 10 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2608003 | I490600169 | bill_of_lading_records / 10 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2608003 | I490600169 | bill_of_lading_records / 10 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2608003 | I490600169 | bill_of_lading_records / 10 | consigned_to_order_of | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2608003 | I490600169 | bill_of_lading_records / 10 | notify_address | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2608003 | I490600169 | bill_of_lading_records / 10 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608002 | A59GX25812 | booking_records / 41 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2608002 | A59GX25812 | booking_records / 41 | port_of_loading_id | 35988 | 35996 |
| S2608002 | A59GX25812 | booking_records / 41 | mother_vessel_voyage | WAN HAI 332 / N015 | WAN HAI 325 / N061 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | ocean_vessel | WAN HAI 325 N061 | WAN HAI 332 / N015 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | place_of_receipt_port_id | ∅ | 35988 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | port_of_loading_id | ∅ | 35996 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | port_of_discharge_id | ∅ | 35146 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | place_of_delivery_port_id | ∅ | 35146 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | place_of_issue_port_id | ∅ | 35996 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | consigned_to_order_of | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | notify_address | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | document_date | 2026-08-21 | 2026-09-01 |
| S2608002 | A59GX25812 | bill_of_lading_records / 11 | clean_on_board_date | 2026-08-30 | 2026-09-01 |
| S2607036 | EMFUIHUKB020568 | booking_records / 42 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607036 | EMFUIHUKB020568 | booking_records / 42 | port_of_loading_id | 42 | 35990 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | port_of_loading_id | 42 | 35990 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | consigned_to_order_of | SEKIGAHARA STONE CO., LTD.<br>2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN<br>TEL: 81584425974 | SEKIGAHARA STONE CO., LTD. 2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN +81-584-43-5974 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | notify_address | SEKIGAHARA STONE CO., LTD.<br>2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN<br>TEL: 81584425974 | SEKIGAHARA STONE CO., LTD. 2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN +81-584-43-5974 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | document_date | 2026-08-05 | 2026-08-12 |
| S2607036 | EMFUIHUKB020568 | bill_of_lading_records / 12 | clean_on_board_date | 2026-08-05 | 2026-08-12 |
| S2607035 | EMFUIHOSA020565 | booking_records / 43 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607035 | EMFUIHOSA020565 | booking_records / 43 | port_of_loading_id | 42 | 35990 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | port_of_loading_id | 42 | 35990 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81354083733  FAX: 81354083589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | document_date | 2026-08-05 | 2026-08-10 |
| S2607035 | EMFUIHOSA020565 | bill_of_lading_records / 13 | clean_on_board_date | 2026-08-05 | 2026-08-10 |
| S2607034 | EMFUIHTYO020576 | booking_records / 356 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607034 | EMFUIHTYO020576 | booking_records / 356 | port_of_loading_id | 42 | 35990 |
| S2607034 | EMFUIHTYO020576 | booking_records / 356 | mother_vessel_voyage | SITC MINHE / 2621N | SITC YUANHE / 2623N |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | port_of_loading_id | 42 | 35990 |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | document_date | 2026-08-12 | 2026-08-18 |
| S2607034 | EMFUIHTYO020576 | bill_of_lading_records / 326 | clean_on_board_date | 2026-08-12 | 2026-08-18 |
| S2607033 | EMFUIHNGO020365 | booking_records / 44 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607033 | EMFUIHNGO020365 | booking_records / 44 | port_of_loading_id | 42 | 35990 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | port_of_loading_id | 42 | 35990 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | consignor | ASIA FINEST LIMITED<br>UNIT 11C, CHINA INSURANCE BUILDING, 48 CAMERON ROAD, TSIM SHA TSUI, HONG KONG | ASIA FINEST LIMITED UNIT F,9/F,CHINA INSURANCE BUILDING,48 CAMERON ROAD, TSIM SHA TSUI,KOWLOON,HONG KONG. |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | consigned_to_order_of | TAKETO SHOTEN CO., LTD.<br>1622 KOMAKIHARA KOMAKI CITY AICHI - PREFECTURE, 485-0012 JAPAN | TAKETO SHOTEN CO., LTD. 1622 KOMAKIHARASHINDEN KOMAKI, AICHI, JAPAN TEL:+81-568-77-2321 FAX:+81-568-77-0117 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | notify_address | TAKETO SHOTEN CO., LTD.<br>1622 KOMAKIHARA KOMAKI CITY AICHI - PREFECTURE, 485-0012 JAPAN | TAKETO SHOTEN CO., LTD. 1622 KOMAKIHARASHINDEN KOMAKI, AICHI, JAPAN TEL:+81-568-77-2321 FAX:+81-568-77-0117 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | document_date | 2026-08-05 | 2026-08-12 |
| S2607033 | EMFUIHNGO020365 | bill_of_lading_records / 14 | clean_on_board_date | 2026-08-05 | 2026-08-12 |
| S2607032 | EMFUIHHKT020364 | booking_records / 357 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607032 | EMFUIHHKT020364 | booking_records / 357 | port_of_loading_id | 42 | 35990 |
| S2607032 | EMFUIHHKT020364 | booking_records / 357 | port_of_discharge_name | HAKATA, FUKUOKA, JP (JPHKT) | HAKATA, JP (JPHKT) |
| S2607032 | EMFUIHHKT020364 | booking_records / 357 | place_of_delivery_name | HAKATA, FUKUOKA, JP (JPHKT) | HAKATA, JP (JPHKT) |
| S2607032 | EMFUIHHKT020364 | booking_records / 357 | mother_vessel_voyage | M. ATLAS / 2623N | SITC HONGKONG / 2625N |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | port_of_loading_id | 42 | 35990 |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | port_of_discharge_name | HAKATA, FUKUOKA, JP (JPHKT) | HAKATA, JP (JPHKT) |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | place_of_delivery_name | HAKATA, FUKUOKA, JP (JPHKT) | HAKATA, JP (JPHKT) |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | consigned_to_order_of | CHORI GLEX CO., LTD<br>30F TOWER A, SHINAGAWA INTERCITY 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN TEL: +81 3 5715 4350 FAX: +81 3 3450 5169<br>TEL: 81357154357  FAX: 81334505169 | CHORI GLEX CO., LTD 30F TOWER A, SHINAGAWA INTERCITY, 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN Tel: +81-3-5715-4350 FAX: +81 3 3450 5169 |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | notify_address | CHORI GLEX CO., LTD<br>30F TOWER A, SHINAGAWA INTERCITY 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN TEL: +81 3 5715 4350 FAX: +81 3 3450 5169<br>TEL: 81357154357  FAX: 81334505169 | CHORI GLEX CO., LTD 30F TOWER A, SHINAGAWA INTERCITY, 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN Tel: +81-3-5715-4350 FAX: +81 3 3450 5169 |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | document_date | 2026-07-29 | 2026-08-11 |
| S2607032 | EMFUIHHKT020364 | bill_of_lading_records / 327 | clean_on_board_date | 2026-07-29 | 2026-08-11 |
| S2607031 | EMFUIHOSA020363 | booking_records / 45 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607031 | EMFUIHOSA020363 | booking_records / 45 | port_of_loading_id | 42 | 35990 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | port_of_loading_id | 42 | 35990 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | document_date | 2026-07-29 | 2026-08-04 |
| S2607031 | EMFUIHOSA020363 | bill_of_lading_records / 15 | clean_on_board_date | 2026-07-29 | 2026-08-04 |
| S2607030 | EMFUIHXMN020368 | booking_records / 556 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607030 | EMFUIHXMN020368 | booking_records / 556 | port_of_loading_id | 42 | 35990 |
| S2607030 | EMFUIHXMN020368 | booking_records / 556 | place_of_delivery_name | ∅ | XIAMEN (XIAN), CN (CNXMN) |
| S2607030 | EMFUIHXMN020368 | booking_records / 556 | place_of_delivery_port_id | ∅ | 34579 |
| S2607029 | EMFUIHDADYOK020337 | booking_records / 46 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607029 | EMFUIHDADYOK020337 | booking_records / 46 | port_of_loading_id | 42 | 35990 |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | port_of_loading_id | 42 | 35990 |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | consigned_to_order_of | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | notify_address | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | document_date | 2026-08-05 | 2026-08-12 |
| S2607029 | EMFUIHDADYOK020337 | bill_of_lading_records / 16 | clean_on_board_date | 2026-08-05 | 2026-08-12 |
| S2607028 | EMFUIHNGO020339 | booking_records / 358 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607028 | EMFUIHNGO020339 | booking_records / 358 | port_of_loading_id | 42 | 35990 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | port_of_loading_id | 42 | 35990 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | document_date | 2026-07-28 | 2026-08-05 |
| S2607028 | EMFUIHNGO020339 | bill_of_lading_records / 328 | clean_on_board_date | 2026-07-28 | 2026-08-05 |
| S2607027 | A59GX23719 | booking_records / 47 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607027 | A59GX23719 | booking_records / 47 | port_of_loading_id | 35988 | 35996 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | port_of_loading_id | 35988 | 35996 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | place_of_issue_port_id | ∅ | 35996 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | document_date | 2026-08-08 | 2026-08-09 |
| S2607027 | A59GX23719 | bill_of_lading_records / 17 | clean_on_board_date | 2026-08-08 | 2026-08-09 |
| S2607026 | BK-2 | booking_records / 557 | place_of_receipt_name | CHONGQING, CN (CNCKG) | SHIMIZU CY |
| S2607026 | BK-2 | booking_records / 557 | place_of_receipt_port_id | ∅ | ∅ |
| S2607026 | BK-2 | booking_records / 557 | port_of_loading_name | CHONGQING, CN (CNCKG) | SHIMIZU, JAPAN |
| S2607026 | BK-2 | booking_records / 557 | port_of_loading_id | ∅ | ∅ |
| S2607026 | BK-2 | booking_records / 557 | port_of_discharge_name | QUI NHON, VN (VNUIH) | HAIPHONG, VIETNAM |
| S2607026 | BK-2 | booking_records / 557 | port_of_discharge_id | 42 | ∅ |
| S2607026 | BK-2 | booking_records / 557 | place_of_delivery_name | ∅ | HAIPHONG (TAN VU TERMINAL) |
| S2607026 | BK-2 | booking_records / 557 | place_of_delivery_port_id | ∅ | ∅ |
| S2607026 | BK-2 | booking_records / 557 | vessel_voyage | ∅ | SMOOTH WIND / 0FXH8N1NC/022S |
| S2607023 | EMFUIHOSA020156 | booking_records / 48 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607023 | EMFUIHOSA020156 | booking_records / 48 | port_of_loading_id | 42 | 35990 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | port_of_loading_id | 42 | 35990 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | document_date | 2026-07-19 | 2026-07-25 |
| S2607023 | EMFUIHOSA020156 | bill_of_lading_records / 18 | clean_on_board_date | 2026-07-19 | 2026-07-25 |
| S2607022 | EMFUIHMOJ020159 | booking_records / 359 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607022 | EMFUIHMOJ020159 | booking_records / 359 | port_of_loading_id | 42 | 35990 |
| S2607022 | EMFUIHMOJ020159 | booking_records / 359 | mother_vessel_voyage | YOUCAN / 2625N | SITC LIDE / 2623N |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | port_of_loading_id | 42 | 35990 |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | document_date | 2026-07-31 | 2026-08-21 |
| S2607022 | EMFUIHMOJ020159 | bill_of_lading_records / 329 | clean_on_board_date | 2026-07-31 | 2026-08-21 |
| S2607021 | EMFUIHTYO020158 | booking_records / 360 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607021 | EMFUIHTYO020158 | booking_records / 360 | port_of_loading_id | 42 | 35990 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | port_of_loading_id | 42 | 35990 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | document_date | 2026-07-25 | 2026-08-10 |
| S2607021 | EMFUIHTYO020158 | bill_of_lading_records / 330 | clean_on_board_date | 2026-07-25 | 2026-08-10 |
| S2607020 | EMFUIHOSA020157 | booking_records / 361 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607020 | EMFUIHOSA020157 | booking_records / 361 | port_of_loading_id | 42 | 35990 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | port_of_loading_id | 42 | 35990 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | document_date | 2026-07-25 | 2026-08-10 |
| S2607020 | EMFUIHOSA020157 | bill_of_lading_records / 331 | clean_on_board_date | 2026-07-25 | 2026-08-10 |
| S2607019 | EMFUIHOSA020154 | booking_records / 362 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607019 | EMFUIHOSA020154 | booking_records / 362 | port_of_loading_id | 42 | 35990 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | port_of_loading_id | 42 | 35990 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | document_date | 2026-07-19 | 2026-07-24 |
| S2607019 | EMFUIHOSA020154 | bill_of_lading_records / 332 | clean_on_board_date | 2026-07-19 | 2026-07-24 |
| S2607018 | A59GX22157 | booking_records / 49 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607018 | A59GX22157 | booking_records / 49 | port_of_loading_id | 35988 | 35996 |
| S2607018 | A59GX22157 | bill_of_lading_records / 19 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607018 | A59GX22157 | bill_of_lading_records / 19 | port_of_loading_id | 35988 | 35996 |
| S2607018 | A59GX22157 | bill_of_lading_records / 19 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2607017 | A59GX22085 | booking_records / 50 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607017 | A59GX22085 | booking_records / 50 | port_of_loading_id | 35988 | 35996 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | port_of_loading_id | 35988 | 35996 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | place_of_issue_port_id | ∅ | 35996 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607017 | A59GX22085 | bill_of_lading_records / 20 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607016 | 239600078662 | booking_records / 558 | place_of_delivery_name | ∅ | TAICHUNG, TW (TWTXG) |
| S2607016 | 239600078662 | booking_records / 558 | place_of_delivery_port_id | ∅ | 35977 |
| S2607015 | EMFUIHOSA020015 | booking_records / 51 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607015 | EMFUIHOSA020015 | booking_records / 51 | port_of_loading_id | 42 | 35990 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | port_of_loading_id | 42 | 35990 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | document_date | 2026-07-14 | 2026-07-17 |
| S2607015 | EMFUIHOSA020015 | bill_of_lading_records / 21 | clean_on_board_date | 2026-07-14 | 2026-07-17 |
| S2607014 | EMFUIHOSA020064 | booking_records / 363 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607014 | EMFUIHOSA020064 | booking_records / 363 | port_of_loading_id | 42 | 35990 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | port_of_loading_id | 42 | 35990 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | document_date | 2026-07-19 | 2026-07-24 |
| S2607014 | EMFUIHOSA020064 | bill_of_lading_records / 333 | clean_on_board_date | 2026-07-19 | 2026-07-24 |
| S2607013 | EMFUIHYOK020065 | booking_records / 364 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607013 | EMFUIHYOK020065 | booking_records / 364 | port_of_loading_id | 42 | 35990 |
| S2607013 | EMFUIHYOK020065 | booking_records / 364 | mother_vessel_voyage | M. ATLAS / 2623N | SITC YUANHE / 2623N |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | port_of_loading_id | 42 | 35990 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | document_date | 2026-07-25 | 2026-08-18 |
| S2607013 | EMFUIHYOK020065 | bill_of_lading_records / 334 | clean_on_board_date | 2026-07-25 | 2026-08-18 |
| S2607009 | BK-1 | booking_records / 559 | place_of_delivery_name | ∅ | OSAKA, JP (JPOSA) |
| S2607009 | BK-1 | booking_records / 559 | place_of_delivery_port_id | ∅ | 35117 |
| S2607008 | A59GX21830 | booking_records / 52 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607008 | A59GX21830 | booking_records / 52 | port_of_loading_id | 35988 | 35996 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | port_of_loading_id | 35988 | 35996 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | place_of_issue_port_id | ∅ | 35996 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607008 | A59GX21830 | bill_of_lading_records / 22 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607007 | SITSGKB0706G188785 | booking_records / 365 | place_of_receipt_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607007 | SITSGKB0706G188785 | booking_records / 365 | place_of_receipt_port_id | 35988 | 35996 |
| S2607007 | SITSGKB0706G188785 | booking_records / 365 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607007 | SITSGKB0706G188785 | booking_records / 365 | port_of_loading_id | 35988 | 35996 |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | place_of_receipt_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | place_of_receipt_port_id | 35988 | 35996 |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | port_of_loading_id | 35988 | 35996 |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | consigned_to_order_of | CHORI GLEX CO., LTD<br>30F TOWER A, SHINAGAWA INTERCITY 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN TEL: +81 3 5715 4350 FAX: +81 3 3450 5169<br>TEL: 81357154357  FAX: 81334505169 | CHORI GLEX CO., LTD 30F TOWER A, SHINAGAWA INTERCITY, 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN Tel: +81-3-5715-4350 |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | notify_address | CHORI GLEX CO., LTD<br>30F TOWER A, SHINAGAWA INTERCITY 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN TEL: +81 3 5715 4350 FAX: +81 3 3450 5169<br>TEL: 81357154357  FAX: 81334505169 | CHORI GLEX CO., LTD 30F TOWER A, SHINAGAWA INTERCITY, 15-1 KONAN 2-CHOME, MINATO-KU, TOKYO 108-6030, JAPAN Tel: +81-3-5715-4350 |
| S2607007 | SITSGKB0706G188785 | bill_of_lading_records / 335 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607006 | SITSGOS0706G188780 | booking_records / 53 | place_of_receipt_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607006 | SITSGOS0706G188780 | booking_records / 53 | place_of_receipt_port_id | 35988 | 35996 |
| S2607006 | SITSGOS0706G188780 | booking_records / 53 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607006 | SITSGOS0706G188780 | booking_records / 53 | port_of_loading_id | 35988 | 35996 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | place_of_receipt_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | place_of_receipt_port_id | 35988 | 35996 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | port_of_loading_name | CAT LAI, VN (VNCLI) | HO CHI MINH CITY, VN (VNSGN) |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | port_of_loading_id | 35988 | 35996 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM TEL: +84-256-3 701 745 /FAX: +84-256-3 733 255 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607006 | SITSGOS0706G188780 | bill_of_lading_records / 23 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607005 | I490596654 | booking_records / 54 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607005 | I490596654 | booking_records / 54 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607005 | I490596654 | bill_of_lading_records / 24 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607005 | I490596654 | bill_of_lading_records / 24 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607005 | I490596654 | bill_of_lading_records / 24 | consignor | TAN HOANG THACH SON COMPANY LTD.<br>VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE , GIA LAI PROVINCE,VIET NAM<br>TEL: 84977706964 | TAN HOANG THACH SON COMPANY LTD. VAN HOI 2 VILLAGE, TUY PHUOC COMMUNE, GIA LAI PROVINCE,VIET NAM TEL: +84 0977-706-964 |
| S2607005 | I490596654 | bill_of_lading_records / 24 | consigned_to_order_of | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2607005 | I490596654 | bill_of_lading_records / 24 | notify_address | AIZ CORPORATION<br>1402 -3 SIMONAKANO,MINAMI KU, OKAYAMA CITY 700-0973, JAPAN | AIZ CORPORATION 1402 -3 SIMONAKANO,MINAMI – KU, OKAYAMA – CITY 700-0973, JAPAN |
| S2607005 | I490596654 | bill_of_lading_records / 24 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607005 | I490596654 | bill_of_lading_records / 24 | document_date | 2026-07-19 | 2026-07-21 |
| S2607005 | I490596654 | bill_of_lading_records / 24 | clean_on_board_date | 2026-07-19 | 2026-07-21 |
| S2607004 | ASC0528245 | booking_records / 55 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607004 | ASC0528245 | booking_records / 55 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | port_of_discharge_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | place_of_delivery_name | YOKOHAMA, KANAGAWA, JP (JPYOK) | YOKOHAMA, JP (JPYOK) |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | consigned_to_order_of | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | notify_address | KOWA COMPANY LTD<br>6-29, Nishiki 3 - Chome, Naka-Ku, Nagoya 460-8625, Japan<br>TEL: 81529633091  FAX: 81529633093 | KOWA COMPANY LTD 6-29, NISHIKI 3 - CHOME, NAKA-KU, NAGOYA 460-8625, JAPAN TEL: +81(52)-963-3091 /FAX: +81(52)-963-3093 EMAIL: KOWA-SHIZAI@KOWA.CO.JP |
| S2607004 | ASC0528245 | bill_of_lading_records / 25 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607003 | EUIHMFDADHKT019810 | booking_records / 56 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607003 | EUIHMFDADHKT019810 | booking_records / 56 | port_of_loading_id | 42 | 35990 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | port_of_loading_name | QUI NHON, VN (VNUIH) | DA NANG, VN (VNDAD) |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | port_of_loading_id | 42 | 35990 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | consignor | AN THINH STONE CO., LTD<br>92 HAI BA TRUNG STREET, QUY NHON WARD, GIA LAI PROVINCE, VIETNAM | AN THINH STONE CO., LTD 92 HAI BA TRUNG STREET, QUY NHON WARD GIA LAI PROVINCE, VIETNAM |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | consigned_to_order_of | SEKIGAHARA STONE CO., LTD.<br>2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN<br>TEL: 81584425974 | SEKIGAHARA STONE CO., LTD. 2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN +81-584-43-5974 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | notify_address | SEKIGAHARA STONE CO., LTD.<br>2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN<br>TEL: 81584425974 | SEKIGAHARA STONE CO., LTD. 2682 SEKIGAHARA, FUWA-GUN, GIFU-KEN, 503-1595 JAPAN +81-584-43-5974 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | document_date | 2026-07-08 | 2026-07-12 |
| S2607003 | EUIHMFDADHKT019810 | bill_of_lading_records / 26 | clean_on_board_date | 2026-07-08 | 2026-07-12 |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | consignor | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY<br>CLUSTER 8, QUARTER 8, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM | ENTERPRISE 380-PHU TAI JOINT STOCK COMPANY CLUSTER 8, QUARTER 4, QUY NHON BAC WARD, GIA LAI PROVINCE, VIET NAM |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | consigned_to_order_of | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | notify_address | ESPERAND LTD.<br>SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN . PO : 101-0052<br>TEL: 81355773825  FAX: 81355773826 | ESPERAND LTD. SHIMODA BLD , 2-8-21, KANDAOGAWAMACHI, CHIYODA-KU, TOKYO, JAPAN PO : 101-0052 TEL : 03-5577-3825 FAX : 03-5577-3826 |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | document_date | 2026-07-04 | 2026-07-07 |
| S2607002 | ASC0527805 | bill_of_lading_records / 336 | clean_on_board_date | 2026-07-04 | 2026-07-07 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | consignor | HOANG KHANG NATURAL STONE CO., LTD<br>LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM<br>TEL: 84837157987  FAX: 8483715798 | HOANG KHANG NATURAL STONE CO., LTD LOT E9, DAI PHU GIA PROJECT, BAC SONG HA THANH COMMERCIAL URBAN AREA, QUY NHON DONG WARD, GIA LAI PROVINCE, VIETNAM TEL: 848.37157987 Fax: 848.3715798 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | consigned_to_order_of | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | notify_address | TOYO SEKISO CO., LTD.<br>1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223<br>TEL: 81749428100  FAX: 81749428130 | TOYO SEKISO CO., LTD. 1578-1 SHIMAKAWA AISHO-CHO ECHI-GUN SHIGA JAPAN 529-1223 TEL: 81-749-428100 FAX: 81-749-428130 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | delivery_apply_to | APEX INTERNATIONAL INC.<br>7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN<br>TEL: 81-3-5408-3733<br>FAX: 81-3-5408-3589 | APEX INTERNATIONAL INC. 7F, TOYOKUNI BLDG, 2-4-6, SHIBA-DAIMON, MINATO-KU, TOKYO 105-0012 JAPAN TEL . 81-3-5408-3733 FAX . 81-3-5408-3589 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | document_date | 2026-07-13 | 2026-07-20 |
| S2607001 | ASC0527807 | bill_of_lading_records / 337 | clean_on_board_date | 2026-07-13 | 2026-07-20 |

## Chứng từ/dòng mới

| Shipment ID | Booking No. | Bảng | ID sau nhập |
|---|---|---|---|
| S2609012 | ASC0541389 | bill_of_lading_records | 515 |
| S2609012 | ASC0541389 | bill_of_lading_containers | 1327 |
| S2609011 | EMFUIHSHK021531 | bill_of_lading_records | 516 |
| S2609011 | EMFUIHSHK021531 | bill_of_lading_containers | 1328 |
| S2609010 | EMFUIHMOJ021523 | bill_of_lading_records | 517 |
| S2609010 | EMFUIHMOJ021523 | bill_of_lading_containers | 1329 |
| S2609009 | EMFUIHOSA021524 | bill_of_lading_records | 518 |
| S2609009 | EMFUIHOSA021524 | bill_of_lading_containers | 1330 |
| S2609008 | EMFUIHHKT021522 | bill_of_lading_records | 519 |
| S2609008 | EMFUIHHKT021522 | bill_of_lading_containers | 1331 |
| S2609007 | ASC0540512 | bill_of_lading_records | 520 |
| S2609007 | ASC0540512 | bill_of_lading_containers | 1332 |
| S2609006 | SITSGKB0915G205422 | bill_of_lading_records | 521 |
| S2609006 | SITSGKB0915G205422 | bill_of_lading_containers | 1333 |
| S2609005 | SNKO101260900516 | bill_of_lading_records | 522 |
| S2609005 | SNKO101260900516 | bill_of_lading_containers | 1334 |
| S2609004 | 239600084752 | bill_of_lading_records | 523 |
| S2609004 | 239600084752 | bill_of_lading_containers | 1335 |
| S2609004 | 239600084752 | bill_of_lading_containers | 1336 |
| S2609002 | BK-4 | bill_of_lading_records | 524 |
| S2609002 | BK-4 | bill_of_lading_containers | 1337 |
| S2609001 | EMFUIHTYO021330 | bill_of_lading_records | 525 |
| S2609001 | EMFUIHTYO021330 | bill_of_lading_containers | 1338 |
| S2608024 | EMFUIHNGO021077 | bill_of_lading_records | 526 |
| S2608024 | EMFUIHNGO021077 | bill_of_lading_containers | 1339 |
| S2608009 | BK-3 | bill_of_lading_records | 527 |
| S2608009 | BK-3 | bill_of_lading_containers | 1340 |
| S2607030 | EMFUIHXMN020368 | bill_of_lading_records | 528 |
| S2607030 | EMFUIHXMN020368 | bill_of_lading_containers | 1341 |
| S2607026 | BK-2 | arrival_notice_records | 12 |
| S2607026 | BK-2 | delivery_order_records | 7 |
| S2607026 | BK-2 | arrival_notice_containers | 5 |
| S2607026 | BK-2 | delivery_order_containers | 3 |
| S2607016 | 239600078662 | bill_of_lading_records | 529 |
| S2607016 | 239600078662 | bill_of_lading_containers | 1342 |
| S2607009 | BK-1 | bill_of_lading_records | 530 |
| S2607009 | BK-1 | bill_of_lading_containers | 1343 |

## Dòng container đã xóa theo xác nhận cuối (có backup)

| Shipment ID | Bảng / ID | Dữ liệu trước |
|---|---|---|
| S2608019 | bill_of_lading_containers / 5 | {"id":"5","document_id":"317","row_order":1,"container_type_code":"20'DC","container_no":null,"seal_no":null,"gross_weight_kg":null,"gross_weight_raw":null,"measurement_cbm":"10.000","measurement_raw":"10","tare_kg":null,"tare_raw":null,"package_type_id":177,"package_type_snapshot":"PALLET(S)","number_of_packages":null,"number_of_packages_raw":null,"method":null,"note":null} |

## Cảnh báo master ban đầu (lịch sử trước đợt bổ sung)

Các cảnh báo Partner dưới đây đã được xử lý bằng 4 master mới ở mục đợt bổ sung cuối. Các Port còn thiếu liên kết được liệt kê riêng ở phía trên.

| Shipment ID | Trường | Giá trị nguồn | Lý do |
|---|---|---|---|
| S2609012 | delivery_apply_to | ASIA TRANSPORTATION CO., LTD 4F,NO.11 JIAN KANG RD,TAIPEI,TAIWAN TEL: 2-25147199 EX. 16 FAX: 2-25147499 ATTN: BRIAN | Party ASIA TRANSPORTATION CO., LTD: 0 master matches; source snapshot saved, ID null |
| S2609004 | delivery_apply_to | ASIA TRANSPORTATION CO., LTD 4F,NO.11 JIAN KANG RD,TAIPEI,TAIWAN TEL: 2-25147199 EX. 16 FAX: 2-25147499 ATTN: BRIAN | Party ASIA TRANSPORTATION CO., LTD: 0 master matches; source snapshot saved, ID null |
| S2608025 | delivery_apply_to | ASIA TRANSPORTATION CO., LTD 4F,NO.11 JIAN KANG RD,TAIPEI,TAIWAN TEL: 2-25147199 EX. 16 FAX: 2-25147499 ATTN: BRIAN | Party ASIA TRANSPORTATION CO., LTD: 0 master matches; source snapshot saved, ID null |
| S2607030 | consigned_to_order_of | XIAMEN YIZHIYUE IMPORT AND EXPORT CO.,LTD. 12H 05LIANFU COMMERCIAL BLDG, NO.2 WEST LIAN QIAN ROAD, XIAMEN, CHINA TEL: +86 13656003524 | Party XIAMEN YIZHIYUE IMPORT AND EXPORT CO.,LTD.: 0 master matches; source snapshot saved, ID null |
| S2607030 | notify_address | XIAMEN WANTONG LOGISTICS CO., LTD. UNIT 09-3/F TOWER D XIAMEN INTERNATIONAL SHIPPING CENTER, NO.97 XIANGYU ROAD, XIAMEN, CHINA TEL:+86(0)592-2615805 FAX:+86(0)592-2615219 EMAIL:VIVID@XMWT.NET | Party XIAMEN WANTONG LOGISTICS CO., LTD.: 0 master matches; source snapshot saved, ID null |
| S2607026 | place_of_receipt_name | SHIMIZU CY | Port SHIMIZU CY: 0 master matches; source snapshot saved, ID null |
| S2607026 | port_of_loading_name | SHIMIZU, JAPAN | Port SHIMIZU, JAPAN: 0 master matches; source snapshot saved, ID null |
| S2607026 | port_of_discharge_name | HAIPHONG, VIETNAM | Port HAIPHONG, VIETNAM: 0 master matches; source snapshot saved, ID null |
| S2607026 | place_of_delivery_name | HAIPHONG (TAN VU TERMINAL) | Port HAIPHONG (TAN VU TERMINAL): 0 master matches; source snapshot saved, ID null |
| S2607026 | place_of_receipt_name | SHIMIZU CY | Port SHIMIZU CY: 0 master matches; source snapshot saved, ID null |
| S2607026 | port_of_loading_name | SHIMIZU, JAPAN | Port SHIMIZU, JAPAN: 0 master matches; source snapshot saved, ID null |
| S2607026 | port_of_discharge_name | HAIPHONG, VIETNAM | Port HAIPHONG, VIETNAM: 0 master matches; source snapshot saved, ID null |
| S2607026 | place_of_delivery_name | HAIPHONG (TAN VU TERMINAL) | Port HAIPHONG (TAN VU TERMINAL): 0 master matches; source snapshot saved, ID null |
| S2607026 | place_of_issue_name | SHIMIZU, JAPAN | Port SHIMIZU, JAPAN: 0 master matches; source snapshot saved, ID null |
| S2607026 | consigned_to_order_of | SATOEN VIETNAM JOINT STOCK COMPANY SAO DO SUB -AREA 2, VAN HO COMMUNE, SON LA PROVINCE,VIET NAM TEL:+84-2123-660-054 TAX CODE: 5500212731 | Party SATOEN VIETNAM JOINT STOCK COMPANY: 0 master matches; source snapshot saved, ID null |
| S2607026 | notify_address | SATOEN VIETNAM JOINT STOCK COMPANY SAO DO SUB -AREA 2, VAN HO COMMUNE, SON LA PROVINCE,VIET NAM TEL:+84-2123-660-054 TAX CODE: 5500212731 | Party SATOEN VIETNAM JOINT STOCK COMPANY: 0 master matches; source snapshot saved, ID null |
| S2607016 | delivery_apply_to | ASIA TRANSPORTATION CO., LTD 4F,NO.11 JIAN KANG RD,TAIPEI,TAIWAN TEL: 2-25147199 EX. 16 FAX: 2-25147499 ATTN: BRIAN | Party ASIA TRANSPORTATION CO., LTD: 0 master matches; source snapshot saved, ID null |

## Trạng thái chứng từ sau nhập

| Bảng / ID | Trạng thái | Trường bắt buộc còn thiếu |
|---|---|---|
| booking_records / 543 | COMPLETED |  |
| booking_records / 544 | PROCESSING | commodityType, measurement |
| booking_records / 545 | COMPLETED |  |
| booking_records / 546 | COMPLETED |  |
| booking_records / 547 | COMPLETED |  |
| booking_records / 548 | COMPLETED |  |
| booking_records / 549 | COMPLETED |  |
| booking_records / 550 | COMPLETED |  |
| booking_records / 551 | COMPLETED |  |
| booking_records / 530 | COMPLETED |  |
| booking_records / 552 | PROCESSING | eta |
| booking_records / 553 | COMPLETED |  |
| booking_records / 521 | COMPLETED |  |
| booking_records / 554 | PROCESSING | etd, eta |
| booking_records / 519 | COMPLETED |  |
| booking_records / 345 | COMPLETED |  |
| booking_records / 346 | COMPLETED |  |
| booking_records / 347 | COMPLETED |  |
| booking_records / 348 | COMPLETED |  |
| booking_records / 349 | COMPLETED |  |
| booking_records / 35 | COMPLETED |  |
| booking_records / 350 | COMPLETED |  |
| booking_records / 36 | COMPLETED |  |
| booking_records / 37 | COMPLETED |  |
| booking_records / 38 | COMPLETED |  |
| booking_records / 351 | COMPLETED |  |
| booking_records / 352 | COMPLETED |  |
| booking_records / 555 | PROCESSING | etd, eta, grossWeight, measurement |
| booking_records / 354 | COMPLETED |  |
| booking_records / 39 | COMPLETED |  |
| booking_records / 355 | COMPLETED |  |
| booking_records / 40 | COMPLETED |  |
| booking_records / 41 | COMPLETED |  |
| booking_records / 42 | COMPLETED |  |
| booking_records / 43 | COMPLETED |  |
| booking_records / 356 | COMPLETED |  |
| booking_records / 44 | COMPLETED |  |
| booking_records / 357 | COMPLETED |  |
| booking_records / 45 | COMPLETED |  |
| booking_records / 556 | COMPLETED |  |
| booking_records / 46 | COMPLETED |  |
| booking_records / 358 | COMPLETED |  |
| booking_records / 47 | COMPLETED |  |
| booking_records / 557 | PROCESSING | commodityType, grossWeight, measurement |
| booking_records / 48 | COMPLETED |  |
| booking_records / 359 | COMPLETED |  |
| booking_records / 360 | COMPLETED |  |
| booking_records / 361 | COMPLETED |  |
| booking_records / 362 | COMPLETED |  |
| booking_records / 49 | COMPLETED |  |
| booking_records / 50 | COMPLETED |  |
| booking_records / 558 | COMPLETED |  |
| booking_records / 51 | COMPLETED |  |
| booking_records / 363 | COMPLETED |  |
| booking_records / 364 | COMPLETED |  |
| booking_records / 559 | PROCESSING | vesselVoyage, etd, eta, grossWeight, measurement |
| booking_records / 52 | COMPLETED |  |
| booking_records / 365 | COMPLETED |  |
| booking_records / 53 | COMPLETED |  |
| booking_records / 54 | COMPLETED |  |
| booking_records / 55 | COMPLETED |  |
| booking_records / 56 | COMPLETED |  |
| bill_of_lading_records / 497 | COMPLETED |  |
| bill_of_lading_records / 490 | COMPLETED |  |
| bill_of_lading_records / 489 | COMPLETED |  |
| bill_of_lading_records / 315 | COMPLETED |  |
| bill_of_lading_records / 316 | COMPLETED |  |
| bill_of_lading_records / 317 | COMPLETED |  |
| bill_of_lading_records / 318 | COMPLETED |  |
| bill_of_lading_records / 319 | COMPLETED |  |
| bill_of_lading_records / 5 | COMPLETED |  |
| bill_of_lading_records / 320 | COMPLETED |  |
| bill_of_lading_records / 6 | COMPLETED |  |
| bill_of_lading_records / 7 | COMPLETED |  |
| bill_of_lading_records / 8 | COMPLETED |  |
| bill_of_lading_records / 321 | COMPLETED |  |
| bill_of_lading_records / 322 | COMPLETED |  |
| bill_of_lading_records / 323 | PROCESSING | consignedToOrderOf, placeOfIssue, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].noOfPkgs |
| bill_of_lading_records / 324 | PROCESSING | consignedToOrderOf, placeOfIssue, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].noOfPkgs |
| bill_of_lading_records / 9 | COMPLETED |  |
| bill_of_lading_records / 325 | PROCESSING | consignedToOrderOf, placeOfIssue, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].noOfPkgs |
| bill_of_lading_records / 10 | COMPLETED |  |
| bill_of_lading_records / 11 | COMPLETED |  |
| bill_of_lading_records / 12 | COMPLETED |  |
| bill_of_lading_records / 13 | COMPLETED |  |
| bill_of_lading_records / 326 | COMPLETED |  |
| bill_of_lading_records / 14 | COMPLETED |  |
| bill_of_lading_records / 327 | COMPLETED |  |
| bill_of_lading_records / 15 | COMPLETED |  |
| bill_of_lading_records / 16 | COMPLETED |  |
| bill_of_lading_records / 328 | COMPLETED |  |
| bill_of_lading_records / 17 | COMPLETED |  |
| bill_of_lading_records / 18 | COMPLETED |  |
| bill_of_lading_records / 329 | COMPLETED |  |
| bill_of_lading_records / 330 | COMPLETED |  |
| bill_of_lading_records / 331 | COMPLETED |  |
| bill_of_lading_records / 332 | COMPLETED |  |
| bill_of_lading_records / 19 | PROCESSING | consignedToOrderOf, placeOfIssue, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].noOfPkgs |
| bill_of_lading_records / 20 | COMPLETED |  |
| bill_of_lading_records / 21 | COMPLETED |  |
| bill_of_lading_records / 333 | COMPLETED |  |
| bill_of_lading_records / 334 | COMPLETED |  |
| bill_of_lading_records / 22 | COMPLETED |  |
| bill_of_lading_records / 335 | COMPLETED |  |
| bill_of_lading_records / 23 | COMPLETED |  |
| bill_of_lading_records / 24 | COMPLETED |  |
| bill_of_lading_records / 25 | COMPLETED |  |
| bill_of_lading_records / 26 | COMPLETED |  |
| bill_of_lading_records / 336 | COMPLETED |  |
| bill_of_lading_records / 337 | COMPLETED |  |
| bill_of_lading_records / 515 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 516 | PROCESSING | consignedToOrderOf, shippingMark, placeOfIssue, numberOfOriginals, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 517 | PROCESSING | consignedToOrderOf, shippingMark, placeOfIssue, numberOfOriginals, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 518 | PROCESSING | consignedToOrderOf, shippingMark, placeOfIssue, numberOfOriginals, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 519 | PROCESSING | consignedToOrderOf, shippingMark, placeOfIssue, numberOfOriginals, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 520 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 521 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 522 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 523 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType, containers[1].containerNo, containers[1].sealNo, containers[1].grossWeight, containers[1].measurement, containers[1].noOfPkgs, containers[1].packageType |
| bill_of_lading_records / 524 | PROCESSING | containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| bill_of_lading_records / 525 | COMPLETED |  |
| bill_of_lading_records / 526 | COMPLETED |  |
| bill_of_lading_records / 527 | COMPLETED |  |
| bill_of_lading_records / 528 | COMPLETED |  |
| bill_of_lading_records / 529 | COMPLETED |  |
| bill_of_lading_records / 530 | PROCESSING | consignedToOrderOf, oceanVessel, shippingMark, descriptionOfGoods, placeOfIssue, dateOfIssue, numberOfOriginals, containers[0].containerNo, containers[0].sealNo, containers[0].grossWeight, containers[0].measurement, containers[0].noOfPkgs, containers[0].packageType |
| arrival_notice_records / 12 | COMPLETED |  |
| delivery_order_records / 7 | PROCESSING | to |

## Những nội dung không có cột/nguồn tương ứng

- Commodity GENERAL CARGO là phân loại FreightEK, không thay Commodity thực của Booking.
- Net weight, max gross weight, VGM, overweight, các checkbox trình bày và Final Destination của BL không có cột tương ứng: không thêm schema.
- Closing Time, SI/VGM Cutoff, PIC và tổng trọng lượng/measurement Booking không có ô nguồn riêng trong file, giữ nguyên.
- Không ghi đè master Partner/Port đang có, vì snapshot trên chứng từ có thể khác dữ liệu master hiện tại. Đã thêm 4 Partner thực sự còn thiếu ở đợt bổ sung cuối.
- Backend build pass; 301 test migration Node pass, bao gồm 6 test đợt bổ sung. Targeted lint pass. Toàn bộ backend: 878 pass / 1 lỗi mock cũ thiếu enrichMissingParties (không thuộc cập nhật dữ liệu này).
- Rehearsal thực hiện toàn bộ ghi trong transaction rồi ROLLBACK, kiểm tra trước/sau tất cả tám bảng. Postflight đối chiếu từng trường và toàn bộ dòng ngoài phạm vi.
