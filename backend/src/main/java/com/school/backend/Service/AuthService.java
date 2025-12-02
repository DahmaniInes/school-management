// src/main/java/com/school/backend/Service/AuthService.java
package com.school.backend.Service;

import com.school.backend.DTO.AuthResponse;
import com.school.backend.DTO.LoginRequest;
import com.school.backend.DTO.RegisterRequest;
import com.school.backend.Entity.Admin;
import com.school.backend.Repository.AdminRepository;
import com.school.backend.Util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // CONSTRUCTEUR EXPLICITE – PLUS JAMAIS DE @RequiredArgsConstructor
    public AuthService(AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        Admin admin = adminRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        String token = jwtUtil.generateToken(admin);
        return new AuthResponse(token);
    }

    public void register(RegisterRequest request) {
        if (adminRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        Admin admin = new Admin();
        admin.setUsername(request.username());
        admin.setPassword(passwordEncoder.encode(request.password()));
        adminRepository.save(admin);
    }
}