package com.roomly.service;

import com.roomly.dto.common.PagedResponse;
import com.roomly.dto.guest.CreateGuestRequest;
import com.roomly.dto.guest.GuestDto;
import com.roomly.dto.guest.UpdateGuestRequest;
import com.roomly.entity.Guest;
import com.roomly.exception.BadRequestException;
import com.roomly.exception.ResourceNotFoundException;
import com.roomly.mapper.GuestMapper;
import com.roomly.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GuestService {

    private final GuestRepository guestRepository;
    private final GuestMapper guestMapper;

    @Transactional(readOnly = true)
    public PagedResponse<GuestDto> getGuests(
            String search,
            String tier,
            String status,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String cleanedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String cleanedTier = (tier != null && !tier.isBlank() && !"all".equalsIgnoreCase(tier)) ? tier.trim() : null;
        String cleanedStatus = (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Guest> guestPage = guestRepository.findWithFilters(
                cleanedSearch,
                cleanedTier,
                cleanedStatus,
                pageable
        );

        List<GuestDto> content = guestPage.getContent().stream()
                .map(guestMapper::toDto)
                .collect(Collectors.toList());

        return PagedResponse.<GuestDto>builder()
                .content(content)
                .page(guestPage.getNumber())
                .size(guestPage.getSize())
                .totalElements(guestPage.getTotalElements())
                .totalPages(guestPage.getTotalPages())
                .last(guestPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<GuestDto> getAllGuests() {
        return guestRepository.findAll(Sort.by("firstName").ascending()).stream()
                .map(guestMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuestDto getGuestById(UUID id) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest profile not found with ID: " + id));
        return guestMapper.toDto(guest);
    }

    @Transactional
    public GuestDto createGuest(CreateGuestRequest request) {
        log.info("Creating guest directory entry for: {}", request.getEmail());

        if (guestRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("A guest profile with email " + request.getEmail() + " already exists.");
        }

        Guest guest = guestMapper.toEntity(request);
        guest = guestRepository.save(guest);
        return guestMapper.toDto(guest);
    }

    @Transactional
    public GuestDto updateGuest(UUID id, UpdateGuestRequest request) {
        log.info("Updating guest directory entry with ID: {}", id);

        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest profile not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(guest.getEmail())) {
            if (guestRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("A guest profile with email " + request.getEmail() + " already exists.");
            }
        }

        guestMapper.updateEntityFromDto(request, guest);
        guest = guestRepository.save(guest);
        return guestMapper.toDto(guest);
    }

    @Transactional
    public void deleteGuest(UUID id) {
        log.info("Deleting guest directory entry with ID: {}", id);
        if (!guestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Guest profile not found with ID: " + id);
        }
        guestRepository.deleteById(id);
    }
}
