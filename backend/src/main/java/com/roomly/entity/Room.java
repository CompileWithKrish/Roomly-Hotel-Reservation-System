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
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_number", nullable = false, unique = true, length = 50)
    private String roomNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "hotel_name", nullable = false)
    private String hotelName;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 2;

    @Column(name = "bed_type", nullable = false, length = 100)
    private String bedType;

    @Column(name = "size_sq_ft", nullable = false)
    private Integer sizeSqFt;

    @Column(nullable = false)
    @Builder.Default
    private Integer floor = 1;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "Available";

    @Column(nullable = false, precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.valueOf(5.00);

    @Column(name = "review_count", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_images", joinColumns = @JoinColumn(name = "room_id"))
    @OrderColumn(name = "display_order")
    @Column(name = "image_url", length = 1000)
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum RoomStatus {
        AVAILABLE("Available"),
        OCCUPIED("Occupied"),
        RESERVED("Reserved"),
        MAINTENANCE("Maintenance");

        private final String value;

        RoomStatus(String value) {
            this.value = value;
        }

        @com.fasterxml.jackson.annotation.JsonValue
        public String getValue() {
            return value;
        }

        @com.fasterxml.jackson.annotation.JsonCreator
        public static RoomStatus fromString(String text) {
            if (text == null) return AVAILABLE;
            for (RoomStatus b : RoomStatus.values()) {
                if (b.value.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text)) {
                    return b;
                }
            }
            return AVAILABLE;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public enum RoomType {
        DELUXE_SUITE("Deluxe Suite"),
        EXECUTIVE_SUITE("Executive Suite"),
        OCEAN_VILLA("Ocean Villa"),
        PRESIDENTIAL_SUITE("Presidential Suite"),
        STANDARD_ROOM("Standard Room"),
        PENTHOUSE("Penthouse");

        private final String value;

        RoomType(String value) {
            this.value = value;
        }

        @com.fasterxml.jackson.annotation.JsonValue
        public String getValue() {
            return value;
        }

        @com.fasterxml.jackson.annotation.JsonCreator
        public static RoomType fromString(String text) {
            if (text == null) return DELUXE_SUITE;
            for (RoomType b : RoomType.values()) {
                if (b.value.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text.replace(" ", "_"))) {
                    return b;
                }
            }
            return DELUXE_SUITE;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public RoomStatus getStatus() {
        return RoomStatus.fromString(this.status);
    }

    public void setStatus(RoomStatus roomStatus) {
        this.status = roomStatus != null ? roomStatus.getValue() : "Available";
    }

    public void setStatus(String status) {
        this.status = status != null ? status : "Available";
    }

    public RoomType getType() {
        return RoomType.fromString(this.type);
    }

    public void setType(RoomType roomType) {
        this.type = roomType != null ? roomType.getValue() : "Deluxe Suite";
    }

    public void setType(String type) {
        this.type = type != null ? type : "Deluxe Suite";
    }

    public Integer getSizeSqft() {
        return sizeSqFt;
    }

    public void setSizeSqft(Integer sizeSqft) {
        this.sizeSqFt = sizeSqft;
    }

    public String getName() {
        return title;
    }

    public void setName(String name) {
        this.title = name;
    }
}

