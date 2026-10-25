package com.roomly.mapper;

import com.roomly.dto.offer.CreateOfferRequest;
import com.roomly.dto.offer.OfferDto;
import com.roomly.entity.Offer;
import org.springframework.stereotype.Component;

@Component
public class OfferMapper {

    public OfferDto toDto(Offer entity) {
        if (entity == null) return null;

        return OfferDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .title(entity.getTitle())
                .bankName(entity.getBankName())
                .cardNetwork(entity.getCardNetwork())
                .cardType(entity.getCardType())
                .description(entity.getDescription())
                .discountType(entity.getDiscountType())
                .discountValue(entity.getDiscountValue())
                .maxDiscount(entity.getMaxDiscount())
                .minBookingAmount(entity.getMinBookingAmount())
                .startDateTime(entity.getStartDateTime())
                .expiryDateTime(entity.getExpiryDateTime())
                .maxTotalRedemptions(entity.getMaxTotalRedemptions())
                .currentRedemptions(entity.getCurrentRedemptions())
                .maxPerCustomerRedemptions(entity.getMaxPerCustomerRedemptions())
                .termsAndConditions(entity.getTermsAndConditions())
                .isActive(entity.getIsActive())
                .isArchived(entity.getIsArchived())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .isCurrentlyValid(entity.isCurrentlyValid())
                .build();
    }

    public Offer toEntity(CreateOfferRequest request) {
        if (request == null) return null;

        return Offer.builder()
                .code(request.getCode().trim().toUpperCase())
                .title(request.getTitle().trim())
                .bankName(request.getBankName().trim())
                .cardNetwork(request.getCardNetwork().trim())
                .cardType(request.getCardType() != null ? request.getCardType().trim() : "Credit Card")
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscount(request.getMaxDiscount())
                .minBookingAmount(request.getMinBookingAmount() != null ? request.getMinBookingAmount() : java.math.BigDecimal.ZERO)
                .startDateTime(request.getStartDateTime())
                .expiryDateTime(request.getExpiryDateTime())
                .maxTotalRedemptions(request.getMaxTotalRedemptions() != null ? request.getMaxTotalRedemptions() : 1000)
                .currentRedemptions(0)
                .maxPerCustomerRedemptions(request.getMaxPerCustomerRedemptions() != null ? request.getMaxPerCustomerRedemptions() : 1)
                .termsAndConditions(request.getTermsAndConditions())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isArchived(false)
                .build();
    }
}
