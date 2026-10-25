package com.roomly.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Offer {

    public enum DiscountType {
        PERCENTAGE("PERCENTAGE"),
        FIXED_AMOUNT("FIXED_AMOUNT");

        private final String value;

        DiscountType(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static DiscountType fromValue(String value) {
            if (value == null) return PERCENTAGE;
            for (DiscountType type : values()) {
                if (type.value.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                    return type;
                }
            }
            return PERCENTAGE;
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "card_network", nullable = false, length = 100)
    private String cardNetwork;

    @Column(name = "card_type", nullable = false, length = 100)
    @Builder.Default
    private String cardType = "Credit Card";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 50)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "min_booking_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minBookingAmount = BigDecimal.ZERO;

    @Column(name = "start_date_time", nullable = false)
    private Instant startDateTime;

    @Column(name = "expiry_date_time", nullable = false)
    private Instant expiryDateTime;

    @Column(name = "max_total_redemptions", nullable = false)
    @Builder.Default
    private Integer maxTotalRedemptions = 1000;

    @Column(name = "current_redemptions", nullable = false)
    @Builder.Default
    private Integer currentRedemptions = 0;

    @Column(name = "max_per_customer_redemptions", nullable = false)
    @Builder.Default
    private Integer maxPerCustomerRedemptions = 1;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private Boolean isArchived = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public boolean isCurrentlyValid() {
        if (!Boolean.TRUE.equals(isActive) || Boolean.TRUE.equals(isArchived)) {
            return false;
        }
        Instant now = Instant.now();
        if (startDateTime != null && now.isBefore(startDateTime)) {
            return false;
        }
        if (expiryDateTime != null && now.isAfter(expiryDateTime)) {
            return false;
        }
        if (maxTotalRedemptions != null && currentRedemptions != null && currentRedemptions >= maxTotalRedemptions) {
            return false;
        }
        return true;
    }
}
