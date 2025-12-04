package com.school.backend.Service;

import com.school.backend.DTO.*;
import com.school.backend.Entity.Admin;
import com.school.backend.Repository.AdminRepository;
import com.school.backend.Util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private Admin admin;

    @BeforeEach
    void setUp() {
        admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        // Hash BCrypt réel du mot de passe "password"
        admin.setPassword(new BCryptPasswordEncoder().encode("password"));
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("admin", "password");

        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(jwtUtil.generateToken(admin)).thenReturn("fake-jwt-token-123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("fake-jwt-token-123", response.token());
        verify(jwtUtil).generateToken(admin);
    }

    @Test
    void login_WrongUsername_ThrowsException() {
        LoginRequest request = new LoginRequest("ghost", "password");

        when(adminRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> authService.login(request)
        );
        assertEquals("Invalid username or password", exception.getMessage());
    }

    @Test
    void login_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest("admin", "wrongpass");

        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> authService.login(request)
        );
        assertEquals("Invalid username or password", exception.getMessage());
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("newadmin", "pass123");

        when(adminRepository.existsByUsername("newadmin")).thenReturn(false);
        when(adminRepository.save(any(Admin.class))).thenAnswer(i -> i.getArgument(0));

        authService.register(request);

        verify(adminRepository).save(argThat(a ->
                "newadmin".equals(a.getUsername()) &&
                        new BCryptPasswordEncoder().matches("pass123", a.getPassword())
        ));
    }

    @Test
    void register_UsernameExists_ThrowsException() {
        when(adminRepository.existsByUsername("admin")).thenReturn(true);

        assertThrows(RuntimeException.class, () ->
                authService.register(new RegisterRequest("admin", "anything")));
    }
}