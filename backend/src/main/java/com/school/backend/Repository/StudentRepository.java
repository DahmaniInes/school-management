package com.school.backend.Repository;

import com.school.backend.Entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student, Long> {
    Page<Student> findByUsernameContainingIgnoreCase(String search, Pageable pageable);
    Page<Student> findByLevel(String level, Pageable pageable);
}
