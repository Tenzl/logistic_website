-- Seed service_types with fixed IDs/slugs
INSERT INTO service_types (id, name, display_name, description, is_active, created_at, updated_at)
VALUES
    (1, 'shipping-agency', 'Shipping Agency', 'Port agency services', TRUE, NOW(), NOW()),
    (2, 'freight-forwarding', 'Freight Forwarding', 'International freight forwarding', TRUE, NOW(), NOW()),
    (3, 'chartering-ship-broking', 'Chartering & Ship Broking', 'Chartering and broking services', TRUE, NOW(), NOW()),
    (4, 'total-logistics', 'Total Logistics', 'Integrated logistics services', TRUE, NOW(), NOW()),
    (5, 'special-request', 'Special Request', 'Custom and special service requests', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    display_name = VALUES(display_name),
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_at = NOW();

-- Seed dynamic non-identity form fields
-- Shipping Agency (1)
INSERT INTO service_form_fields (service_type_id, field_key, label, type, required, placeholder, grid_span, options, position, is_active, created_at, updated_at)
VALUES
    (1, 'port_of_call', 'Port of call', 'text', TRUE, 'Port name', 12, NULL, 1, TRUE, NOW(), NOW()),
    (1, 'vessel_name', 'Vessel name', 'text', FALSE, 'Vessel name', 12, NULL, 2, TRUE, NOW(), NOW()),
    (1, 'voyage_no', 'Voyage No.', 'text', FALSE, 'Voyage number', 12, NULL, 3, TRUE, NOW(), NOW()),
    (1, 'eta', 'ETA', 'date', FALSE, 'Estimated arrival', 6, NULL, 4, TRUE, NOW(), NOW()),
    (1, 'etd', 'ETD', 'date', FALSE, 'Estimated departure', 6, NULL, 5, TRUE, NOW(), NOW()),
    (1, 'agency_scope', 'Agency scope', 'select', TRUE, 'Select scope', 12, '["Husbandry","Protecting","Port Agency"]', 6, TRUE, NOW(), NOW()),
    (1, 'documents_required', 'Documents required', 'textarea', FALSE, 'List required documents', 12, NULL, 7, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), type=VALUES(type), required=VALUES(required), placeholder=VALUES(placeholder), grid_span=VALUES(grid_span), options=VALUES(options), position=VALUES(position), is_active=VALUES(is_active), updated_at=NOW();

-- Chartering & Ship Broking (3)
INSERT INTO service_form_fields (service_type_id, field_key, label, type, required, placeholder, grid_span, options, position, is_active, created_at, updated_at)
VALUES
    (3, 'charter_type', 'Charter type', 'select', TRUE, 'Select type', 12, '["Time","Voyage","Bareboat"]', 1, TRUE, NOW(), NOW()),
    (3, 'vessel_type', 'Vessel type', 'select', TRUE, 'Select vessel type', 12, '["Bulk Carrier","Container","Tanker","MPP"]', 2, TRUE, NOW(), NOW()),
    (3, 'dwt', 'DWT', 'number', FALSE, 'Deadweight tonnage', 6, NULL, 3, TRUE, NOW(), NOW()),
    (3, 'laycan', 'Laycan', 'date', FALSE, 'Laycan date', 6, NULL, 4, TRUE, NOW(), NOW()),
    (3, 'cargo', 'Cargo', 'text', TRUE, 'Cargo description', 12, NULL, 5, TRUE, NOW(), NOW()),
    (3, 'load_port', 'Load port', 'text', FALSE, 'Port of loading', 6, NULL, 6, TRUE, NOW(), NOW()),
    (3, 'discharge_port', 'Discharge port', 'text', FALSE, 'Port of discharge', 6, NULL, 7, TRUE, NOW(), NOW()),
    (3, 'rate_indication', 'Rate indication', 'text', FALSE, 'Desired rate', 12, NULL, 8, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), type=VALUES(type), required=VALUES(required), placeholder=VALUES(placeholder), grid_span=VALUES(grid_span), options=VALUES(options), position=VALUES(position), is_active=VALUES(is_active), updated_at=NOW();

-- Freight Forwarding (2)
INSERT INTO service_form_fields (service_type_id, field_key, label, type, required, placeholder, grid_span, options, position, is_active, created_at, updated_at)
VALUES
    (2, 'mode', 'Mode', 'select', TRUE, 'Select mode', 6, '["Sea","Air","Road","Rail"]', 1, TRUE, NOW(), NOW()),
    (2, 'incoterms', 'Incoterms', 'select', TRUE, 'Select incoterm', 6, '["FOB","CIF","CFR","EXW","DAP","DDP"]', 2, TRUE, NOW(), NOW()),
    (2, 'origin', 'Origin', 'text', TRUE, 'Departure location', 6, NULL, 3, TRUE, NOW(), NOW()),
    (2, 'destination', 'Destination', 'text', TRUE, 'Arrival location', 6, NULL, 4, TRUE, NOW(), NOW()),
    (2, 'cargo_type', 'Cargo type', 'text', FALSE, 'Type of goods', 6, NULL, 5, TRUE, NOW(), NOW()),
    (2, 'gross_weight_kg', 'Gross weight (kg)', 'number', FALSE, 'Weight in kg', 6, NULL, 6, TRUE, NOW(), NOW()),
    (2, 'volume_cbm', 'Volume (cbm)', 'number', FALSE, 'Volume in cbm', 6, NULL, 7, TRUE, NOW(), NOW()),
    (2, 'ready_date', 'Ready date', 'date', FALSE, 'When cargo is ready', 6, NULL, 8, TRUE, NOW(), NOW()),
    (2, 'dangerous_goods', 'Dangerous goods', 'select', FALSE, 'Select', 6, '["Yes","No"]', 9, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), type=VALUES(type), required=VALUES(required), placeholder=VALUES(placeholder), grid_span=VALUES(grid_span), options=VALUES(options), position=VALUES(position), is_active=VALUES(is_active), updated_at=NOW();

-- Total Logistics (4)
INSERT INTO service_form_fields (service_type_id, field_key, label, type, required, placeholder, grid_span, options, position, is_active, created_at, updated_at)
VALUES
    (4, 'services_needed', 'Services needed', 'textarea', TRUE, 'Warehousing / customs / trucking / last-mile...', 12, NULL, 1, TRUE, NOW(), NOW()),
    (4, 'pickup_address', 'Pickup address', 'textarea', TRUE, 'Pickup address', 12, NULL, 2, TRUE, NOW(), NOW()),
    (4, 'delivery_address', 'Delivery address', 'textarea', TRUE, 'Delivery address', 12, NULL, 3, TRUE, NOW(), NOW()),
    (4, 'timeline', 'Timeline', 'text', FALSE, 'Preferred timeline', 6, NULL, 4, TRUE, NOW(), NOW()),
    (4, 'special_handling', 'Special handling', 'textarea', FALSE, 'Temperature control, fragile...', 12, NULL, 5, TRUE, NOW(), NOW()),
    (4, 'insurance_required', 'Insurance required', 'select', FALSE, 'Select', 6, '["Yes","No"]', 6, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), type=VALUES(type), required=VALUES(required), placeholder=VALUES(placeholder), grid_span=VALUES(grid_span), options=VALUES(options), position=VALUES(position), is_active=VALUES(is_active), updated_at=NOW();

-- Special Request (5)
INSERT INTO service_form_fields (service_type_id, field_key, label, type, required, placeholder, grid_span, options, position, is_active, created_at, updated_at)
VALUES
    (5, 'request_type', 'Request type', 'text', TRUE, 'Type of special request', 12, NULL, 1, TRUE, NOW(), NOW()),
    (5, 'subject', 'Subject', 'text', TRUE, 'Brief subject', 12, NULL, 2, TRUE, NOW(), NOW()),
    (5, 'description', 'Detailed description', 'textarea', TRUE, 'Describe your special request in detail', 12, NULL, 3, TRUE, NOW(), NOW()),
    (5, 'urgency', 'Urgency', 'select', FALSE, 'How urgent is this request', 6, '["Low","Medium","High","Critical"]', 4, TRUE, NOW(), NOW()),
    (5, 'preferred_contact', 'Preferred contact method', 'select', FALSE, 'How to contact you', 6, '["Email","Phone","WhatsApp"]', 5, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE label=VALUES(label), type=VALUES(type), required=VALUES(required), placeholder=VALUES(placeholder), grid_span=VALUES(grid_span), options=VALUES(options), position=VALUES(position), is_active=VALUES(is_active), updated_at=NOW();
