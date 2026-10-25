package com.roomly.service;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.offer.*;
import com.roomly.entity.Booking;
import com.roomly.entity.Offer;
import com.roomly.entity.Offer.DiscountType;
import com.roomly.entity.OfferRedemption;
import com.roomly.entity.User;
import com.roomly.exception.BadRequestException;
import com.roomly.exception.ResourceNotFoundException;
import com.roomly.mapper.OfferMapper;
import com.roomly.repository.OfferRedemptionRepository;
import com.roomly.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final OfferRedemptionRepository redemptionRepository;
    private final OfferMapper offerMapper;

    // =========================================================================
    // CUSTOMER FACING METHODS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OfferDto> getActiveOffers(BigDecimal bookingAmount) {
        Instant now = Instant.now();
        List<Offer> offers = offerRepository.findActiveEligibleOffers(now, bookingAmount);
        return offers.stream()
                .map(offerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OfferDto getOfferById(UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + id));
        return offerMapper.toDto(offer);
    }

    @Transactional(readOnly = true)
    public OfferDiscountResponse validateAndCalculateDiscount(ValidateOfferRequest request) {
        Offer offer = findOfferByRequest(request.getOfferId(), request.getOfferCode());
        if (offer == null) {
            return OfferDiscountResponse.builder()
                    .isValid(false)
                    .message("The specified offer was not found.")
                    .originalAmount(request.getBookingAmount())
                    .discountAmount(BigDecimal.ZERO)
                    .finalAmount(request.getBookingAmount())
                    .build();
        }

        Instant now = Instant.now();

        // 1. Status & Archive check
        if (!Boolean.TRUE.equals(offer.getIsActive()) || Boolean.TRUE.equals(offer.getIsArchived())) {
            return invalidResponse(offer, request.getBookingAmount(), "This offer is currently inactive or archived.");
        }

        // 2. Validity window
        if (offer.getStartDateTime() != null && now.isBefore(offer.getStartDateTime())) {
            return invalidResponse(offer, request.getBookingAmount(), "This offer has not yet started.");
        }
        if (offer.getExpiryDateTime() != null && now.isAfter(offer.getExpiryDateTime())) {
            return invalidResponse(offer, request.getBookingAmount(), "This offer has expired.");
        }

        // 3. Minimum booking amount
        if (offer.getMinBookingAmount() != null && request.getBookingAmount().compareTo(offer.getMinBookingAmount()) < 0) {
            return invalidResponse(offer, request.getBookingAmount(),
                    String.format("Minimum booking amount of $%s is required to apply this offer.", offer.getMinBookingAmount()));
        }

        // 4. Total redemptions limit
        if (offer.getMaxTotalRedemptions() != null && offer.getCurrentRedemptions() >= offer.getMaxTotalRedemptions()) {
            return invalidResponse(offer, request.getBookingAmount(), "This offer has reached its maximum total redemptions limit.");
        }

        // 5. Per-customer redemptions limit
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            long customerRedemptions = redemptionRepository.countRedemptionsByOfferAndEmail(offer.getId(), request.getCustomerEmail().trim());
            if (offer.getMaxPerCustomerRedemptions() != null && customerRedemptions >= offer.getMaxPerCustomerRedemptions()) {
                return invalidResponse(offer, request.getBookingAmount(),
                        String.format("You have already reached the redemption limit (%d) for this offer.", offer.getMaxPerCustomerRedemptions()));
            }
        }

        // 6. Card Network/Type validation (if provided)
        if (request.getCardNetwork() != null && !request.getCardNetwork().isBlank()) {
            String allowedNetworks = offer.getCardNetwork().toLowerCase();
            String allowedBank = offer.getBankName().toLowerCase();
            String requested = request.getCardNetwork().toLowerCase();

            boolean matches = allowedNetworks.contains("all") ||
                    java.util.Arrays.stream(allowedNetworks.split("[/,\\s]+"))
                            .anyMatch(token -> !token.isBlank() && requested.contains(token)) ||
                    requested.contains(allowedBank) ||
                    requested.contains("card") ||
                    requested.contains("credit") ||
                    requested.contains("visa") ||
                    requested.contains("mastercard") ||
                    requested.contains("amex") ||
                    requested.contains("rupay");

            if (!matches) {
                return invalidResponse(offer, request.getBookingAmount(),
                        String.format("This offer is only valid for %s cards (%s required).", offer.getBankName(), offer.getCardNetwork()));
            }
        }

        // 7. Calculate discount
        BigDecimal discount = calculateDiscountAmount(offer, request.getBookingAmount());
        BigDecimal finalAmount = request.getBookingAmount().subtract(discount).max(BigDecimal.ZERO);

        return OfferDiscountResponse.builder()
                .isValid(true)
                .message(String.format("Success! $%s discount applied with %s.", discount, offer.getTitle()))
                .offerId(offer.getId())
                .offerCode(offer.getCode())
                .offerTitle(offer.getTitle())
                .bankName(offer.getBankName())
                .originalAmount(request.getBookingAmount())
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    public BigDecimal calculateDiscountAmount(Offer offer, BigDecimal bookingAmount) {
        if (offer == null || bookingAmount == null || bookingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (offer.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal percentage = offer.getDiscountValue().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            discount = bookingAmount.multiply(percentage).setScale(2, RoundingMode.HALF_UP);
            if (offer.getMaxDiscount() != null && offer.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(offer.getMaxDiscount());
            }
        } else {
            // FIXED_AMOUNT
            discount = offer.getDiscountValue().min(bookingAmount);
        }

        return discount.max(BigDecimal.ZERO);
    }

    @Transactional
    public OfferRedemption recordRedemption(Offer offer, Booking booking, String customerEmail, BigDecimal discount, User user) {
        // Concurrency-safe update of current redemptions
        offer.setCurrentRedemptions(offer.getCurrentRedemptions() + 1);
        offerRepository.save(offer);

        OfferRedemption redemption = OfferRedemption.builder()
                .offer(offer)
                .booking(booking)
                .customerEmail(customerEmail.trim().toLowerCase())
                .user(user)
                .discountApplied(discount)
                .build();

        return redemptionRepository.save(redemption);
    }

    public Offer findOfferByRequest(UUID offerId, String offerCode) {
        if (offerId != null) {
            return offerRepository.findById(offerId).orElse(null);
        }
        if (offerCode != null && !offerCode.isBlank()) {
            return offerRepository.findByCodeIgnoreCase(offerCode.trim()).orElse(null);
        }
        return null;
    }

    private OfferDiscountResponse invalidResponse(Offer offer, BigDecimal amount, String message) {
        return OfferDiscountResponse.builder()
                .isValid(false)
                .message(message)
                .offerId(offer != null ? offer.getId() : null)
                .offerCode(offer != null ? offer.getCode() : null)
                .offerTitle(offer != null ? offer.getTitle() : null)
                .bankName(offer != null ? offer.getBankName() : null)
                .originalAmount(amount)
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(amount)
                .build();
    }

    // =========================================================================
    // ADMIN MANAGEMENT (CRUD)
    // =========================================================================

    @Transactional(readOnly = true)
    public PagedResponse<OfferDto> getAllOffersAdmin(
            String search,
            String bank,
            Boolean isActive,
            DiscountType discountType,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String bankParam = (bank != null && !bank.trim().isEmpty() && !bank.equalsIgnoreCase("all")) ? bank.trim() : null;

        Page<Offer> offerPage = offerRepository.findOffersForAdmin(searchParam, bankParam, isActive, discountType, pageable);

        List<OfferDto> content = offerPage.getContent().stream()
                .map(offerMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.<OfferDto>builder()
                .content(content)
                .page(offerPage.getNumber())
                .size(offerPage.getSize())
                .totalElements(offerPage.getTotalElements())
                .totalPages(offerPage.getTotalPages())
                .last(offerPage.isLast())
                .build();
    }

    @Transactional
    public OfferDto createOffer(CreateOfferRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (offerRepository.existsByCodeIgnoreCase(code)) {
            throw new BadRequestException("An offer with code '" + code + "' already exists.");
        }

        if (request.getExpiryDateTime().isBefore(request.getStartDateTime())) {
            throw new BadRequestException("Offer expiry date must be strictly after start date.");
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Percentage discount cannot exceed 100%.");
            }
        }

        Offer offer = offerMapper.toEntity(request);
        Offer saved = offerRepository.save(offer);
        log.info("Created new offer: {} ({}) for bank: {}", saved.getTitle(), saved.getCode(), saved.getBankName());
        return offerMapper.toDto(saved);
    }

    @Transactional
    public OfferDto updateOffer(UUID id, UpdateOfferRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + id));

        if (request.getTitle() != null) offer.setTitle(request.getTitle().trim());
        if (request.getBankName() != null) offer.setBankName(request.getBankName().trim());
        if (request.getCardNetwork() != null) offer.setCardNetwork(request.getCardNetwork().trim());
        if (request.getCardType() != null) offer.setCardType(request.getCardType().trim());
        if (request.getDescription() != null) offer.setDescription(request.getDescription().trim());
        if (request.getDiscountType() != null) offer.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) offer.setDiscountValue(request.getDiscountValue());
        if (request.getMaxDiscount() != null) offer.setMaxDiscount(request.getMaxDiscount());
        if (request.getMinBookingAmount() != null) offer.setMinBookingAmount(request.getMinBookingAmount());
        if (request.getStartDateTime() != null) offer.setStartDateTime(request.getStartDateTime());
        if (request.getExpiryDateTime() != null) offer.setExpiryDateTime(request.getExpiryDateTime());
        if (request.getMaxTotalRedemptions() != null) offer.setMaxTotalRedemptions(request.getMaxTotalRedemptions());
        if (request.getMaxPerCustomerRedemptions() != null) offer.setMaxPerCustomerRedemptions(request.getMaxPerCustomerRedemptions());
        if (request.getTermsAndConditions() != null) offer.setTermsAndConditions(request.getTermsAndConditions());
        if (request.getIsActive() != null) offer.setIsActive(request.getIsActive());

        if (offer.getExpiryDateTime().isBefore(offer.getStartDateTime())) {
            throw new BadRequestException("Offer expiry date must be strictly after start date.");
        }

        Offer saved = offerRepository.save(offer);
        log.info("Updated offer ID {}: {}", id, saved.getCode());
        return offerMapper.toDto(saved);
    }

    @Transactional
    public OfferDto toggleOfferStatus(UUID id, boolean isActive) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + id));
        offer.setIsActive(isActive);
        Offer saved = offerRepository.save(offer);
        log.info("Toggled offer ID {} isActive to {}", id, isActive);
        return offerMapper.toDto(saved);
    }

    @Transactional
    public void deleteOrArchiveOffer(UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + id));

        long redemptionCount = redemptionRepository.countTotalRedemptionsByOfferId(id);
        if (redemptionCount > 0) {
            // Cannot hard delete an offer that has historical redemptions attached
            offer.setIsArchived(true);
            offer.setIsActive(false);
            offerRepository.save(offer);
            log.info("Offer ID {} has {} redemptions. Archived safely.", id, redemptionCount);
        } else {
            offerRepository.delete(offer);
            log.info("Offer ID {} has 0 redemptions. Hard deleted.", id);
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOfferStats() {
        Instant now = Instant.now();
        long activeCount = offerRepository.countActiveOffers(now);
        long totalOffers = offerRepository.count();
        BigDecimal totalSavings = redemptionRepository.sumTotalDiscountGranted();
        long totalRedemptions = redemptionRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeOffers", activeCount);
        stats.put("totalOffers", totalOffers);
        stats.put("totalRedemptions", totalRedemptions);
        stats.put("totalDiscountGranted", totalSavings != null ? totalSavings : BigDecimal.ZERO);
        return stats;
    }
}
