import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  StudentService, 
  StudentResponse, 
  Level, 
  PageResponse 
} from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentFormComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {

  studentService = inject(StudentService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Page state
  currentPage = signal(0);
  pageSize = signal(5);
  searchQuery = signal('');
  selectedLevelFilter = signal<Level | null>(null);

  // Modal
  isModalOpen = signal(false);
  selectedStudentToEdit = signal<StudentResponse | null>(null);

  // Import/Export
  selectedFile: File | null = null;
  fileImportMessage = signal<string | null>(null);
  fileImportError = signal<string | null>(null);

  constructor() {
    // Update URL when state changes (page, search, filter)
    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          page: this.currentPage() || 0,
          size: this.pageSize(),
          search: this.searchQuery() || null,
          level: this.selectedLevelFilter() || null
        },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  ngOnInit(): void {
    // Read query params on load (F5, direct link, etc.)
    this.route.queryParams.subscribe(params => {
      this.currentPage.set(parseInt(params['page'] ?? '0', 10));
      this.pageSize.set(parseInt(params['size'] ?? '5', 10));
      this.searchQuery.set(params['search'] ?? '');
      this.selectedLevelFilter.set((params['level'] as Level) ?? null);
    });

    // Load data once state is restored
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getAll(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery() || null,
      this.selectedLevelFilter()
    ).subscribe({
      next: (data) => {
        this.studentService.studentsPage.set(data);
      },
      error: (err) => console.error('Error loading students:', err)
    });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0) {
      this.currentPage.set(newPage);
      this.loadStudents();
    }
  }

  getPageNumbers(pageData: PageResponse<StudentResponse> | null): number[] {
    if (!pageData) return [];
    return Array.from({ length: pageData.totalPages }, (_, i) => i);
  }

  // === FORM ===
  openCreateModal(): void {
    this.selectedStudentToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(student: StudentResponse): void {
    this.selectedStudentToEdit.set(student);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedStudentToEdit.set(null);
  }

  onFormSubmitted(): void {
    this.closeModal();
    this.currentPage.set(0); // Return to first page after add/edit
    this.loadStudents();
  }

  // === DELETE (IMPROVED) ===
  deleteStudent(id: number, username: string): void {
    if (confirm(`Delete student "${username}"? This action cannot be undone.`)) {
      this.studentService.delete(id).subscribe({
        next: () => {
          const currentContent = this.studentService.students();
          if (currentContent.length === 1 && this.currentPage() > 0) {
            this.currentPage.set(this.currentPage() - 1);
          }
          this.loadStudents();
        },
        error: (err) => {
          console.error('Delete error:', err);
          alert('Failed to delete this student. Please try again.');
        }
      });
    }
  }

  // === FILTERS ===
  applyFilters(): void {
    this.currentPage.set(0);
    this.loadStudents();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }

  clearLevelFilter(): void {
    this.selectedLevelFilter.set(null);
    this.applyFilters();
  }

  // === IMPORT / EXPORT ===
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.fileImportMessage.set(null);
    this.fileImportError.set(null);
  }

  importCsv(): void {
    if (!this.selectedFile) {
      this.fileImportError.set('Please select a file to import.');
      return;
    }
    this.fileImportMessage.set('Importing students...');
    this.studentService.importCsv(this.selectedFile).subscribe({
      next: () => {
        this.fileImportMessage.set('Students imported successfully!');
        this.selectedFile = null;
        this.loadStudents();
        setTimeout(() => this.fileImportMessage.set(null), 4000);
      },
      error: (err) => {
        this.fileImportError.set('Import failed: ' + (err.error?.message || err.message || 'Unknown error'));
      }
    });
  }

  exportCsv(): void {
    this.studentService.exportCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Failed to export students. Please try again.');
      }
    });
  }
}