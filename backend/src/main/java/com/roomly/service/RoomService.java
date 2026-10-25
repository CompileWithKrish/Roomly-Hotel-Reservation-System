package com.roomly.service;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.room.CreateRoomRequest;
import com.roomly.dto.room.RoomDto;
import com.roomly.dto.room.UpdateRoomRequest;
import com.roomly.entity.Room;
import com.roomly.exception.BadRequestException;
import com.roomly.exception.ResourceNotFoundException;
import com.roomly.mapper.RoomMapper;
import com.roomly.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    @Transactional(readOnly = true)
    public PagedResponse<RoomDto> getRooms(
            String search,
            String location,
            String type,
            String status,
            Integer capacity,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String cleanedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanedLocation = (location != null && !location.isBlank() && !"all".equalsIgnoreCase(location) && !"All Locations".equalsIgnoreCase(location)) ? location.trim() : null;
        String cleanedType = (type != null && !type.isBlank() && !"all".equalsIgnoreCase(type) && !"All Types".equalsIgnoreCase(type)) ? type.trim() : null;
        String cleanedStatus = (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Room> roomPage = roomRepository.findWithFilters(
                cleanedSearch,
                cleanedLocation,
                cleanedType,
                cleanedStatus,
                capacity,
                minPrice,
                maxPrice,
                pageable
        );

        List<RoomDto> content = roomPage.getContent().stream()
                .map(roomMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.<RoomDto>builder()
                .content(content)
                .page(roomPage.getNumber())
                .size(roomPage.getSize())
                .totalElements(roomPage.getTotalElements())
                .totalPages(roomPage.getTotalPages())
                .last(roomPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll(Sort.by("roomNumber").ascending()).stream()
                .map(roomMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDto getRoomById(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return roomMapper.toDto(room);
    }

    @Transactional
    public RoomDto createRoom(CreateRoomRequest request) {
        log.info("Creating room number: {}", request.getRoomNumber());

        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new BadRequestException("Room with number " + request.getRoomNumber() + " already exists.");
        }

        Room room = roomMapper.toEntity(request);
        room = roomRepository.save(room);
        return roomMapper.toDto(room);
    }

    @Transactional
    public RoomDto updateRoom(UUID id, UpdateRoomRequest request) {
        log.info("Updating room with ID: {}", id);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        if (request.getRoomNumber() != null && !request.getRoomNumber().equals(room.getRoomNumber())) {
            if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
                throw new BadRequestException("Room with number " + request.getRoomNumber() + " already exists.");
            }
        }

        roomMapper.updateEntityFromDto(request, room);
        room = roomRepository.save(room);
        return roomMapper.toDto(room);
    }

    @Transactional
    public void deleteRoom(UUID id) {
        log.info("Deleting room with ID: {}", id);
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with ID: " + id);
        }
        roomRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<String> getDistinctLocations() {
        return roomRepository.findDistinctLocations();
    }
}
