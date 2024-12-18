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
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/pharmacy/pharmacy.component').then(
                (m) => m.PharmacyComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-form/pharmacy-form.component'
              ).then((m) => m.PharmacyFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './features/pharmacy/pharmacy-form/pharmacy-form.component'
              ).then((m) => m.PharmacyFormComponent),
          },
        ],
      },
    ],
  },
];
