package com.roomly.service;

import com.roomly.dto.offer.OfferDiscountResponse;
import com.roomly.dto.offer.ValidateOfferRequest;
import com.roomly.entity.Booking;
import com.roomly.entity.Offer;
import com.roomly.entity.Offer.DiscountType;
import com.roomly.mapper.OfferMapper;
import com.roomly.repository.OfferRedemptionRepository;
import com.roomly.repository.OfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private OfferRepository offerRepository;

    @Mock
    private OfferRedemptionRepository redemptionRepository;

    private OfferMapper offerMapper = new OfferMapper();

    private OfferService offerService;

    private Offer activePercentageOffer;
    private Offer activeFixedOffer;
    private UUID offerId;

    @BeforeEach
    void setUp() {
        offerService = new OfferService(offerRepository, redemptionRepository, offerMapper);
        offerId = UUID.randomUUID();
        Instant now = Instant.now();

        activePercentageOffer = Offer.builder()
                .id(offerId)
                .code("HDFC10")
                .title("HDFC Bank 10% Instant Savings")
                .bankName("HDFC Bank")
                .cardNetwork("Visa")
                .cardType("Credit Card")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10.00))
                .maxDiscount(BigDecimal.valueOf(100.00))
                .minBookingAmount(BigDecimal.valueOf(300.00))
                .startDateTime(now.minus(2, ChronoUnit.DAYS))
                .expiryDateTime(now.plus(20, ChronoUnit.DAYS))
                .maxTotalRedemptions(100)
                .currentRedemptions(5)
                .maxPerCustomerRedemptions(2)
                .isActive(true)
                .isArchived(false)
                .build();

        activeFixedOffer = Offer.builder()
                .id(UUID.randomUUID())
                .code("ICICI50")
                .title("ICICI Bank Flat $50 Off")
                .bankName("ICICI Bank")
                .cardNetwork("Mastercard")
                .cardType("Credit Card")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(50.00))
                .maxDiscount(BigDecimal.valueOf(50.00))
                .minBookingAmount(BigDecimal.valueOf(250.00))
                .startDateTime(now.minus(2, ChronoUnit.DAYS))
                .expiryDateTime(now.plus(20, ChronoUnit.DAYS))
                .maxTotalRedemptions(100)
                .currentRedemptions(2)
                .maxPerCustomerRedemptions(1)
                .isActive(true)
                .isArchived(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully validate percentage offer and apply discount up to maximum cap")
    void validateOffer_PercentageWithCap_Success() {
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));
        when(redemptionRepository.countRedemptionsByOfferAndEmail(any(), eq("guest@example.com"))).thenReturn(0L);

        // Booking amount $1,500: 10% would be $150, but cap is $100
        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(1500.00))
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertTrue(response.getIsValid());
        assertEquals(0, BigDecimal.valueOf(100.00).compareTo(response.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(1400.00).compareTo(response.getFinalAmount()));
        assertEquals(0, BigDecimal.valueOf(1500.00).compareTo(response.getOriginalAmount()));
    }

    @Test
    @DisplayName("Should successfully validate percentage offer without hitting cap")
    void validateOffer_PercentageUnderCap_Success() {
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));
        when(redemptionRepository.countRedemptionsByOfferAndEmail(any(), eq("guest@example.com"))).thenReturn(0L);

        // Booking amount $500: 10% is $50 (cap is $100)
        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(500.00))
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertTrue(response.getIsValid());
        assertEquals(0, BigDecimal.valueOf(50.00).compareTo(response.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(450.00).compareTo(response.getFinalAmount()));
    }

    @Test
    @DisplayName("Should successfully validate fixed amount offer")
    void validateOffer_FixedAmount_Success() {
        when(offerRepository.findByCodeIgnoreCase("ICICI50")).thenReturn(Optional.of(activeFixedOffer));
        when(redemptionRepository.countRedemptionsByOfferAndEmail(any(), eq("guest@example.com"))).thenReturn(0L);

        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("ICICI50")
                .bookingAmount(BigDecimal.valueOf(400.00))
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertTrue(response.getIsValid());
        assertEquals(0, BigDecimal.valueOf(50.00).compareTo(response.getDiscountAmount()));
        assertEquals(0, BigDecimal.valueOf(350.00).compareTo(response.getFinalAmount()));
    }

    @Test
    @DisplayName("Should reject offer if booking amount is less than minimum booking amount")
    void validateOffer_BelowMinimumAmount_Fails() {
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));

        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(200.00)) // Min is 300
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertFalse(response.getIsValid());
        assertEquals(BigDecimal.ZERO, response.getDiscountAmount());
        assertTrue(response.getMessage().contains("Minimum booking amount"));
    }

    @Test
    @DisplayName("Should reject offer if offer is expired")
    void validateOffer_Expired_Fails() {
        activePercentageOffer.setExpiryDateTime(Instant.now().minus(1, ChronoUnit.DAYS));
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));

        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(500.00))
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertFalse(response.getIsValid());
        assertEquals(BigDecimal.ZERO, response.getDiscountAmount());
        assertTrue(response.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Should reject offer if offer is deactivated or archived")
    void validateOffer_Deactivated_Fails() {
        activePercentageOffer.setIsActive(false);
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));

        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(500.00))
                .customerEmail("guest@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertFalse(response.getIsValid());
        assertTrue(response.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("Should reject offer when per-customer redemption limit is exceeded")
    void validateOffer_PerCustomerLimitReached_Fails() {
        when(offerRepository.findByCodeIgnoreCase("HDFC10")).thenReturn(Optional.of(activePercentageOffer));
        // maxPerCustomerRedemptions is 2, customer already used 2
        when(redemptionRepository.countRedemptionsByOfferAndEmail(any(), eq("repeat@example.com"))).thenReturn(2L);

        ValidateOfferRequest request = ValidateOfferRequest.builder()
                .offerCode("HDFC10")
                .bookingAmount(BigDecimal.valueOf(500.00))
                .customerEmail("repeat@example.com")
                .build();

        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);

        assertFalse(response.getIsValid());
        assertTrue(response.getMessage().contains("redemption limit"));
    }

    @Test
    @DisplayName("Should record redemption and increment counter atomically")
    void recordRedemption_Success() {
        int initialCount = activePercentageOffer.getCurrentRedemptions();

        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .guestEmail("guest@example.com")
                .build();

        offerService.recordRedemption(activePercentageOffer, booking, "guest@example.com", BigDecimal.valueOf(50.00), null);

        assertEquals(initialCount + 1, activePercentageOffer.getCurrentRedemptions());
        verify(offerRepository).save(activePercentageOffer);
        verify(redemptionRepository).save(any());
    }
}
