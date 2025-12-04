import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        localStorage.setItem('jwt_token', response.token);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }


  register(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }
}