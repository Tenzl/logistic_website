# Kết quả cập nhật Report và port ID

## Cập nhật theo chỉ định của người dùng

Đã xử lý cả ba trường còn lại: A59GX18786 và A59GX18837 liên kết CAI MEP — VNTCI — PORT (ID 35984); A59GX07103 liên kết CAT LAI TERMINAL — VNCLI — TERMINAL (ID 35988). Tên trên Booking A59GX07103 được lưu thành `CAT LAI TERMINAL, VN (VNCLI)`; tên danh mục hiện là `Cat Lai`. Tổng quý II giữ nguyên 72 Bookings, 104 Booked TEU và 104 Actual TEU. Chạy đối chiếu lại không phát sinh thay đổi. Chi tiết trước/sau lưu trong `port-id-explicit-applied.json`.

Phần bên dưới là kết quả của đợt cập nhật tự động trước đó; ba trường từng chưa khớp đã được giải quyết bằng chỉ định trên.

Đã rà soát 319 Booking đang hoạt động, bổ sung 148 port ID trên 44 Booking. Đối chiếu lần hai: không còn thay đổi tự động.

Tổng dữ liệu đang hoạt động trước/sau: 319 Bookings, 416 Booked TEU, 411 Actual TEU. Quý II/2026: 72 Bookings, 104 Booked TEU, 104 Actual TEU; tháng 4/5/6: 40/31/33. Hiện database không có Booking Import đang hoạt động; INBOUND được kiểm thử bằng dữ liệu tổng hợp trong unit test.

## Các trường chưa thể khớp duy nhất

| Booking | Trường | Giá trị đang lưu | Lý do |
|---|---|---|---|
| A59GX18786 (ID 66) | place_of_issue_port_id | CAI MEP, VN (VNTCI) | Không có mã/tên khớp chính xác trong danh mục hoạt động; cần chọn cảng đúng |
| A59GX18837 (ID 67) | place_of_issue_port_id | CAI MEP, VN (VNTCI) | Không có mã/tên khớp chính xác trong danh mục hoạt động; cần chọn cảng đúng |
| A59GX07103 (ID 435) | place_of_issue_port_id | CAT LAI PORT HOCHIMINH, VIETNAM | Không có mã/tên khớp chính xác trong danh mục hoạt động; cần chọn cảng đúng |

## Chi tiết cập nhật

Tên và nội dung chứng từ được giữ nguyên. Chỉ bổ sung ID còn thiếu, tăng version và updated_at. B/L, AN, DO không bị sửa.

| Booking | Trường | Tên đang lưu | ID trước → sau | Version trước → sau |
|---|---|---|---|---|
| A59GX25812 (ID 41) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX23719 (ID 47) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX22085 (ID 50) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX21830 (ID 52) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX20902 (ID 59) | place_of_issue_port_id | HO CHI MINH CITY, VN | NULL → 35996 | 5 → 6 |
| A59GX04728 (ID 98) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04728 (ID 98) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04728 (ID 98) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04728 (ID 98) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-1 (ID 99) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-1 (ID 99) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-1 (ID 99) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-2 (ID 100) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-2 (ID 100) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX04509-2 (ID 100) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX02186 (ID 110) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| EMFUIHTYO020974 (ID 347) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 6 → 7 |
| EMFUIHTYO020974 (ID 347) | place_of_delivery_port_id | TOKYO, JP (JPTYO) | NULL → 35135 | 6 → 7 |
| EMFUIHTYO020974 (ID 347) | place_of_issue_port_id | DA NANG, VN (VNDAD) | NULL → 35990 | 6 → 7 |
| EMFUIHTYO020974 (ID 347) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 6 → 7 |
| EMFUIHTYO020974 (ID 347) | dropoff_port_id | TOKYO, JP (JPTYO) | NULL → 35135 | 6 → 7 |
| EMFUIHOSA020957 (ID 348) | place_of_delivery_port_id | OSAKA, JP (JPOSA) | NULL → 35117 | 5 → 6 |
| EMFUIHOSA020957 (ID 348) | place_of_issue_port_id | DA NANG, VN (VNDAD) | NULL → 35990 | 5 → 6 |
| EMFUIHOSA020957 (ID 348) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 5 → 6 |
| EMFUIHOSA020957 (ID 348) | dropoff_port_id | OSAKA, JP (JPOSA) | NULL → 35117 | 5 → 6 |
| EMFUIHUKB020956 (ID 349) | port_of_loading_id | QUI NHON, VN (VNUIH) | NULL → 42 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | port_of_discharge_id | KOBE, HYOGO, JP (JPUKB) | NULL → 35094 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | place_of_delivery_port_id | KOBE, HYOGO, JP (JPUKB) | NULL → 35094 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | place_of_issue_port_id | DA NANG, VN (VNDAD) | NULL → 35990 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 6 → 7 |
| EMFUIHUKB020956 (ID 349) | dropoff_port_id | KOBE, HYOGO, JP (JPUKB) | NULL → 35094 | 6 → 7 |
| A59GX20901 (ID 372) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 6 → 7 |
| A59GX20901 (ID 372) | place_of_issue_port_id | HO CHI MINH CITY, VN | NULL → 35996 | 6 → 7 |
| A59GX20901 (ID 372) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 6 → 7 |
| SNKO101260301915 (ID 424) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| SNKO101260301915 (ID 424) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| SNKO101260301915 (ID 424) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| SNKO101260301915 (ID 424) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08424 (ID 426) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08424 (ID 426) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08424 (ID 426) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08424 (ID 426) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08008 (ID 429) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08008 (ID 429) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08008 (ID 429) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX08008 (ID 429) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX07103 (ID 435) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX07103 (ID 435) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX07103 (ID 435) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06197 (ID 439) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06197 (ID 439) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06197 (ID 439) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06197 (ID 439) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06108 (ID 440) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06108 (ID 440) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06108 (ID 440) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX06108 (ID 440) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX03722 (ID 448) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX03722 (ID 448) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX03722 (ID 448) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX03722 (ID 448) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00256 (ID 454) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00256 (ID 454) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00256 (ID 454) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00256 (ID 454) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00190 (ID 455) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00190 (ID 455) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00190 (ID 455) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00190 (ID 455) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00189 (ID 456) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00189 (ID 456) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00189 (ID 456) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59GX00189 (ID 456) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24198 (ID 457) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24198 (ID 457) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24198 (ID 457) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24198 (ID 457) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24247 (ID 458) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24247 (ID 458) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24247 (ID 458) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24247 (ID 458) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24074 (ID 459) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24074 (ID 459) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24074 (ID 459) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX24074 (ID 459) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX23963 (ID 460) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX23963 (ID 460) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX23963 (ID 460) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573337 (ID 462) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573337 (ID 462) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573337 (ID 462) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573337 (ID 462) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573336 (ID 463) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573336 (ID 463) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573336 (ID 463) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| YMJAI490573336 (ID 463) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21021 (ID 471) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21021 (ID 471) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21021 (ID 471) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21020 (ID 472) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21020 (ID 472) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21020 (ID 472) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21022 (ID 473) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21022 (ID 473) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21022 (ID 473) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21023 (ID 474) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21023 (ID 474) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21023 (ID 474) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| A59FX21023 (ID 474) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12718 (ID 478) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12718 (ID 478) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12718 (ID 478) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12718 (ID 478) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12799 (ID 479) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12799 (ID 479) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12799 (ID 479) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FY12799 (ID 479) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88563 (ID 502) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88563 (ID 502) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88563 (ID 502) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88563 (ID 502) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88759 (ID 503) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88759 (ID 503) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88759 (ID 503) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX88759 (ID 503) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79300-1 (ID 509) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79300-1 (ID 509) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79300-1 (ID 509) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79300-1 (ID 509) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79301-1 (ID 510) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79301-1 (ID 510) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79301-1 (ID 510) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| 039FX79301-1 (ID 510) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| I490558937-1 (ID 511) | port_of_loading_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| I490558937-1 (ID 511) | place_of_receipt_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| I490558937-1 (ID 511) | place_of_issue_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| I490558937-1 (ID 511) | pickup_port_id | HO CHI MINH CITY, VN (VNSGN) | NULL → 35996 | 5 → 6 |
| EMFUIHYOK021335 (ID 525) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
| EMFUIHYOK021335 (ID 525) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
| EMFUIHOSA021336 (ID 526) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
| EMFUIHOSA021336 (ID 526) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
| EMFUIHOSA021339 (ID 527) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 8 → 9 |
| EMFUIHOSA021339 (ID 527) | place_of_issue_port_id | DA NANG, VN (VNDAD) | NULL → 35990 | 8 → 9 |
| EMFUIHOSA021339 (ID 527) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 8 → 9 |
| EMFUIHYOK021342 (ID 528) | place_of_receipt_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
| EMFUIHYOK021342 (ID 528) | place_of_issue_port_id | DA NANG, VN (VNDAD) | NULL → 35990 | 1 → 2 |
| EMFUIHYOK021342 (ID 528) | pickup_port_id | QUI NHON, VN (VNUIH) | NULL → 42 | 1 → 2 |
