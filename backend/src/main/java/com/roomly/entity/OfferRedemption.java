package com.roomly.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "offer_redemptions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_offer_booking", columnNames = {"offer_id", "booking_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "discount_applied", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountApplied;

    @CreationTimestamp
    @Column(name = "redeemed_at", nullable = false, updatable = false)
    private Instant redeemedAt;
}
