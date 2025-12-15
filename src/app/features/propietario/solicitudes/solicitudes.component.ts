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
        <h1>Solicitudes Recibidas</h1>
        <p>Gestiona las solicitudes de arriendo</p>
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
            <div class="request-card" [class.responded]="request.status !== 'PENDING'">
              <div class="request-header">
                <div class="sender-info">
                  <img [src]="request.requester?.avatar || getDefaultAvatar(request.requester)" class="avatar" alt="Avatar">
                  <div>
                    <strong>{{ request.requester?.firstName }} {{ request.requester?.lastName }}</strong>
                    <small>{{ request.requester?.email }}</small>
                  </div>
                </div>
                <span class="status-badge" [class]="request.status.toLowerCase()">
                  {{ getStatusLabel(request.status) }}
                </span>
              </div>
              <div class="request-body">
                <p class="property-info">
                  <i class="fas fa-home"></i>
                  {{ request.room?.property?.title || 'Propiedad' }} - {{ request.room?.name || 'Habitación' }}
                </p>
                @if (request.message) {
                  <p class="message">{{ request.message }}</p>
                }
                <div class="request-meta">
                  <span><i class="fas fa-calendar"></i> {{ request.createdAt | date:'dd MMM yyyy' }}</span>
                  @if (request.proposedMoveIn) {
                    <span><i class="fas fa-sign-in-alt"></i> Ingreso: {{ request.proposedMoveIn | date:'dd MMM yyyy' }}</span>
                  }
                  @if (request.room?.monthlyRent) {
                    <span><i class="fas fa-dollar-sign"></i> \${{ request.room?.monthlyRent | number }}/mes</span>
                  }
                </div>
              </div>
              @if (request.status === 'PENDING') {
                <div class="request-actions">
                  <button class="btn btn-success" (click)="respondRequest(request.id, 'ACCEPTED')" [disabled]="responding()">
                    @if (responding() && respondingId() === request.id) {
                      <i class="fas fa-spinner fa-spin"></i>
                    } @else {
                      <i class="fas fa-check"></i>
                    }
                    Aprobar
                  </button>
                  <button class="btn btn-danger" (click)="openRejectModal(request)" [disabled]="responding()">
                    <i class="fas fa-times"></i> Rechazar
                  </button>
                </div>
              } @else if (request.responseMessage) {
                <div class="response-message">
                  <strong>Respuesta:</strong> {{ request.responseMessage }}
                </div>
              }
            </div>
          } @empty {
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <h3>No hay solicitudes</h3>
              <p>Las solicitudes de arriendo aparecerán aquí</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Reject Modal -->
    @if (rejectingRequest()) {
      <div class="modal-backdrop" (click)="closeRejectModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Rechazar Solicitud</h3>
            <button class="close-btn" (click)="closeRejectModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de rechazar la solicitud de <strong>{{ rejectingRequest()?.requester?.firstName }} {{ rejectingRequest()?.requester?.lastName }}</strong>?</p>
            <div class="form-group">
              <label>Mensaje (opcional)</label>
              <textarea #rejectMessage rows="3" placeholder="Escribe un mensaje para el solicitante..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeRejectModal()">Cancelar</button>
            <button class="btn btn-danger" (click)="confirmReject(rejectMessage.value)" [disabled]="responding()">
              @if (responding()) {
                <i class="fas fa-spinner fa-spin"></i>
              }
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
    }
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
        &.active { background: #10b981; color: white; }
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
    .loading-state i { color: #10b981; }
    .error-state i { color: #ef4444; }
    .requests-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      background: white; border-radius: 1rem; padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      &.responded { opacity: 0.85; }
    }
    .request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .sender-info { display: flex; align-items: center; gap: 1rem;
      .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #e5e7eb; }
      strong { display: block; color: #1f2937; }
      small { color: #6b7280; font-size: 0.8125rem; }
    }
    .status-badge {
      padding: 0.375rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      &.pending { background: #fef3c7; color: #d97706; }
      &.accepted { background: #d1fae5; color: #059669; }
      &.rejected { background: #fee2e2; color: #dc2626; }
      &.cancelled { background: #e5e7eb; color: #6b7280; }
      &.expired { background: #e5e7eb; color: #6b7280; }
    }
    .request-body {
      .property-info { font-size: 0.9375rem; color: #1f2937; margin: 0 0 0.75rem;
        i { color: #10b981; margin-right: 0.5rem; }
      }
      .message { color: #4b5563; margin: 0 0 1rem; line-height: 1.5; font-size: 0.9375rem; }
    }
    .request-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; font-size: 0.8125rem; color: #6b7280;
      span { display: flex; align-items: center; gap: 0.375rem; }
    }
    .request-actions {
      display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
    }
    .response-message {
      margin-top: 1rem; padding: 0.75rem 1rem; background: #f9fafb;
      border-radius: 0.5rem; font-size: 0.875rem; color: #4b5563;
      strong { color: #1f2937; margin-right: 0.5rem; }
    }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 0.5rem; border: none; font-size: 0.875rem;
      transition: all 0.2s;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      &.btn-success { background: #10b981; color: white; &:hover:not(:disabled) { background: #059669; } }
      &.btn-danger { background: #ef4444; color: white; &:hover:not(:disabled) { background: #dc2626; } }
      &.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; &:hover:not(:disabled) { background: #f3f4f6; } }
    }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0; }
    }

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
      h3 { margin: 0; font-size: 1.125rem; font-weight: 600; }
    }
    .close-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; color: #6b7280;
      &:hover { background: #e5e7eb; }
    }
    .modal-body { padding: 1.5rem;
      p { margin: 0 0 1rem; color: #4b5563; }
    }
    .form-group {
      label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
      textarea {
        width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;
        font-size: 0.9375rem; resize: vertical;
        &:focus { outline: none; border-color: #10b981; }
      }
    }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
      border-radius: 0 0 1rem 1rem;
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
  responding = signal(false);
  respondingId = signal<string | null>(null);
  rejectingRequest = signal<RoomRequest | null>(null);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading.set(true);
    this.error.set('');

    this.requestService.getReceivedRequests({ limit: 50 }).subscribe({
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
      'ACCEPTED': 'Aprobada',
      'REJECTED': 'Rechazada',
      'CANCELLED': 'Cancelada',
      'EXPIRED': 'Expirada'
    };
    return labels[status] || status;
  }

  getDefaultAvatar(requester?: { firstName?: string; lastName?: string }): string {
    const name = requester ? `${requester.firstName || ''}+${requester.lastName || ''}` : 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=e5e7eb&color=374151`;
  }

  respondRequest(id: string, status: 'ACCEPTED' | 'REJECTED', message?: string) {
    this.responding.set(true);
    this.respondingId.set(id);

    this.requestService.respondToRequest(id, { status, responseMessage: message }).subscribe({
      next: () => {
        this.responding.set(false);
        this.respondingId.set(null);
        this.rejectingRequest.set(null);
        this.loadRequests();
      },
      error: (err) => {
        this.responding.set(false);
        this.respondingId.set(null);
        alert(err.error?.message || 'Error al responder la solicitud');
      }
    });
  }

  openRejectModal(request: RoomRequest) {
    this.rejectingRequest.set(request);
  }

  closeRejectModal() {
    this.rejectingRequest.set(null);
  }

  confirmReject(message: string) {
    const request = this.rejectingRequest();
    if (request) {
      this.respondRequest(request.id, 'REJECTED', message || undefined);
    }
  }
}
