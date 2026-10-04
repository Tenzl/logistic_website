# Đối chiếu và import Booking — 15/09/2026

Nguồn: D:\dataTable.xlsx, Sheet1, 336 dòng dữ liệu (dòng Excel 2–337). Lọc **Created On từ 01/07/2026 đến hết 15/09/2026**, không lọc theo ETD; chuyến có ETD tương lai vẫn được tính nếu ngày tạo nằm trong kỳ.

- Trong kỳ: **65 shipment**.
- Đã có Booking No. trong database trước import: **48**.
- Chưa có, đã thêm thành công: **17 Booking** (16 Export, 1 Import).
- Trạng thái Booking: 11 Completed, 6 Processing. Đây là trạng thái Booking, không đồng nghĩa workflow đã hoàn tất.
- 329 Booking cũ và cargo volume cũ được đối chiếu checksum trong transaction, không thay đổi.

## Các Booking chưa có và đã thêm

| No. | Booking No. đã lưu | Shipment ID | Booking ID | Flow | Created On | Status | Dòng Excel |
|---:|---|---|---:|---|---|---|---:|
| 1 | BK-1 | S2607009 | 559 | EXPORT | 2026-07-08 | PROCESSING | 58 |
| 2 | 239600078662 | S2607016 | 558 | EXPORT | 2026-07-10 | COMPLETED | 54 |
| 3 | BK-2 | S2607026 | 557 | IMPORT | 2026-07-17 | PROCESSING | 46 |
| 4 | EMFUIHXMN020368 | S2607030 | 556 | EXPORT | 2026-07-22 | COMPLETED | 42 |
| 5 | BK-3 | S2608009 | 555 | EXPORT | 2026-08-10 | PROCESSING | 29 |
| 6 | EMFUIHNGO021077 | S2608024 | 554 | EXPORT | 2026-08-27 | PROCESSING | 15 |
| 7 | EMFUIHTYO021330 | S2609001 | 553 | EXPORT | 2026-09-03 | COMPLETED | 13 |
| 8 | BK-4 | S2609002 | 552 | EXPORT | 2026-09-03 | PROCESSING | 12 |
| 9 | 239600084752 | S2609004 | 551 | EXPORT | 2026-09-08 | COMPLETED | 10 |
| 10 | SNKO101260900516 | S2609005 | 550 | EXPORT | 2026-09-08 | COMPLETED | 9 |
| 11 | SITSGKB0915G205422 | S2609006 | 549 | EXPORT | 2026-09-09 | COMPLETED | 8 |
| 12 | ASC0540512 | S2609007 | 548 | EXPORT | 2026-09-09 | COMPLETED | 7 |
| 13 | EMFUIHHKT021522 | S2609008 | 547 | EXPORT | 2026-09-10 | COMPLETED | 6 |
| 14 | EMFUIHOSA021524 | S2609009 | 546 | EXPORT | 2026-09-10 | COMPLETED | 5 |
| 15 | EMFUIHMOJ021523 | S2609010 | 545 | EXPORT | 2026-09-11 | COMPLETED | 4 |
| 16 | EMFUIHSHK021531 | S2609011 | 544 | EXPORT | 2026-09-11 | PROCESSING | 3 |
| 17 | ASC0541389 | S2609012 | 543 | EXPORT | 2026-09-14 | COMPLETED | 2 |

## Bốn số Booking nguồn chỉ ghi BK

Được đặt BK-1 đến BK-4 theo thứ tự ngày tạo, theo xác nhận cuối cùng của người dùng. Không suy đoán số Booking thật.

| Số nguồn | Số đã lưu | Shipment ID | Booking ID |
|---|---|---|---:|
| BK | BK-1 | S2607009 | 559 |
| BK | BK-2 | S2607026 | 557 |
| BK | BK-3 | S2608009 | 555 |
| BK | BK-4 | S2609002 | 552 |

## Các dòng còn thiếu thông tin

Dữ liệu nguồn vẫn được nhập; trường chưa có giữ trống/null, không tự điền dữ liệu giả.

| Booking No. | Shipment ID | Trường bắt buộc còn thiếu | Lưu ý master data |
|---|---|---|---|
| BK-1 | S2607009 | Vessel/Voyage, ETD, ETA, Gross weight, Measurement | — |
| BK-2 | S2607026 | Vessel/Voyage, Type, Gross weight, Measurement | Origin port: 0 master-data matches; source snapshot retained; Commodity: 0 master-data matches; source snapshot retained |
| BK-3 | S2608009 | Vessel/Voyage, ETD, ETA, Gross weight, Measurement | — |
| EMFUIHNGO021077 | S2608024 | ETD, ETA | — |
| BK-4 | S2609002 | ETA | — |
| EMFUIHSHK021531 | S2609011 | Type, Measurement | Client: 0 master-data matches; source snapshot retained; Commodity: 0 master-data matches; source snapshot retained |

- TROPICAL GARDEN COMPANY LIMITED chưa có Partner khớp tên; giữ snapshot tên Client, client_party_id = NULL, không tạo Partner thiếu địa chỉ.
- FURNITURE và hàng chai thủy tinh chưa có Commodity trong master: giữ commodity_name/commodity_description từ nguồn, commodity_id = NULL. Không tự suy đoán Package Type.
- CNCKG không có master Port khớp mã. Database có CHONGQING mã CNCQI; không tự thay mã. Giữ snapshot CHONGQING, CN (CNCKG), không gán Port ID sai.
- VNCLI là CAT LAI Terminal hiện có, được gắn ID 35988; không tạo Port mới hoặc đổi loại.

## Quy tắc dữ liệu đã áp dụng

- STONE PRODUCTS IN PALLETS tách thành Type PALLET(S) (ID 177), Commodity STONE PRODUCT (ID 39); giữ nguyên mô tả nguồn.
- Origin → Place of Receipt và Port of Loading theo mapping import cũ; Destination → Port of Discharge. Không tự điền pickup/dropoff, Place of Issue hoặc Place of Delivery khi nguồn không có giá trị riêng.
- Created On → document_date và created_at (00:00 giờ Việt Nam vì Excel chỉ có ngày, không có thời điểm chính xác). Creator/PIC theo Created By, Nhung Nguyen ID 11.
- Vessel/Voyage nguồn phân cách bằng dấu ; chuẩn hóa thành /; Mother Vessel và Mother Voyage gộp bằng /.
- Giữ gross weight/measurement raw text; numeric dùng parser runtime hiện tại. Không nhân giá trị /20' với số cont; không map gross weight Booking sang container đầu.
- Số lượng 20DC/40HC/40DC vào booking_cargo_volumes, đúng thứ tự; không tạo container chi tiết giả.
- CY Cut-Off → closing_time; SI Cut-Off → si_cutoff. Không suy đoán VGM cutoff.
- Không thêm schema/cột mới, không sửa Booking cũ, không tự tạo BL/AN/DO hoặc điền HBL/MBL vào cột không tồn tại ở Booking. Các HBL/MBL trong Excel chưa được xác minh để tạo chứng từ con.
- Shipment ID không có cột riêng trong booking_records. Ánh xạ Shipment ID ↔ Booking ID được lưu bền vững trong app_schema_migrations.details, migration ID 2026-09-15_datatable_missing_bookings_v1.

## Đã có trước import

| No. | Booking No. | Shipment ID | Booking ID | Created On nguồn | Dòng Excel |
|---:|---|---|---:|---|---:|
| 1 | ASC0539708 | S2609003 | 530 | 2026-09-04 | 11 |
| 2 | 239600083411 | S2608025 | 521 | 2026-08-28 | 14 |
| 3 | I490602506 | S2608023 | 519 | 2026-08-24 | 16 |
| 4 | EMFUIHYOK020976 | S2608021 | 345 | 2026-08-19 | 17 |
| 5 | EMFUIHTYO020975 | S2608020 | 346 | 2026-08-19 | 18 |
| 6 | EMFUIHTYO020974 | S2608019 | 347 | 2026-08-19 | 19 |
| 7 | EMFUIHOSA020957 | S2608018 | 348 | 2026-08-18 | 20 |
| 8 | EMFUIHUKB020956 | S2608017 | 349 | 2026-08-18 | 21 |
| 9 | EMFUIHYOK020835 | S2608016 | 35 | 2026-08-13 | 22 |
| 10 | EMFUIHOSA020838 | S2608015 | 350 | 2026-08-11 | 23 |
| 11 | SNKO101260801031 | S2608014 | 36 | 2026-08-11 | 24 |
| 12 | EMFUIHOSA020812 | S2608013 | 37 | 2026-08-11 | 25 |
| 13 | EMFUIHYOK020815 | S2608012 | 38 | 2026-08-11 | 26 |
| 14 | EMFUIHTYO020817 | S2608011 | 351 | 2026-08-11 | 27 |
| 15 | EMFUIHYOK020818 | S2608010 | 352 | 2026-08-11 | 28 |
| 16 | ASC0534619 | S2608007 | 353 | 2026-08-07 | 30 |
| 17 | EMFUIHYOK020658 | S2608006 | 354 | 2026-08-05 | 31 |
| 18 | EMFUIHOSA020654 | S2608005 | 39 | 2026-08-05 | 32 |
| 19 | EMFUIHOSA020650 | S2608004 | 355 | 2026-08-05 | 33 |
| 20 | I490600169 | S2608003 | 40 | 2026-08-05 | 34 |
| 21 | A59GX25812 | S2608002 | 41 | 2026-08-03 | 35 |
| 22 | EMFUIHUKB020568 | S2607036 | 42 | 2026-07-31 | 36 |
| 23 | EMFUIHOSA020565 | S2607035 | 43 | 2026-07-31 | 37 |
| 24 | EMFUIHTYO020576 | S2607034 | 356 | 2026-07-31 | 38 |
| 25 | EMFUIHNGO020365 | S2607033 | 44 | 2026-07-24 | 39 |
| 26 | EMFUIHHKT020364 | S2607032 | 357 | 2026-07-23 | 40 |
| 27 | EMFUIHOSA020363 | S2607031 | 45 | 2026-07-22 | 41 |
| 28 | EMFUIHDADYOK020337 | S2607029 | 46 | 2026-07-21 | 43 |
| 29 | EMFUIHNGO020339 | S2607028 | 358 | 2026-07-21 | 44 |
| 30 | A59GX23719 | S2607027 | 47 | 2026-07-20 | 45 |
| 31 | EMFUIHOSA020156 | S2607023 | 48 | 2026-07-14 | 47 |
| 32 | EMFUIHMOJ020159 | S2607022 | 359 | 2026-07-14 | 48 |
| 33 | EMFUIHTYO020158 | S2607021 | 360 | 2026-07-14 | 49 |
| 34 | EMFUIHOSA020157 | S2607020 | 361 | 2026-07-14 | 50 |
| 35 | EMFUIHOSA020154 | S2607019 | 362 | 2026-07-14 | 51 |
| 36 | A59GX22157 | S2607018 | 49 | 2026-07-13 | 52 |
| 37 | A59GX22085 | S2607017 | 50 | 2026-07-13 | 53 |
| 38 | EMFUIHOSA020015 | S2607015 | 51 | 2026-07-10 | 55 |
| 39 | EMFUIHOSA020064 | S2607014 | 363 | 2026-07-10 | 56 |
| 40 | EMFUIHYOK020065 | S2607013 | 364 | 2026-07-09 | 57 |
| 41 | A59GX21830 | S2607008 | 52 | 2026-07-07 | 59 |
| 42 | SITSGKB0706G188785 | S2607007 | 365 | 2026-07-06 | 60 |
| 43 | SITSGOS0706G188780 | S2607006 | 53 | 2026-07-06 | 61 |
| 44 | I490596654 | S2607005 | 54 | 2026-07-06 | 62 |
| 45 | ASC0528245 | S2607004 | 55 | 2026-07-03 | 63 |
| 46 | EUIHMFDADHKT019810 | S2607003 | 56 | 2026-07-02 | 64 |
| 47 | ASC0527805 | S2607002 | 366 | 2026-07-01 | 65 |
| 48 | ASC0527807 | S2607001 | 367 | 2026-07-01 | 66 |

## Backup và kiểm chứng

- Full pg_dump trước insert: D:\University\Seatrans-website\seatrans-db-backups\before-datatable-bookings-1789465650457.dump.
- pg_restore --list đọc được backup; SHA-256 lưu cạnh file dump.
- Chạy thử insert + so sánh từng trường/cargo + rollback: pass.
- Commit thật chỉ sau khi backup hợp lệ; đối chiếu từng field, thứ tự cargo, status, version và dữ liệu cũ trong transaction: pass.
- Runner có ledger chống chạy lặp; postflight đọc lại 17 Booking: pass.
- Unit test import: 4/4 pass. Backend build: pass.
- Full backend suite: 878 pass, 1 fail. Lỗi test cũ tests/flows/booking-documents/booking-documents.service.spec.ts thiếu mock enrichMissingParties; không sửa hoặc bỏ test.
- File Excel nguồn giữ nguyên.
