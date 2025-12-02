package com.school.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(
		basePackages = {
				"com.school.backend",
				"com.school.backend.Util",
				"com.school.backend.Config",
				"com.school.backend.Repository",
				"com.school.backend.Service"
		}
)public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
