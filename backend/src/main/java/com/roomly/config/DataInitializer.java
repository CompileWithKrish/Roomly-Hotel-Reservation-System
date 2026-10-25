package com.roomly.config;

import com.roomly.entity.Booking;
import com.roomly.entity.Guest;
import com.roomly.entity.Role;
import com.roomly.entity.Room;
import com.roomly.entity.User;
import com.roomly.repository.BookingRepository;
import com.roomly.repository.GuestRepository;
import com.roomly.repository.RoomRepository;
import com.roomly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final GuestRepository guestRepository;
    private final BookingRepository bookingRepository;
    private final com.roomly.repository.OfferRepository offerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedOffersIfEmpty();

        if (userRepository.count() > 0 && roomRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data provisioning.");
            return;
        }

        log.info("Seeding initial Roomly hotel dataset...");

        // 1. Seed Users
        User admin = User.builder()
                .name("Alexander Wright")
                .email("admin@roomly.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .phone("+1 (555) 234-5678")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")
                .isActive(true)
                .build();

        User customer = User.builder()
                .name("Sarah Jenkins")
                .email("customer@roomly.com")
                .passwordHash(passwordEncoder.encode("customer123"))
                .role(Role.CUSTOMER)
                .phone("+1 (555) 987-6543")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80")
                .isActive(true)
                .build();

        admin = userRepository.save(admin);
        customer = userRepository.save(customer);

        // 2. Seed Rooms
        Room r101 = Room.builder()
                .roomNumber("101")
                .title("Deluxe King Suite")
                .hotelName("Roomly Grand Banjara")
                .location("Hyderabad")
                .type("Deluxe Suite")
                .description("Experience pure opulence with panoramic skyline views, private marble jacuzzi, king-size premium memory foam bed, and bespoke 24/7 concierge service.")
                .pricePerNight(BigDecimal.valueOf(350.00))
                .capacity(2)
                .bedType("1 King Bed")
                .sizeSqFt(620)
                .floor(4)
                .status("Available")
                .rating(BigDecimal.valueOf(4.90))
                .reviewCount(128)
                .featured(true)
                .amenities(Arrays.asList("High-Speed Wi-Fi 6", "Panoramic City View", "Smart 4K TV & Soundbar", "Marble Jacuzzi Bath", "Complimentary Espresso Bar", "24/7 Butler Service"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                ))
                .build();

        Room r202 = Room.builder()
                .roomNumber("202")
                .title("Executive Panoramic Suite")
                .hotelName("Roomly Silicon Sky")
                .location("Bengaluru")
                .type("Executive Suite")
                .description("Designed for discerning travelers and executives, featuring an ergonomic lounge workspace, expansive living salon, and deep soaking bathtub overlooking the cityscape.")
                .pricePerNight(BigDecimal.valueOf(480.00))
                .capacity(3)
                .bedType("1 King Bed + 1 Daybed")
                .sizeSqFt(850)
                .floor(7)
                .status("Available")
                .rating(BigDecimal.valueOf(4.95))
                .reviewCount(94)
                .featured(true)
                .amenities(Arrays.asList("Dedicated Workstation", "Cityscape Balcony", "Lounge Area", "Complimentary Minibar", "Spa Bathroom", "High-Speed Wi-Fi 6"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
                ))
                .build();

        Room r303 = Room.builder()
                .roomNumber("V-03")
                .title("Private Ocean Villa")
                .hotelName("Roomly Bay Breeze Resort")
                .location("Visakhapatnam")
                .type("Ocean Villa")
                .description("A secluded sanctuary with direct beach terrace access, infinity plunge pool, outdoor rain shower, and handcrafted teak furnishings for ultimate relaxation.")
                .pricePerNight(BigDecimal.valueOf(750.00))
                .capacity(4)
                .bedType("2 King Beds")
                .sizeSqFt(1400)
                .floor(1)
                .status("Occupied")
                .rating(BigDecimal.valueOf(5.00))
                .reviewCount(62)
                .featured(true)
                .amenities(Arrays.asList("Private Plunge Pool", "Direct Beach Access", "Outdoor Dining Deck", "Full Kitchenette"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
                ))
                .build();

        Room r404 = Room.builder()
                .roomNumber("PH-01")
                .title("Presidential Penthouse")
                .hotelName("Roomly Marina Heritage")
                .location("Chennai")
                .type("Presidential Suite")
                .description("The pinnacle of luxury hospitality. Spanning the entire top floor with 360-degree vistas, private rooftop pool, chef kitchen, and dedicated security access.")
                .pricePerNight(BigDecimal.valueOf(1200.00))
                .capacity(6)
                .bedType("3 King Suites")
                .sizeSqFt(2800)
                .floor(12)
                .status("Reserved")
                .rating(BigDecimal.valueOf(5.00))
                .reviewCount(38)
                .featured(true)
                .amenities(Arrays.asList("Private Rooftop Pool", "Private Elevator Key", "Personal Chef on Demand", "Grand Piano Lounge"))
                .images(Collections.singletonList("https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"))
                .build();

        Room r505 = Room.builder()
                .roomNumber("505")
                .title("Modern Classic Twin")
                .hotelName("Roomly Riverside Palace")
                .location("Vijayawada")
                .type("Standard Room")
                .description("Ideal for friends or business colleagues, featuring twin plush beds, smart workspace, rainfall walk-in shower, and ambient architectural lighting.")
                .pricePerNight(BigDecimal.valueOf(220.00))
                .capacity(2)
                .bedType("2 Queen Beds")
                .sizeSqFt(420)
                .floor(5)
                .status("Available")
                .rating(BigDecimal.valueOf(4.80))
                .reviewCount(154)
                .featured(false)
                .amenities(Arrays.asList("High-Speed Wi-Fi 6", "Walk-in Rainfall Shower", "Smart TV"))
                .images(Collections.singletonList("https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"))
                .build();

        r101 = roomRepository.save(r101);
        r202 = roomRepository.save(r202);
        r303 = roomRepository.save(r303);
        r404 = roomRepository.save(r404);
        r505 = roomRepository.save(r505);

        // 3. Seed Guests
        Guest g1 = Guest.builder()
                .user(customer)
                .firstName("Sarah")
                .lastName("Jenkins")
                .email("customer@roomly.com")
                .phone("+1 (555) 987-6543")
                .nationality("United States")
                .passportId("US8921045A")
                .tier("Gold")
                .totalStays(6)
                .totalSpent(BigDecimal.valueOf(8450.00))
                .lastStay("2026-09-20")
                .status("Active")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80")
                .notes("Prefers high floor and extra sparkling water.")
                .preferences(Arrays.asList("Quiet Room", "Late Checkout", "Feather Pillows"))
                .build();

        Guest g2 = Guest.builder()
                .firstName("Marcus")
                .lastName("Vance")
                .email("marcus.vance@techcorp.io")
                .phone("+1 (555) 432-1098")
                .nationality("Canada")
                .passportId("CA4419082X")
                .tier("VIP")
                .totalStays(14)
                .totalSpent(BigDecimal.valueOf(24800.00))
                .lastStay("2026-09-28")
                .status("Active")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80")
                .notes("Corporate travel account manager. Needs quiet workspace.")
                .preferences(Arrays.asList("Executive Lounge", "Express Check-In"))
                .build();

        guestRepository.save(g1);
        guestRepository.save(g2);

        // 4. Seed Bookings
        Booking b1 = Booking.builder()
                .bookingCode("ROOMLY-84920")
                .room(r101)
                .user(customer)
                .guestName("Sarah Jenkins")
                .guestEmail("customer@roomly.com")
                .guestPhone("+1 (555) 987-6543")
                .checkInDate(LocalDate.now().plusDays(2))
                .checkOutDate(LocalDate.now().plusDays(6))
                .nights(4)
                .guestsCount(2)
                .baseRate(BigDecimal.valueOf(1400.00))
                .taxes(BigDecimal.valueOf(168.00))
                .serviceFee(BigDecimal.valueOf(50.00))
                .discount(BigDecimal.valueOf(100.00))
                .totalAmount(BigDecimal.valueOf(1518.00))
                .status("CONFIRMED")
                .paymentStatus("PAID")
                .paymentMethod("Visa •••• 4242")
                .specialRequests("High floor preferred, extra feather pillows.")
                .source("Direct Booking")
                .build();

        Booking b2 = Booking.builder()
                .bookingCode("ROOMLY-92014")
                .room(r202)
                .guestName("Marcus Vance")
                .guestEmail("marcus.vance@techcorp.io")
                .guestPhone("+1 (555) 432-1098")
                .checkInDate(LocalDate.now().minusDays(1))
                .checkOutDate(LocalDate.now().plusDays(3))
                .nights(4)
                .guestsCount(1)
                .baseRate(BigDecimal.valueOf(1920.00))
                .taxes(BigDecimal.valueOf(230.00))
                .serviceFee(BigDecimal.valueOf(60.00))
                .discount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(2210.00))
                .status("CHECKED_IN")
                .paymentStatus("PAID")
                .paymentMethod("Mastercard •••• 8821")
                .specialRequests("Late checkout requested at 2:00 PM.")
                .source("Direct Booking")
                .build();

        bookingRepository.save(b1);
        bookingRepository.save(b2);

        log.info("Initial dataset seeded successfully!");
    }

    private void seedOffersIfEmpty() {
        if (offerRepository.count() > 0) {
            return;
        }

        log.info("Seeding demonstration credit card offers...");

        java.time.Instant now = java.time.Instant.now();
        java.time.Instant oneMonthLater = now.plus(30, java.time.temporal.ChronoUnit.DAYS);

        // 1. HDFC Bank Credit Card — 10% off, max ₹1,000 / $100
        com.roomly.entity.Offer hdfc = com.roomly.entity.Offer.builder()
                .code("HDFC10")
                .title("HDFC Bank Credit Card — 10% Instant Savings")
                .bankName("HDFC Bank")
                .cardNetwork("Visa / Mastercard")
                .cardType("Credit Card")
                .description("Get 10% instant discount up to $100 on luxury suite reservations using HDFC Bank credit cards. (Demonstration Offer)")
                .discountType(com.roomly.entity.Offer.DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10.00))
                .maxDiscount(BigDecimal.valueOf(100.00))
                .minBookingAmount(BigDecimal.valueOf(300.00))
                .startDateTime(now.minus(1, java.time.temporal.ChronoUnit.DAYS))
                .expiryDateTime(oneMonthLater)
                .maxTotalRedemptions(500)
                .currentRedemptions(14)
                .maxPerCustomerRedemptions(2)
                .termsAndConditions("Valid exclusively on room reservations booked directly on Roomly. Minimum spend of $300 required. Maximum savings capped at $100. Demonstration sandbox offer.")
                .isActive(true)
                .isArchived(false)
                .build();

        // 2. SBI Credit Card — 15% off, max ₹1,500 / $150
        com.roomly.entity.Offer sbi = com.roomly.entity.Offer.builder()
                .code("SBI15")
                .title("SBI Credit Card — 15% Special Gateway Discount")
                .bankName("State Bank of India (SBI)")
                .cardNetwork("Visa / RuPay / Mastercard")
                .cardType("Credit Card")
                .description("Enjoy 15% off up to $150 on luxury suites with your SBI Credit Card. (Demonstration Offer)")
                .discountType(com.roomly.entity.Offer.DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(15.00))
                .maxDiscount(BigDecimal.valueOf(150.00))
                .minBookingAmount(BigDecimal.valueOf(400.00))
                .startDateTime(now.minus(1, java.time.temporal.ChronoUnit.DAYS))
                .expiryDateTime(oneMonthLater)
                .maxTotalRedemptions(300)
                .currentRedemptions(8)
                .maxPerCustomerRedemptions(1)
                .termsAndConditions("Offer valid for select SBI Credit Cardholders. Applicable once per customer during the campaign window. Minimum booking total $400. Demonstration sandbox offer.")
                .isActive(true)
                .isArchived(false)
                .build();

        // 3. ICICI Bank Credit Card — ₹500 / $50 fixed off
        com.roomly.entity.Offer icici = com.roomly.entity.Offer.builder()
                .code("ICICI50")
                .title("ICICI Bank Credit Card — Flat $50 Off")
                .bankName("ICICI Bank")
                .cardNetwork("Mastercard / Visa")
                .cardType("Credit Card")
                .description("Flat $50 off on eligible hotel reservations over $250 with ICICI Bank Credit Cards. (Demonstration Offer)")
                .discountType(com.roomly.entity.Offer.DiscountType.FIXED_AMOUNT)
                .discountValue(BigDecimal.valueOf(50.00))
                .maxDiscount(BigDecimal.valueOf(50.00))
                .minBookingAmount(BigDecimal.valueOf(250.00))
                .startDateTime(now.minus(2, java.time.temporal.ChronoUnit.DAYS))
                .expiryDateTime(oneMonthLater)
                .maxTotalRedemptions(400)
                .currentRedemptions(22)
                .maxPerCustomerRedemptions(3)
                .termsAndConditions("Flat discount of $50 on bookings valued at $250 or more. Valid on ICICI credit cards only. Demonstration sandbox offer.")
                .isActive(true)
                .isArchived(false)
                .build();

        offerRepository.saveAll(java.util.List.of(hdfc, sbi, icici));
        log.info("Demonstration credit card offers seeded successfully!");
    }
}
