package com.roomly.service;

import com.roomly.dto.booking.BookingDto;
import com.roomly.dto.booking.CreateBookingRequest;
import com.roomly.entity.Booking;
import com.roomly.entity.Booking.PaymentStatus;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private GuestRepository guestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OfferService offerService;

    private final BookingMapper bookingMapper = new BookingMapper();

    private BookingService bookingService;

    private Room testRoom;
    private UUID roomId;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository,
                roomRepository,
                guestRepository,
                userRepository,
                bookingMapper,
                offerService
        );

        roomId = UUID.randomUUID();
        testRoom = Room.builder()
                .id(roomId)
                .roomNumber("101")
                .title("Deluxe Suite")
                .pricePerNight(BigDecimal.valueOf(350.00))
                .capacity(2)
                .status("Available")
                .build();
    }

    @Test
    @DisplayName("Successfully create booking with Pending payment status (Pay at Hotel)")
    void createBooking_Successful_PendingPaymentStatus() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(roomId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555 987-6543")
                .paymentMethod("Pay at Hotel (Demo)")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.hasOverlappingBooking(eq(roomId), eq(checkIn), eq(checkOut), isNull())).thenReturn(false);
        when(userRepository.findByEmail("sarah@example.com")).thenReturn(Optional.empty());

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(UUID.randomUUID());
            return b;
        });

        BookingDto result = bookingService.createBooking(request, null);

        assertNotNull(result);
        assertEquals("CONFIRMED", result.getStatus().name());
        assertEquals(PaymentStatus.PENDING, result.getPaymentStatus());
        assertEquals("Pay at Hotel (Demo)", result.getPaymentMethod());
        assertEquals("Sarah Jenkins", result.getGuestName());
        assertEquals("sarah@example.com", result.getGuestEmail());
        assertEquals(3, result.getNights());
        assertTrue(result.getBookingNumber().startsWith("ROOMLY-"));

        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws BadRequestException when check-out is before or equal to check-in")
    void createBooking_InvalidDates_ThrowsBadRequestException() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(2);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(roomId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555 987-6543")
                .build();

        assertThrows(BadRequestException.class, () -> bookingService.createBooking(request, null));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when room does not exist")
    void createBooking_RoomNotFound_ThrowsResourceNotFoundException() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(roomId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555 987-6543")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.createBooking(request, null));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Throws BookingConflictException on overlapping reservation dates")
    void createBooking_OverlappingDates_ThrowsBookingConflictException() {
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(roomId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555 987-6543")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(testRoom));
        when(bookingRepository.hasOverlappingBooking(eq(roomId), eq(checkIn), eq(checkOut), isNull())).thenReturn(true);

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(request, null));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("getMyBookings returns list of bookings mapped to DTOs for authenticated email")
    void getMyBookings_ReturnsUserBookings() {
        String email = "customer@roomly.com";
        Booking b1 = Booking.builder()
                .id(UUID.randomUUID())
                .bookingCode("ROOMLY-11111")
                .guestEmail(email)
                .guestName("Customer One")
                .paymentStatus("Pending")
                .status("CONFIRMED")
                .room(testRoom)
                .build();

        when(bookingRepository.findByGuestEmailOrderByCreatedAtDesc(email)).thenReturn(List.of(b1));

        List<BookingDto> list = bookingService.getMyBookings(email);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("ROOMLY-11111", list.get(0).getBookingNumber());
        assertEquals(PaymentStatus.PENDING, list.get(0).getPaymentStatus());
    }
}
