package com.example.seatrans.features.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.seatrans.features.booking.model.BookingPartner;

public interface BookingPartnerRepository extends JpaRepository<BookingPartner, Long>, JpaSpecificationExecutor<BookingPartner> {
    Optional<BookingPartner> findByIdAndDeletedAtIsNull(Long id);
}
