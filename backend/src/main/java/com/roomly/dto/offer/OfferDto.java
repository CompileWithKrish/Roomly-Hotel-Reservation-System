package com.roomly.dto.offer;

import com.roomly.entity.Offer.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferDto {
    private UUID id;
    private String code;
    private String title;
    private String bankName;
    private String cardNetwork;
    private String cardType;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minBookingAmount;
    private Instant startDateTime;
    private Instant expiryDateTime;
    private Integer maxTotalRedemptions;
    private Integer currentRedemptions;
    private Integer maxPerCustomerRedemptions;
    private String termsAndConditions;
    private Boolean isActive;
    private Boolean isArchived;
    private Instant createdAt;
    private Instant updatedAt;
    private Boolean isCurrentlyValid;
}
