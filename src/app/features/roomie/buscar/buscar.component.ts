import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService, PropertyFilterParams } from '../../../core/services/property.service';
import { RequestService } from '../../../core/services/request.service';
import { Property, PropertyType, PropertyStatus } from '../../../core/models/property.model';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="page-header">
        <h1>Buscar Propiedades</h1>
        <p>Encuentra tu próximo hogar</p>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Comuna</label>
          <select [(ngModel)]="filters.comuna" (change)="applyFilters()">
            <option value="">Todas</option>
            @for (comuna of comunas(); track comuna) {
              <option [value]="comuna">{{ comuna }}</option>
            }
          </select>
        </div>
        <div class="filter-group">
          <label>Precio máx.</label>
          <select [(ngModel)]="filters.priceMax" (change)="applyFilters()">
            <option value="">Sin límite</option>
            <option value="250000">$250.000</option>
            <option value="350000">$350.000</option>
            <option value="450000">$450.000</option>
            <option value="550000">$550.000</option>
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
        <div class="filter-group checkbox">
          <label>
            <input type="checkbox" [(ngModel)]="filters.petsAllowed" (change)="applyFilters()">
            Mascotas permitidas
          </label>
        </div>
      </div>

      <!-- Loading state -->
      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Buscando propiedades...</span>
        </div>
      } @else {
        <!-- Resultados -->
        <div class="results-header">
          <span>{{ properties().length }} propiedades encontradas</span>
        </div>

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
                <div class="property-price">\${{ property.monthlyRent | number }}/mes</div>
                <button class="favorite-btn" title="Agregar a favoritos">
                  <i class="far fa-heart"></i>
                </button>
              </div>
              <div class="property-content">
                <span class="property-type">{{ getTypeLabel(property.type) }}</span>
                <h3>{{ property.title }}</h3>
                <p class="location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ property.address.comuna }}, {{ property.address.city }}
                </p>
                <div class="property-features">
                  <span><i class="fas fa-bed"></i> {{ property.features.totalRooms }}</span>
                  <span><i class="fas fa-bath"></i> {{ property.features.bathrooms }}</span>
                  @if (property.features.squareMeters) {
                    <span><i class="fas fa-ruler-combined"></i> {{ property.features.squareMeters }}m²</span>
                  }
                </div>
                <div class="property-tags">
                  @if (property.features.hasWifi) {
                    <span class="tag"><i class="fas fa-wifi"></i> WiFi</span>
                  }
                  @if (property.features.hasFurniture) {
                    <span class="tag"><i class="fas fa-couch"></i> Amoblado</span>
                  }
                  @if (property.rules?.petsAllowed) {
                    <span class="tag"><i class="fas fa-paw"></i> Mascotas</span>
                  }
                </div>
                <button class="btn btn-primary" (click)="sendRequest(property)">
                  <i class="fas fa-paper-plane me-2"></i>Enviar Solicitud
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <i class="fas fa-search"></i>
              <h3>No se encontraron propiedades</h3>
              <p>Intenta ajustar tus filtros de búsqueda</p>
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

    <!-- Request Modal -->
    @if (requestProperty()) {
      <div class="modal-backdrop" (click)="closeRequestModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Enviar Solicitud</h2>
            <button class="close-btn" (click)="closeRequestModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="property-preview">
              @if (requestProperty()?.images && requestProperty()!.images.length > 0) {
                <img [src]="requestProperty()!.images[0]" [alt]="requestProperty()?.title">
              } @else {
                <div class="no-img"><i class="fas fa-home"></i></div>
              }
              <div class="preview-info">
                <h4>{{ requestProperty()?.title }}</h4>
                <p>{{ requestProperty()?.address?.comuna }}, {{ requestProperty()?.address?.city }}</p>
                <strong>\${{ requestProperty()?.monthlyRent | number }}/mes</strong>
              </div>
            </div>
            <div class="form-group">
              <label>Mensaje (opcional)</label>
              <textarea #messageInput rows="3" placeholder="Cuéntale al propietario por qué estás interesado..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeRequestModal()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmRequest(messageInput.value)" [disabled]="sendingRequest()">
              @if (sendingRequest()) {
                <i class="fas fa-spinner fa-spin"></i>
              } @else {
                <i class="fas fa-paper-plane"></i>
              }
              Enviar Solicitud
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Success Message -->
    @if (successMessage()) {
      <div class="toast success">
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage() }}</span>
      </div>
    }

    <!-- Error Message -->
    @if (errorMessage()) {
      <div class="toast error">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .filters-section {
      display: flex; flex-wrap: wrap; gap: 1rem;
      background: white; padding: 1.25rem; border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;
    }
    .filter-group {
      display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px;
      label { font-size: 0.8125rem; font-weight: 500; color: #4b5563; }
      select {
        padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;
        font-size: 0.875rem; background: white;
        &:focus { outline: none; border-color: #f59e0b; }
      }
      &.checkbox {
        flex-direction: row; align-items: center;
        label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
          input { width: 18px; height: 18px; accent-color: #f59e0b; }
        }
      }
    }
    .loading-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; color: #6b7280; gap: 1rem;
      i { font-size: 2rem; color: #f59e0b; }
    }
    .error-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; color: #6b7280; gap: 1rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 2rem; color: #ef4444; }
      p { margin: 0; }
    }
    .btn-secondary {
      background: white; border: 1px solid #d1d5db; padding: 0.5rem 1rem;
      border-radius: 0.5rem; color: #374151; font-weight: 500; cursor: pointer;
      display: inline-flex; align-items: center; transition: all 0.2s;
      &:hover { background: #f3f4f6; }
    }
    .results-header { margin-bottom: 1rem;
      span { font-size: 0.875rem; color: #6b7280; }
    }
    .properties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
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
      .property-price {
        position: absolute; bottom: 1rem; left: 1rem;
        background: rgba(0,0,0,0.8); color: white;
        padding: 0.5rem 1rem; border-radius: 0.5rem;
        font-weight: 700; font-size: 1.125rem;
      }
      .favorite-btn {
        position: absolute; top: 1rem; right: 1rem;
        width: 40px; height: 40px; border-radius: 50%;
        background: white; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.25rem; color: #ef4444; transition: all 0.2s;
        &:hover { transform: scale(1.1); }
      }
    }
    .property-content { padding: 1.25rem;
      .property-type {
        display: inline-block; padding: 0.25rem 0.75rem;
        background: #fef3c7; color: #d97706;
        border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
        margin-bottom: 0.75rem;
      }
      h3 { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0 0 0.5rem; }
      .location { font-size: 0.875rem; color: #6b7280; margin: 0 0 1rem;
        i { color: #f59e0b; margin-right: 0.5rem; }
      }
    }
    .property-features { display: flex; gap: 1rem; margin-bottom: 0.75rem;
      span { font-size: 0.875rem; color: #6b7280; display: flex; align-items: center; gap: 0.375rem;
        i { color: #9ca3af; }
      }
    }
    .property-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;
      .tag {
        padding: 0.25rem 0.625rem; background: #f3f4f6;
        border-radius: 0.375rem; font-size: 0.75rem; color: #6b7280;
        display: flex; align-items: center; gap: 0.375rem;
      }
    }
    .btn-primary {
      width: 100%; padding: 0.75rem;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border: none; border-radius: 0.5rem; color: white;
      font-weight: 600; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
      &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.3); }
    }
    .me-2 { margin-right: 0.5rem; }
    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 4rem;
      background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0; }
    }
    @media (max-width: 768px) {
      .filters-section { flex-direction: column; }
      .filter-group { width: 100%; }
    }

    /* Modal styles */
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-container {
      background: white; border-radius: 1rem; width: 100%; max-width: 480px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
      h2 { margin: 0; font-size: 1.125rem; font-weight: 600; }
    }
    .close-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; color: #6b7280;
      &:hover { background: #e5e7eb; }
    }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
      background: #f9fafb; border-radius: 0 0 1rem 1rem;
    }
    .property-preview {
      display: flex; gap: 1rem; margin-bottom: 1.5rem;
      padding: 1rem; background: #f9fafb; border-radius: 0.75rem;
      img { width: 80px; height: 60px; border-radius: 0.5rem; object-fit: cover; }
      .no-img { width: 80px; height: 60px; background: #e5e7eb; border-radius: 0.5rem;
        display: flex; align-items: center; justify-content: center;
        i { color: #d1d5db; }
      }
      .preview-info { flex: 1;
        h4 { font-size: 0.9375rem; font-weight: 600; margin: 0 0 0.25rem; }
        p { font-size: 0.8125rem; color: #6b7280; margin: 0 0 0.25rem; }
        strong { font-size: 0.875rem; color: #059669; }
      }
    }
    .form-group {
      label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
      textarea {
        width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;
        font-size: 0.9375rem; resize: vertical; font-family: inherit;
        &:focus { outline: none; border-color: #f59e0b; }
      }
    }

    /* Toast messages */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; padding: 1rem 1.5rem;
      border-radius: 0.5rem; display: flex; align-items: center; gap: 0.75rem;
      font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      z-index: 2000;
      &.success { background: #10b981; color: white; }
      &.error { background: #ef4444; color: white; }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class BuscarComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private requestService = inject(RequestService);

  properties = signal<Property[]>([]);
  comunas = signal<string[]>([
    'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Vitacura',
    'La Florida', 'Maipú', 'Puente Alto', 'La Reina', 'Macul',
    'Peñalolén', 'San Miguel', 'Estación Central', 'Recoleta', 'Independencia'
  ]);
  loading = signal(false);
  error = signal('');

  // Request modal state
  requestProperty = signal<Property | null>(null);
  sendingRequest = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  filters: PropertyFilterParams = {
    comuna: '',
    priceMax: undefined,
    type: undefined,
    petsAllowed: undefined
  };

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading.set(true);
    this.error.set('');

    const searchFilters: PropertyFilterParams = {
      status: PropertyStatus.AVAILABLE
    };

    if (this.filters.comuna) {
      searchFilters.comuna = this.filters.comuna;
    }
    if (this.filters.priceMax) {
      searchFilters.priceMax = Number(this.filters.priceMax);
    }
    if (this.filters.type) {
      searchFilters.type = this.filters.type as PropertyType;
    }
    if (this.filters.petsAllowed) {
      searchFilters.petsAllowed = true;
    }

    this.propertyService.getProperties(searchFilters).subscribe({
      next: (response) => {
        this.properties.set(response.data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al buscar propiedades');
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    this.loadProperties();
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

  sendRequest(property: Property) {
    this.requestProperty.set(property);
  }

  closeRequestModal() {
    this.requestProperty.set(null);
  }

  confirmRequest(message: string) {
    const property = this.requestProperty();
    if (!property) return;

    this.sendingRequest.set(true);
    this.errorMessage.set('');

    this.requestService.createRequest({
      propertyId: property.id,
      message: message.trim() || undefined
    }).subscribe({
      next: () => {
        this.sendingRequest.set(false);
        this.closeRequestModal();
        this.showSuccess('Solicitud enviada exitosamente');
      },
      error: (err) => {
        this.sendingRequest.set(false);
        this.showError(err.error?.message || 'Error al enviar la solicitud');
      }
    });
  }

  private showSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 4000);
  }
}
