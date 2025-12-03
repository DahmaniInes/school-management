import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Level, StudentRequest, StudentResponse, StudentService } from '../../services/student.service';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.css'
})
export class StudentFormComponent implements OnInit {

  // Propriétés en entrée pour le mode édition
  @Input() studentToEdit: StudentResponse | null = null;
  // Événement de sortie pour informer le parent de la fermeture/soumission
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  studentService = inject(StudentService);

  // Données du formulaire
  currentId: number | null = null;
  username: string = '';
  selectedLevel: Level = 'L1';
  
  // Données de l'UI
  isEditMode: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.isEditMode = !!this.studentToEdit;
    
    // Si en mode édition, pré-remplir le formulaire
    if (this.studentToEdit) {
      this.currentId = this.studentToEdit.id;
      this.username = this.studentToEdit.username;
      this.selectedLevel = this.studentToEdit.level as Level;
    }
  }

  // Soumission du formulaire
  onSubmit() {
    this.error = null;
    if (!this.username || !this.selectedLevel) {
      this.error = "Veuillez remplir tous les champs.";
      return;
    }

    this.isLoading = true;
    const request: StudentRequest = {
      username: this.username,
      level: this.selectedLevel
    };

    let operation: Observable<any>;

    if (this.isEditMode && this.currentId !== null) {
      operation = this.studentService.update(this.currentId, request);
    } else {
      operation = this.studentService.create(request);
    }

    operation.subscribe({
      next: () => {
        this.isLoading = false;
        this.submitted.emit(); // Informe le parent que l'opération a réussi
        this.close.emit(); // Ferme la modale
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || "Une erreur est survenue lors de l'opération.";
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}