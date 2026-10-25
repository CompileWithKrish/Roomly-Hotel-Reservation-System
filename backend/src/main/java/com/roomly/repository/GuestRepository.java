package com.roomly.repository;

import com.roomly.entity.Guest;
import com.roomly.entity.Guest.GuestStatus;
import com.roomly.entity.Guest.GuestTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuestRepository extends JpaRepository<Guest, UUID> {

    Optional<Guest> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByStatus(String status);

    default long countByGuestStatus(GuestStatus status) {
        return countByStatus(status != null ? status.getValue() : "Active");
    }

    @Query("SELECT g FROM Guest g WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(g.firstName, ' ', g.lastName)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.phone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.passportId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:tier IS NULL OR LOWER(g.tier) = LOWER(:tier)) AND " +
           "(:status IS NULL OR LOWER(g.status) = LOWER(:status))")
    Page<Guest> findWithFilters(@Param("search") String search,
                               @Param("tier") String tier,
                               @Param("status") String status,
                               Pageable pageable);
}
