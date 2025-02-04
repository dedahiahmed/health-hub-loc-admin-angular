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
      {
        path: 'cabinet',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/cabinets/cabinet.component').then(
                (m) => m.CabinetComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './features/cabinets/cabinet-form/cabinet-form.component'
              ).then((m) => m.CabinetFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import(
                './features/cabinets/cabinet-form/cabinet-form.component'
              ).then((m) => m.CabinetFormComponent),
          },
        ],
      },
    ],
  },
];
