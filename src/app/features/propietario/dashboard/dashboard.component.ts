import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';

@Component({
  selector: 'app-propietario-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Hola, {{ userName() }}</h1>
          <p class="text-muted">Bienvenido a tu panel de propietario</p>
        </div>
        <a routerLink="/propietario/propiedades" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Nueva Propiedad
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon properties">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalProperties() }}</span>
            <span class="stat-label">Propiedades</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon available">
            <i class="fas fa-door-open"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ availableProperties() }}</span>
            <span class="stat-label">Disponibles</span>
          </div>
        </div>

        <div class="stat-card clickable" routerLink="/propietario/solicitudes">
          <div class="stat-icon pending">
            <i class="fas fa-inbox"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingRequests() }}</span>
            <span class="stat-label">Solicitudes Pendientes</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon matches">
            <i class="fas fa-eye"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalViews() }}</span>
            <span class="stat-label">Vistas Totales</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <!-- Propiedades -->
        <div class="section">
          <div class="section-header">
            <h2>Mis Propiedades</h2>
            <a routerLink="/propietario/propiedades" class="btn-link">Ver todas</a>
          </div>

          @if (loading()) {
            <div class="loading-inline">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando...</span>
            </div>
          } @else {
            <div class="properties-grid">
              @for (property of properties(); track property.id) {
                <div class="property-card">
                  <div class="property-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="property.images[0]" [alt]="property.title">
                    } @else {
                      <div class="no-image">
                        <i class="fas fa-home"></i>
                      </div>
                    }
                    <span class="property-status" [class]="property.status.toLowerCase()">
                      {{ getStatusLabel(property.status) }}
                    </span>
                  </div>
                  <div class="property-info">
                    <h3>{{ property.title }}</h3>
                    <p class="location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ property.address.comuna }}, {{ property.address.city }}
                    </p>
                    <div class="property-details">
                      <span><i class="fas fa-bed"></i> {{ property.features.totalRooms }} hab.</span>
                      <span><i class="fas fa-bath"></i> {{ property.features.bathrooms }} baños</span>
                      <span class="price">\${{ property.monthlyRent | number }}</span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <i class="fas fa-home"></i>
                  <p>No tienes propiedades registradas</p>
                  <a routerLink="/propietario/propiedades" class="btn btn-primary btn-sm">
                    Agregar Propiedad
                  </a>
                </div>
              }
            </div>
          }
        </div>

        <!-- Info Panel -->
        <div class="section">
          <div class="section-header">
            <h2>Resumen</h2>
          </div>
          <div class="info-panel">
            <div class="info-item">
              <i class="fas fa-check-circle text-success"></i>
              <div>
                <strong>{{ verifiedProperties() }}</strong>
                <span>Propiedades verificadas</span>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-clock text-warning"></i>
              <div>
                <strong>{{ pendingVerification() }}</strong>
                <span>Pendientes de verificar</span>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-ban text-muted"></i>
              <div>
                <strong>{{ inactiveProperties() }}</strong>
                <span>Inactivas</span>
              </div>
            </div>
          </div>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
    }

    .me-2 { margin-right: 0.5rem; }

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
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &.clickable {
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;

      &.properties {
        background: #dbeafe;
        color: #2563eb;
      }

      &.available {
        background: #d1fae5;
        color: #059669;
      }

      &.pending {
        background: #fef3c7;
        color: #d97706;
      }

      &.matches {
        background: #ede9fe;
        color: #7c3aed;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2937;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .section {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
      }

      .btn-link {
        color: #10b981;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .loading-inline {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: #6b7280;

      i { color: #10b981; }
    }

    .properties-grid {
      display: grid;
      gap: 1rem;
    }

    .property-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      transition: all 0.2s ease;

      &:hover {
        border-color: #10b981;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
    }

    .property-image {
      width: 120px;
      height: 90px;
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .no-image {
        width: 100%;
        height: 100%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;

        i { font-size: 2rem; color: #d1d5db; }
      }

      .property-status {
        position: absolute;
        top: 0.5rem;
        left: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 600;

        &.available {
          background: #d1fae5;
          color: #059669;
        }

        &.occupied {
          background: #fee2e2;
          color: #dc2626;
        }

        &.inactive {
          background: #e5e7eb;
          color: #6b7280;
        }
      }
    }

    .property-info {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .location {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0 0 0.5rem;

        i {
          margin-right: 0.25rem;
          color: #10b981;
        }
      }
    }

    .property-details {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;

      span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .price {
        font-weight: 600;
        color: #10b981;
        margin-left: auto;
      }
    }

    .info-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.75rem;

      i {
        font-size: 1.25rem;

        &.text-success { color: #10b981; }
        &.text-warning { color: #f59e0b; }
        &.text-muted { color: #9ca3af; }
      }

      div {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 1.25rem;
          color: #1f2937;
        }

        span {
          font-size: 0.8125rem;
          color: #6b7280;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        margin-bottom: 1rem;
      }

      &.small {
        padding: 1.5rem;

        i {
          font-size: 2rem;
        }
      }
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-content {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .property-card {
        flex-direction: column;
      }

      .property-image {
        width: 100%;
        height: 150px;
      }
    }
  `]
})
export class PropietarioDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);

  userName = signal('');
  totalProperties = signal(0);
  availableProperties = signal(0);
  inactiveProperties = signal(0);
  verifiedProperties = signal(0);
  pendingVerification = signal(0);
  pendingRequests = signal(0);
  totalViews = signal(0);
  properties = signal<Property[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.firstName);
      this.loadProperties();
      this.loadStats();
    }
  }

  private loadProperties() {
    this.loading.set(true);
    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties.set(data.slice(0, 3));
        this.totalProperties.set(data.length);

        const available = data.filter(p => p.status === PropertyStatus.AVAILABLE).length;
        const inactive = data.filter(p => p.status === PropertyStatus.INACTIVE).length;
        const verified = data.filter(p => p.isVerified).length;
        const pending = data.filter(p => !p.isVerified).length;
        const views = data.reduce((sum, p) => sum + (p.views || 0), 0);

        this.availableProperties.set(available);
        this.inactiveProperties.set(inactive);
        this.verifiedProperties.set(verified);
        this.pendingVerification.set(pending);
        this.totalViews.set(views);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private loadStats() {
    // TODO: Load pending requests from API when available
    this.pendingRequests.set(0);
  }

  getStatusLabel(status: PropertyStatus | string): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'Disponible',
      'OCCUPIED': 'Ocupado',
      'INACTIVE': 'Inactivo'
    };
    return labels[status] || status;
  }
}
