package com.roomly.service;

import com.roomly.dto.booking.BookingDto;
import com.roomly.entity.Booking;
import com.roomly.entity.Booking.BookingSource;
import com.roomly.mapper.BookingMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class BookingEntityMappingTest {

    private final BookingMapper bookingMapper = new BookingMapper();

    @Test
    @DisplayName("Should correctly map source field on Booking entity and DTO")
    void bookingSource_DefaultAndMapping_Success() {
        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .bookingCode("ROOMLY-TEST01")
                .guestName("Alice Green")
                .guestEmail("alice@example.com")
                .guestPhone("+1 555 1234")
                .checkInDate(LocalDate.now().plusDays(1))
                .checkOutDate(LocalDate.now().plusDays(4))
                .nights(3)
                .guestsCount(2)
                .source("Direct Booking")
                .build();

        assertEquals(BookingSource.DIRECT, booking.getSource());

        BookingDto dto = bookingMapper.toDto(booking);
        assertNotNull(dto);
        assertEquals(BookingSource.DIRECT, dto.getSource());

        // Test custom source
        booking.setSource("Online");
        assertEquals(BookingSource.ONLINE, booking.getSource());

        booking.setSource(BookingSource.AGENCY);
        assertEquals(BookingSource.AGENCY, booking.getSource());
    }

    @Test
    @DisplayName("Verify V4__add_booking_source.sql migration script is present and structured correctly")
    void flywayMigrationV4_ContentVerification() throws Exception {
        try (InputStream in = getClass().getResourceAsStream("/db/migration/V4__add_booking_source.sql")) {
            assertNotNull(in, "V4__add_booking_source.sql must be present on the classpath");
            String sql = new String(in.readAllBytes(), StandardCharsets.UTF_8);

            assertTrue(sql.contains("ALTER TABLE bookings"), "Migration must alter bookings table");
            assertTrue(sql.contains("ADD COLUMN IF NOT EXISTS source"), "Migration must add source column safely");
            assertTrue(sql.contains("VARCHAR(100)"), "Migration must define VARCHAR(100)");
            assertTrue(sql.contains("DEFAULT 'Direct Booking'"), "Migration must set 'Direct Booking' default");
        }
    }

    @Test
    @DisplayName("Verify BCrypt password hashing for seed users")
    void verifyBCryptPasswordEncoding() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String adminHash = encoder.encode("admin123");
        String customerHash = encoder.encode("customer123");
        assertTrue(encoder.matches("admin123", adminHash));
        assertTrue(encoder.matches("customer123", customerHash));
        System.out.println("BCRYPT_ADMIN: " + adminHash);
        System.out.println("BCRYPT_CUSTOMER: " + customerHash);
    }
}
