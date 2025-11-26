import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./user-create.component').then((m) => m.UserCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-detail.component').then((m) => m.UserDetailComponent),
  },
];

