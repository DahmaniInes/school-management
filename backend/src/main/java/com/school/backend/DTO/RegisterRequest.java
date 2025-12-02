package com.school.backend.DTO;

import jakarta.validation.constraints.*;
public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 20) String username,
        @NotBlank @Size(min = 6) String password
) {}
