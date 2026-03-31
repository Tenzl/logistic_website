package com.example.seatrans.features.booking.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BookingPartnerSchemaNormalizer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void normalizeBookingPartnerSchema() {
        if (!tableExists("booking_partners")) {
            return;
        }

        ensureTaxNumberColumn();
        ensureFaxColumn();
        dropLegacyInvoiceCompanyColumns();
    }

    private void ensureTaxNumberColumn() {
        boolean hasTaxNumber = columnExists("booking_partners", "tax_number");
        boolean hasInvoiceTaxNumber = columnExists("booking_partners", "invoice_tax_number");

        if (!hasTaxNumber && hasInvoiceTaxNumber) {
            jdbcTemplate.execute(
                "ALTER TABLE booking_partners CHANGE COLUMN invoice_tax_number tax_number VARCHAR(128) NULL"
            );
            hasTaxNumber = true;
            hasInvoiceTaxNumber = false;
        }

        if (!hasTaxNumber) {
            jdbcTemplate.execute(
                "ALTER TABLE booking_partners ADD COLUMN tax_number VARCHAR(128) NULL AFTER customer_type"
            );
            hasTaxNumber = true;
        }

        if (hasTaxNumber && hasInvoiceTaxNumber) {
            jdbcTemplate.execute(
                """
                UPDATE booking_partners
                SET tax_number = invoice_tax_number
                WHERE (tax_number IS NULL OR tax_number = '')
                  AND invoice_tax_number IS NOT NULL
                """
            );
            jdbcTemplate.execute("ALTER TABLE booking_partners DROP COLUMN invoice_tax_number");
        }

        jdbcTemplate.execute("ALTER TABLE booking_partners MODIFY COLUMN tax_number VARCHAR(128) NULL");
    }

    private void ensureFaxColumn() {
        if (!columnExists("booking_partners", "fax")) {
            jdbcTemplate.execute("ALTER TABLE booking_partners ADD COLUMN fax VARCHAR(64) NULL AFTER phone");
        }
    }

    private void dropLegacyInvoiceCompanyColumns() {
        dropColumnIfExists("booking_partners", "invoice_company_name");
        dropColumnIfExists("booking_partners", "invoice_company_address");
        dropColumnIfExists("booking_partners", "invoice_company_phone");
        dropColumnIfExists("booking_partners", "invoice_company_fax");
        dropColumnIfExists("booking_partners", "invoice_company_email");
    }

    private void dropColumnIfExists(String tableName, String columnName) {
        if (columnExists(tableName, columnName)) {
            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP COLUMN " + columnName);
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
            """,
            Integer.class,
            tableName
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
            """,
            Integer.class,
            tableName,
            columnName
        );
        return count != null && count > 0;
    }
}
