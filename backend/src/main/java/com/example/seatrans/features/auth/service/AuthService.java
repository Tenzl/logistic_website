package com.example.seatrans.features.auth.service;
import com.example.seatrans.features.auth.dto.AuthResponseDTO;
import com.example.seatrans.features.auth.dto.LoginDTO;
import com.example.seatrans.features.auth.dto.RefreshTokenRequest;
import com.example.seatrans.features.auth.dto.RegisterDTO;
import com.example.seatrans.features.auth.dto.UserDTO;

public interface AuthService {
    AuthResponseDTO login(LoginDTO loginDTO);
    AuthResponseDTO refreshToken(RefreshTokenRequest request);
    AuthResponseDTO register(RegisterDTO registerDTO);
    UserDTO getCurrentUser(String token);
}
