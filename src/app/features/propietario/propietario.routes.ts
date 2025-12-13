import { Routes } from '@angular/router';
import { PropietarioShellComponent } from '../../shared/components/propietario-shell/propietario-shell.component';

export const PROPIETARIO_ROUTES: Routes = [
  {
    path: '',
    component: PropietarioShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.PropietarioDashboardComponent)
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
        path: 'matches',
        loadComponent: () => import('./matches/matches.component').then(m => m.MatchesComponent)
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./mensajes/mensajes.component').then(m => m.MensajesComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent)
      }
    ]
  }
];
