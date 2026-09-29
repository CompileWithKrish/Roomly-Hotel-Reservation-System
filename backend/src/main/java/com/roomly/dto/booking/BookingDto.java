package com.roomly.dto.booking;

import com.roomly.entity.Booking.BookingSource;
import com.roomly.entity.Booking.BookingStatus;
import com.roomly.entity.Booking.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private UUID id;
    private String bookingNumber;
    private UUID roomId;
    private String roomNumber;
    private String roomName;
    private String hotelName;
    private String location;
    private String roomImage;
    private UUID userId;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer nights;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal roomPrice;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String specialRequests;
    private BookingSource source;
    private LocalDateTime createdAt;
}
