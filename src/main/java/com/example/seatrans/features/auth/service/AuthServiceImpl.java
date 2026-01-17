package com.example.seatrans.features.auth.service;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.seatrans.features.auth.dto.AuthResponseDTO;
import com.example.seatrans.features.auth.dto.LoginDTO;
import com.example.seatrans.features.auth.dto.RefreshTokenRequest;
import com.example.seatrans.features.auth.dto.RegisterDTO;
import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.repository.UserRepository;
import com.example.seatrans.shared.exception.UserNotFoundException;
import com.example.seatrans.shared.mapper.EntityMapper;
import com.example.seatrans.shared.security.TokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;
    private final TokenProvider tokenProvider;
    private final UserService userService;

    @Override
    public AuthResponseDTO login(LoginDTO loginDTO) {
        boolean isValid = verifyCredentials(loginDTO.getEmail(), loginDTO.getPassword());
        if (!isValid) {
            return null;
        }
        Optional<User> optUser = userRepository.findByEmail(loginDTO.getEmail());
        if (optUser.isEmpty()) {
            return null;
        }
        User user = optUser.get();

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        UserDTO userDTO = entityMapper.toUserDTO(user);

        String token = tokenProvider.generateToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        AuthResponseDTO authResponse = AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .user(userDTO)
                .build();

        return authResponse;
    }
    
    @Override
    public AuthResponseDTO refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            return null;
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        if (userId == null) {
            return null;
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));

        String newToken = tokenProvider.generateToken(user);
        String newRefreshToken = tokenProvider.generateRefreshToken(user);

        UserDTO userDTO = entityMapper.toUserDTO(user);

        return AuthResponseDTO.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .type("Bearer")
                .user(userDTO)
                .build();
    }
    
    @Override
    public AuthResponseDTO register(RegisterDTO registerDTO) {
        User createdUser = userService.registerOrUpgradeCustomer(registerDTO);
        UserDTO userDTO = entityMapper.toUserDTO(createdUser);

        String token = tokenProvider.generateToken(createdUser);
        String refreshToken = tokenProvider.generateRefreshToken(createdUser);

        return AuthResponseDTO.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .user(userDTO)
                .build();
    }
    
    @Override
    public UserDTO getCurrentUser(String token) {
        if (!tokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Long userId = tokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        return entityMapper.toUserDTO(user);
    }

    /**
     * Verify credentials (login) using email.
     */
    private boolean verifyCredentials(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        return user.getIsActive() && passwordEncoder.matches(password, user.getPassword());
    }
}
