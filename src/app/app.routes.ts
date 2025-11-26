import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'performance',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/performance/performance.component').then(
            (m) => m.PerformanceComponent
          ),
      },
      {
        path: 'user',
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./pages/user/user-dashboard.component').then(
                (m) => m.UserDashboardComponent
              ),
          },
          {
            path: 'performance',
            loadComponent: () =>
              import('./pages/user/user-performance.component').then(
                (m) => m.UserPerformanceComponent
              ),
          },
        ],
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./pages/admin/users/users.routes').then((m) => m.userRoutes),
      },
      {
        path: 'settings',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
      },
      {
        path: 'components',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/admin/components/components-library.component').then(
            (m) => m.ComponentsLibraryComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

