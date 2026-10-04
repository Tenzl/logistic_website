BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '30s';

-- metadata
select now() as captured_at,current_setting('transaction_read_only') as read_only;

-- monthly
select to_char(etd,'YYYY-MM') as month,count(*) as bookings,sum(planned_teu) planned,sum(actual_teu) actual from booking_reporting_v1 where etd >= '2026-04-01' and etd < '2026-07-01' group by 1 order by 1;

-- customers
select client_party_id,client_name,to_char(etd,'YYYY-MM') as month,count(*) as bookings,sum(planned_teu) planned,sum(actual_teu) actual from booking_reporting_v1 where etd >= '2026-04-01' and etd < '2026-07-01' group by 1,2,3 order by 2,3;

-- routes
select client_party_id,client_name,port_of_loading_name,port_of_discharge_name,p.country_code,commodity_name,count(*) bookings,sum(actual_teu) actual from booking_reporting_v1 v left join ports p on p.id=v.port_of_discharge_id where etd >= '2026-04-01' and etd < '2026-07-01' group by 1,2,3,4,5,6 order by 2,4;

-- quality
select booking_status,bl_status,count(*) bookings,count(*) filter(where has_bl) has_bl,count(*) filter(where planned_teu<>actual_teu) unequal,count(*) filter(where client_party_id is null) no_client_id,count(*) filter(where port_of_discharge_id is null) no_pod,sum(actual_unknown_type_count) unknown,sum(actual_20ft_containers) c20,sum(actual_40ft_containers) c40,sum(actual_45ft_containers) c45 from booking_reporting_v1 where etd >= '2026-04-01' and etd < '2026-07-01' group by 1,2;

-- dateBasis
select 'booking_date' basis,count(*) bookings,sum(actual_teu) teu from booking_reporting_v1 where booking_date >= '2026-04-01' and booking_date < '2026-07-01' union all select 'bl_date',count(*),sum(actual_teu) from booking_reporting_v1 where bl_date >= '2026-04-01' and bl_date < '2026-07-01' union all select 'clean_on_board_date',count(*),sum(v.actual_teu) from booking_reporting_v1 v join bill_of_lading_records b on b.id=v.bl_id where b.clean_on_board_date >= '2026-04-01' and b.clean_on_board_date < '2026-07-01';

-- onboardCoverage
select count(*) total,count(*) filter(where b.clean_on_board_date is not null) with_onboard,count(*) filter(where b.clean_on_board_date is null) missing_onboard from booking_reporting_v1 v join bill_of_lading_records b on b.id=v.bl_id where etd >= '2026-04-01' and etd < '2026-07-01';

-- deleted
select booking_flow,status,count(*) total,count(*) filter(where deleted_at is not null) deleted from booking_records where etd >= '2026-04-01' and etd < '2026-07-01' group by 1,2;

-- partners
select id,name,customer_id,deleted_at from booking_partners where name ~* 'AN THINH|HOANG KHANG|THACH SON|NHAT PHU|PHU TAI|STONE MIX|NAM THANG|GIANG DAT|HUYNH LUU|APEX' order by name;

-- tables
select table_name from information_schema.tables where table_schema='public' order by 1;

-- serviceColumns
select table_name,column_name,data_type from information_schema.columns where table_schema='public' and column_name ~* 'truck|stuff|fumi|customs|shipment|actual_depart|service|completed|cancel' order by 1,2;

-- duplicates
select booking_number,count(*) from booking_records where deleted_at is null group by 1 having count(*)>1;

-- containerDuplicates
select c.document_id,c.container_no,count(*) from bill_of_lading_containers c join bill_of_lading_records bl on bl.id=c.document_id join booking_records b on b.id=bl.booking_id where b.etd >= '2026-04-01' and b.etd < '2026-07-01' and b.deleted_at is null and bl.deleted_at is null group by 1,2 having count(*)>1;

-- records
select v.*,bl.clean_on_board_date from booking_reporting_v1 v left join bill_of_lading_records bl on bl.id=v.bl_id where etd >= '2026-04-01' and etd < '2026-07-01' order by etd,booking_id;

-- quarterComparison
select to_char(etd,'YYYY-Q') quarter,count(*) bookings,sum(actual_teu) teu from booking_reporting_v1 group by 1 order by 1;

-- missingClientsHistory
select client_party_id,client_name,to_char(etd,'YYYY-MM') as month,count(*) bookings,sum(actual_teu) teu from booking_reporting_v1 where client_party_id in (66,99,46,123,124) group by 1,2,3 order by 1,3;

-- containerQuality
select count(*) container_rows,count(*) filter(where nullif(trim(c.container_no),'') is null) missing_container_no,count(*) filter(where c.gross_weight_kg is null or c.gross_weight_kg=0) missing_weight from bill_of_lading_containers c join bill_of_lading_records bl on bl.id=c.document_id join booking_records b on b.id=bl.booking_id where b.etd >= '2026-04-01' and b.etd < '2026-07-01' and b.deleted_at is null and bl.deleted_at is null;

-- exceptions
select b.id,b.booking_number,b.client_name,b.etd,b.port_of_loading_name,b.port_of_discharge_name,b.place_of_delivery_name,bl.port_of_loading_name as bl_pol,bl.port_of_discharge_name as bl_pod,bl.place_of_delivery_name as bl_delivery,bl.clean_on_board_date,bl.fbl_number from booking_records b left join bill_of_lading_records bl on bl.booking_id=b.id and bl.deleted_at is null where b.deleted_at is null and b.etd >= '2026-04-01' and b.etd < '2026-07-01' and (b.client_party_id in (113,125) or b.port_of_discharge_name like '%VNCLI%');

-- serviceSchema
select table_name,column_name,data_type from information_schema.columns where table_schema='public' and table_name in ('total_logistics_inquiries','freight_forwarding_inquiries','booking_partner_addition_types') order by 1,ordinal_position;

-- serviceHints
select id,booking_number,client_name,special_remark from booking_records where deleted_at is null and etd >= '2026-04-01' and etd < '2026-07-01' and special_remark ~* 'truck|stuff|fumi|customs|khai|đóng|hải quan';

-- onboardDifferences
select count(*) different_dates,count(*) filter(where (bl.clean_on_board_date >= '2026-04-01' and bl.clean_on_board_date < '2026-07-01') is distinct from (b.etd >= '2026-04-01' and b.etd < '2026-07-01')) cross_quarter from booking_records b join bill_of_lading_records bl on bl.booking_id=b.id and bl.deleted_at is null where b.deleted_at is null and b.etd is distinct from bl.clean_on_board_date;

ROLLBACK;
