package com.roomly.dto.booking;

import com.roomly.entity.Booking.BookingStatus;
import com.roomly.entity.Booking.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    @NotNull(message = "Status cannot be null")
    private BookingStatus status;

    private PaymentStatus paymentStatus;
}
