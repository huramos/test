import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService, PropertyFilterParams } from '../../../core/services/property.service';
import { Property, PropertyType, PropertyStatus } from '../../../core/models/property.model';

@Component({
  selector: 'app-admin-propiedades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión de Propiedades</h1>
          <p>Administra las propiedades de la plataforma</p>
        </div>
        <div class="header-stats">
          <div class="stat">
            <span class="value">{{ properties().length }}</span>
            <span class="label">Total</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Estado</label>
          <select [(ngModel)]="filters.status" (change)="applyFilters()">
            <option value="">Todos</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="OCCUPIED">Ocupado</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo</label>
          <select [(ngModel)]="filters.type" (change)="applyFilters()">
            <option value="">Todos</option>
            <option value="APARTMENT">Departamento</option>
            <option value="HOUSE">Casa</option>
            <option value="STUDIO">Estudio</option>
            <option value="LOFT">Loft</option>
            <option value="SHARED_APARTMENT">Depto. Compartido</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Comuna</label>
          <select [(ngModel)]="filters.comuna" (change)="applyFilters()">
            <option value="">Todas</option>
            @for (comuna of comunas; track comuna) {
              <option [value]="comuna">{{ comuna }}</option>
            }
          </select>
        </div>
        <button class="btn btn-secondary" (click)="clearFilters()">
          <i class="fas fa-times me-1"></i>Limpiar
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando propiedades...</span>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="loadProperties()">Reintentar</button>
        </div>
      } @else {
        <!-- Tabla de propiedades -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (property of properties(); track property.id) {
                <tr>
                  <td>
                    <div class="property-cell">
                      <div class="property-image">
                        @if (property.images && property.images.length > 0) {
                          <img [src]="property.images[0]" [alt]="property.title">
                        } @else {
                          <div class="no-image"><i class="fas fa-home"></i></div>
                        }
                      </div>
                      <div class="property-info">
                        <strong>{{ property.title }}</strong>
                        <small>{{ property.features.totalRooms }} hab. · {{ property.features.bathrooms }} baños</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="type-badge">{{ getTypeLabel(property.type) }}</span>
                  </td>
                  <td>
                    <div class="location-cell">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ property.address.comuna }}, {{ property.address.city }}
                    </div>
                  </td>
                  <td>
                    <strong class="price">\${{ property.monthlyRent | number }}</strong>
                    <small>/mes</small>
                  </td>
                  <td>
                    <span class="status-badge" [class]="property.status.toLowerCase()">
                      {{ getStatusLabel(property.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button class="btn-icon" title="Ver detalles" (click)="viewProperty(property)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon" title="Cambiar estado" (click)="openStatusModal(property)">
                        <i class="fas fa-toggle-on"></i>
                      </button>
                      @if (!property.isVerified) {
                        <button class="btn-icon verify" title="Verificar" (click)="verifyProperty(property)">
                          <i class="fas fa-check-circle"></i>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-row">
                    <i class="fas fa-building"></i>
                    <p>No se encontraron propiedades</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Modal de detalle -->
      @if (selectedProperty()) {
        <div class="modal-backdrop" (click)="closeModals()">
          <div class="modal-container detail-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Detalle de Propiedad</h2>
              <button class="close-btn" (click)="closeModals()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-section">
                  <h4>Información General</h4>
                  <div class="detail-row">
                    <span class="label">Título:</span>
                    <span class="value">{{ selectedProperty()?.title }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Tipo:</span>
                    <span class="value">{{ getTypeLabel(selectedProperty()?.type || '') }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Estado:</span>
                    <span class="status-badge" [class]="selectedProperty()?.status?.toLowerCase()">
                      {{ getStatusLabel(selectedProperty()?.status || '') }}
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Precio:</span>
                    <span class="value price">\${{ selectedProperty()?.monthlyRent | number }}/mes</span>
                  </div>
                </div>
                <div class="detail-section">
                  <h4>Ubicación</h4>
                  <div class="detail-row">
                    <span class="label">Dirección:</span>
                    <span class="value">{{ selectedProperty()?.address?.street }} {{ selectedProperty()?.address?.number }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Comuna:</span>
                    <span class="value">{{ selectedProperty()?.address?.comuna }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Ciudad:</span>
                    <span class="value">{{ selectedProperty()?.address?.city }}</span>
                  </div>
                </div>
                <div class="detail-section">
                  <h4>Características</h4>
                  <div class="features-grid">
                    <div class="feature">
                      <i class="fas fa-bed"></i>
                      <span>{{ selectedProperty()?.features?.totalRooms }} Habitaciones</span>
                    </div>
                    <div class="feature">
                      <i class="fas fa-bath"></i>
                      <span>{{ selectedProperty()?.features?.bathrooms }} Baños</span>
                    </div>
                    <div class="feature">
                      <i class="fas fa-ruler-combined"></i>
                      <span>{{ selectedProperty()?.features?.squareMeters }} m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModals()">Cerrar</button>
              <button class="btn btn-primary" (click)="openStatusModal(selectedProperty()!)">
                <i class="fas fa-edit me-1"></i>Cambiar Estado
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de cambio de estado -->
      @if (showStatusModal()) {
        <div class="modal-backdrop" (click)="closeModals()">
          <div class="modal-container status-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Cambiar Estado</h2>
              <button class="close-btn" (click)="closeModals()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <p class="modal-subtitle">{{ propertyToEdit()?.title }}</p>
              <div class="status-options">
                @for (status of statusOptions; track status.value) {
                  <label class="status-option" [class.selected]="newStatus() === status.value">
                    <input type="radio" [value]="status.value" [(ngModel)]="newStatusValue" name="status">
                    <div class="option-content">
                      <span class="status-badge" [class]="status.value.toLowerCase()">{{ status.label }}</span>
                      <small>{{ status.description }}</small>
                    </div>
                  </label>
                }
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModals()">Cancelar</button>
              <button class="btn btn-primary" (click)="updateStatus()" [disabled]="updatingStatus()">
                @if (updatingStatus()) {
                  <i class="fas fa-spinner fa-spin me-1"></i>Actualizando...
                } @else {
                  <i class="fas fa-save me-1"></i>Guardar
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .header-stats {
      display: flex; gap: 1rem;
      .stat {
        background: white; padding: 0.75rem 1.25rem; border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;
        .value { display: block; font-size: 1.5rem; font-weight: 700; color: #6366f1; }
        .label { font-size: 0.75rem; color: #6b7280; }
      }
    }
    .filters-section {
      display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;
      background: white; padding: 1.25rem; border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;
    }
    .filter-group {
      display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px;
      label { font-size: 0.8125rem; font-weight: 500; color: #4b5563; }
      select {
        padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;
        font-size: 0.875rem; background: white;
        &:focus { outline: none; border-color: #6366f1; }
      }
    }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500;
      cursor: pointer; border: none; display: inline-flex; align-items: center;
      transition: all 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    }
    .btn-secondary {
      background: white; border: 1px solid #d1d5db; color: #374151;
      &:hover { background: #f3f4f6; }
    }
    .me-1 { margin-right: 0.25rem; }
    .loading-state, .error-state {
      display: flex; flex-direction: column; align-items: center;
      padding: 4rem; color: #6b7280; gap: 1rem;
      background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 2rem; }
      p { margin: 0; }
    }
    .loading-state i { color: #6366f1; }
    .error-state i { color: #ef4444; }
    .table-container {
      background: white; border-radius: 1rem; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .data-table {
      width: 100%; border-collapse: collapse;
      th, td { padding: 1rem; text-align: left; }
      th {
        background: #f9fafb; font-size: 0.75rem; font-weight: 600;
        text-transform: uppercase; color: #6b7280; border-bottom: 1px solid #e5e7eb;
      }
      td { border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
      tr:hover td { background: #f9fafb; }
    }
    .property-cell {
      display: flex; align-items: center; gap: 1rem;
      .property-image {
        width: 60px; height: 60px; border-radius: 0.5rem; overflow: hidden; flex-shrink: 0;
        img { width: 100%; height: 100%; object-fit: cover; }
        .no-image {
          width: 100%; height: 100%; background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          i { color: #d1d5db; }
        }
      }
      .property-info {
        strong { display: block; font-size: 0.9375rem; color: #1f2937; }
        small { color: #6b7280; }
      }
    }
    .type-badge {
      padding: 0.25rem 0.75rem; background: #f3f4f6;
      border-radius: 1rem; font-size: 0.75rem; color: #6b7280;
    }
    .location-cell {
      font-size: 0.875rem; color: #6b7280;
      i { color: #6366f1; margin-right: 0.5rem; }
    }
    .price { color: #059669; }
    .status-badge {
      padding: 0.25rem 0.75rem; border-radius: 1rem;
      font-size: 0.75rem; font-weight: 600;
      &.available { background: #d1fae5; color: #059669; }
      &.occupied { background: #fee2e2; color: #dc2626; }
      &.inactive { background: #e5e7eb; color: #6b7280; }
      &.pending_verification { background: #fef3c7; color: #d97706; }
    }
    .actions {
      display: flex; gap: 0.5rem;
    }
    .btn-icon {
      width: 32px; height: 32px; border-radius: 0.375rem;
      border: 1px solid #e5e7eb; background: white;
      display: flex; align-items: center; justify-content: center;
      color: #6b7280; cursor: pointer; transition: all 0.2s;
      &:hover { border-color: #6366f1; color: #6366f1; }
      &.verify { &:hover { border-color: #059669; color: #059669; } }
    }
    .empty-row {
      text-align: center; padding: 3rem !important;
      i { font-size: 2rem; color: #d1d5db; margin-bottom: 0.5rem; }
      p { margin: 0; color: #6b7280; }
    }
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-container {
      background: white; border-radius: 1rem; width: 100%;
      max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      &.detail-modal { max-width: 600px; }
      &.status-modal { max-width: 500px; }
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
      h2 { margin: 0; font-size: 1.125rem; font-weight: 600; color: #1f2937; }
    }
    .close-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; color: #6b7280;
      &:hover { background: #e5e7eb; color: #1f2937; }
    }
    .modal-body { padding: 1.5rem; overflow-y: auto; }
    .modal-subtitle { margin: 0 0 1rem; color: #6b7280; font-size: 0.9375rem; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
    }
    .detail-section {
      margin-bottom: 1.5rem;
      h4 { font-size: 0.875rem; font-weight: 600; color: #6366f1; margin: 0 0 0.75rem; text-transform: uppercase; }
    }
    .detail-row {
      display: flex; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6;
      .label { width: 100px; font-size: 0.875rem; color: #6b7280; flex-shrink: 0; }
      .value { font-size: 0.875rem; color: #1f2937; }
    }
    .features-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
      .feature {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.75rem; background: #f9fafb; border-radius: 0.5rem;
        i { color: #6366f1; }
        span { font-size: 0.8125rem; color: #374151; }
      }
    }
    .status-options {
      display: flex; flex-direction: column; gap: 0.75rem;
    }
    .status-option {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.75rem;
      cursor: pointer; transition: all 0.2s;
      input { display: none; }
      &:hover { border-color: #c7d2fe; }
      &.selected { border-color: #6366f1; background: #eef2ff; }
      .option-content {
        display: flex; flex-direction: column; gap: 0.25rem;
        small { color: #6b7280; font-size: 0.8125rem; }
      }
    }
    @media (max-width: 768px) {
      .page-container { padding: 1rem; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .filters-section { flex-direction: column; }
      .filter-group { width: 100%; }
      .data-table { font-size: 0.875rem; }
      .features-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PropiedadesComponent implements OnInit {
  private propertyService = inject(PropertyService);

  properties = signal<Property[]>([]);
  loading = signal(false);
  error = signal('');
  selectedProperty = signal<Property | null>(null);
  showStatusModal = signal(false);
  propertyToEdit = signal<Property | null>(null);
  newStatus = signal<string>('');
  newStatusValue = '';
  updatingStatus = signal(false);

  filters: PropertyFilterParams = {
    status: undefined,
    type: undefined,
    comuna: ''
  };

  comunas = [
    'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Vitacura',
    'La Florida', 'Maipú', 'Puente Alto', 'La Reina', 'Macul',
    'Peñalolén', 'San Miguel', 'Estación Central', 'Recoleta', 'Independencia'
  ];

  statusOptions = [
    { value: 'AVAILABLE', label: 'Disponible', description: 'La propiedad está disponible para arriendo' },
    { value: 'OCCUPIED', label: 'Ocupado', description: 'La propiedad está actualmente arrendada' },
    { value: 'INACTIVE', label: 'Inactivo', description: 'La propiedad no está visible en búsquedas' },
    { value: 'PENDING_VERIFICATION', label: 'Pendiente', description: 'Pendiente de verificación por admin' }
  ];

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading.set(true);
    this.error.set('');

    const searchFilters: PropertyFilterParams = {};
    if (this.filters.status) searchFilters.status = this.filters.status as PropertyStatus;
    if (this.filters.type) searchFilters.type = this.filters.type as PropertyType;
    if (this.filters.comuna) searchFilters.comuna = this.filters.comuna;

    this.propertyService.getProperties(searchFilters).subscribe({
      next: (response) => {
        this.properties.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar las propiedades');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.loadProperties();
  }

  clearFilters() {
    this.filters = { status: undefined, type: undefined, comuna: '' };
    this.loadProperties();
  }

  viewProperty(property: Property) {
    this.selectedProperty.set(property);
  }

  openStatusModal(property: Property) {
    this.propertyToEdit.set(property);
    this.newStatus.set(property.status);
    this.newStatusValue = property.status;
    this.showStatusModal.set(true);
    this.selectedProperty.set(null);
  }

  closeModals() {
    this.selectedProperty.set(null);
    this.showStatusModal.set(false);
    this.propertyToEdit.set(null);
  }

  updateStatus() {
    const property = this.propertyToEdit();
    if (!property || !this.newStatusValue) return;

    this.updatingStatus.set(true);

    this.propertyService.updateStatus(property.id, this.newStatusValue as PropertyStatus).subscribe({
      next: () => {
        this.updatingStatus.set(false);
        this.closeModals();
        this.loadProperties();
      },
      error: (err) => {
        this.updatingStatus.set(false);
        alert(err.error?.message || 'Error al actualizar el estado');
      }
    });
  }

  verifyProperty(property: Property) {
    if (confirm(`¿Estás seguro de verificar la propiedad "${property.title}"?`)) {
      this.propertyService.updateStatus(property.id, PropertyStatus.AVAILABLE).subscribe({
        next: () => {
          this.loadProperties();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al verificar la propiedad');
        }
      });
    }
  }

  getTypeLabel(type: PropertyType | string): string {
    const labels: Record<string, string> = {
      'APARTMENT': 'Departamento',
      'HOUSE': 'Casa',
      'STUDIO': 'Estudio',
      'LOFT': 'Loft',
      'SHARED_APARTMENT': 'Depto. Compartido'
    };
    return labels[type] || type;
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
