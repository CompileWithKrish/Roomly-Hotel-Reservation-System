package com.roomly.dto.room;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.roomly.entity.Room.RoomStatus;
import com.roomly.entity.Room.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private UUID id;
    private String roomNumber;
    private String name;
    private String hotelName;
    private String location;
    private RoomType type;
    private RoomStatus status;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private BigDecimal rating;
    private Integer reviewCount;

    @JsonProperty("size")
    private Integer size;

    private Integer sizeSqft;
    private String description;
    private String bedType;
    private List<String> amenities;
    private List<String> images;

    public Integer getSize() {
        return size != null ? size : sizeSqft;
    }
}
