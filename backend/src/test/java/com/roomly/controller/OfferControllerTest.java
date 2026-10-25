package com.roomly.controller;

import com.roomly.dto.offer.OfferDiscountResponse;
import com.roomly.dto.offer.OfferDto;
import com.roomly.dto.offer.ValidateOfferRequest;
import com.roomly.service.OfferService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferControllerTest {

    @Mock
    private OfferService offerService;

    @InjectMocks
    private OfferController offerController;

    @Test
    @DisplayName("GET /api/v1/offers returns active offers from service")
    void getActiveOffers_ReturnsOffers() {
        OfferDto dto = OfferDto.builder()
                .id(UUID.randomUUID())
                .code("HDFC10")
                .title("HDFC Bank 10% Instant Savings")
                .bankName("HDFC Bank")
                .discountValue(BigDecimal.valueOf(10.00))
                .isActive(true)
                .build();

        when(offerService.getActiveOffers(null)).thenReturn(List.of(dto));

        ResponseEntity<List<OfferDto>> response = offerController.getActiveOffers(null);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("HDFC10", response.getBody().get(0).getCode());
    }

    @Test
    @DisplayName("POST /api/v1/offers/validate returns validation response")
    void validateOffer_ReturnsValidationResult() {
        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(500.00))
                .build();

        OfferDiscountResponse discountResponse = OfferDiscountResponse.builder()
                .isValid(true)
                .message("Valid offer")
                .discountAmount(BigDecimal.valueOf(50.00))
                .finalAmount(BigDecimal.valueOf(450.00))
                .build();

        when(offerService.validateAndCalculateDiscount(any())).thenReturn(discountResponse);

        ResponseEntity<OfferDiscountResponse> response = offerController.validateOffer(request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getIsValid());
        assertEquals(BigDecimal.valueOf(50.00), response.getBody().getDiscountAmount());
    }
}
