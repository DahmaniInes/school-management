package com.school.backend.Service;

import com.school.backend.DTO.AuthResponse;
import com.school.backend.DTO.LoginRequest;
import com.school.backend.DTO.RegisterRequest;
import com.school.backend.Entity.Admin;
import com.school.backend.Repository.AdminRepository;
import com.school.backend.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        Admin admin = adminRepository.findByUsername(request.username())
                .orElseThrow();
        String token = jwtUtil.generateToken(admin);
        return new AuthResponse(token);
    }

    public void register(RegisterRequest request) {
        if (adminRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        Admin admin = Admin.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .build();
        adminRepository.save(admin);
    }
}
