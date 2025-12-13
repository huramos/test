import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  {
    path: 'propietario',
    canActivate: [authGuard, roleGuard([UserRole.PROPIETARIO])],
    loadChildren: () => import('./features/propietario/propietario.routes').then(m => m.PROPIETARIO_ROUTES)
  },

  {
    path: 'roomie',
    canActivate: [authGuard, roleGuard([UserRole.ROOMIE])],
    loadChildren: () => import('./features/roomie/roomie.routes').then(m => m.ROOMIE_ROUTES)
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
