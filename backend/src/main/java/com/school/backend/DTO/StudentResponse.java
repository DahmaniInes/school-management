package com.school.backend.DTO;

import com.school.backend.Entity.Level;

public record StudentResponse(
        Long id,
        String username,
        Level level
) {}
