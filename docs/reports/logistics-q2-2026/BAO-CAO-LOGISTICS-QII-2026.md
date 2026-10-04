# Đánh giá LOGISTICS REPORT QUARTER II–2026

**Ngày đối chiếu:** 06/09/2026, snapshot chính lúc 13:22:45 (UTC+7). **Kỳ:** 01/04/2026 đến hết 30/06/2026. **Kết luận:** chưa đủ điều kiện xác nhận báo cáo 156 TEU / 86 shipment khớp database.

Bảng người dùng gửi cộng đúng 156 TEU và 86 shipment. Database ứng dụng đang cấu hình trong backend2.0 ghi nhận **104 TEU dự kiến, 104 TEU theo B/L và 72 Booking xuất khẩu** trong cùng kỳ ETD. Chênh lệch là **−52 TEU (−33,33%) và −14 Booking so với số shipment báo cáo (−16,28%)**. Đây là chênh lệch giữa hai nguồn, chưa phải bằng chứng bên nào phản ánh đầy đủ hoạt động thực tế.

**Phạm vi chứng cứ.** Đã truy vấn trực tiếp PostgreSQL qua cấu hình hiện tại của dự án, trong transaction READ ONLY; kiểm tra schema, view đang chạy, dữ liệu Booking/B/L/container và mã nguồn lọc báo cáo. Không có Excel gốc, danh sách 86 shipment, tờ khai, phiếu giao nhận hoặc chứng từ dịch vụ để đối soát từng lô. Database kết nối được không tự chứng minh đây là sổ nghiệp vụ đầy đủ hoặc bản chốt quý chính thức. Chỉ tạo các tài liệu phân tích cục bộ.

## 1. Đối chiếu tổng và tháng

| Kỳ | TEU báo cáo | TEU Booking dự kiến | TEU theo B/L | Chênh TEU DB − báo cáo | Booking DB |
| --- | --- | --- | --- | --- | --- |
| 2026-04 | 51 | 40 | 40 | -11 | 27 |
| 2026-05 | 57 | 31 | 31 | -26 | 23 |
| 2026-06 | 48 | 33 | 33 | -15 | 22 |
| QUÝ II | 156 | 104 | 104 | -52 | 72 |

Chênh lệch lớn nhất nằm ở tháng 5: −26 TEU, chiếm 50% chênh lệch quý. Dữ liệu DB đạt 66,67% tổng TEU trong bảng; đây chỉ là tỷ số hai tổng, không phải tỷ lệ hồ sơ đã được đối soát thành công.

Trong DB, mỗi Booking quý II có một dòng trong view và có B/L. Cả 72 Booking đều có TEU dự kiến bằng TEU theo B/L. Tổng 104 TEU đến từ 104 dòng container 20 feet; không có container 40/45 feet hoặc loại không nhận diện trong kỳ này.

## 2. Khôi phục bảng nguồn và kiểm tra số học

Do nội dung dán bị lệch cột khi mất ô gộp, cách đọc sử dụng là: khách hàng → TEU tháng 4/5/6 → chứng từ nhập → dịch vụ → tổng TEU → tổng shipment. Ô trống TEU/dịch vụ được quy về 0 chỉ để kiểm tra số học; điều này không xác nhận không có nghiệp vụ. Các tuyến JP được kế thừa xuống 8 dòng đầu. APEX tạm hiểu là 1 shipment dịch vụ không có TEU; vị trí cột này cần xác nhận bằng bản gốc.

| STT | Khách hàng | Tuyến theo bảng | T4 | T5 | T6 | TEU quý | SHPT | SHPT dịch vụ* |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | AN THINH | UIH/DAD/HCM–JP | 23 | 10 | 16 | 49 | 30 | 5 |
| 2 | HOANG KHANG | UIH/DAD/HCM–JP | 1 | 2 | 5 | 8 | 5 | 0 |
| 3 | HOANG THACH SON | UIH/DAD/HCM–JP | 13 | 9 | 1 | 23 | 17 | 6 |
| 4 | NHAT PHU | UIH/DAD/HCM–JP | 1 | 0 | 0 | 1 | 1 | 0 |
| 5 | PHU TAI 380 | UIH/DAD/HCM–JP | 3 | 6 | 4 | 13 | 12 | 0 |
| 6 | STONE MIX DONG NAI | UIH/DAD/HCM–JP | 1 | 0 | 0 | 1 | 1 | 0 |
| 7 | NAM THANG | UIH/DAD/HCM–JP | 0 | 2 | 0 | 2 | 1 | 0 |
| 8 | TAN HOANG THACH SON | UIH/DAD/HCM–JP | 0 | 0 | 6 | 6 | 4 | 3 |
| 9 | GIANG DAT THANH | UIH–TAICHUNG | 3 | 2 | 0 | 5 | 2 | 2 |
| 10 | HUYNH LUU NGAI | UIH–CHITTAGONG | 0 | 22 | 12 | 34 | 7 | 7 |
| 11 | HUYNH LUU NGAI | UIH–JAKARTA | 4 | 4 | 0 | 8 | 2 | 2 |
| 12 | HUYNH LUU NGAI | UIH–SONGKHLA | 2 | 0 | 4 | 6 | 3 | 3 |
| 13 | APEX | Chưa rõ / dịch vụ độc lập | 0 | 0 | 0 | 0 | 1 | 1 |

- Tổng tháng: 51 + 57 + 48 = **156 TEU**. Tổng TEU từng dòng cũng bằng 156.
- Tổng shipment từng dòng = **86**, trong đó 85 thuộc các dòng có TEU và 1 thuộc APEX theo cách đọc trên.
- Tổng dịch vụ các dòng có TEU = **28**; cộng thêm APEX 1 = **29**. Do đó tổng 28 chỉ nhất quán nếu cố ý loại APEX khỏi KPI dịch vụ gắn với lô xuất, hoặc nếu ô APEX thực ra thuộc cột khác. Không nên tự sửa tổng thành 29 trước khi xác nhận vị trí cột/phạm vi.
- Không cộng 28/29 dịch vụ vào 86 shipment: một lô có thể vừa vận tải biển vừa có trucking, TTHQ, fumigation, đóng hàng. Khi thống kê “số lô có ít nhất một dịch vụ”, phải đếm mã lô duy nhất.
- Tỷ lệ 28/86 = **32,56%** chỉ phù hợp nếu dùng toàn bộ 86 shipment làm mẫu số; nếu chỉ xét 85 lô xuất có TEU thì 28/85 = **32,94%**. Nếu tính cả APEX trong dịch vụ thì 29/86 = **33,72%**. Cần công bố đúng phạm vi.

## 3. Đối chiếu khách hàng

Quy ước mọi chênh lệch dưới đây là DB trừ báo cáo. Cột Booking DB chỉ là đại lượng thay thế để so sánh shipment; chưa có danh sách mã shipment của bảng nguồn để chứng minh quan hệ 1:1.

| Khách hàng / tuyến | TEU báo cáo | TEU DB | Δ TEU | SHPT báo cáo | Booking DB | Δ số lô |
| --- | --- | --- | --- | --- | --- | --- |
| AN THINH | 49 | 47 | -2 | 30 | 29 | -1 |
| HOANG KHANG | 8 | 9 | 1 | 5 | 6 | 1 |
| HOANG THACH SON | 23 | 23 | 0 | 17 | 17 | 0 |
| NHAT PHU | 1 | 1 | 0 | 1 | 1 | 0 |
| PHU TAI 380 | 13 | 15 | 2 | 12 | 13 | 1 |
| STONE MIX DONG NAI | 1 | 1 | 0 | 1 | 1 | 0 |
| NAM THANG | 2 | 0 | -2 | 1 | 0 | -1 |
| TAN HOANG THACH SON | 6 | 4 | -2 | 4 | 3 | -1 |
| GIANG DAT THANH | 5 | 3 | -2 | 2 | 1 | -1 |
| HUYNH LUU NGAI / UIH–CHITTAGONG | 34 | 0 | -34 | 7 | 0 | -7 |
| HUYNH LUU NGAI / UIH–JAKARTA | 8 | 0 | -8 | 2 | 0 | -2 |
| HUYNH LUU NGAI / UIH–SONGKHLA | 6 | 0 | -6 | 3 | 0 | -3 |
| APEX | 0 | 0 | 0 | 1 | 0 | -1 |
| ASIA FINEST (ngoài bảng) | 0 | 1 | 1 | 0 | 1 | 1 |
| TỔNG | 156 | 104 | -52 | 86 | 72 | -14 |

**Lưu ý ánh xạ:** HOANG KHANG đang có hai partner khác nhau: ID 87 (HOANG KHANG CO., LTD, 5 TEU/4 Booking) và ID 2 (HOANG KHANG NATURAL STONE CO., LTD, 4 TEU/2 Booking). Bảng trên tạm gộp thành 9 TEU/6 Booking theo tên rút gọn của báo cáo; đây là giả định đối chiếu, không phải kết luận hai pháp nhân là một. Các nhóm khác ánh xạ theo tên và ID hiện có; bảng nguồn không có mã khách hàng để xác nhận tuyệt đối.

**Nguồn chênh lệch nổi bật:** HUYNH LUU NGAI có 48 TEU/12 shipment trong báo cáo nhưng không có Booking tương ứng trong quý II; partner ID 66 vẫn tồn tại trong danh mục. Trong toàn bộ view hiện tại cũng không có Booking khách hàng ID 66. Riêng 48 TEU này tương đương 92,31% chênh lệch ròng 52 TEU. Chênh lệch còn lại là tổng bù trừ giữa các khách hàng, không thể kết luận còn đúng 4 TEU thiếu hồ sơ.

NAM THANG có partner ID 99 và Booking ở kỳ khác, nhưng không có quý II/2026. APEX có các partner ID 46/123/124, chưa có Booking khách hàng tương ứng; điều này không loại trừ nghiệp vụ dịch vụ độc lập hoặc vai trò đại lý. ASIA FINEST có 1 TEU/1 Booking trong DB nhưng không được nêu riêng trong bảng nguồn.

**Chi tiết TEU tháng để kiểm tra bù trừ:**

| Khách hàng | Báo cáo T4/T5/T6 | DB T4/T5/T6 |
| --- | --- | --- |
| AN THINH | 23/10/16 | 21/10/16 |
| HOANG KHANG | 1/2/5 | 2/3/4 |
| HOANG THACH SON | 13/9/1 | 10/12/1 |
| NHAT PHU | 1/0/0 | 1/0/0 |
| PHU TAI 380 | 3/6/4 | 2/6/7 |
| STONE MIX DONG NAI | 1/0/0 | 1/0/0 |
| NAM THANG | 0/2/0 | 0/0/0 |
| TAN HOANG THACH SON | 0/0/6 | 0/0/4 |
| GIANG DAT THANH | 3/2/0 | 3/0/0 |

HOANG THACH SON khớp tổng 23 TEU/17 lô nhưng lệch phân bổ tháng: 13/9/1 so với 10/12/1. Vì vậy khớp tổng quý chưa đủ để xác nhận khớp từng lô hoặc từng tháng.

## 4. Tuyến, hàng hóa và ngoại lệ cụ thể

| Nội dung | Bảng nguồn | Database theo ETD quý II | Đánh giá |
| --- | --- | --- | --- |
| Đi Nhật | 103 TEU ở 8 dòng đầu | 100 TEU đến cảng JP, 70 Booking | Phạm vi khách hàng khác nhau; DB có ASIA FINEST và một tuyến VN bất thường |
| Đi Đài Loan | 5 TEU / 2 shipment đi Taichung | 3 TEU / 1 Booking đi Keelung | Khác cả sản lượng và cảng |
| Bột nhang: Chittagong/Jakarta/Songkhla | 48 TEU / 12 shipment | Không có Booking tương ứng | Chưa được DB chứng minh |
| Hàng nhập | Không có | 0 Booking IMPORT đang hoạt động trong view hiện tại | Nhất quán trong phạm vi DB; chưa xác nhận mọi nghiệp vụ ngoài hệ thống |
| Mặt hàng | Đá và bột nhang | 72 Booking đều ghi STONE PRODUCT | DB chỉ hỗ trợ phần hàng đá ở cấp danh mục |

Ba hồ sơ cần kiểm tra trực tiếp với chứng từ gốc:

1. **Booking 239600066877, ID 88, B/L ST2603030, ETD 03/04/2026:** GIANG DAT THANH, 3 TEU; cả Booking và B/L ghi KEELUNG (TWKEL), không phải Taichung. Ba dòng container trên B/L này chưa có số container, không được coi là ba container bị trùng chỉ vì cùng NULL.
2. **Booking A59GX11479, ID 409, B/L ST2604012, ETD 20/04/2026:** HOANG THACH SON, 1 TEU; cả POL, POD và place of delivery đều là Cát Lái (VNCLI), trong khi booking_flow = EXPORT. Đây là xung đột tuyến cần kiểm tra; chưa đủ căn cứ tự suy ra cảng Nhật. Nếu chỉ lọc POD quốc gia JP thì khách hàng này còn 22 TEU/16 Booking.
3. **Booking A59GX18837, ID 67, B/L STVN-260609, ETD 16/06/2026:** ASIA FINEST, 1 TEU, Cát Lái–Nagoya; cần xác nhận có nằm trong phạm vi báo cáo phòng logistics và có được hạch toán dưới khách hàng khác không.

Nhóm tuyến theo POD trong DB cộng lại là **JP 100 + TW 3 + VN 1 = 104 TEU**. Không nên ép tên cảng khác nhau thành cùng tuyến để làm khớp số tổng.

## 5. “Lý thuyết”, “theo chứng từ” và “thực tế”

**TEU là đơn vị quy đổi, không phải số shipment.** Container 20 feet thường được tính 1 TEU và 40 feet là 2 TEU. Tham chiếu phương pháp: [Eurostat – Maritime transport metadata](https://ec.europa.eu/eurostat/cache/metadata/en/mar_esms.htm). Với 45 feet cần quy ước công bố rõ: view hiện tại tính 2 TEU; phương pháp thống kê Eurostat cho loại trên 40 feet dùng 2,25 TEU. Quý đang xét không có 45 feet nên vấn đề này không tạo ra chênh lệch 52 TEU.

| Chỉ tiêu | Cách DB hiện tính | Kết quả quý II | Giới hạn |
| --- | --- | --- | --- |
| TEU dự kiến | SUM(quantity × hệ số) từ booking_cargo_volumes | 104 | Kế hoạch/đặt chỗ, chưa phải hàng đã vận chuyển |
| TEU theo chứng từ xuất | Đếm/quy đổi container trong bill_of_lading_containers của B/L chưa xóa | 104 | View không yêu cầu B/L COMPLETED |
| Số Booking | COUNT tại view một dòng/Booking | 72 | Chưa chứng minh tương đương 72 shipment độc lập của sổ gốc |
| Workflow hoàn tất | Booking COMPLETED và B/L COMPLETED cho EXPORT | 0 | Cả 72 Booking và 72 B/L đều PROCESSING; không có nghĩa 0 lô đã đi thực tế |
| Chứng cứ ngày on-board | clean_on_board_date trên B/L | 72/72 có ngày | Là trường đã nhập, chưa kiểm tra bản B/L ký/phát hành |
| Dịch vụ TTHQ/trucking/fumi/stuffing | Chưa tìm thấy sổ dịch vụ hoàn thành liên kết mã Booking/lô | Chưa xác minh 28/29 | Inquiry và danh mục service không thay thế nhật ký thực hiện dịch vụ |

DB có cấu trúc tốt cho báo cáo Booking/B/L/container: tách kế hoạch và số trên chứng từ, có ID khách hàng/cảng, ngày ETD, trạng thái và soft-delete. Tuy nhiên mô hình hiện tại **chưa đủ để tự sinh và kiểm toán trọn vẹn mẫu logistics này**, đặc biệt dịch vụ độc lập không có Booking, một lô có nhiều dịch vụ và cách đếm shipment chung.

Không tìm thấy trường thực hiện trucking/customs/fumigation/stuffing có cấu trúc trong các bảng public đã kiểm tra. total_logistics_inquiries và freight_forwarding_inquiries có yêu cầu, container dự kiến, khoảng ngày shipment và notes, nhưng không có liên kết Booking hay bảng sự kiện dịch vụ thực hiện đủ để tái tạo KPI 28. Truy vấn ghi chú Booking quý II theo từ khóa dịch vụ cũng không có kết quả; ghi chú tự do dù có vẫn cần thẩm định thủ công.

**Chất lượng dữ liệu:** 72/72 có mã khách hàng, POD và B/L; không có Booking quý II bị soft-delete; không có booking_number trùng trong các Booking chưa xóa của toàn bộ DB; 0 loại container không nhận diện. Tuy nhiên **9/104 dòng container thiếu số container (8,65%)**, và 9 dòng thiếu/0 gross weight. Vì vậy 104 TEU hiện là số tổng hợp từ dòng chứng từ, chưa đủ để bảo đảm toàn bộ container đã được định danh và đối soát ngoài thực địa. Kiểm tra trùng số trong từng B/L không phát hiện số container không rỗng bị lặp; nhóm NULL của B/L ID 58 là dữ liệu thiếu.

**Ngày chốt kỳ:** API báo cáo hiện lọc ETD. ETD là ngày dự kiến; báo cáo thực hiện nên thống nhất dùng ngày on-board/khởi hành được chứng minh, còn dịch vụ độc lập dùng ngày hoàn thành. Đã thử cùng quý theo ngày Booking: **108 TEU/78 Booking**; theo ngày B/L: **104/72**; theo clean_on_board_date: **104/72**. Việc đổi các trường ngày hiện có không đưa tổng về 156/86. ETD là kiểu DATE nên dùng khoảng 01/04 ≤ ETD < 01/07, không dịch ngày theo múi giờ khi xuất CSV.

## 6. Đánh giá nhận xét tăng trưởng

| Nguồn / chỉ tiêu | Quý I/2026 | Quý II/2026 | Thay đổi |
| --- | --- | --- | --- |
| Bảng nguồn – TEU | 100 | 156 | +56,00% |
| Bảng nguồn – shipment | 71 | 86 | +21,13% |
| DB theo ETD – TEU B/L | 110 | 104 | −5,45% |
| DB theo ETD – Booking | 87 | 72 | −17,24% |

Theo số người dùng cung cấp, so với quý II/2025 (87 TEU/62 shipment), quý II/2026 tăng **79,31% TEU và 38,71% shipment**. Phép tính đúng, nhưng database hiện tại có ETD sớm nhất 26/08/2025, nên **không có dữ liệu quý II/2025 để xác nhận mốc 87/62**. Không được hiểu thiếu dữ liệu là sản lượng quý đó bằng 0.

Nhận xét “quý II tốt hơn quý I” đúng về lượng nếu lấy các tổng trong bảng nguồn, nhưng **ngược xu hướng dữ liệu DB hiện có**. Quý I cũng đã lệch: nguồn ghi 100/71, DB là 110/87. Cần đối soát cả hai quý với cùng phạm vi, ngày chốt và đơn vị đếm trước khi dùng nhận xét này làm kết luận quản trị.

TEU/shipment theo bảng tăng từ 1,41 lên 1,81, khoảng **28,79%**; nếu loại APEX không TEU thì quý II là 156/85 = 1,84 TEU/lô xuất. Theo DB, TEU/Booking tăng từ 1,26 lên 1,44, khoảng **14,24%**, dù tổng lượng và số Booking giảm. Tỷ lệ này mô tả quy mô bình quân mỗi lô, không phải tỷ lệ lấp đầy container, lợi nhuận hay năng suất nhân sự. Không có doanh thu, chi phí, thời gian xử lý hoặc kế hoạch mục tiêu nên chưa thể đánh giá hiệu quả tài chính hay mức hoàn thành kế hoạch.

Theo bảng nguồn, AN THINH có 49 TEU (31,41%) và HUYNH LUU NGAI có 48 TEU (30,77%); hai khách hàng chiếm 62,18% sản lượng. Đây là mức tập trung đáng theo dõi, nhưng chưa thể suy ra mức độ rủi ro hay hiệu quả kinh doanh nếu thiếu thông tin hợp đồng và biên lợi nhuận.

## 7. Đề xuất xử lý và quy tắc báo cáo chuẩn

**Ưu tiên ngay:** lấy Excel gốc để xác nhận các ô gộp và APEX; lấy danh sách 86 shipment gồm mã lô, khách hàng, tuyến, ngày chốt, số/loại container và chứng từ dịch vụ. Đối soát 12 shipment/48 TEU của HUYNH LUU NGAI trước; tiếp theo kiểm tra GIANG DAT THANH, A59GX11479, ASIA FINEST và hai mã HOANG KHANG. Không sửa Booking theo số tổng để ép khớp báo cáo.

**Bộ phận nghiệp vụ** xác nhận mỗi chênh lệch thuộc một trong các nhóm: thiếu nhập hệ thống, khác phạm vi phòng ban, khác kỳ, sai khách hàng/tuyến, hủy lô hoặc khác định nghĩa shipment. **Người phụ trách dữ liệu** bổ sung số container thiếu và cập nhật trạng thái sau khi kiểm tra chứng từ. **Người phê duyệt báo cáo** quyết định mốc ngày và định nghĩa KPI dùng nhất quán giữa các quý.

**Mô hình đề xuất cho giai đoạn tiếp theo:** một mã shipment/job ổn định; liên kết Booking và các chứng từ; nhật ký dịch vụ theo từng lô với service_type, ngày thực hiện, trạng thái và bằng chứng; hỗ trợ job dịch vụ độc lập như APEX; bảng quy đổi container có phiên bản; lưu snapshot quý và các điều chỉnh có lý do. Đây là đề xuất thiết kế, chưa phải schema đã có hoặc thay đổi đã thực hiện.

**Quy tắc nên ban hành:**

1. TEU dự kiến và TEU đã xác nhận tách thành hai cột; thiếu bằng chứng gắn nhãn chờ xác minh.
2. Shipment đếm DISTINCT mã lô, không đếm dòng container, số dịch vụ hay số bản chứng từ.
3. Tổng dịch vụ theo loại có thể chồng lặp; tổng “lô có dịch vụ” đếm hợp của mã lô. Công bố APEX có thuộc tổng nào.
4. Tuyến nhóm theo POL/POD và mã quốc gia; quy tắc gộp UIH/DAD/HCM công bố riêng, không che mất tuyến không hợp lệ.
5. Quy định ngày chốt và điều kiện trạng thái hoàn tất; không mặc định chỉ cần có B/L là đã xác nhận sản lượng.
6. Chốt và lưu cùng một snapshot cho số tổng, chi tiết, kỳ so sánh và lịch sử điều chỉnh.

**Nhận xét thay thế có thể dùng ngay:** “Theo bảng tổng hợp nghiệp vụ được cung cấp, quý II/2026 đạt 156 TEU/86 shipment. Database hiện ghi nhận 104 TEU dự kiến và 104 TEU theo B/L trên 72 Booking có ETD trong quý; toàn bộ còn trạng thái PROCESSING. Chênh lệch 52 TEU và 14 đơn vị đếm lô đang chờ đối soát, tập trung ở HUYNH LUU NGAI và một số khác biệt khách hàng/tuyến. Chỉ tiêu 28 shipment dịch vụ cần làm rõ phạm vi APEX. Chưa xác nhận chính thức tăng trưởng so với các kỳ trước cho đến khi thống nhất nguồn và phạm vi dữ liệu.”

## 8. Tệp kèm theo và khả năng kiểm tra lại

- [Bảng nguồn đã khôi phục](./bao-cao-goc-chuan-hoa.csv)
- [Đối chiếu theo khách hàng](./doi-chieu-khach-hang.csv)
- [Chi tiết 72 Booking quý II](./chi-tiet-72-booking.csv)
- [SQL truy vấn đối chiếu](./doi-chieu-read-only.sql)

Chứng cứ kỹ thuật trong workspace: tmp/logistics-q2-2026-audit/reconciliation.json, followup.json và database-snapshot.json (schema và định nghĩa view tại lúc kiểm tra). Mã nguồn liên quan: backend2.0/src/features/booking-documents/booking-documents-wire.service.ts (lọc ETD, workflow_status) và backend2.0/scripts/migrations/2026-09-03_booking_teu_reporting.sql (công thức TEU); định nghĩa view trực tiếp đã được đọc để đối chiếu. Snapshot chính dùng transaction REPEATABLE READ, READ ONLY; các truy vấn bổ sung được đọc sau đó trong transaction riêng, không phải bản dữ liệu đóng băng từ cuối quý II.
