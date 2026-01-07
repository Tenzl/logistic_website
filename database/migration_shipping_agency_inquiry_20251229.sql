-- Extend shipping_agency_inquiries for new Shipping Agency form fields
ALTER TABLE shipping_agency_inquiries
ADD COLUMN IF NOT EXISTS shipowner_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS mv VARCHAR(255),
ADD COLUMN IF NOT EXISTS eta DATE,
ADD COLUMN IF NOT EXISTS cargo_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cargo_name_other VARCHAR(255),
ADD COLUMN IF NOT EXISTS transport_ls TEXT,
ADD COLUMN IF NOT EXISTS transport_quarantine TEXT,
ADD COLUMN IF NOT EXISTS frt_tax_type VARCHAR(64);

-- Align cargo_quantity to numeric tons (if column already exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shipping_agency_inquiries' 
          AND column_name = 'cargo_quantity'
    ) THEN
        -- Attempt safe cast; adjust USING clause if existing data is non-numeric
        EXECUTE 'ALTER TABLE shipping_agency_inquiries ALTER COLUMN cargo_quantity TYPE NUMERIC(15,3) USING NULLIF(cargo_quantity, '''')::NUMERIC';
    ELSE
        EXECUTE 'ALTER TABLE shipping_agency_inquiries ADD COLUMN cargo_quantity NUMERIC(15,3)';
    END IF;
END $$;

-- Add yes/no + amount options
ALTER TABLE shipping_agency_inquiries
ADD COLUMN IF NOT EXISTS boat_hire_enabled BOOLEAN,
ADD COLUMN IF NOT EXISTS boat_hire_amount NUMERIC(15,2),
ADD COLUMN IF NOT EXISTS tally_fee_enabled BOOLEAN,
ADD COLUMN IF NOT EXISTS tally_fee_amount NUMERIC(15,2);

