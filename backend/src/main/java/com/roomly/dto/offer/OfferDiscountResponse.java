package com.roomly.dto.offer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferDiscountResponse {
    private Boolean isValid;
    private String message;
    private UUID offerId;
    private String offerCode;
    private String offerTitle;
    private String bankName;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
}
