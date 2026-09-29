package com.roomly.dto.guest;

import com.roomly.entity.Guest.GuestStatus;
import com.roomly.entity.Guest.GuestTier;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGuestRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String avatar;

    @NotNull(message = "Tier is required")
    @Builder.Default
    private GuestTier tier = GuestTier.STANDARD;

    @NotNull(message = "Status is required")
    @Builder.Default
    private GuestStatus status = GuestStatus.ACTIVE;

    private String address;
    private String city;
    private String country;
    private String passportNumber;
    private String notes;

    @Builder.Default
    private List<String> preferences = new ArrayList<>();
}
