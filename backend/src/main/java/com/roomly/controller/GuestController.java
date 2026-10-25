package com.roomly.controller;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.guest.CreateGuestRequest;
import com.roomly.dto.guest.GuestDto;
import com.roomly.dto.guest.UpdateGuestRequest;
import com.roomly.service.GuestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/guests")
@RequiredArgsConstructor
@Tag(name = "Guests", description = "Guest directory, VIP tiers, stay history, and CRM preferences")
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get guest directory entries with filters and pagination (Admin only)")
    public ResponseEntity<PagedResponse<GuestDto>> getGuests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PagedResponse<GuestDto> response = guestService.getGuests(search, tier, status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get full list of guests without pagination (Admin only)")
    public ResponseEntity<List<GuestDto>> getAllGuests() {
        return ResponseEntity.ok(guestService.getAllGuests());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get specific guest profile by ID (Admin only)")
    public ResponseEntity<GuestDto> getGuestById(@PathVariable UUID id) {
        return ResponseEntity.ok(guestService.getGuestById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register new guest profile in directory (Admin only)")
    public ResponseEntity<GuestDto> createGuest(@Valid @RequestBody CreateGuestRequest request) {
        GuestDto created = guestService.createGuest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update guest VIP tier, status, or preferences (Admin only)")
    public ResponseEntity<GuestDto> updateGuest(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateGuestRequest request
    ) {
        GuestDto updated = guestService.updateGuest(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove guest profile from directory (Admin only)")
    public ResponseEntity<Void> deleteGuest(@PathVariable UUID id) {
        guestService.deleteGuest(id);
        return ResponseEntity.noContent().build();
    }
}
