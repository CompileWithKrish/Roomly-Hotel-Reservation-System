package com.roomly.dto.room;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.roomly.entity.Room.RoomStatus;
import com.roomly.entity.Room.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Room name is required")
    private String name;

    @NotBlank(message = "Hotel name is required")
    private String hotelName;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Room type is required")
    private RoomType type;

    @NotNull(message = "Room status is required")
    private RoomStatus status;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per night must be greater than zero")
    private BigDecimal pricePerNight;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @JsonAlias({"size", "sizeSqft"})
    private Integer sizeSqft;

    private String description;
    private String bedType;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Builder.Default
    private List<String> images = new ArrayList<>();
}
