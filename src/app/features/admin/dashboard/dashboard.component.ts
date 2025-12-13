import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p class="text-muted">Resumen general de RoomMatch</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" routerLink="/admin/usuarios">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalUsers }}</span>
            <span class="stat-label">Usuarios Totales</span>
          </div>
          <div class="stat-breakdown">
            <span><i class="fas fa-home"></i> {{ stats().totalPropietarios }} Propietarios</span>
            <span><i class="fas fa-user-friends"></i> {{ stats().totalRoomies }} Roomies</span>
          </div>
        </div>

        <div class="stat-card" routerLink="/admin/propiedades">
          <div class="stat-icon properties">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalProperties }}</span>
            <span class="stat-label">Propiedades</span>
          </div>
          <div class="stat-breakdown">
            <span class="success"><i class="fas fa-check-circle"></i> {{ stats().availableProperties }} Disponibles</span>
          </div>
        </div>

        <div class="stat-card" routerLink="/admin/solicitudes">
          <div class="stat-icon requests">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalRequests }}</span>
            <span class="stat-label">Solicitudes</span>
          </div>
          <div class="stat-breakdown">
            <span class="warning"><i class="fas fa-clock"></i> {{ stats().pendingRequests }} Pendientes</span>
            <span class="success"><i class="fas fa-check"></i> {{ stats().approvedRequests }} Aprobadas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon matches">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats().totalMatches }}</span>
            <span class="stat-label">Matches</span>
          </div>
          <div class="stat-breakdown">
            <span class="success"><i class="fas fa-check-circle"></i> {{ stats().activeMatches }} Activos</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Roomies Stats -->
        <div class="section">
          <div class="section-header">
            <h2>Distribución de Roomies</h2>
          </div>
          <div class="roomie-stats">
            <div class="roomie-stat-card looking">
              <div class="roomie-stat-icon">
                <i class="fas fa-search"></i>
              </div>
              <div class="roomie-stat-info">
                <span class="value">{{ stats().roomiesLookingForRoom }}</span>
                <span class="label">Buscando Lugar</span>
              </div>
            </div>
            <div class="roomie-stat-card offering">
              <div class="roomie-stat-icon">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="roomie-stat-info">
                <span class="value">{{ stats().roomiesWithRoom }}</span>
                <span class="label">Ofrecen Habitación</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="section">
          <div class="section-header">
            <h2>Actividad Reciente</h2>
          </div>
          <div class="activity-list">
            @for (activity of recentActivity(); track activity.id) {
              <div class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  <i [class]="activity.icon"></i>
                </div>
                <div class="activity-info">
                  <p>{{ activity.message }}</p>
                  <small>{{ activity.date | date:'dd MMM yyyy, HH:mm' }}</small>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
          <a routerLink="/admin/usuarios" class="action-card">
            <i class="fas fa-user-plus"></i>
            <span>Gestionar Usuarios</span>
          </a>
          <a routerLink="/admin/propiedades" class="action-card">
            <i class="fas fa-building"></i>
            <span>Ver Propiedades</span>
          </a>
          <a routerLink="/admin/solicitudes" class="action-card">
            <i class="fas fa-clipboard-check"></i>
            <span>Revisar Solicitudes</span>
          </a>
          <a routerLink="/admin/reportes" class="action-card">
            <i class="fas fa-chart-bar"></i>
            <span>Ver Reportes</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 2rem;

      h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.25rem;
      }

      .text-muted {
        color: #6b7280;
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      &.users { background: #dbeafe; color: #2563eb; }
      &.properties { background: #d1fae5; color: #059669; }
      &.requests { background: #fef3c7; color: #d97706; }
      &.matches { background: #ede9fe; color: #7c3aed; }
    }

    .stat-info {
      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
        display: block;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .stat-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: #6b7280;

      span {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &.success { color: #059669; }
        &.warning { color: #d97706; }
      }
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .section {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }
    }

    .roomie-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .roomie-stat-card {
      padding: 1.5rem;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      &.looking {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);

        .roomie-stat-icon {
          background: #f59e0b;
          color: white;
        }
      }

      &.offering {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);

        .roomie-stat-icon {
          background: #10b981;
          color: white;
        }
      }
    }

    .roomie-stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .roomie-stat-info {
      .value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
        display: block;
      }

      .label {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.75rem;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.user { background: #dbeafe; color: #2563eb; }
      &.property { background: #d1fae5; color: #059669; }
      &.request { background: #fef3c7; color: #d97706; }
      &.match { background: #ede9fe; color: #7c3aed; }
    }

    .activity-info {
      flex: 1;

      p {
        margin: 0 0 0.25rem;
        font-size: 0.875rem;
        color: #1f2937;
      }

      small {
        color: #6b7280;
        font-size: 0.75rem;
      }
    }

    .quick-actions {
      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 1rem;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .action-card {
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 1rem;
      padding: 1.5rem;
      text-align: center;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        border-color: #6366f1;
        background: #f5f3ff;
      }

      i {
        font-size: 2rem;
        color: #6366f1;
        margin-bottom: 0.75rem;
        display: block;
      }

      span {
        font-weight: 600;
        color: #1f2937;
        font-size: 0.9375rem;
      }
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-content {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .dashboard-container { padding: 1rem; }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .roomie-stats {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private mockDataService = inject(MockDataService);

  stats = signal({
    totalUsers: 0,
    totalPropietarios: 0,
    totalRoomies: 0,
    roomiesWithRoom: 0,
    roomiesLookingForRoom: 0,
    totalProperties: 0,
    availableProperties: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalMatches: 0,
    activeMatches: 0
  });

  recentActivity = signal<any[]>([]);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const statsData = this.mockDataService.getStats();
    this.stats.set(statsData);

    this.recentActivity.set([
      {
        id: 1,
        type: 'user',
        icon: 'fas fa-user-plus',
        message: 'Nuevo usuario registrado: Ana Torres',
        date: new Date('2024-10-28T10:30:00')
      },
      {
        id: 2,
        type: 'property',
        icon: 'fas fa-building',
        message: 'Nueva propiedad publicada en Providencia',
        date: new Date('2024-10-28T09:15:00')
      },
      {
        id: 3,
        type: 'request',
        icon: 'fas fa-paper-plane',
        message: 'Nueva solicitud de arriendo recibida',
        date: new Date('2024-10-27T16:45:00')
      },
      {
        id: 4,
        type: 'match',
        icon: 'fas fa-handshake',
        message: 'Match exitoso entre Valentina y María',
        date: new Date('2024-10-27T14:20:00')
      }
    ]);
  }
}
