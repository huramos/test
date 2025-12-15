import { Routes } from '@angular/router';
import { RoomieShellComponent } from '../../shared/components/roomie-shell/roomie-shell.component';

export const ROOMIE_ROUTES: Routes = [
  {
    path: '',
    component: RoomieShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.RoomieDashboardComponent)
      },
      {
        path: 'buscar',
        loadComponent: () => import('./buscar/buscar.component').then(m => m.BuscarComponent)
      },
      {
        path: 'explorar',
        loadComponent: () => import('./explorar/explorar.component').then(m => m.ExplorarComponent)
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
      },
      {
        path: 'preferencias',
        loadComponent: () => import('./preferencias/preferencias.component').then(m => m.PreferenciasComponent)
      }
    ]
  }
];
