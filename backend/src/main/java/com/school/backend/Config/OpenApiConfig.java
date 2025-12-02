package com.school.backend.Config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@OpenAPIDefinition(
        info = @Info(title = "School Management API", version = "1.0", description = "PFE Technical Test"),
        security = @SecurityRequirement(name = "bearerAuth")
)
public class OpenApiConfig {}