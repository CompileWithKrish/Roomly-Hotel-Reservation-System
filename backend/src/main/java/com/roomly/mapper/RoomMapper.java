package com.roomly.mapper;

import com.roomly.dto.room.CreateRoomRequest;
import com.roomly.dto.room.RoomDto;
import com.roomly.dto.room.UpdateRoomRequest;
import com.roomly.entity.Room;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;

@Component
public class RoomMapper {

    public RoomDto toDto(Room room) {
        if (room == null) {
            return null;
        }
        return RoomDto.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .name(room.getName())
                .hotelName(room.getHotelName())
                .location(room.getLocation())
                .type(room.getType())
                .status(room.getStatus())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .rating(room.getRating())
                .reviewCount(room.getReviewCount())
                .size(room.getSizeSqft())
                .sizeSqft(room.getSizeSqft())
                .description(room.getDescription())
                .bedType(room.getBedType())
                .amenities(room.getAmenities() != null ? new ArrayList<>(room.getAmenities()) : new ArrayList<>())
                .images(room.getImages() != null ? new ArrayList<>(room.getImages()) : new ArrayList<>())
                .build();
    }

    public Room toEntity(CreateRoomRequest request) {
        if (request == null) {
            return null;
        }
        return Room.builder()
                .roomNumber(request.getRoomNumber())
                .name(request.getName())
                .hotelName(request.getHotelName())
                .location(request.getLocation())
                .type(request.getType())
                .status(request.getStatus())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .rating(BigDecimal.valueOf(4.5))
                .reviewCount(0)
                .sizeSqft(request.getSizeSqft() != null ? request.getSizeSqft() : 350)
                .description(request.getDescription())
                .bedType(request.getBedType() != null ? request.getBedType() : "Queen Bed")
                .amenities(request.getAmenities() != null ? new ArrayList<>(request.getAmenities()) : new ArrayList<>())
                .images(request.getImages() != null ? new ArrayList<>(request.getImages()) : new ArrayList<>())
                .build();
    }

    public void updateEntityFromDto(UpdateRoomRequest request, Room room) {
        if (request == null || room == null) {
            return;
        }
        if (request.getRoomNumber() != null) room.setRoomNumber(request.getRoomNumber());
        if (request.getName() != null) room.setName(request.getName());
        if (request.getHotelName() != null) room.setHotelName(request.getHotelName());
        if (request.getLocation() != null) room.setLocation(request.getLocation());
        if (request.getType() != null) room.setType(request.getType());
        if (request.getStatus() != null) room.setStatus(request.getStatus());
        if (request.getPricePerNight() != null) room.setPricePerNight(request.getPricePerNight());
        if (request.getCapacity() != null) room.setCapacity(request.getCapacity());
        if (request.getSizeSqft() != null) room.setSizeSqft(request.getSizeSqft());
        if (request.getDescription() != null) room.setDescription(request.getDescription());
        if (request.getBedType() != null) room.setBedType(request.getBedType());
        if (request.getAmenities() != null) {
            room.setAmenities(new ArrayList<>(request.getAmenities()));
        }
        if (request.getImages() != null) {
            room.setImages(new ArrayList<>(request.getImages()));
        }
    }
}
