package com.roomly.repository;

import com.roomly.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    long countByStatus(String status);

    @Query("SELECT DISTINCT r.location FROM Room r WHERE r.location IS NOT NULL ORDER BY r.location ASC")
    List<String> findDistinctLocations();

    @Query("SELECT r FROM Room r WHERE " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.hotelName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:type IS NULL OR LOWER(r.type) = LOWER(:type)) AND " +
           "(:status IS NULL OR LOWER(r.status) = LOWER(:status)) AND " +
           "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
           "(:minPrice IS NULL OR r.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)")
    Page<Room> findWithFilters(@Param("search") String search,
                              @Param("location") String location,
                              @Param("type") String type,
                              @Param("status") String status,
                              @Param("capacity") Integer capacity,
                              @Param("minPrice") BigDecimal minPrice,
                              @Param("maxPrice") BigDecimal maxPrice,
                              Pageable pageable);
}
