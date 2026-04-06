package com.example.seatrans.features.booking.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.booking.dto.BookingPartnerDetailResponse;
import com.example.seatrans.features.booking.dto.BookingPartnerListItemResponse;
import com.example.seatrans.features.booking.dto.BookingPartnerPageResponse;
import com.example.seatrans.features.booking.dto.BookingPartnerUpsertRequest;
import com.example.seatrans.features.booking.model.BookingPartner;
import com.example.seatrans.features.booking.model.CustomerStatus;
import com.example.seatrans.features.booking.model.CustomerType;
import com.example.seatrans.features.booking.model.PartnerAdditionType;
import com.example.seatrans.features.booking.repository.BookingPartnerRepository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingPartnerService {

    private static final DateTimeFormatter CUSTOMER_ID_DATE = DateTimeFormatter.ofPattern("yyMMdd", Locale.ROOT);
    private static final String CREATE_CUSTOMER_ID_SEQUENCE_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS customer_id_sequences (
            sequence_date CHAR(6) PRIMARY KEY,
            current_value BIGINT NOT NULL
        )
        """;

    private final BookingPartnerRepository bookingPartnerRepository;
    private final JdbcTemplate jdbcTemplate;
    private volatile boolean sequenceTableEnsured;

    @Transactional(readOnly = true)
    public BookingPartnerPageResponse listPartners(
            String q,
            CustomerStatus customerStatus,
            CustomerType customerType,
            List<PartnerAdditionType> additionTypes,
            String additionTypesMode,
            boolean includeArchived,
            Pageable pageable
    ) {
        Specification<BookingPartner> spec = buildBaseSpecification(
            q, customerStatus, customerType, includeArchived, additionTypes, additionTypesMode
        );
        
        Page<BookingPartner> pageData = bookingPartnerRepository.findAll(spec, pageable);

        List<BookingPartnerListItemResponse> items = pageData.getContent()
            .stream()
            .map(BookingPartnerListItemResponse::from)
            .toList();

        return BookingPartnerPageResponse.builder()
            .items(items)
            .page(pageData.getNumber())
            .size(pageData.getSize())
            .totalElements(pageData.getTotalElements())
            .totalPages(pageData.getTotalPages())
            .hasNext(pageData.hasNext())
            .build();
    }

    @Transactional(readOnly = true)
    public BookingPartnerDetailResponse getDetail(Long id, boolean includeArchived) {
        BookingPartner partner = includeArchived
            ? bookingPartnerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Partner not found"))
            : bookingPartnerRepository.findByIdAndDeletedAtIsNull(id).orElseThrow(() -> new IllegalArgumentException("Partner not found"));
        return BookingPartnerDetailResponse.from(partner);
    }

    @Transactional
    public BookingPartnerDetailResponse createPartner(BookingPartnerUpsertRequest request) {
        validateRequest(request);
        BookingPartner partner = new BookingPartner();
        mapUpsertRequest(partner, request);
        partner.setCustomerId(generateCustomerId());
        String actor = currentActor();
        partner.setCreatedBy(actor);
        partner.setUpdatedBy(actor);
        BookingPartner saved = bookingPartnerRepository.save(partner);
        return BookingPartnerDetailResponse.from(saved);
    }

    @Transactional
    public BookingPartnerDetailResponse updatePartner(Long id, BookingPartnerUpsertRequest request) {
        validateRequest(request);
        BookingPartner partner = bookingPartnerRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Partner not found"));

        mapUpsertRequest(partner, request);
        partner.setUpdatedBy(currentActor());
        BookingPartner saved = bookingPartnerRepository.save(partner);
        return BookingPartnerDetailResponse.from(saved);
    }

    @Transactional
    public BookingPartnerDetailResponse updateCustomerStatus(Long id, CustomerStatus customerStatus) {
        if (customerStatus == null) {
            throw new IllegalArgumentException("customerStatus is required");
        }

        BookingPartner partner = bookingPartnerRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Partner not found"));
        partner.setCustomerStatus(customerStatus);
        partner.setUpdatedBy(currentActor());

        BookingPartner saved = bookingPartnerRepository.save(partner);
        return BookingPartnerDetailResponse.from(saved);
    }

    @Transactional
    public void delete(Long id) {
        BookingPartner partner = bookingPartnerRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Partner not found"));
        bookingPartnerRepository.delete(partner);
    }

    private Specification<BookingPartner> buildBaseSpecification(
            String q,
            CustomerStatus customerStatus,
            CustomerType customerType,
            boolean includeArchived,
            List<PartnerAdditionType> additionTypes,
            String additionTypesMode
    ) {
        return (root, query, cb) -> {
            query.distinct(true);
            List<Predicate> predicates = new ArrayList<>();

            if (includeArchived) {
                predicates.add(cb.isNotNull(root.get("deletedAt")));
            } else {
                predicates.add(cb.isNull(root.get("deletedAt")));
            }

            if (customerStatus != null) {
                predicates.add(cb.equal(root.get("customerStatus"), customerStatus));
            }
            if (customerType != null) {
                predicates.add(cb.equal(root.get("customerType"), customerType));
            }

            String normalizedQ = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
            if (!normalizedQ.isEmpty()) {
                String likeQ = "%" + normalizedQ + "%";
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("name")), likeQ),
                        cb.like(cb.lower(root.get("customerId")), likeQ),
                        cb.like(cb.lower(root.get("taxNumber")), likeQ)
                    )
                );
            }

            if (additionTypes != null && !additionTypes.isEmpty()) {
                if ("AND".equalsIgnoreCase(additionTypesMode)) {
                    for (PartnerAdditionType type : additionTypes) {
                        predicates.add(cb.isMember(type, root.get("additionTypes")));
                    }
                } else {
                    Join<BookingPartner, PartnerAdditionType> join = root.join("additionTypes", JoinType.INNER);
                    predicates.add(join.in(additionTypes));
                }
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private List<BookingPartner> applyAdditionTypeFilter(
            List<BookingPartner> base,
            List<PartnerAdditionType> selected,
            String additionTypesMode
    ) {
        if (selected.isEmpty()) {
            return base;
        }

        Set<PartnerAdditionType> selectedSet = Set.copyOf(selected);
        boolean andMode = "AND".equalsIgnoreCase(additionTypesMode);

        if (andMode) {
            return base.stream()
                .filter(partner -> partner.getAdditionTypes() != null && partner.getAdditionTypes().containsAll(selectedSet))
                .collect(Collectors.toList());
        }

        return base.stream()
            .filter(partner -> {
                Set<PartnerAdditionType> partnerTypes = partner.getAdditionTypes();
                if (partnerTypes == null || partnerTypes.isEmpty()) {
                    return false;
                }
                return partnerTypes.stream().anyMatch(selectedSet::contains);
            })
            .collect(Collectors.toList());
    }

    private void mapUpsertRequest(BookingPartner target, BookingPartnerUpsertRequest request) {
        target.setName(trimToNull(request.getName()));
        target.setAdditionTypes(request.getAdditionTypes() == null ? Collections.emptySet() : request.getAdditionTypes());
        target.setCountry(trimToNull(request.getCountry()));
        target.setCity(trimToNull(request.getCity()));
        target.setContactEmail(trimToNull(request.getContactEmail()));
        target.setPhone(trimToNull(request.getPhone()));
        target.setFax(trimToNull(request.getFax()));
        target.setTrackingUrl(trimToNull(request.getTrackingUrl()));
        target.setAddress(trimToNull(request.getAddress()));
        target.setCustomerStatus(request.getCustomerStatus());
        target.setCustomerType(request.getCustomerType());
        target.setTaxNumber(trimToNull(request.getTaxNumber()));
    }

    private void validateRequest(BookingPartnerUpsertRequest request) {
        if (trimToNull(request.getName()) == null) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getAdditionTypes() == null || request.getAdditionTypes().isEmpty()) {
            throw new IllegalArgumentException("additionTypes is required");
        }
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "system";
        }
        return authentication.getName();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Transactional
    protected String generateCustomerId() {
        String datePart = LocalDate.now().format(CUSTOMER_ID_DATE);
        long nextValue = nextSequenceValueForDate(datePart);
        return String.format(Locale.ROOT, "CUS-%s-%06d", datePart, nextValue);
    }

    private long nextSequenceValueForDate(String datePart) {
        ensureSequenceTableExists();

        List<Long> rows = lockSequenceRow(datePart);
        if (rows.isEmpty()) {
            try {
                jdbcTemplate.update(
                    "INSERT INTO customer_id_sequences(sequence_date, current_value) VALUES (?, ?)",
                    datePart,
                    0L
                );
            } catch (DuplicateKeyException ignored) {
                // Row created concurrently by another transaction.
            }
            rows = lockSequenceRow(datePart);
            if (rows.isEmpty()) {
                throw new IllegalStateException("Failed to initialize customer id sequence row");
            }
        }

        long nextValue = rows.get(0) + 1;
        jdbcTemplate.update(
            "UPDATE customer_id_sequences SET current_value = ? WHERE sequence_date = ?",
            nextValue,
            datePart
        );
        return nextValue;
    }

    private List<Long> lockSequenceRow(String datePart) {
        return jdbcTemplate.query(
            "SELECT current_value FROM customer_id_sequences WHERE sequence_date = ? FOR UPDATE",
            (rs, rowNum) -> rs.getLong("current_value"),
            datePart
        );
    }

    private void ensureSequenceTableExists() {
        if (sequenceTableEnsured) {
            return;
        }

        synchronized (this) {
            if (sequenceTableEnsured) {
                return;
            }
            jdbcTemplate.execute(CREATE_CUSTOMER_ID_SEQUENCE_TABLE_SQL);
            sequenceTableEnsured = true;
        }
    }
}
