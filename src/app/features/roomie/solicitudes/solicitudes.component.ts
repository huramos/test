import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { RoomRequest, RequestStatus } from '../../../core/models/room-request.model';

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

      <div class="requests-list">
        @for (request of requests(); track request.id) {
          <div class="request-card">
            <div class="request-status-bar" [class]="request.status.toLowerCase()"></div>
            <div class="request-content">
              <div class="property-info">
                <h3>{{ getPropertyTitle(request.propertyId) }}</h3>
                <p>{{ getPropertyLocation(request.propertyId) }}</p>
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
              <p class="message">{{ request.message }}</p>
              @if (request.responseMessage) {
                <div class="response">
                  <strong>Respuesta:</strong>
                  <p>{{ request.responseMessage }}</p>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fas fa-paper-plane"></i>
            <h3>No has enviado solicitudes</h3>
            <p>Explora propiedades y envía tu primera solicitud</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .requests-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      background: white; border-radius: 1rem; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex;
    }
    .request-status-bar { width: 6px;
      &.pending { background: #f59e0b; }
      &.approved { background: #10b981; }
      &.rejected { background: #ef4444; }
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
        &.approved { background: #d1fae5; color: #059669; }
        &.rejected { background: #fee2e2; color: #dc2626; }
      }
    }
    .message { color: #4b5563; margin: 0; line-height: 1.5; font-size: 0.9375rem; }
    .response {
      margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;
      strong { display: block; color: #1f2937; margin-bottom: 0.5rem; font-size: 0.8125rem; }
      p { margin: 0; color: #4b5563; font-size: 0.875rem; }
    }
    .empty-state {
      text-align: center; padding: 4rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0; }
    }
  `]
})
export class SolicitudesComponent implements OnInit {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  requests = signal<RoomRequest[]>([]);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.requests.set(this.mockDataService.getRequestsBySender(user.id));
    }
  }

  getStatusLabel(status: RequestStatus): string {
    const labels: Record<RequestStatus, string> = {
      [RequestStatus.PENDING]: 'Pendiente',
      [RequestStatus.APPROVED]: 'Aprobada',
      [RequestStatus.REJECTED]: 'Rechazada',
      [RequestStatus.CANCELLED]: 'Cancelada',
      [RequestStatus.EXPIRED]: 'Expirada'
    };
    return labels[status];
  }

  getPropertyTitle(propertyId?: string): string {
    if (!propertyId) return 'Propiedad';
    const property = this.mockDataService.getPropertyById(propertyId);
    return property?.title || 'Propiedad';
  }

  getPropertyLocation(propertyId?: string): string {
    if (!propertyId) return '';
    const property = this.mockDataService.getPropertyById(propertyId);
    return property ? `${property.address.comuna}, ${property.address.city}` : '';
  }
}
