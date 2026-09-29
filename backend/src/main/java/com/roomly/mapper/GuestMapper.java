package com.roomly.mapper;

import com.roomly.dto.guest.CreateGuestRequest;
import com.roomly.dto.guest.GuestDto;
import com.roomly.dto.guest.UpdateGuestRequest;
import com.roomly.entity.Guest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;

@Component
public class GuestMapper {

    public GuestDto toDto(Guest guest) {
        if (guest == null) {
            return null;
        }
        return GuestDto.builder()
                .id(guest.getId())
                .fullName(guest.getFullName())
                .email(guest.getEmail())
                .phone(guest.getPhone())
                .avatar(guest.getAvatar())
                .tier(guest.getTier())
                .status(guest.getStatus())
                .totalStays(guest.getTotalStays())
                .totalSpent(guest.getTotalSpent())
                .lastStayDate(guest.getLastStayDate())
                .address(guest.getAddress())
                .city(guest.getCity())
                .country(guest.getCountry())
                .passportNumber(guest.getPassportNumber())
                .notes(guest.getNotes())
                .preferences(guest.getPreferences() != null ? new ArrayList<>(guest.getPreferences()) : new ArrayList<>())
                .createdAt(guest.getCreatedAt())
                .build();
    }

    public Guest toEntity(CreateGuestRequest request) {
        if (request == null) {
            return null;
        }
        return Guest.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .avatar(request.getAvatar())
                .tier(request.getTier())
                .status(request.getStatus())
                .totalStays(0)
                .totalSpent(BigDecimal.ZERO)
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .passportNumber(request.getPassportNumber())
                .notes(request.getNotes())
                .preferences(request.getPreferences() != null ? new ArrayList<>(request.getPreferences()) : new ArrayList<>())
                .build();
    }

    public void updateEntityFromDto(UpdateGuestRequest request, Guest guest) {
        if (request == null || guest == null) {
            return;
        }
        if (request.getFullName() != null) guest.setFullName(request.getFullName());
        if (request.getEmail() != null) guest.setEmail(request.getEmail());
        if (request.getPhone() != null) guest.setPhone(request.getPhone());
        if (request.getAvatar() != null) guest.setAvatar(request.getAvatar());
        if (request.getTier() != null) guest.setTier(request.getTier());
        if (request.getStatus() != null) guest.setStatus(request.getStatus());
        if (request.getAddress() != null) guest.setAddress(request.getAddress());
        if (request.getCity() != null) guest.setCity(request.getCity());
        if (request.getCountry() != null) guest.setCountry(request.getCountry());
        if (request.getPassportNumber() != null) guest.setPassportNumber(request.getPassportNumber());
        if (request.getNotes() != null) guest.setNotes(request.getNotes());
        if (request.getPreferences() != null) {
            guest.setPreferences(new ArrayList<>(request.getPreferences()));
        }
    }
}
