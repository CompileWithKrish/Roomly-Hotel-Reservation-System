package com.roomly.service;

import com.roomly.dto.booking.BookingDto;
import com.roomly.dto.booking.CreateBookingRequest;
import com.roomly.dto.booking.UpdateBookingStatusRequest;
import com.roomly.dto.common.PagedResponse;
import com.roomly.entity.Booking;
import com.roomly.entity.Guest;
import com.roomly.entity.Room;
import com.roomly.entity.User;
import com.roomly.exception.BadRequestException;
import com.roomly.exception.BookingConflictException;
import com.roomly.exception.ResourceNotFoundException;
import com.roomly.mapper.BookingMapper;
import com.roomly.repository.BookingRepository;
import com.roomly.repository.GuestRepository;
import com.roomly.repository.RoomRepository;
import com.roomly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private final OfferService offerService;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public BookingDto createBooking(CreateBookingRequest request, String authenticatedEmail) {
        log.info("Processing reservation for room ID: {} from: {} to: {}", 
                request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate());

        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();

        if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
            throw new BadRequestException("Check-out date must be strictly after check-in date.");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        // Double-booking check
        boolean hasConflict = bookingRepository.hasOverlappingBooking(room.getId(), checkIn, checkOut, null);
        if (hasConflict) {
            throw new BookingConflictException("The selected room has already been reserved for these dates. Please choose another date range or room.");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights <= 0) {
            throw new BadRequestException("Reservation must be at least 1 night.");
        }

        BigDecimal baseRate = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        BigDecimal taxes = baseRate.multiply(BigDecimal.valueOf(0.12)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal serviceFee = BigDecimal.valueOf(45.00);
        BigDecimal discount = BigDecimal.ZERO;

        // Apply Offer validation if offerId or offerCode is provided
        com.roomly.entity.Offer appliedOffer = null;
        if (request.getOfferId() != null || (request.getOfferCode() != null && !request.getOfferCode().isBlank())) {
            BigDecimal subtotal = baseRate.add(taxes).add(serviceFee);
            com.roomly.dto.offer.ValidateOfferRequest valReq = com.roomly.dto.offer.ValidateOfferRequest.builder()
                    .offerId(request.getOfferId())
                    .offerCode(request.getOfferCode())
                    .bookingAmount(subtotal)
                    .customerEmail(request.getGuestEmail() != null ? request.getGuestEmail().trim().toLowerCase() : null)
                    .cardNetwork(request.getPaymentMethod())
                    .build();

            com.roomly.dto.offer.OfferDiscountResponse valRes = offerService.validateAndCalculateDiscount(valReq);
            if (!Boolean.TRUE.equals(valRes.getIsValid())) {
                throw new BadRequestException("Offer cannot be applied: " + valRes.getMessage());
            }

            discount = valRes.getDiscountAmount();
            appliedOffer = offerService.findOfferByRequest(request.getOfferId(), request.getOfferCode());
            log.info("Applied offer '{}' with discount: ${}", appliedOffer != null ? appliedOffer.getCode() : "UNKNOWN", discount);
        }

        BigDecimal totalAmount = baseRate.add(taxes).add(serviceFee).subtract(discount).max(BigDecimal.ZERO);

        // Find or associate authenticated user
        User user = null;
        if (authenticatedEmail != null) {
            user = userRepository.findByEmail(authenticatedEmail).orElse(null);
        } else if (request.getGuestEmail() != null) {
            user = userRepository.findByEmail(request.getGuestEmail()).orElse(null);
        }

        String bookingCode = generateUniqueBookingCode();

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .room(room)
                .user(user)
                .guestName(request.getGuestName().trim())
                .guestEmail(request.getGuestEmail().trim().toLowerCase())
                .guestPhone(request.getGuestPhone().trim())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .nights((int) nights)
                .guestsCount(room.getCapacity() != null ? Math.min(room.getCapacity(), 2) : 2)
                .baseRate(baseRate)
                .taxes(taxes)
                .serviceFee(serviceFee)
                .discount(discount)
                .totalAmount(totalAmount)
                .status("CONFIRMED")
                .paymentStatus("PAID")
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Visa")
                .specialRequests(request.getSpecialRequests())
                .source("Direct Booking")
                .offerId(appliedOffer != null ? appliedOffer.getId() : null)
                .offerCode(appliedOffer != null ? appliedOffer.getCode() : null)
                .build();

        booking = bookingRepository.save(booking);

        // Record offer redemption if an offer was applied
        if (appliedOffer != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            offerService.recordRedemption(appliedOffer, booking, booking.getGuestEmail(), discount, user);
        }

        // Synchronize guest directory record
        syncGuestRecord(booking);

        return bookingMapper.toDto(booking);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingDto> getBookings(
            String search,
            String status,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String cleanedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanedStatus = (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Booking> bookingPage = bookingRepository.findWithFilters(
                cleanedSearch,
                cleanedStatus,
                startDate,
                endDate,
                pageable
        );

        List<BookingDto> content = bookingPage.getContent().stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.<BookingDto>builder()
                .content(content)
                .page(bookingPage.getNumber())
                .size(bookingPage.getSize())
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .last(bookingPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getMyBookings(String email) {
        return bookingRepository.findByGuestEmailOrderByCreatedAtDesc(email).stream()
                .map(bookingMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingByIdOrCode(String identifier) {
        try {
            UUID id = UUID.fromString(identifier);
            Booking booking = bookingRepository.findById(id)
                    .orElseGet(() -> bookingRepository.findByBookingCode(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + identifier)));
            return bookingMapper.toDto(booking);
        } catch (IllegalArgumentException e) {
            Booking booking = bookingRepository.findByBookingCode(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + identifier));
            return bookingMapper.toDto(booking);
        }
    }

    @Transactional
    public BookingDto updateBookingStatus(UUID id, UpdateBookingStatusRequest request) {
        log.info("Updating booking status for ID {}: {}", id, request.getStatus());

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }
        if (request.getPaymentStatus() != null) {
            booking.setPaymentStatus(request.getPaymentStatus());
        }

        booking = bookingRepository.save(booking);
        return bookingMapper.toDto(booking);
    }

    @Transactional
    public BookingDto cancelBooking(UUID id, String userEmail, boolean isAdmin) {
        log.info("Cancelling booking with ID: {} requested by: {}", id, userEmail);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!isAdmin && userEmail != null && !booking.getGuestEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You are not authorized to cancel this reservation.");
        }

        booking.setStatus("CANCELLED");
        booking = bookingRepository.save(booking);
        return bookingMapper.toDto(booking);
    }

    private String generateUniqueBookingCode() {
        String code;
        do {
            int num = 10000 + random.nextInt(90000);
            code = "ROOMLY-" + num;
        } while (bookingRepository.existsByBookingCode(code));
        return code;
    }

    private void syncGuestRecord(Booking booking) {
        try {
            Guest guest = guestRepository.findByEmail(booking.getGuestEmail()).orElse(null);
            if (guest == null) {
                String[] parts = booking.getGuestName().split("\\s+", 2);
                guest = Guest.builder()
                        .user(booking.getUser())
                        .firstName(parts[0])
                        .lastName(parts.length > 1 ? parts[1] : "")
                        .email(booking.getGuestEmail())
                        .phone(booking.getGuestPhone())
                        .tier("Regular")
                        .status("Active")
                        .totalStays(1)
                        .totalSpent(booking.getTotalAmount())
                        .lastStay(booking.getCheckInDate().toString())
                        .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                        .preferences(Collections.singletonList("Quiet Room"))
                        .build();
            } else {
                guest.setTotalStays((guest.getTotalStays() != null ? guest.getTotalStays() : 0) + 1);
                BigDecimal existingSpent = guest.getTotalSpent() != null ? guest.getTotalSpent() : BigDecimal.ZERO;
                guest.setTotalSpent(existingSpent.add(booking.getTotalAmount()));
                guest.setLastStay(booking.getCheckInDate().toString());
                if (guest.getTotalStays() >= 10) {
                    guest.setTier("VIP");
                } else if (guest.getTotalStays() >= 5) {
                    guest.setTier("Gold");
                }
            }
            guestRepository.save(guest);
        } catch (Exception e) {
            log.warn("Failed to synchronize guest record for booking {}: {}", booking.getBookingCode(), e.getMessage());
        }
    }
}
