package com.school.backend.Service;

import com.school.backend.DTO.*;
import com.school.backend.Entity.Admin;
import com.school.backend.Repository.AdminRepository;
import com.school.backend.Util.JwtUtil;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {

    private final AdminRepository adminRepository;
    private final JwtUtil jwtUtil;

    // ON SUPPRIME AuthenticationManager DU CONSTRUCTEUR
    public AuthService(AdminRepository adminRepository, JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));
    }

    public AuthResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.username())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid username or password"));

        if (!new BCryptPasswordEncoder().matches(request.password(), admin.getPassword())) {
            throw new UsernameNotFoundException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(admin);
        return new AuthResponse(token);
    }

    public void register(RegisterRequest request) {
        if (adminRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        Admin admin = new Admin();
        admin.setUsername(request.username());
        admin.setPassword(new BCryptPasswordEncoder().encode(request.password()));
        adminRepository.save(admin);
    }
}