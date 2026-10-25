package com.roomly.dto.offer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class ValidateOfferRequest {

    private UUID offerId;
    private String offerCode;

    @NotNull(message = "Booking amount is required")
    @Positive(message = "Booking amount must be greater than zero")
    private BigDecimal bookingAmount;

    private String customerEmail;
    private String cardNetwork;
    private String cardType;
}
