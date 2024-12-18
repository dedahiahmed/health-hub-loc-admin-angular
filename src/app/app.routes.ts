// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy.component').then(
            (m) => m.PharmacyComponent
          ),
      },
    ],
  },
];
