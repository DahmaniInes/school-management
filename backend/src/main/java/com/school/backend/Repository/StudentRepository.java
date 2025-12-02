// src/main/java/com/school/backend/Repository/StudentRepository.java
package com.school.backend.Repository;

import com.school.backend.Entity.Level;
import com.school.backend.Entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Recherche partielle (insensible à la casse)
    Page<Student> findByUsernameContainingIgnoreCase(String search, Pageable pageable);

    // Filtre par niveau
    Page<Student> findByLevel(Level level, Pageable pageable);

    // Recherche + filtre combinés
    Page<Student> findByUsernameContainingIgnoreCaseAndLevel(
            String search, Level level, Pageable pageable);

    // RECHERCHE EXACTE PAR USERNAME (TRÈS IMPORTANT !)
    Optional<Student> findByUsername(String username);

    // Vérification d’existence par username (utilisé dans le service)
    boolean existsByUsername(String username);
}