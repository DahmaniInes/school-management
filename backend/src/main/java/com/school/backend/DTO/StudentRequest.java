package com.school.backend.DTO;

import com.school.backend.Entity.Level;
import jakarta.validation.constraints.*;
public record StudentRequest(
        @NotBlank(message = "Username is required")
        @Size(max = 50, message = "Username must not exceed 50 characters")
        String username,

        @NotNull(message = "Level is required")
        Level level
) {}
