-- Seed and protect service_types master data

-- Ensure unique indexes
DROP INDEX IF EXISTS ux_service_types_name ON service_types;
CREATE UNIQUE INDEX ux_service_types_name ON service_types(name);

DROP INDEX IF EXISTS ux_service_types_display_name ON service_types;
CREATE UNIQUE INDEX ux_service_types_display_name ON service_types(display_name);

-- Seed 5 fixed service types (idempotent)
INSERT INTO service_types (id, name, display_name, description, is_active, created_at, updated_at)
VALUES
    (1, 'SHIPPING AGENCY', 'Shipping Agency', 'Shipping agency services', 1, '2025-12-08 23:28:49', '2026-01-20 09:17:11'),
    (2, 'FREIGHT FORWARDING', 'Freight Forwarding', 'Freight forwarding and logistics', 1, '2025-12-08 23:28:49', '2026-01-20 09:17:15'),
    (3, 'CHARTERING', 'Chartering & Broking', 'Chartering and ship broking services', 1, '2025-12-08 23:28:49', '2025-12-08 23:28:49'),
    (4, 'LOGISTICS', 'Total Logistics', 'General logistics services', 1, '2025-12-08 23:28:49', '2025-12-18 21:51:25'),
    (5, 'SPECIAL REQUEST', 'Special Request', 'Custom inquiries and special requirements from contact page', 1, '2025-12-27 13:05:36', '2026-01-20 09:17:20')
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_at = VALUES(updated_at);

-- Guardrails: prevent changing key fields or deleting rows
DROP TRIGGER IF EXISTS trg_service_types_prevent_update;
DELIMITER $$
CREATE TRIGGER trg_service_types_prevent_update
BEFORE UPDATE ON service_types
FOR EACH ROW
BEGIN
    IF OLD.id <> NEW.id OR OLD.name <> NEW.name OR OLD.display_name <> NEW.display_name THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'service_types is immutable: id/name/display_name cannot change';
    END IF;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS trg_service_types_prevent_delete;
DELIMITER $$
CREATE TRIGGER trg_service_types_prevent_delete
BEFORE DELETE ON service_types
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'service_types delete is not allowed';
END$$
DELIMITER ;
