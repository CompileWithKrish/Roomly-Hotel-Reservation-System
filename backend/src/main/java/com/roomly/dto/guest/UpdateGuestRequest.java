package com.roomly.dto.guest;

import com.roomly.entity.Guest.GuestStatus;
import com.roomly.entity.Guest.GuestTier;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGuestRequest {
    private String fullName;

    @Email(message = "Invalid email address")
    private String email;

    private String phone;
    private String avatar;
    private GuestTier tier;
    private GuestStatus status;
    private String address;
    private String city;
    private String country;
    private String passportNumber;
    private String notes;
    private List<String> preferences;
}
