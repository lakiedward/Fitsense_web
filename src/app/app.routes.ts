import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/auth/signup.component').then(m => m.SignupComponent) },
  { path: 'home', loadComponent: () => import('./pages/home/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'workout/plans', loadComponent: () => import('./pages/workout/training-dashboard.component').then(m => m.TrainingDashboardComponent) },
  { path: 'workout/execute/:id', loadComponent: () => import('./pages/workout/workout-execution.component').then(m => m.WorkoutExecutionComponent) },
  { path: 'more', loadComponent: () => import('./pages/more/more.component').then(m => m.MoreComponent) },
  { path: '**', redirectTo: '/login' }
];
