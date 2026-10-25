package com.roomly.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String nationality;

    @Column(name = "passport_id", unique = true, length = 100)
    private String passportId;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String tier = "Regular";

    @Column(name = "total_stays", nullable = false)
    @Builder.Default
    private Integer totalStays = 0;

    @Column(name = "total_spent", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(name = "last_stay", length = 100)
    private String lastStay;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "Active";

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "guest_preferences", joinColumns = @JoinColumn(name = "guest_id"))
    @Column(name = "preference_tag")
    @Builder.Default
    private List<String> preferences = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Transient
    private String address;

    @Transient
    private String city;

    @Transient
    private String country;

    public enum GuestTier {
        VIP("VIP"),
        GOLD("Gold"),
        SILVER("Silver"),
        REGULAR("Regular"),
        STANDARD("Standard");

        private final String value;

        GuestTier(String value) {
            this.value = value;
        }

        @com.fasterxml.jackson.annotation.JsonValue
        public String getValue() {
            return value;
        }

        @com.fasterxml.jackson.annotation.JsonCreator
        public static GuestTier fromString(String text) {
            if (text == null) return REGULAR;
            for (GuestTier b : GuestTier.values()) {
                if (b.value.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text)) {
                    return b;
                }
            }
            return REGULAR;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public enum GuestStatus {
        ACTIVE("Active"),
        INACTIVE("Inactive");

        private final String value;

        GuestStatus(String value) {
            this.value = value;
        }

        @com.fasterxml.jackson.annotation.JsonValue
        public String getValue() {
            return value;
        }

        @com.fasterxml.jackson.annotation.JsonCreator
        public static GuestStatus fromString(String text) {
            if (text == null) return ACTIVE;
            for (GuestStatus b : GuestStatus.values()) {
                if (b.value.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text)) {
                    return b;
                }
            }
            return ACTIVE;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public GuestTier getTier() {
        return GuestTier.fromString(this.tier);
    }

    public void setTier(GuestTier guestTier) {
        this.tier = guestTier != null ? guestTier.getValue() : "Regular";
    }

    public void setTier(String tier) {
        this.tier = tier != null ? tier : "Regular";
    }

    public GuestStatus getStatus() {
        return GuestStatus.fromString(this.status);
    }

    public void setStatus(GuestStatus guestStatus) {
        this.status = guestStatus != null ? guestStatus.getValue() : "Active";
    }

    public void setStatus(String status) {
        this.status = status != null ? status : "Active";
    }

    public String getAvatar() {
        return avatarUrl;
    }

    public void setAvatar(String avatar) {
        this.avatarUrl = avatar;
    }

    public String getPassportNumber() {
        return passportId;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportId = passportNumber;
    }

    public java.time.LocalDate getLastStayDate() {
        if (lastStay == null || lastStay.isEmpty() || "None".equalsIgnoreCase(lastStay)) return null;
        try {
            return java.time.LocalDate.parse(lastStay);
        } catch (Exception e) {
            return null;
        }
    }

    public void setLastStayDate(java.time.LocalDate date) {
        this.lastStay = date != null ? date.toString() : null;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country != null ? country : nationality;
    }

    public void setCountry(String country) {
        this.country = country;
        if (this.nationality == null || this.nationality.isEmpty()) {
            this.nationality = country;
        }
    }

    public String getFullName() {
        if (firstName == null) return lastName != null ? lastName : "";
        if (lastName == null || lastName.isEmpty()) return firstName;
        return firstName + " " + lastName;
    }

    public void setFullName(String fullName) {
        if (fullName == null) return;
        String[] parts = fullName.trim().split("\\s+", 2);
        this.firstName = parts[0];
        this.lastName = parts.length > 1 ? parts[1] : "";
    }
}

