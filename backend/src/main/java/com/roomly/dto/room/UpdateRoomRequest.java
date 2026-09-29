package com.roomly.dto.room;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.roomly.entity.Room.RoomStatus;
import com.roomly.entity.Room.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomRequest {
    private String roomNumber;
    private String name;
    private String hotelName;
    private String location;
    private RoomType type;
    private RoomStatus status;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price per night must be greater than zero")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @JsonAlias({"size", "sizeSqft"})
    private Integer sizeSqft;

    private String description;
    private String bedType;
    private List<String> amenities;
    private List<String> images;
}
