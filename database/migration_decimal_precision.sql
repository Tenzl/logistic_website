-- Update currency columns to DECIMAL(18,2)
ALTER TABLE quotations
    MODIFY COLUMN base_price DECIMAL(18,2),
    MODIFY COLUMN total_surcharges DECIMAL(18,2),
    MODIFY COLUMN total_discounts DECIMAL(18,2),
    MODIFY COLUMN subtotal DECIMAL(18,2),
    MODIFY COLUMN tax_amount DECIMAL(18,2),
    MODIFY COLUMN final_amount DECIMAL(18,2);

ALTER TABLE quotation_items
    MODIFY COLUMN unit_price DECIMAL(18,2),
    MODIFY COLUMN total_price DECIMAL(18,2);

ALTER TABLE price_calculations
    MODIFY COLUMN total_price DECIMAL(18,2);

ALTER TABLE saved_estimates
    MODIFY COLUMN estimated_price DECIMAL(18,2);

-- Update rate/coefficient columns to DECIMAL(18,6)
ALTER TABLE rate_tiers
    MODIFY COLUMN min_value DECIMAL(18,6),
    MODIFY COLUMN max_value DECIMAL(18,6),
    MODIFY COLUMN result_value DECIMAL(18,6);

ALTER TABLE select_values
    MODIFY COLUMN rate DECIMAL(18,6);

-- Add audit columns for debugging (optional)
ALTER TABLE quotation_items
    ADD COLUMN raw_amount DECIMAL(18,8) COMMENT 'Before rounding' AFTER total_price;

ALTER TABLE price_calculations
    ADD COLUMN raw_amount DECIMAL(18,8) COMMENT 'Before rounding' AFTER total_price;
