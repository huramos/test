import { Routes } from '@angular/router';
import { AdminShellComponent } from '../../shared/components/admin-shell/admin-shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'propiedades',
        loadComponent: () => import('./propiedades/propiedades.component').then(m => m.PropiedadesComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./solicitudes/solicitudes.component').then(m => m.SolicitudesComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      }
    ]
  }
];
