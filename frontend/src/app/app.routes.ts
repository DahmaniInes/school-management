import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { StudentsComponent } from './components/students/students.component';
import { RegisterComponent } from './components/register/register.component';


export const routes: Routes = [
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // La route /students sera ajoutée plus tard, protégée par un Guard
    { path: 'students', component: StudentsComponent },
    { path: '**', redirectTo: '/login' } // Page par défaut
];