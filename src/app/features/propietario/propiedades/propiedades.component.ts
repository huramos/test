import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';
import { CrearPropiedadComponent } from './crear-propiedad/crear-propiedad.component';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, CrearPropiedadComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Mis Propiedades</h1>
          <p>Gestiona tus propiedades y habitaciones</p>
        </div>
        <button class="btn btn-primary" (click)="showCreateModal.set(true)">
          <i class="fas fa-plus me-2"></i>Nueva Propiedad
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando propiedades...</span>
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
                <span class="status-badge" [class]="property.status.toLowerCase()">
                  {{ getStatusLabel(property.status) }}
                </span>
              </div>
              <div class="property-content">
                <h3>{{ property.title }}</h3>
                <p class="location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ property.address.street }} {{ property.address.number }}, {{ property.address.comuna }}
                </p>
                <div class="property-stats">
                  <div class="stat">
                    <i class="fas fa-bed"></i>
                    <span>{{ property.features.totalRooms }} hab.</span>
                  </div>
                  <div class="stat">
                    <i class="fas fa-bath"></i>
                    <span>{{ property.features.bathrooms }} baños</span>
                  </div>
                  <div class="stat">
                    <i class="fas fa-ruler-combined"></i>
                    <span>{{ property.features.squareMeters }} m²</span>
                  </div>
                </div>
                <div class="property-footer">
                  <span class="price">\${{ property.monthlyRent | number }}/mes</span>
                  <div class="actions">
                    <button class="btn-icon" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Ver habitaciones">
                      <i class="fas fa-door-open"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <i class="fas fa-home"></i>
              <h3>No tienes propiedades</h3>
              <p>Comienza agregando tu primera propiedad</p>
              <button class="btn btn-primary" (click)="showCreateModal.set(true)">
                <i class="fas fa-plus me-2"></i>Agregar Propiedad
              </button>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-secondary" (click)="loadProperties()">
            <i class="fas fa-redo me-2"></i>Reintentar
          </button>
        </div>
      }
    </div>

    @if (showCreateModal()) {
      <app-crear-propiedad
        (close)="showCreateModal.set(false)"
        (created)="onPropertyCreated()">
      </app-crear-propiedad>
    }
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      color: white; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; transition: all 0.2s;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    }
    .btn-secondary {
      background: white; border: 1px solid #d1d5db; padding: 0.5rem 1rem;
      border-radius: 0.5rem; color: #374151; font-weight: 500; cursor: pointer;
      display: inline-flex; align-items: center; transition: all 0.2s;
      &:hover { background: #f3f4f6; }
    }
    .me-2 { margin-right: 0.5rem; }
    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; color: #6b7280; gap: 1rem;
      i { font-size: 2rem; color: #10b981; }
    }
    .error-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; color: #6b7280; gap: 1rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 2rem; color: #ef4444; }
      p { margin: 0; }
    }
    .properties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .property-card {
      background: white; border-radius: 1rem; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: all 0.2s;
      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    }
    .property-image {
      height: 200px; position: relative;
      img { width: 100%; height: 100%; object-fit: cover; }
      .no-image {
        width: 100%; height: 100%; background: #f3f4f6;
        display: flex; align-items: center; justify-content: center;
        i { font-size: 3rem; color: #d1d5db; }
      }
      .status-badge {
        position: absolute; top: 1rem; left: 1rem;
        padding: 0.375rem 0.75rem; border-radius: 0.5rem;
        font-size: 0.75rem; font-weight: 600;
        &.available { background: #d1fae5; color: #059669; }
        &.occupied { background: #fee2e2; color: #dc2626; }
        &.inactive { background: #e5e7eb; color: #6b7280; }
        &.pending_verification { background: #fef3c7; color: #d97706; }
      }
    }
    .property-content { padding: 1.25rem;
      h3 { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0 0 0.5rem; }
      .location { font-size: 0.875rem; color: #6b7280; margin: 0 0 1rem;
        i { color: #10b981; margin-right: 0.5rem; }
      }
    }
    .property-stats { display: flex; gap: 1.5rem; margin-bottom: 1rem;
      .stat { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280;
        i { color: #9ca3af; }
      }
    }
    .property-footer { display: flex; justify-content: space-between; align-items: center;
      .price { font-size: 1.25rem; font-weight: 700; color: #10b981; }
      .actions { display: flex; gap: 0.5rem; }
    }
    .btn-icon {
      width: 36px; height: 36px; border-radius: 0.5rem;
      border: 1px solid #e5e7eb; background: white;
      display: flex; align-items: center; justify-content: center;
      color: #6b7280; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #10b981; color: #10b981; }
    }
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;
      background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { font-size: 1.25rem; color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0 0 1.5rem; }
    }
    @media (max-width: 640px) {
      .page-container { padding: 1rem; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .properties-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PropiedadesComponent implements OnInit {
  private propertyService = inject(PropertyService);

  properties = signal<Property[]>([]);
  loading = signal(false);
  error = signal('');
  showCreateModal = signal(false);

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading.set(true);
    this.error.set('');

    this.propertyService.getMyProperties().subscribe({
      next: (data) => {
        this.properties.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar las propiedades');
        this.loading.set(false);
      }
    });
  }

  onPropertyCreated() {
    this.loadProperties();
  }

  getStatusLabel(status: PropertyStatus | string): string {
    const labels: Record<string, string> = {
      'AVAILABLE': 'Disponible',
      'OCCUPIED': 'Ocupado',
      'INACTIVE': 'Inactivo',
      'PENDING_VERIFICATION': 'Pendiente'
    };
    return labels[status] || status;
  }
}
