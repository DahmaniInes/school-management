import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  // Rate limiting state
  isRateLimited = false;
  countdown = 0;
  private timerSubscription?: Subscription;

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

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/students']);
    }
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.isRateLimited || this.loginForm.invalid) return;

    this.errorMessage = null;
    this.loading = true;

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.router.navigate(['/students']);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } 
        else if (err.status === 429) {
          const seconds = err.error?.retryAfter || 60;
          this.startCountdown(seconds);
        } 
        else {
          this.errorMessage = 'Server error. Please try again later.';
        }
      }
    });
  }

  private startCountdown(seconds: number): void {
    this.isRateLimited = true;
    this.countdown = seconds;
    this.errorMessage = `Too many login attempts. Please wait ${seconds} second${seconds > 1 ? 's' : ''}.`;

    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      this.errorMessage = `Too many login attempts. Please wait ${this.countdown} second${this.countdown > 1 ? 's' : ''}.`;

      if (this.countdown <= 0) {
        this.isRateLimited = false;
        this.errorMessage = null;
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}