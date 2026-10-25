package com.roomly.controller;

import com.roomly.dto.booking.BookingDto;
import com.roomly.dto.booking.CreateBookingRequest;
import com.roomly.dto.booking.UpdateBookingStatusRequest;
import com.roomly.dto.common.PagedResponse;
import com.roomly.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Hotel reservations, check-in, confirmation, and cancellations")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new hotel reservation")
    public ResponseEntity<BookingDto> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String authenticatedEmail = userDetails != null ? userDetails.getUsername() : null;
        BookingDto booking = bookingService.createBooking(request, authenticatedEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get bookings directory with filters and pagination (Admin only)")
    public ResponseEntity<PagedResponse<BookingDto>> getBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PagedResponse<BookingDto> response = bookingService.getBookings(search, status, startDate, endDate, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get bookings for the currently authenticated guest")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<BookingDto> myBookings = bookingService.getMyBookings(userDetails.getUsername());
        return ResponseEntity.ok(myBookings);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get reservation details by UUID or Booking Code")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingByIdOrCode(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update booking status (Confirm, Check-In, Check-Out, Cancel) (Admin only)")
    public ResponseEntity<BookingDto> updateBookingStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBookingStatusRequest request
    ) {
        BookingDto updated = bookingService.updateBookingStatus(id, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a reservation")
    public ResponseEntity<BookingDto> cancelBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        boolean isAdmin = userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        BookingDto cancelled = bookingService.cancelBooking(id, email, isAdmin);
        return ResponseEntity.ok(cancelled);
    }
}
