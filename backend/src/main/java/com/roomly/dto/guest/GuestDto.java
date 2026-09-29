package com.roomly.dto.guest;

import com.roomly.entity.Guest.GuestStatus;
import com.roomly.entity.Guest.GuestTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestDto {
    private UUID id;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatar;
    private GuestTier tier;
    private GuestStatus status;
    private Integer totalStays;
    private BigDecimal totalSpent;
    private LocalDate lastStayDate;
    private String lastStay;
    private String address;
    private String city;
    private String country;
    private String nationality;
    private String passportNumber;
    private String passportId;
    private String notes;
    private List<String> preferences;
    private LocalDateTime createdAt;

    public String getFirstName() {
        if (firstName != null) return firstName;
        if (fullName == null) return "";
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts[0];
    }

    public String getLastName() {
        if (lastName != null) return lastName;
        if (fullName == null) return "";
        String[] parts = fullName.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    public String getPassportId() {
        return passportId != null ? passportId : passportNumber;
    }

    public String getNationality() {
        return nationality != null ? nationality : country;
    }

    public String getLastStay() {
        if (lastStay != null) return lastStay;
        return lastStayDate != null ? lastStayDate.toString() : null;
    }
}
