package com.school.backend.Service;

import com.school.backend.DTO.*;
import com.school.backend.Entity.Level;
import com.school.backend.Entity.Student;
import com.school.backend.Exception.*;
import com.school.backend.Repository.StudentRepository;
import com.school.backend.Util.CsvUtil;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }




    public Page<StudentResponse> getAllStudents(int page, int size, String search, Level level) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());

        // === RECHERCHE PAR ID (priorité absolue) ===
        if (search != null && !search.isBlank()) {
            String trimmed = search.trim();
            if (trimmed.matches("\\d+")) {
                try {
                    Long id = Long.parseLong(trimmed);
                    Optional<Student> studentOpt = studentRepository.findById(id);

                    if (studentOpt.isEmpty()) {
                        return new PageImpl<>(List.of(), pageable, 0);
                    }

                    Student student = studentOpt.get();

                    // Si un filtre level est actif → on vérifie la compatibilité
                    if (level != null && student.getLevel() != level) {
                        return new PageImpl<>(List.of(), pageable, 0);
                    }

                    StudentResponse response = toResponse(student);
                    List<StudentResponse> content = List.of(response);

                    return new PageImpl<>(content, pageable, 1);

                } catch (NumberFormatException e) {
                    // Si ce n'est pas un nombre valide → on passe à la recherche par nom
                }
            }
        }

        // === RECHERCHE PAR NOM + FILTRE LEVEL (comportement normal) ===
        Page<Student> studentPage;

        if (search != null && !search.isBlank() && level != null) {
            studentPage = studentRepository.findByUsernameContainingIgnoreCaseAndLevel(search.trim(), level, pageable);
        } else if (search != null && !search.isBlank()) {
            studentPage = studentRepository.findByUsernameContainingIgnoreCase(search.trim(), pageable);
        } else if (level != null) {
            studentPage = studentRepository.findByLevel(level, pageable);
        } else {
            studentPage = studentRepository.findAll(pageable);
        }

        List<StudentResponse> content = studentPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new PageImpl<>(content, pageable, studentPage.getTotalElements());
    }




    public StudentResponse getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public StudentResponse createStudent(StudentRequest request) {
        if (studentRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already exists: " + request.username());
        }

        Student student = new Student();
        student.setUsername(request.username());
        student.setLevel(request.level());

        return toResponse(studentRepository.save(student));
    }

    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (!student.getUsername().equals(request.username()) &&
                studentRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already exists: " + request.username());
        }

        student.setUsername(request.username());
        student.setLevel(request.level());

        return toResponse(studentRepository.save(student));
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    public CsvExportResponse exportToCsv() {
        List<Student> students = studentRepository.findAll();
        String csv = CsvUtil.toCsv(students);
        return new CsvExportResponse(csv);
    }

    public void importFromCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        try {
            List<Student> students = CsvUtil.parseCsv(file);
            for (Student s : students) {
                if (studentRepository.existsByUsername(s.getUsername())) {
                    throw new ConflictException("Username already exists: " + s.getUsername());
                }
            }
            studentRepository.saveAll(students);
        } catch (Exception e) {
            throw new BadRequestException("Failed to import CSV: " + e.getMessage());
        }
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(student.getId(), student.getUsername(), student.getLevel());
    }
}