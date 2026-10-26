package com.roomly.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.roomly.dto.booking.BookingDto;
import com.roomly.dto.booking.CreateBookingRequest;
import com.roomly.exception.GlobalExceptionHandler;
import com.roomly.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/bookings succeeds with valid future dates and valid UUID")
    void createBooking_Success() throws Exception {
        UUID roomId = UUID.randomUUID();
        LocalDate checkIn = LocalDate.now().plusDays(2);
        LocalDate checkOut = LocalDate.now().plusDays(5);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(roomId)
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555-0199")
                .paymentMethod("Pay on Arrival (Front Desk)")
                .build();

        BookingDto responseDto = BookingDto.builder()
                .id(UUID.randomUUID())
                .bookingNumber("ROOMLY-12345")
                .roomId(roomId)
                .guestName("Sarah Jenkins")
                .guestEmail("sarah@example.com")
                .guestPhone("+1 555-0199")
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .nights(3)
                .totalAmount(BigDecimal.valueOf(500.00))
                .status(com.roomly.entity.Booking.BookingStatus.CONFIRMED)
                .paymentStatus(com.roomly.entity.Booking.PaymentStatus.PENDING)
                .paymentMethod("Pay on Arrival (Front Desk)")
                .build();

        when(bookingService.createBooking(any(), any()))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingNumber").value("ROOMLY-12345"))
                .andExpect(jsonPath("$.guestEmail").value("sarah@example.com"));
    }

    @Test
    @DisplayName("Regression: POST /api/v1/bookings with past check-in returns 400 with specific field error")
    void createBooking_PastCheckInDate_ReturnsFieldValidationMessage() throws Exception {
        String payloadWithPastDate = """
            {
              "roomId": "b0000000-0000-0000-0000-000000000101",
              "checkInDate": "2020-01-01",
              "checkOutDate": "2020-01-05",
              "guestName": "Sarah Jenkins",
              "guestEmail": "sarah@example.com",
              "guestPhone": "+1 555-0199",
              "paymentMethod": "Pay on Arrival"
            }
            """;

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithPastDate))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail", containsString("checkInDate: Check-in date cannot be in the past")))
                .andExpect(jsonPath("$.fieldErrors.checkInDate").value("Check-in date cannot be in the past"));
    }

    @Test
    @DisplayName("Regression: POST /api/v1/bookings with non-UUID string returns 400 with helpful format error")
    void createBooking_InvalidRoomIdFormat_ReturnsFormatMessage() throws Exception {
        String payloadWithInvalidUuid = """
            {
              "roomId": "room-101",
              "checkInDate": "2028-11-01",
              "checkOutDate": "2028-11-05",
              "guestName": "Sarah Jenkins",
              "guestEmail": "sarah@example.com",
              "guestPhone": "+1 555-0199",
              "paymentMethod": "Pay on Arrival"
            }
            """;

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadWithInvalidUuid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail", containsString("Invalid format for 'roomId': value 'room-101' is not a valid UUID")))
                .andExpect(jsonPath("$.fieldErrors.roomId", containsString("Invalid format for 'roomId'")));
    }

    @Test
    @DisplayName("POST /api/v1/bookings missing required fields returns 400 with field errors")
    void createBooking_MissingRequiredFields_ReturnsValidationErrors() throws Exception {
        String incompletePayload = """
            {
              "guestEmail": "invalid-email"
            }
            """;

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(incompletePayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.roomId").value("Room ID is required"))
                .andExpect(jsonPath("$.fieldErrors.checkInDate").value("Check-in date is required"))
                .andExpect(jsonPath("$.fieldErrors.guestName").value("Guest name is required"))
                .andExpect(jsonPath("$.fieldErrors.guestEmail").value("Invalid guest email address"));
    }
}
