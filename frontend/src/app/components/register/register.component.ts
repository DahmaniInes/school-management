import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css' 
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirige si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/students']);
    }

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      this.errorMessage = 'Please check the form fields.';
      return;
    }

    this.loading = true;
    const { username, password } = this.registerForm.value;

    this.authService.register({ username, password }).subscribe({
      next: () => {
        // Succès : navigation vers la page Students (l'utilisateur est déjà connecté)
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        // Gestion des erreurs spécifiques
        if (err.status === 409) {
    this.errorMessage = 'Username already exists. Please choose a different one.';
  } else if (err.status === 400) {
    this.errorMessage = 'Invalid input data.';
  } else if (err.status === 201) {
    // Parfois Spring renvoie 201 dans error si mal géré
    this.router.navigate(['/login']);
  } else {
    this.errorMessage = 'Registration failed. Please try again.';
  }
      }
    });
  }

  // Helper pour un accès facile aux contrôles du formulaire
  get f() {
    return this.registerForm.controls;
  }
}