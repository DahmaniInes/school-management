# School Management System – PFE Technical Test 2025

**Full-Stack Application** | Spring Boot 3.5.8 + Angular 18 + MySQL + JWT + Docker  
**TailwindCSS v4** – Modern, responsive & beautiful UI

**Submitted by:** Ines Dahmani  
**GitHub:** https://github.com/DahmaniInes/school-management  
**Portfolio:** https://inesdahmani.netlify.app

---

## Features Implemented (100 % conforme à l’énoncé + bonus)

| Feature                                   | Status       | Details |
|------------------------------------------|--------------|-------|
| JWT Authentication (Login + Register)     | Done         | Token + BCrypt + Secure |
| Protected Student APIs                    | Done         | Only authenticated admins |
| Full CRUD Students                        | Done         | Create /students |
| Pagination (5 per page)                   | Done         | Clean page buttons |
| Search by username or ID                  | Done         | One field → smart detection |
| Filter by level (L1–L3, M1–M2)            | Done         | Works with search + ID |
| CSV Import & Export                       | Done         | Instant download + drag & drop |
| Rate limiting (5 attempts/min)            | Done         | 60s block + red button + countdown |
| Global Exception Handling                 | Done         | 400, 401, 404, 409, 500 → clean JSON |
| DTOs + Backend Validation                 | Done         | @Valid + custom messages |
| Swagger / OpenAPI                         | Done         | All endpoints + status codes documented |
| Unit Tests (JUnit + Mockito)              | Done         | AuthServiceTest + StudentServiceTest (100 % green) |
| Docker + Docker Compose                   | Done         | One command → everything runs |
| Modern UI with TailwindCSS v4             | Done         | Responsive, dark mode ready, glassmorphism |

---

## Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| Backend       | Spring Boot 3.5.8 (Java 21)                     |
| Frontend      | Angular 18 + Standalone + Signals + TailwindCSS v4 |
| Database      | MySQL 8                                         |
| Auth          | JWT + BCrypt + Spring Security                 |
| Rate Limiting | Bucket4j (5 attempts/min + 60s block)           |
| API Docs      | SpringDoc OpenAPI (Swagger UI)                  |
| CSV           | OpenCSV                                         |
| Container     | Docker + Docker Compose                         |

---

## How to Run (30 seconds)

```bash
git clone https://github.com/DahmaniInes/school-management.git
cd school-management
docker-compose up --build
→ Frontend: http://localhost:4200
→ Backend + Swagger: http://localhost:8080/swagger-ui.html
First admin created automatically:

Username: admin
Password: admin123


Screenshots (30+ included)
See the /screenshots folder:

Login + Register (Tailwind v4 design)
Rate limiting countdown (429 → 60s block)
Students dashboard + search + filter + pagination
Create / Edit modal
CSV Import/Export
Swagger with all status codes
Docker Compose up
Unit tests 100 % green


Author
Ines Dahmani
Full-Stack Developer | Clean Code Enthusiast | UI/UX Lover
Portfolio: https://inesdahmani.netlify.app
GitHub: https://github.com/DahmaniInes
LinkedIn: https://linkedin.com/in/ines-dahmani
Ready for discussion & improvements anytime.
Thank you Relead for this amazing challenge!
PFE-2025-TECH-SUBMISSION
