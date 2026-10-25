package com.roomly.repository;

import com.roomly.entity.OfferRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface OfferRedemptionRepository extends JpaRepository<OfferRedemption, UUID> {

    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.offer.id = :offerId AND LOWER(r.customerEmail) = LOWER(:customerEmail)")
    long countRedemptionsByOfferAndEmail(
            @Param("offerId") UUID offerId,
            @Param("customerEmail") String customerEmail
    );

    @Query("SELECT COUNT(r) FROM OfferRedemption r WHERE r.offer.id = :offerId")
    long countTotalRedemptionsByOfferId(@Param("offerId") UUID offerId);

    List<OfferRedemption> findByOfferIdOrderByRedeemedAtDesc(UUID offerId);

    List<OfferRedemption> findByCustomerEmailIgnoreCaseOrderByRedeemedAtDesc(String customerEmail);

    @Query("SELECT COALESCE(SUM(r.discountApplied), 0) FROM OfferRedemption r")
    BigDecimal sumTotalDiscountGranted();
}
