package com.roomly.repository;

import com.roomly.entity.Offer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {

    Optional<Offer> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.isArchived = false " +
           "AND :now >= o.startDateTime AND :now <= o.expiryDateTime " +
           "AND (o.maxTotalRedemptions IS NULL OR o.currentRedemptions < o.maxTotalRedemptions) " +
           "AND (:bookingAmount IS NULL OR o.minBookingAmount <= :bookingAmount) " +
           "ORDER BY o.discountValue DESC")
    List<Offer> findActiveEligibleOffers(
            @Param("now") Instant now,
            @Param("bookingAmount") BigDecimal bookingAmount
    );

    @Query("SELECT o FROM Offer o WHERE o.isArchived = false " +
           "AND (:search IS NULL OR LOWER(o.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.code) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.bankName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:bank IS NULL OR LOWER(o.bankName) = LOWER(:bank)) " +
           "AND (:isActive IS NULL OR o.isActive = :isActive) " +
           "AND (:discountType IS NULL OR o.discountType = :discountType) " +
           "ORDER BY o.createdAt DESC")
    Page<Offer> findOffersForAdmin(
            @Param("search") String search,
            @Param("bank") String bank,
            @Param("isActive") Boolean isActive,
            @Param("discountType") Offer.DiscountType discountType,
            Pageable pageable
    );

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.isActive = true AND o.isArchived = false AND :now <= o.expiryDateTime")
    long countActiveOffers(@Param("now") Instant now);
}
