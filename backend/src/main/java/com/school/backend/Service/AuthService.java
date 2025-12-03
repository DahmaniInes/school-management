package com.school.backend.Service;

import com.school.backend.DTO.*;
import com.school.backend.Entity.Admin;
import com.school.backend.Repository.AdminRepository;
import com.school.backend.Util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {  // ICI LA MAGIE

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // IMPLEMENTATION OBLIGATOIRE DE UserDetailsService
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));
    }

    public AuthResponse login(LoginRequest request) {
        // On charge l'admin + on vérifie le mot de passe manuellement (plus simple et plus sûr ici)
        Admin admin = adminRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("Mauvais identifiants"));

        if (!passwordEncoder.matches(request.password(), admin.getPassword())) {
            throw new RuntimeException("Mauvais identifiants");
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
        admin.setPassword(passwordEncoder.encode(request.password()));
        adminRepository.save(admin);
    }
}