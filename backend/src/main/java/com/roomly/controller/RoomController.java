package com.roomly.controller;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.room.CreateRoomRequest;
import com.roomly.dto.room.RoomDto;
import com.roomly.dto.room.UpdateRoomRequest;
import com.roomly.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Hotel suite inventory, availability, and details")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    @Operation(summary = "Search and filter room listings with pagination")
    public ResponseEntity<PagedResponse<RoomDto>> getRooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PagedResponse<RoomDto> response = roomService.getRooms(
                search, location, type, status, capacity, minPrice, maxPrice, page, size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get full room list without pagination")
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a specific room")
    public ResponseEntity<RoomDto> getRoomById(@PathVariable UUID id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/locations")
    @Operation(summary = "Get list of distinct hotel property locations")
    public ResponseEntity<List<String>> getDistinctLocations() {
        return ResponseEntity.ok(roomService.getDistinctLocations());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new luxury suite (Admin only)")
    public ResponseEntity<RoomDto> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomDto created = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update suite attributes and availability (Admin only)")
    public ResponseEntity<RoomDto> updateRoom(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoomRequest request
    ) {
        RoomDto updated = roomService.updateRoom(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete suite from property inventory (Admin only)")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
