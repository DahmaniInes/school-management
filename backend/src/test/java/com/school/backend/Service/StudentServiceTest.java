package com.school.backend.Service;

import com.school.backend.DTO.StudentRequest;
import com.school.backend.DTO.StudentResponse;
import com.school.backend.Entity.Level;
import com.school.backend.Entity.Student;
import com.school.backend.Repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    private Student student;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setUsername("john_doe");
        student.setLevel(Level.L3);
    }

    @Test
    void getAllStudents_NoFilter_ReturnsPage() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").ascending());
        Page<Student> page = new PageImpl<>(List.of(student), pageable, 1);

        when(studentRepository.findAll(pageable)).thenReturn(page);

        Page<StudentResponse> result = studentService.getAllStudents(0, 10, null, null);

        assertEquals(1, result.getTotalElements());
        assertEquals("john_doe", result.getContent().get(0).username());
        assertEquals(Level.L3, result.getContent().get(0).level());
    }

    @Test
    void getAllStudents_WithUsernameSearch() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id"));
        Page<Student> page = new PageImpl<>(List.of(student));

        when(studentRepository.findByUsernameContainingIgnoreCase("john", pageable))
                .thenReturn(page);

        Page<StudentResponse> result = studentService.getAllStudents(0, 10, "john", null);

        assertEquals(1, result.getTotalElements());
        assertEquals("john_doe", result.getContent().get(0).username());
    }

    @Test
    void getAllStudents_WithLevelFilter() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id"));
        Page<Student> page = new PageImpl<>(List.of(student));

        when(studentRepository.findByLevel(Level.L3, pageable)).thenReturn(page);

        Page<StudentResponse> result = studentService.getAllStudents(0, 10, null, Level.L3);

        assertEquals(1, result.getTotalElements());
        assertEquals(Level.L3, result.getContent().get(0).level());
    }

    @Test
    void getStudentById_Found() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponse found = studentService.getStudentById(1L);

        assertEquals("john_doe", found.username());
        assertEquals(Level.L3, found.level());
    }

    @Test
    void getStudentById_NotFound_ThrowsException() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentService.getStudentById(99L));
    }

    @Test
    void createStudent_Success() {
        StudentRequest request = new StudentRequest("alice", Level.M1);
        Student saved = new Student();
        saved.setId(2L);
        saved.setUsername("alice");
        saved.setLevel(Level.M1);

        when(studentRepository.save(any(Student.class))).thenReturn(saved);

        StudentResponse created = studentService.createStudent(request);

        assertEquals("alice", created.username());
        assertEquals(Level.M1, created.level());
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void updateStudent_Success() {
        StudentRequest updateRequest = new StudentRequest("john_updated", Level.M2);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArgument(0));

        StudentResponse result = studentService.updateStudent(1L, updateRequest);

        assertEquals("john_updated", result.username());
        assertEquals(Level.M2, result.level());
    }

    @Test
    void deleteStudent_Success() {
        when(studentRepository.existsById(1L)).thenReturn(true);

        studentService.deleteStudent(1L);

        verify(studentRepository).deleteById(1L);
    }
}