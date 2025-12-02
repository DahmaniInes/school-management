// src/main/java/com/school/backend/Util/CsvUtil.java
package com.school.backend.Util;

import com.school.backend.Entity.Level;
import com.school.backend.Entity.Student;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class CsvUtil {

    public static List<Student> parseCsv(MultipartFile file) {
        List<Student> students = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                String[] parts = line.split(",");
                if (parts.length >= 2) {
                    Student student = new Student();
                    student.setUsername(parts[0].trim());
                    student.setLevel(Level.valueOf(parts[1].trim().toUpperCase()));
                    students.add(student);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }
        return students;
    }

    public static String toCsv(List<Student> students) {
        StringBuilder sb = new StringBuilder();
        sb.append("username,level\n");
        for (Student s : students) {
            sb.append(s.getUsername()).append(",").append(s.getLevel()).append("\n");
        }
        return sb.toString();
    }
}