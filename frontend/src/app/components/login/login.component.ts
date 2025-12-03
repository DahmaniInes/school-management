import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css' // Ce fichier est vide, Tailwind gère le style
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Si déjà authentifié, rediriger
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/students']);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez vérifier les champs du formulaire.';
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        // Succès : naviguer vers la page Students (à créer)
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.loading = false;
        // Afficher un message d'erreur clair
        if (err.status === 401) {
          this.errorMessage = 'Identifiants invalides ou non autorisés.';
        } else if (err.status === 429) {
          this.errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
        } else {
          this.errorMessage = 'Erreur de connexion inattendue. Vérifiez l\'état du backend.';
        }
      }
    });
  }

  // Helper pour un accès facile aux contrôles du formulaire
  get f() {
    return this.loginForm.controls;
  }
}