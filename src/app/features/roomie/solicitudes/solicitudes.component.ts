import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService, RoomRequest } from '../../../core/services/request.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Mis Solicitudes</h1>
        <p>Seguimiento de tus solicitudes enviadas</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'pending'" (click)="setTab('pending')">
          Pendientes <span class="badge">{{ pendingCount() }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          Todas
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando solicitudes...</span>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-secondary" (click)="loadRequests()">Reintentar</button>
        </div>
      } @else {
        <div class="requests-list">
          @for (request of filteredRequests(); track request.id) {
            <div class="request-card">
              <div class="request-status-bar" [class]="request.status.toLowerCase()"></div>
              <div class="request-content">
                <div class="property-info">
                  <h3>{{ request.room?.property?.title || 'Propiedad' }}</h3>
                  <p>{{ request.room?.name || 'Habitación' }} • {{ getAddress(request) }}</p>
                </div>
                <div class="request-meta">
                  <span class="date">
                    <i class="fas fa-calendar"></i>
                    {{ request.createdAt | date:'dd MMM yyyy' }}
                  </span>
                  <span class="status" [class]="request.status.toLowerCase()">
                    {{ getStatusLabel(request.status) }}
                  </span>
                </div>
                @if (request.message) {
                  <p class="message">{{ request.message }}</p>
                }
                <div class="request-details">
                  @if (request.proposedMoveIn) {
                    <span><i class="fas fa-sign-in-alt"></i> Ingreso: {{ request.proposedMoveIn | date:'dd MMM yyyy' }}</span>
                  }
                  @if (request.room?.monthlyRent) {
                    <span><i class="fas fa-dollar-sign"></i> \${{ request.room?.monthlyRent | number }}/mes</span>
                  }
                </div>
                @if (request.responseMessage) {
                  <div class="response">
                    <strong>Respuesta del propietario:</strong>
                    <p>{{ request.responseMessage }}</p>
                  </div>
                }
                @if (request.status === 'PENDING') {
                  <div class="request-actions">
                    <button class="btn btn-danger" (click)="cancelRequest(request.id)" [disabled]="cancelling()">
                      @if (cancelling() && cancellingId() === request.id) {
                        <i class="fas fa-spinner fa-spin"></i>
                      } @else {
                        <i class="fas fa-times"></i>
                      }
                      Cancelar Solicitud
                    </button>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <i class="fas fa-paper-plane"></i>
              <h3>No has enviado solicitudes</h3>
              <p>Explora propiedades y envía tu primera solicitud</p>
              <a routerLink="/roomie/buscar" class="btn btn-primary">
                <i class="fas fa-search"></i> Buscar Propiedades
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
      .tab {
        padding: 0.75rem 1.25rem; border: none; background: #f3f4f6;
        border-radius: 0.5rem; font-weight: 500; color: #6b7280; cursor: pointer;
        display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
        &.active { background: #f59e0b; color: white; }
        &:hover:not(.active) { background: #e5e7eb; }
        .badge { background: rgba(0,0,0,0.1); padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; }
      }
    }
    .loading-state, .error-state {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 4rem; color: #6b7280; gap: 1rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 2rem; }
    }
    .loading-state i { color: #f59e0b; }
    .error-state i { color: #ef4444; }
    .requests-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      background: white; border-radius: 1rem; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex;
    }
    .request-status-bar { width: 6px;
      &.pending { background: #f59e0b; }
      &.accepted { background: #10b981; }
      &.rejected { background: #ef4444; }
      &.cancelled { background: #6b7280; }
      &.expired { background: #9ca3af; }
    }
    .request-content { padding: 1.5rem; flex: 1; }
    .property-info { margin-bottom: 1rem;
      h3 { font-size: 1.125rem; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; font-size: 0.875rem; }
    }
    .request-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
      .date { font-size: 0.8125rem; color: #6b7280; display: flex; align-items: center; gap: 0.375rem; }
      .status {
        padding: 0.375rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
        &.pending { background: #fef3c7; color: #d97706; }
        &.accepted { background: #d1fae5; color: #059669; }
        &.rejected { background: #fee2e2; color: #dc2626; }
        &.cancelled { background: #e5e7eb; color: #6b7280; }
        &.expired { background: #f3f4f6; color: #9ca3af; }
      }
    }
    .message { color: #4b5563; margin: 0 0 1rem; line-height: 1.5; font-size: 0.9375rem; }
    .request-details {
      display: flex; flex-wrap: wrap; gap: 1.5rem; font-size: 0.8125rem; color: #6b7280; margin-bottom: 1rem;
      span { display: flex; align-items: center; gap: 0.375rem; }
    }
    .response {
      margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;
      strong { display: block; color: #1f2937; margin-bottom: 0.5rem; font-size: 0.8125rem; }
      p { margin: 0; color: #4b5563; font-size: 0.875rem; }
    }
    .request-actions {
      margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
    }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.5rem; border: none; font-size: 0.875rem;
      transition: all 0.2s; text-decoration: none;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      &.btn-primary { background: #f59e0b; color: white; &:hover:not(:disabled) { background: #d97706; } }
      &.btn-danger { background: #ef4444; color: white; &:hover:not(:disabled) { background: #dc2626; } }
      &.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; &:hover:not(:disabled) { background: #f3f4f6; } }
    }
    .empty-state {
      text-align: center; padding: 4rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0 0 1.5rem; }
    }
  `]
})
export class SolicitudesComponent implements OnInit {
  private requestService = inject(RequestService);

  requests = signal<RoomRequest[]>([]);
  activeTab = signal<'pending' | 'all'>('pending');
  pendingCount = signal(0);
  loading = signal(false);
  error = signal('');
  cancelling = signal(false);
  cancellingId = signal<string | null>(null);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.error.set('');

    this.requestService.getMyRequests({ limit: 50 }).subscribe({
      next: (response) => {
        this.requests.set(response.data);
        this.pendingCount.set(response.data.filter(r => r.status === 'PENDING').length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar las solicitudes');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'pending' | 'all') {
    this.activeTab.set(tab);
  }

  filteredRequests() {
    if (this.activeTab() === 'pending') {
      return this.requests().filter(r => r.status === 'PENDING');
    }
    return this.requests();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'ACCEPTED': 'Aceptada',
      'REJECTED': 'Rechazada',
      'CANCELLED': 'Cancelada',
      'EXPIRED': 'Expirada'
    };
    return labels[status] || status;
  }

  getAddress(request: RoomRequest): string {
    const address = request.room?.property?.address;
    if (!address) return '';
    return `${address.comuna || ''}, ${address.city || ''}`;
  }

  cancelRequest(id: string) {
    if (!confirm('¿Estás seguro de cancelar esta solicitud?')) return;

    this.cancelling.set(true);
    this.cancellingId.set(id);

    this.requestService.cancelRequest(id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.cancellingId.set(null);
        this.loadRequests();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.cancellingId.set(null);
        alert(err.error?.message || 'Error al cancelar la solicitud');
      }
    });
  }
}
