package com.school.backend.DTO;

import com.school.backend.Entity.Level;
import jakarta.validation.constraints.*;
public record StudentRequest(
        @NotBlank @Size(max = 50) String username,
        @NotNull Level level
) {}
