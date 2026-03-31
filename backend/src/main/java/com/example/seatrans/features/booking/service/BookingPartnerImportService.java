package com.example.seatrans.features.booking.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.booking.dto.BookingPartnerUpsertRequest;
import com.example.seatrans.features.booking.dto.PartnerImportCommitResponse;
import com.example.seatrans.features.booking.dto.PartnerImportPreviewResponse;
import com.example.seatrans.features.booking.dto.PartnerImportRowError;
import com.example.seatrans.features.booking.model.CustomerStatus;
import com.example.seatrans.features.booking.model.CustomerType;
import com.example.seatrans.features.booking.model.PartnerAdditionType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingPartnerImportService {

    private static final String MODE_CREATE_ONLY = "CREATE_ONLY";

    private static final Set<String> REQUIRED_HEADERS = Set.of("name", "addition_types");
    private static final Set<String> OPTIONAL_HEADERS = Set.of(
        "tax_number",
        "country",
        "city",
        "contact_email",
        "phone",
        "fax",
        "tracking_url",
        "address",
        "customer_status",
        "customer_type"
    );

    private final BookingPartnerService bookingPartnerService;

    public PartnerImportPreviewResponse preview(MultipartFile file) {
        ParsedSheet parsed = parseSheet(file);

        List<PartnerImportRowError> rowErrors = new ArrayList<>();
        int validRows = 0;

        for (ParsedDataRow row : parsed.dataRows()) {
            List<PartnerImportRowError> currentErrors = validateRow(row, false);
            rowErrors.addAll(currentErrors);
            if (currentErrors.isEmpty()) {
                validRows++;
            }
        }

        return PartnerImportPreviewResponse.builder()
            .headers(parsed.headers())
            .rows(parsed.rawRows())
            .rowErrors(rowErrors)
            .summary(PartnerImportPreviewResponse.Summary.builder()
                .total(parsed.dataRows().size())
                .valid(validRows)
                .invalid(parsed.dataRows().size() - validRows)
                .build())
            .build();
    }

    public PartnerImportCommitResponse commit(MultipartFile file, String mode) {
        if (!MODE_CREATE_ONLY.equalsIgnoreCase(trimToEmpty(mode))) {
            throw new IllegalArgumentException("Only CREATE_ONLY mode is supported");
        }

        ParsedSheet parsed = parseSheet(file);
        List<PartnerImportRowError> rowErrors = new ArrayList<>();
        int createdCount = 0;

        for (ParsedDataRow row : parsed.dataRows()) {
            List<PartnerImportRowError> currentErrors = validateRow(row, true);
            if (!currentErrors.isEmpty()) {
                rowErrors.addAll(currentErrors);
                continue;
            }

            try {
                bookingPartnerService.createPartner(toUpsertRequest(row));
                createdCount++;
            } catch (IllegalArgumentException ex) {
                rowErrors.add(PartnerImportRowError.builder()
                    .rowIndex(row.excelRowIndex())
                    .message(ex.getMessage())
                    .code("BUSINESS_VALIDATION")
                    .build());
            }
        }

        int failedRows = rowErrors.stream()
            .map(PartnerImportRowError::getRowIndex)
            .collect(Collectors.toSet())
            .size();

        return PartnerImportCommitResponse.builder()
            .createdCount(createdCount)
            .updatedCount(0)
            .failedCount(failedRows)
            .rowErrors(rowErrors)
            .build();
    }

    public byte[] generateTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("partners");
            Row header = sheet.createRow(0);

            List<String> templateHeaders = new ArrayList<>();
            templateHeaders.add("name");
            templateHeaders.add("addition_types");
            templateHeaders.add("tax_number");
            templateHeaders.add("country");
            templateHeaders.add("city");
            templateHeaders.add("contact_email");
            templateHeaders.add("phone");
            templateHeaders.add("fax");
            templateHeaders.add("tracking_url");
            templateHeaders.add("address");
            templateHeaders.add("customer_status");
            templateHeaders.add("customer_type");

            for (int i = 0; i < templateHeaders.size(); i++) {
                header.createCell(i).setCellValue(templateHeaders.get(i));
                sheet.autoSizeColumn(i);
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to generate import template", ex);
        }
    }

    private ParsedSheet parseSheet(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file is required");
        }

        String originalFilename = trimToEmpty(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
        if (!originalFilename.endsWith(".xlsx")) {
            throw new IllegalArgumentException("Only .xlsx files are supported");
        }

        DataFormatter formatter = new DataFormatter();

        try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() == 0) {
                throw new IllegalArgumentException("Excel file is empty");
            }

            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw new IllegalArgumentException("Header row is missing");
            }

            List<String> headers = extractHeaders(headerRow, formatter);
            validateHeaders(headers);

            int lastRowNum = sheet.getLastRowNum();
            List<Map<String, String>> rawRows = new ArrayList<>();
            List<ParsedDataRow> dataRows = new ArrayList<>();

            for (int rowIndex = headerRow.getRowNum() + 1; rowIndex <= lastRowNum; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }

                LinkedHashMap<String, String> values = new LinkedHashMap<>();
                boolean hasValue = false;
                for (int col = 0; col < headers.size(); col++) {
                    String header = headers.get(col);
                    Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                    String value = trimToEmpty(cell == null ? "" : formatter.formatCellValue(cell));
                    if (!value.isEmpty()) {
                        hasValue = true;
                    }
                    values.put(header, value);
                }

                if (!hasValue) {
                    continue;
                }

                rawRows.add(values);
                dataRows.add(new ParsedDataRow(rowIndex + 1, values));
            }

            return new ParsedSheet(headers, rawRows, dataRows);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to read .xlsx file", ex);
        }
    }

    private List<String> extractHeaders(Row headerRow, DataFormatter formatter) {
        short lastCellNum = headerRow.getLastCellNum();
        if (lastCellNum <= 0) {
            throw new IllegalArgumentException("Header row is empty");
        }

        List<String> headers = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();

        for (int col = 0; col < lastCellNum; col++) {
            Cell cell = headerRow.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            String rawHeader = trimToEmpty(cell == null ? "" : formatter.formatCellValue(cell));
            String normalized = normalizeHeader(rawHeader);
            if (normalized.isEmpty()) {
                headers.add("column_" + (col + 1));
                continue;
            }

            if (seen.contains(normalized)) {
                throw new IllegalArgumentException("Duplicate header found: " + normalized);
            }
            seen.add(normalized);
            headers.add(normalized);
        }

        return headers;
    }

    private void validateHeaders(List<String> headers) {
        Set<String> headerSet = new LinkedHashSet<>(headers);
        List<String> missing = REQUIRED_HEADERS.stream().filter(required -> !headerSet.contains(required)).toList();
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException("Missing required headers: " + String.join(", ", missing));
        }
    }

    private List<PartnerImportRowError> validateRow(ParsedDataRow row, boolean strictForCommit) {
        List<PartnerImportRowError> errors = new ArrayList<>();
        Map<String, String> values = row.values();

        if (isBlank(values.get("name"))) {
            errors.add(rowError(row.excelRowIndex(), "name", "name is required", "REQUIRED"));
        }

        if (isBlank(values.get("addition_types"))) {
            errors.add(rowError(row.excelRowIndex(), "addition_types", "addition_types is required", "REQUIRED"));
        } else {
            List<String> invalid = invalidAdditionTypes(values.get("addition_types"));
            if (!invalid.isEmpty()) {
                errors.add(rowError(
                    row.excelRowIndex(),
                    "addition_types",
                    "Invalid addition_types: " + String.join(", ", invalid),
                    "INVALID_ENUM"
                ));
            }
        }

        String customerStatus = values.get("customer_status");
        if (!isBlank(customerStatus) && parseEnum(CustomerStatus.class, customerStatus) == null) {
            errors.add(rowError(row.excelRowIndex(), "customer_status", "Invalid customer_status", "INVALID_ENUM"));
        }

        String customerType = values.get("customer_type");
        if (!isBlank(customerType) && parseEnum(CustomerType.class, customerType) == null) {
            errors.add(rowError(row.excelRowIndex(), "customer_type", "Invalid customer_type", "INVALID_ENUM"));
        }

        return errors;
    }

    private BookingPartnerUpsertRequest toUpsertRequest(ParsedDataRow row) {
        Map<String, String> values = row.values();

        BookingPartnerUpsertRequest request = new BookingPartnerUpsertRequest();
        request.setName(trimToNull(values.get("name")));
        request.setAdditionTypes(parseAdditionTypes(values.get("addition_types")));
        request.setTaxNumber(trimToNull(values.get("tax_number")));
        request.setCountry(trimToNull(values.get("country")));
        request.setCity(trimToNull(values.get("city")));
        request.setContactEmail(trimToNull(values.get("contact_email")));
        request.setPhone(trimToNull(values.get("phone")));
        request.setFax(trimToNull(values.get("fax")));
        request.setTrackingUrl(trimToNull(values.get("tracking_url")));
        request.setAddress(trimToNull(values.get("address")));
        request.setCustomerStatus(parseEnum(CustomerStatus.class, values.get("customer_status")));
        request.setCustomerType(parseEnum(CustomerType.class, values.get("customer_type")));
        return request;
    }

    private Set<PartnerAdditionType> parseAdditionTypes(String value) {
        if (isBlank(value)) {
            return Collections.emptySet();
        }

        return Arrays.stream(value.split(","))
            .map(this::normalizeEnumToken)
            .filter(token -> !token.isEmpty())
            .map(token -> parseEnum(PartnerAdditionType.class, token))
            .filter(Objects::nonNull)
            .collect(LinkedHashSet::new, Set::add, Set::addAll);
    }

    private List<String> invalidAdditionTypes(String value) {
        if (isBlank(value)) {
            return Collections.emptyList();
        }

        return Arrays.stream(value.split(","))
            .map(this::normalizeEnumToken)
            .filter(token -> !token.isEmpty())
            .filter(token -> parseEnum(PartnerAdditionType.class, token) == null)
            .toList();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value) {
        String normalized = normalizeEnumToken(value);
        if (normalized.isEmpty()) {
            return null;
        }
        try {
            return Enum.valueOf(enumClass, normalized);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private PartnerImportRowError rowError(int rowIndex, String field, String message, String code) {
        return PartnerImportRowError.builder()
            .rowIndex(rowIndex)
            .field(field)
            .message(message)
            .code(code)
            .build();
    }

    private String normalizeHeader(String header) {
        String normalized = trimToEmpty(header).toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9]+", "_")
            .replaceAll("_+", "_");

        if (normalized.startsWith("_")) {
            normalized = normalized.substring(1);
        }
        if (normalized.endsWith("_")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String normalizeEnumToken(String value) {
        return trimToEmpty(value)
            .toUpperCase(Locale.ROOT)
            .replaceAll("[^A-Z0-9]+", "_")
            .replaceAll("_+", "_")
            .replaceAll("^_+", "")
            .replaceAll("_+$", "");
    }

    private String trimToNull(String value) {
        String trimmed = trimToEmpty(value);
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return trimToEmpty(value).isEmpty();
    }

    private record ParsedDataRow(int excelRowIndex, Map<String, String> values) {}

    private record ParsedSheet(
        List<String> headers,
        List<Map<String, String>> rawRows,
        List<ParsedDataRow> dataRows
    ) {}
}
