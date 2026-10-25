package com.roomly.controller;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.offer.CreateOfferRequest;
import com.roomly.dto.offer.OfferDto;
import com.roomly.dto.offer.UpdateOfferRequest;
import com.roomly.entity.Offer.DiscountType;
import com.roomly.service.OfferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/offers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Offers", description = "Administration, CRUD, and status controls for limited-time credit card offers")
public class AdminOfferController {

    private final OfferService offerService;

    @GetMapping
    @Operation(summary = "List all offers for administration with search and filtering (Admin only)")
    public ResponseEntity<PagedResponse<OfferDto>> getAllOffers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String bank,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) DiscountType discountType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PagedResponse<OfferDto> response = offerService.getAllOffersAdmin(search, bank, isActive, discountType, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get high-level summary metrics for promotions (Admin only)")
    public ResponseEntity<Map<String, Object>> getOfferStats() {
        return ResponseEntity.ok(offerService.getOfferStats());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single offer details for editing (Admin only)")
    public ResponseEntity<OfferDto> getOfferById(@PathVariable UUID id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new credit card offer (Admin only)")
    public ResponseEntity<OfferDto> createOffer(@Valid @RequestBody CreateOfferRequest request) {
        OfferDto created = offerService.createOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing offer (Admin only)")
    public ResponseEntity<OfferDto> updateOffer(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOfferRequest request
    ) {
        OfferDto updated = offerService.updateOffer(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activate or deactivate an offer immediately (Admin only)")
    public ResponseEntity<OfferDto> toggleStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body
    ) {
        boolean isActive = body.getOrDefault("isActive", true);
        OfferDto updated = offerService.toggleOfferStatus(id, isActive);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an unused offer or safely archive it if already redeemed (Admin only)")
    public ResponseEntity<Void> deleteOrArchiveOffer(@PathVariable UUID id) {
        offerService.deleteOrArchiveOffer(id);
        return ResponseEntity.noContent().build();
    }
}
