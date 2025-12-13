import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';

@Component({
  selector: 'app-roomie-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Hola, {{ userName() }}</h1>
          <p class="text-muted">Encuentra tu nuevo hogar</p>
        </div>
        <a routerLink="/roomie/buscar" class="btn btn-primary">
          <i class="fas fa-search me-2"></i>Buscar Ahora
        </a>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card clickable" routerLink="/roomie/solicitudes">
          <div class="stat-icon sent">
            <i class="fas fa-paper-plane"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ sentRequests() }}</span>
            <span class="stat-label">Solicitudes Enviadas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingRequests() }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>

        <div class="stat-card clickable" routerLink="/roomie/matches">
          <div class="stat-icon matches">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ activeMatches() }}</span>
            <span class="stat-label">Matches</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon favorites">
            <i class="fas fa-heart"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ favorites() }}</span>
            <span class="stat-label">Favoritos</span>
          </div>
        </div>
      </div>

      <!-- Quick Profile -->
      <div class="profile-banner">
        <div class="profile-content">
          <i class="fas fa-lightbulb"></i>
          <div>
            <strong>Completa tu perfil</strong>
            <p>Un perfil completo aumenta tus posibilidades de encontrar roomie</p>
          </div>
        </div>
        <a routerLink="/roomie/preferencias" class="btn btn-outline">Completar Preferencias</a>
      </div>

      <div class="dashboard-content">
        <!-- Propiedades Recomendadas -->
        <div class="section">
          <div class="section-header">
            <h2>Propiedades Disponibles</h2>
            <a routerLink="/roomie/buscar" class="btn-link">Ver todos</a>
          </div>

          @if (loadingProperties()) {
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Cargando...</span>
            </div>
          } @else {
            <div class="properties-grid">
              @for (property of recommendedProperties(); track property.id) {
                <div class="property-card" routerLink="/roomie/buscar">
                  <div class="property-image">
                    @if (property.images && property.images.length > 0) {
                      <img [src]="property.images[0]" [alt]="property.title">
                    } @else {
                      <div class="no-image">
                        <i class="fas fa-home"></i>
                      </div>
                    }
                    <div class="property-price">\${{ property.monthlyRent | number }}/mes</div>
                  </div>
                  <div class="property-info">
                    <h3>{{ property.title }}</h3>
                    <p class="location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ property.address.comuna }}
                    </p>
                    <div class="property-tags">
                      @if (property.features.hasWifi) {
                        <span class="tag"><i class="fas fa-wifi"></i></span>
                      }
                      @if (property.features.hasFurniture) {
                        <span class="tag"><i class="fas fa-couch"></i></span>
                      }
                      @if (property.rules?.petsAllowed) {
                        <span class="tag"><i class="fas fa-paw"></i></span>
                      }
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-properties">
                  <i class="fas fa-home"></i>
                  <p>No hay propiedades disponibles aún</p>
                  <a routerLink="/roomie/buscar" class="btn btn-primary btn-sm">
                    Explorar
                  </a>
                </div>
              }
            </div>
          }
        </div>

        <!-- Mis Solicitudes -->
        <div class="section">
          <div class="section-header">
            <h2>Mis Solicitudes</h2>
            <a routerLink="/roomie/solicitudes" class="btn-link">Ver todas</a>
          </div>
          <div class="requests-list">
            <div class="empty-state">
              <i class="fas fa-paper-plane"></i>
              <p>No has enviado solicitudes</p>
              <a routerLink="/roomie/buscar" class="btn btn-primary btn-sm">
                Buscar Propiedades
              </a>
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

      &.sent { background: #dbeafe; color: #2563eb; }
      &.pending { background: #fef3c7; color: #d97706; }
      &.matches { background: #d1fae5; color: #059669; }
      &.favorites { background: #fce7f3; color: #ec4899; }
    }

    .stat-info {
      display: flex;
      flex-direction: column;

      .stat-value { font-size: 1.75rem; font-weight: 700; color: #1f2937; }
      .stat-label { font-size: 0.875rem; color: #6b7280; }
    }

    .profile-banner {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      .profile-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        i { font-size: 2rem; color: #d97706; }
        strong { display: block; color: #92400e; font-size: 1rem; }
        p { margin: 0; font-size: 0.875rem; color: #b45309; }
      }

      .btn-outline {
        background: white;
        border: 2px solid #d97706;
        color: #d97706;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;

        &:hover { background: #d97706; color: white; }
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

      h2 { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0; }
      .btn-link {
        color: #f59e0b; text-decoration: none; font-weight: 500; font-size: 0.875rem;
        &:hover { text-decoration: underline; }
      }
    }

    .loading-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 2rem; color: #6b7280; gap: 0.5rem;
      i { font-size: 1.5rem; color: #f59e0b; }
    }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .property-card {
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover { border-color: #f59e0b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    }

    .property-image {
      height: 120px;
      position: relative;

      img { width: 100%; height: 100%; object-fit: cover; }
      .no-image {
        width: 100%; height: 100%; background: #f3f4f6;
        display: flex; align-items: center; justify-content: center;
        i { font-size: 2rem; color: #d1d5db; }
      }
      .property-price {
        position: absolute; bottom: 0.5rem; right: 0.5rem;
        background: rgba(0, 0, 0, 0.75); color: white;
        padding: 0.25rem 0.75rem; border-radius: 0.5rem;
        font-size: 0.875rem; font-weight: 600;
      }
    }

    .property-info {
      padding: 1rem;

      h3 {
        font-size: 0.9375rem; font-weight: 600; color: #1f2937; margin: 0 0 0.5rem;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .location {
        font-size: 0.8125rem; color: #6b7280; margin: 0 0 0.5rem;
        i { margin-right: 0.25rem; color: #f59e0b; }
      }
    }

    .property-tags {
      display: flex;
      gap: 0.5rem;

      .tag {
        width: 28px; height: 28px; background: #f3f4f6;
        border-radius: 50%; display: flex; align-items: center;
        justify-content: center; font-size: 0.75rem; color: #6b7280;
      }
    }

    .empty-properties {
      grid-column: 1 / -1;
      text-align: center;
      padding: 2rem;
      color: #6b7280;

      i { font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; }
      p { margin: 0 0 1rem; }
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;

      i { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5; }
      p { margin-bottom: 1rem; }
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .dashboard-content { grid-template-columns: 1fr; }
      .properties-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .dashboard-container { padding: 1rem; }
      .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .profile-banner {
        flex-direction: column; gap: 1rem; text-align: center;
        .profile-content { flex-direction: column; }
      }
    }
  `]
})
export class RoomieDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);

  userName = signal('');
  sentRequests = signal(0);
  pendingRequests = signal(0);
  activeMatches = signal(0);
  favorites = signal(0);
  recommendedProperties = signal<Property[]>([]);
  loadingProperties = signal(false);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.firstName || 'Usuario');
    }

    // Load recommended properties from API
    this.loadingProperties.set(true);
    this.propertyService.getProperties({
      status: PropertyStatus.AVAILABLE,
      limit: 4
    }).subscribe({
      next: (response) => {
        this.recommendedProperties.set(response.data || []);
        this.loadingProperties.set(false);
      },
      error: () => {
        this.loadingProperties.set(false);
      }
    });

    // TODO: Load requests and stats from API when endpoints are ready
    this.sentRequests.set(0);
    this.pendingRequests.set(0);
    this.activeMatches.set(0);
    this.favorites.set(0);
  }
}
