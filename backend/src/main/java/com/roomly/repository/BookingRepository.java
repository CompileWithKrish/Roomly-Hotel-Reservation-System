package com.roomly.repository;

import com.roomly.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByBookingCode(String bookingCode);

    boolean existsByBookingCode(String bookingCode);

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    List<Booking> findByGuestEmailOrderByCreatedAtDesc(String email);

    long countByStatus(String status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.room.id = :roomId " +
           "AND UPPER(b.status) IN ('CONFIRMED', 'PENDING', 'CHECKED_IN', 'CHECKEDIN') " +
           "AND b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    boolean hasOverlappingBooking(@Param("roomId") UUID roomId,
                                 @Param("checkInDate") LocalDate checkInDate,
                                 @Param("checkOutDate") LocalDate checkOutDate,
                                 @Param("excludeBookingId") UUID excludeBookingId);

    @Query("SELECT b FROM Booking b WHERE " +
           "(:search IS NULL OR LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.guestName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.guestEmail) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.room.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(b.room.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR LOWER(b.status) = LOWER(:status)) AND " +
           "(:startDate IS NULL OR b.checkInDate >= :startDate) AND " +
           "(:endDate IS NULL OR b.checkOutDate <= :endDate)")
    Page<Booking> findWithFilters(@Param("search") String search,
                                 @Param("status") String status,
                                 @Param("startDate") LocalDate startDate,
                                 @Param("endDate") LocalDate endDate,
                                 Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE UPPER(b.status) != 'CANCELLED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT b.source, COUNT(b) FROM Booking b GROUP BY b.source")
    List<Object[]> countBookingsBySource();
}
