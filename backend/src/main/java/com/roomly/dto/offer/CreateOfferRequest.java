package com.roomly.dto.offer;

import com.roomly.entity.Offer.DiscountType;
import jakarta.validation.constraints.*;
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
public class CreateOfferRequest {

    @NotBlank(message = "Offer code is required")
    @Pattern(regexp = "^[A-Z0-9_-]{3,20}$", message = "Offer code must be 3-20 uppercase alphanumeric characters")
    private String code;

    @NotBlank(message = "Offer title is required")
    private String title;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Card network is required")
    private String cardNetwork;

    @NotBlank(message = "Card type is required")
    @Builder.Default
    private String cardType = "Credit Card";

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be greater than zero")
    private BigDecimal discountValue;

    private BigDecimal maxDiscount;

    @NotNull(message = "Minimum booking amount is required")
    @PositiveOrZero(message = "Minimum booking amount cannot be negative")
    private BigDecimal minBookingAmount;

    @NotNull(message = "Start date/time is required")
    private Instant startDateTime;

    @NotNull(message = "Expiry date/time is required")
    private Instant expiryDateTime;

    @NotNull(message = "Maximum total redemptions is required")
    @Positive(message = "Maximum total redemptions must be at least 1")
    private Integer maxTotalRedemptions;

    @NotNull(message = "Maximum redemptions per customer is required")
    @Positive(message = "Maximum redemptions per customer must be at least 1")
    private Integer maxPerCustomerRedemptions;

    private String termsAndConditions;

    @Builder.Default
    private Boolean isActive = true;
}
