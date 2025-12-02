# School Management System – PFE Technical Test

Full-Stack School Management Application built with **Spring Boot 3 + Angular 18 + MySQL + Docker**

## Features Implemented

- JWT-based authentication (Login / Register Admin)
- Full CRUD for Students (with pagination, search, filter by level)
- Protected routes (only authenticated admins)
- CSV Import & Export of students
- Rate limiting on login (5 attempts per minute per username)
- Backend validation + clean error responses
- Global exception handling
- Swagger/OpenAPI documentation with all HTTP status codes
- Unit tests (Auth & Student services)
- Fully Dockerized (backend + frontend + mysql)

## Tech Stack

| Layer       | Technology                                      |
|-------------|----------------------------------------------|
| Backend     | Spring Boot 3.5.8 (Java 21)                  |
| Frontend    | Angular 18 + TailwindCSS                     |
| Database    | MySQL 8                                      |
| Auth        | JWT + BCrypt + Spring Security               |
| API Doc     | SpringDoc OpenAPI (Swagger UI)               |
| CSV         | OpenCSV                                      |
| Rate Limit  | Bucket4j                                     |
| Container   | Docker + Docker Compose                      |

school-management/

├─ backend/      # Spring Boot

├─ frontend/     # Angular

├─ docker-compose.yml

└─ README.md


Author
Ines Dahmani – Full Stack Developer
GitHub: (https://github.com/DahmaniInes)
