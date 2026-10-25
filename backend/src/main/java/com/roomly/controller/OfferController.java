package com.roomly.controller;

import com.roomly.dto.offer.OfferDiscountResponse;
import com.roomly.dto.offer.OfferDto;
import com.roomly.dto.offer.ValidateOfferRequest;
import com.roomly.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Customer credit card promotions, instant savings, and discount validation")
public class OfferController {

    private final OfferService offerService;

    @GetMapping
    @Operation(summary = "List currently active and valid credit card offers for customers")
    public ResponseEntity<List<OfferDto>> getActiveOffers(
            @RequestParam(required = false) BigDecimal bookingAmount
    ) {
        List<OfferDto> offers = offerService.getActiveOffers(bookingAmount);
        return ResponseEntity.ok(offers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a specific offer")
    public ResponseEntity<OfferDto> getOfferById(@PathVariable UUID id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate offer eligibility and calculate applicable discount")
    public ResponseEntity<OfferDiscountResponse> validateOffer(
            @Valid @RequestBody ValidateOfferRequest request
    ) {
        OfferDiscountResponse response = offerService.validateAndCalculateDiscount(request);
        return ResponseEntity.ok(response);
    }
}
