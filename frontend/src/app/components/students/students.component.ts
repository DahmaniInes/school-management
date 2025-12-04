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

  // État de la page
  currentPage = signal(0);
  pageSize = signal(5);
  searchQuery = signal('');
  selectedLevelFilter = signal<Level | null>(null);

  // Modale
  isModalOpen = signal(false);
  selectedStudentToEdit = signal<StudentResponse | null>(null);

  // Import/Export
  selectedFile: File | null = null;
  fileImportMessage = signal<string | null>(null);
  fileImportError = signal<string | null>(null);

  constructor() {
    // Met à jour l'URL quand l'état change (page, recherche, filtre)
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
    // Lit les query params au chargement (F5, lien direct, etc.)
    this.route.queryParams.subscribe(params => {
      this.currentPage.set(parseInt(params['page'] ?? '0', 10));
      this.pageSize.set(parseInt(params['size'] ?? '5', 10));
      this.searchQuery.set(params['search'] ?? '');
      this.selectedLevelFilter.set((params['level'] as Level) ?? null);
    });

    // Charge les données une fois l'état restauré
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
        // Important : on met à jour le signal pour que le template réagisse
        this.studentService.studentsPage.set(data);
      },
      error: (err) => console.error('Erreur chargement étudiants:', err)
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

  // === FORMULAIRE ===
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
    this.currentPage.set(0); // retour page 1 après ajout/modif
    this.loadStudents();
  }

  // === SUPPRESSION (CORRIGÉE) ===
  deleteStudent(id: number, username: string): void {
    if (confirm(`Supprimer l'étudiant "${username}" ?`)) {
      this.studentService.delete(id).subscribe({
        next: () => {
          // Si on supprime le dernier étudiant de la page → on recule d'une page
          const currentContent = this.studentService.students();
          if (currentContent.length === 1 && this.currentPage() > 0) {
            this.currentPage.set(this.currentPage() - 1);
          }
          this.loadStudents();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          alert('Impossible de supprimer cet étudiant.');
        }
      });
    }
  }

  // === FILTRES ===
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
      this.fileImportError.set('Veuillez sélectionner un fichier.');
      return;
    }
    this.fileImportMessage.set('Import en cours...');
    this.studentService.importCsv(this.selectedFile).subscribe({
      next: () => {
        this.fileImportMessage.set('Import réussi !');
        this.selectedFile = null;
        this.loadStudents();
        setTimeout(() => this.fileImportMessage.set(null), 3000);
      },
      error: (err) => this.fileImportError.set('Échec import: ' + err.message)
    });
  }

  exportCsv(): void {
    this.studentService.exportCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }
}