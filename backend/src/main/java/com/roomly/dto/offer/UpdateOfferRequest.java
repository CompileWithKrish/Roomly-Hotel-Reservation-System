package com.roomly.dto.offer;

import com.roomly.entity.Offer.DiscountType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOfferRequest {

    private String title;
    private String bankName;
    private String cardNetwork;
    private String cardType;
    private String description;

    private DiscountType discountType;

    @Positive(message = "Discount value must be greater than zero")
    private BigDecimal discountValue;

    private BigDecimal maxDiscount;

    @PositiveOrZero(message = "Minimum booking amount cannot be negative")
    private BigDecimal minBookingAmount;

    private Instant startDateTime;
    private Instant expiryDateTime;

    @Positive(message = "Maximum total redemptions must be at least 1")
    private Integer maxTotalRedemptions;

    @Positive(message = "Maximum redemptions per customer must be at least 1")
    private Integer maxPerCustomerRedemptions;

    private String termsAndConditions;
    private Boolean isActive;
}
