package com.example.seatrans.features.ports.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.seatrans.features.ports.dto.PortImportResultDTO;
import com.example.seatrans.features.ports.repository.PortRepository;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReaderBuilder;

@Service
public class PortImportService {

    private static final Logger log = LoggerFactory.getLogger(PortImportService.class);

    private static final int BATCH_CHUNK_SIZE = 500;
    private static final int MAX_ERRORS = 20;
    private static final Pattern SUFFIX_PATTERN = Pattern.compile(
            "(\\s+(PORT|TERMINAL|ANCHORAGE))+$", Pattern.CASE_INSENSITIVE);

    @Autowired
    private PortRepository portRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public PortImportResultDTO importFile(MultipartFile file) throws IOException {
        long t0 = System.currentTimeMillis();

        String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase()
                : "";

        log.info("[PortImport] Start — file: {}, size: {} bytes", filename, file.getSize());

        List<Map<String, String>> rows;
        if (filename.endsWith(".csv")) {
            rows = parseCsv(file.getInputStream());
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            rows = parseXlsx(file.getInputStream());
        } else {
            throw new IllegalArgumentException("Unsupported file format. Only .csv, .xlsx, .xls are accepted.");
        }

        log.info("[PortImport] Parsed {} rows in {}ms", rows.size(), System.currentTimeMillis() - t0);

        PortImportResultDTO result = processBatch(rows);

        log.info("[PortImport] Done — imported={}, duplicates={}, skipped={}, failed={} | total={}ms",
                result.getImported(), result.getDuplicates(), result.getSkipped(), result.getFailed(),
                System.currentTimeMillis() - t0);

        return result;
    }

    // ==================== Parsers ====================

    private List<Map<String, String>> parseCsv(InputStream inputStream) throws IOException {
        List<Map<String, String>> result = new ArrayList<>();

        try (
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            com.opencsv.CSVReader csvReader = new CSVReaderBuilder(reader)
                    .withCSVParser(new CSVParserBuilder().withSeparator(',').build())
                    .build()
        ) {
            String[] headers = csvReader.readNext();
            if (headers == null) return result;

            String[] normalizedHeaders = normalizeHeaders(headers);

            String[] line;
            while ((line = csvReader.readNext()) != null) {
                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < normalizedHeaders.length; i++) {
                    String value = (i < line.length) ? line[i].trim() : "";
                    row.put(normalizedHeaders[i], value);
                }
                result.add(row);
            }
        } catch (com.opencsv.exceptions.CsvValidationException e) {
            throw new IOException("CSV validation error: " + e.getMessage(), e);
        }

        return result;
    }

    private List<Map<String, String>> parseXlsx(InputStream inputStream) throws IOException {
        List<Map<String, String>> result = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) return result;

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return result;

            int colCount = headerRow.getLastCellNum();
            String[] headers = new String[colCount];
            for (int i = 0; i < colCount; i++) {
                Cell cell = headerRow.getCell(i);
                headers[i] = cell != null ? getCellStringValue(cell) : "";
            }
            String[] normalizedHeaders = normalizeHeaders(headers);

            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;

                Map<String, String> rowMap = new HashMap<>();
                for (int colIndex = 0; colIndex < normalizedHeaders.length; colIndex++) {
                    Cell cell = row.getCell(colIndex);
                    String value = (cell != null) ? getCellStringValue(cell).trim() : "";
                    rowMap.put(normalizedHeaders[colIndex], value);
                }
                result.add(rowMap);
            }
        }

        return result;
    }

    // ==================== Processing ====================

    private PortImportResultDTO processBatch(List<Map<String, String>> rows) {
        int skipped = 0;
        int duplicates = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        // Load only names (not full entities) — much faster for large tables
        Set<String> existingNames = new HashSet<>(portRepository.findAllNames()
                .stream()
                .map(name -> normalizePortName(name).toUpperCase())
                .toList());

        // Collect valid rows to insert
        List<Object[]> paramsBatch = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            int lineNumber = i + 2; // +2: 1-indexed + skip header row

            try {
                String rawName = row.getOrDefault("name", "").trim();
                if (rawName.isEmpty()) {
                    skipped++;
                    continue;
                }

                String normalizedName = normalizePortName(rawName);
                if (existingNames.contains(normalizedName.toUpperCase())) {
                    duplicates++;
                    continue;
                }

                String portOfCall = buildPortOfCall(
                        row.getOrDefault("port_of_call", ""), normalizedName);

                String code       = emptyToNull(row.getOrDefault("code", ""));
                String zoneCode   = emptyToNull(row.getOrDefault("zone_code", ""));
                String countryCode = row.getOrDefault("country_code", "").trim();
                countryCode = countryCode.isEmpty() ? null : countryCode.toUpperCase();

                BigDecimal latitude  = parseDecimal(row.getOrDefault("latitude", ""));
                BigDecimal longitude = parseDecimal(row.getOrDefault("longitude", ""));

                Timestamp now = Timestamp.valueOf(LocalDateTime.now());

                // Parameter order matches INSERT below:
                // name, port_of_call, code, zone_code, country_code,
                // latitude, longitude, is_active, has_info, created_at, updated_at
                paramsBatch.add(new Object[]{
                        normalizedName, portOfCall, code, zoneCode, countryCode,
                        latitude, longitude, true, 0, now, now
                });

                // Prevent intra-batch duplicates
                existingNames.add(normalizedName.toUpperCase());

            } catch (Exception e) {
                failed++;
                if (errors.size() < MAX_ERRORS) {
                    errors.add("Row " + lineNumber + ": " + e.getMessage());
                }
            }
        }

        log.info("[PortImport] Validation done — toInsert={}, duplicates={}, skipped={}", paramsBatch.size(), duplicates, skipped);

        // Insert in chunks — avoids excessively large PreparedStatement batch
        int imported = 0;
        if (!paramsBatch.isEmpty()) {
            long tInsert = System.currentTimeMillis();
            imported = batchInsert(paramsBatch, errors);
            log.info("[PortImport] batchInsert {} rows in {}ms", imported, System.currentTimeMillis() - tInsert);
        }

        return PortImportResultDTO.builder()
                .imported(imported)
                .duplicates(duplicates)
                .skipped(skipped)
                .failed(failed + (paramsBatch.size() - imported))
                .errors(errors)
                .build();
    }

    private int batchInsert(List<Object[]> params, List<String> errors) {
        final String sql =
                "INSERT INTO ports " +
                "(name, port_of_call, code, zone_code, country_code, " +
                " latitude, longitude, is_active, has_info, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        int totalInserted = 0;

        for (int offset = 0; offset < params.size(); offset += BATCH_CHUNK_SIZE) {
            int end = Math.min(offset + BATCH_CHUNK_SIZE, params.size());
            List<Object[]> chunk = params.subList(offset, end);

            try {
                int[] results = jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement ps, int i) throws SQLException {
                        Object[] p = chunk.get(i);
                        ps.setString(1,  (String) p[0]);  // name
                        ps.setString(2,  (String) p[1]);  // port_of_call
                        setNullableString(ps, 3, (String) p[2]);   // code
                        setNullableString(ps, 4, (String) p[3]);   // zone_code
                        setNullableString(ps, 5, (String) p[4]);   // country_code
                        setNullableDecimal(ps, 6, (BigDecimal) p[5]); // latitude
                        setNullableDecimal(ps, 7, (BigDecimal) p[6]); // longitude
                        ps.setBoolean(8, (Boolean) p[7]);           // is_active
                        ps.setInt(9,     (Integer) p[8]);           // has_info
                        ps.setTimestamp(10, (Timestamp) p[9]);      // created_at
                        ps.setTimestamp(11, (Timestamp) p[10]);     // updated_at
                    }

                    @Override
                    public int getBatchSize() {
                        return chunk.size();
                    }
                });

                for (int r : results) {
                    if (r >= 0 || r == java.sql.Statement.SUCCESS_NO_INFO) {
                        totalInserted++;
                    }
                }
            } catch (Exception e) {
                if (errors.size() < MAX_ERRORS) {
                    errors.add("Batch chunk [" + offset + "-" + (end - 1) + "] failed: " + e.getMessage());
                }
            }
        }

        return totalInserted;
    }

    // ==================== Helpers ====================

    private void setNullableString(PreparedStatement ps, int index, String value) throws SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.VARCHAR);
        } else {
            ps.setString(index, value);
        }
    }

    private void setNullableDecimal(PreparedStatement ps, int index, BigDecimal value) throws SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.DECIMAL);
        } else {
            ps.setBigDecimal(index, value);
        }
    }

    private String[] normalizeHeaders(String[] headers) {
        String[] normalized = new String[headers.length];
        for (int i = 0; i < headers.length; i++) {
            normalized[i] = headers[i]
                    .replaceAll("^\uFEFF", "")
                    .trim()
                    .toLowerCase()
                    .replaceAll("\\s+", "_");
        }
        return normalized;
    }

    private String normalizePortName(String value) {
        if (value == null) return "";
        return value.trim().replaceAll("\\s+", " ");
    }

    private String buildPortOfCall(String provided, String normalizedName) {
        if (provided != null && !provided.trim().isEmpty()) {
            return provided.trim().replaceAll("\\s+", " ").toUpperCase();
        }
        String upper = normalizedName.toUpperCase();
        String stripped = SUFFIX_PATTERN.matcher(upper).replaceAll("").trim();
        return stripped.isEmpty() ? upper : stripped;
    }

    private BigDecimal parseDecimal(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            return new BigDecimal(value.trim().replace(",", "."));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String emptyToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        CellType effectiveType = cell.getCellType() == CellType.FORMULA
                ? cell.getCachedFormulaResultType()
                : cell.getCellType();

        return switch (effectiveType) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                }
                double numeric = cell.getNumericCellValue();
                if (numeric == Math.floor(numeric) && !Double.isInfinite(numeric)) {
                    yield String.valueOf((long) numeric);
                }
                yield String.valueOf(numeric);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }
}
