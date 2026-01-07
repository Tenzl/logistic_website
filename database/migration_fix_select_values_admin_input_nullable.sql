-- Drop legacy FK and column admin_input_id (no longer used by rate_table_configs)
ALTER TABLE select_values
    DROP FOREIGN KEY select_values_ibfk_1;

ALTER TABLE select_values
    DROP COLUMN admin_input_id;
