import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { AuthService } from './auth.service';

// --- Interfaces de l'API ---

// Niveaux (doit correspondre à l'enum Level du backend)
export type Level = 'L1' | 'L2' | 'L3' | 'M1' | 'M2';

// Requête de Création/Mise à jour d'un étudiant
export interface StudentRequest {
  username: string;
  level: Level;
}

// Réponse d'un étudiant (avec ID)
export interface StudentResponse {
  id: number;
  username: string;
  level: Level;
}

// Structure de la réponse paginée du backend (Page<StudentResponse>)
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Numéro de page actuel (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:8080/api/students';

  // --- Gestion de l'état local (Signals) ---
  
  // Le signal pour stocker la liste paginée des étudiants
  studentsPage = signal<PageResponse<StudentResponse> | null>(null);
  
  // Liste des étudiants extraite (Computed pour la simplicité du template)
  students = computed(() => this.studentsPage()?.content || []);
  
  // Les niveaux disponibles pour le filtrage
  levels: Level[] = ['L1', 'L2','L3', 'M1', 'M2'];

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // --- Requêtes API ---

  // GET ALL + PAGINATION + FILTRAGE
  getAll(page: number, size: number, search: string | null, level: Level | null): Observable<PageResponse<StudentResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (level) {
      params = params.set('level', level);
    }

    return this.http.get<PageResponse<StudentResponse>>(this.apiUrl, { params, headers: this.getHeaders() })
      .pipe(
        // Mise à jour de l'état local (studentsPage signal) après une requête réussie
        tap(pageResponse => this.studentsPage.set(pageResponse)),
        catchError(this.handleError)
      );
  }

  // GET BY ID
  getById(id: number): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  // CREATE
  create(request: StudentRequest): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(this.apiUrl, request, { headers: this.getHeaders() })
      .pipe(
        // Force la mise à jour de la liste après création (le composant parent devra appeler getAll)
        tap(() => console.log('Student created')),
        catchError(this.handleError)
      );
  }

  // UPDATE
  update(id: number, request: StudentRequest): Observable<StudentResponse> {
    return this.http.put<StudentResponse>(`${this.apiUrl}/${id}`, request, { headers: this.getHeaders() })
      .pipe(
        // Force la mise à jour de la liste après modification
        tap(() => console.log('Student updated')),
        catchError(this.handleError)
      );
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        // Force la mise à jour de la liste après suppression
        tap(() => console.log('Student deleted')),
        catchError(this.handleError)
      );
  }

  // EXPORT CSV
  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, {
      headers: this.getHeaders(),
      responseType: 'blob' // Important pour recevoir le fichier binaire
    }).pipe(catchError(this.handleError));
  }

  // IMPORT CSV
  importCsv(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Note: Ne pas mettre 'Content-Type': 'multipart/form-data' dans les headers.
    // Le navigateur le gère automatiquement.
    return this.http.post<string>(`${this.apiUrl}/import/csv`, formData, { headers: this.getHeaders() })
      .pipe(
        tap(() => console.log('CSV import successful')),
        catchError(this.handleError)
      );
  }

  // Gestion des erreurs
  private handleError(error: any) {
    console.error('An error occurred:', error.error);
    // Retourne une erreur observable que l'abonné du composant peut gérer
    return throwError(() => new Error(error.error?.message || 'Something bad happened; please try again later.'));
  }
}