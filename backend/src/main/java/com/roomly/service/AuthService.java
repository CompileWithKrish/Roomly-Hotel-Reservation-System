package com.roomly.service;

import com.roomly.dto.auth.AuthResponse;
import com.roomly.dto.auth.LoginRequest;
import com.roomly.dto.auth.RefreshTokenRequest;
import com.roomly.dto.auth.RegisterRequest;
import com.roomly.dto.auth.UserDto;
import com.roomly.entity.Guest;
import com.roomly.entity.Role;
import com.roomly.entity.User;
import com.roomly.exception.BadRequestException;
import com.roomly.exception.ResourceNotFoundException;
import com.roomly.mapper.UserMapper;
import com.roomly.repository.GuestRepository;
import com.roomly.repository.UserRepository;
import com.roomly.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final GuestRepository guestRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Attempting login for email: {}", request.getEmail());
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateAccessToken(userDetails, extraClaims);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .phone(request.getPhone())
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Auto-create matching guest profile if none exists
        if (!guestRepository.existsByEmail(user.getEmail())) {
            String[] parts = user.getName().split("\\s+", 2);
            Guest guest = Guest.builder()
                    .user(user)
                    .firstName(parts[0])
                    .lastName(parts.length > 1 ? parts[1] : "")
                    .email(user.getEmail())
                    .phone(user.getPhone() != null ? user.getPhone() : "")
                    .tier("Regular")
                    .status("Active")
                    .totalStays(0)
                    .totalSpent(BigDecimal.ZERO)
                    .avatarUrl(user.getAvatarUrl())
                    .preferences(Collections.singletonList("Quiet Room"))
                    .build();
            guestRepository.save(guest);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateAccessToken(userDetails, extraClaims);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);

        if (userEmail == null) {
            throw new BadRequestException("Invalid refresh token payload.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new BadRequestException("Refresh token is expired or invalid.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("userId", user.getId().toString());

        String newAccessToken = jwtService.generateAccessToken(userDetails, extraClaims);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userMapper.toDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return userMapper.toDto(user);
    }
}
