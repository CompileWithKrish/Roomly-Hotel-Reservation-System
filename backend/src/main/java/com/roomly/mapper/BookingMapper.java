package com.roomly.mapper;

import com.roomly.dto.booking.BookingDto;
import com.roomly.entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingDto toDto(Booking booking) {
        if (booking == null) {
            return null;
        }

        String firstImage = null;
        if (booking.getRoom() != null && booking.getRoom().getImages() != null && !booking.getRoom().getImages().isEmpty()) {
            firstImage = booking.getRoom().getImages().get(0);
        }

        return BookingDto.builder()
                .id(booking.getId())
                .bookingNumber(booking.getBookingNumber())
                .roomId(booking.getRoom() != null ? booking.getRoom().getId() : null)
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .roomName(booking.getRoom() != null ? booking.getRoom().getName() : null)
                .hotelName(booking.getRoom() != null ? booking.getRoom().getHotelName() : null)
                .location(booking.getRoom() != null ? booking.getRoom().getLocation() : null)
                .roomImage(firstImage)
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .guestName(booking.getGuestName())
                .guestEmail(booking.getGuestEmail())
                .guestPhone(booking.getGuestPhone())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .roomPrice(booking.getRoomPrice())
                .taxAmount(booking.getTaxAmount())
                .totalAmount(booking.getTotalAmount())
                .specialRequests(booking.getSpecialRequests())
                .source(booking.getSource())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
