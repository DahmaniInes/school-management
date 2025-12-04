import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  StudentService, 
  StudentResponse, 
  Level, 
  PageResponse 
} from '../../services/student.service';
import { StudentFormComponent } from '../student-form/student-form.component';
import { AuthService } from '../../services/auth.service'; // Importation du AuthService

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentFormComponent],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {

  studentService = inject(StudentService);
  // Injection du AuthService pour pouvoir l'utiliser dans le template (si nécessaire)
  // ou dans la logique du composant.
  authService = inject(AuthService); 
  
  // --- État de la page ---
  currentPage = signal(0);
  pageSize = signal(10);
  searchQuery = signal('');
  selectedLevelFilter = signal<Level | null>(null);
  
  // Modale
  isModalOpen = signal(false);
  selectedStudentToEdit = signal<StudentResponse | null>(null);

  // Import/Export
  selectedFile: File | null = null;
  fileImportMessage = signal<string | null>(null);
  fileImportError = signal<string | null>(null);

  ngOnInit(): void {
    // Chargement initial des données
    this.loadStudents();
  }

  // --- Logique de Chargement et de Pagination ---

  loadStudents(): void {
    const page = this.currentPage();
    const size = this.pageSize();
    const search = this.searchQuery();
    const level = this.selectedLevelFilter();

    this.studentService.getAll(page, size, search, level).subscribe({
      error: (err) => {
        console.error('Failed to load students:', err);
        // Gérer l'erreur (ex: afficher un message)
      }
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
    this.loadStudents();
  }

  // Crée un tableau de nombres pour les boutons de pagination
  getPageNumbers(pageData: PageResponse<StudentResponse> | null): number[] {
    if (!pageData) return [];
    return Array.from({ length: pageData.totalPages }, (_, i) => i);
  }

  // --- Gestion du Formulaire (Modale) ---

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
    // Recharger la liste des étudiants après création/modification
    this.loadStudents();
  }

  // --- Suppression ---

  // NOTE: Remplacer alert/confirm par un modal UI personnalisé pour respecter les directives
  deleteStudent(id: number, username: string): void {
    // Remplacer le confirm() par un modal dans une application réelle
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'étudiant "${username}" ?`)) {
      this.studentService.delete(id).subscribe({
        next: () => {
          // Recharger les données, potentiellement en restant sur la même page
          this.loadStudents();
        },
        error: (err) => {
          console.error(err.message || "Erreur lors de la suppression.");
          // alert(err.message || "Erreur lors de la suppression."); // Remplacer par un message UI
        }
      });
    }
  }

  // --- Filtres et Recherche ---

  applyFilters(): void {
    this.currentPage.set(0); // Toujours revenir à la première page lors de l'application des filtres
    this.loadStudents();
  }
  
  // Réinitialiser la recherche
  clearSearch(): void {
    this.searchQuery.set('');
    this.applyFilters();
  }
  
  // Réinitialiser le filtre de niveau
  clearLevelFilter(): void {
    this.selectedLevelFilter.set(null);
    this.applyFilters();
  }

  // --- Import/Export ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
    this.fileImportMessage.set(null);
    this.fileImportError.set(null);
  }

  importCsv(): void {
    if (!this.selectedFile) {
      this.fileImportError.set("Veuillez sélectionner un fichier CSV.");
      return;
    }

    this.fileImportMessage.set("Importation en cours...");
    this.fileImportError.set(null);

    this.studentService.importCsv(this.selectedFile).subscribe({
      next: () => {
        this.fileImportMessage.set("Importation réussie !");
        this.selectedFile = null;
        this.loadStudents(); // Rafraîchir la liste après l'import
        setTimeout(() => this.fileImportMessage.set(null), 3000);
      },
      error: (err) => {
        this.fileImportError.set(`Échec de l'importation: ${err.message}`);
        this.fileImportMessage.set(null);
      }
    });
  }

  exportCsv(): void {
    this.studentService.exportCsv().subscribe({
      next: (blob) => {
        // Crée un lien temporaire pour télécharger le fichier
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(err.message || "Échec de l'exportation CSV.");
        // alert(err.message || "Échec de l'exportation CSV."); // Remplacer par un message UI
      }
    });
  }
}