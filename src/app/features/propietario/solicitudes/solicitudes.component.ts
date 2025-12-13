import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { RoomRequest, RequestStatus, RoomRequestWithDetails } from '../../../core/models/room-request.model';

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
        <button class="tab" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
          Pendientes <span class="badge">{{ pendingCount() }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">
          Todas
        </button>
      </div>

      <div class="requests-list">
        @for (request of filteredRequests(); track request.id) {
          <div class="request-card">
            <div class="request-header">
              <div class="sender-info">
                <img [src]="getRequesterAvatar(request.senderId)" class="avatar" alt="Avatar">
                <div>
                  <strong>{{ getRequesterName(request.senderId) }}</strong>
                  <small>{{ getRequesterOccupation(request.senderId) }}</small>
                </div>
              </div>
              <span class="status-badge" [class]="request.status.toLowerCase()">
                {{ getStatusLabel(request.status) }}
              </span>
            </div>
            <div class="request-body">
              <p class="property-info">
                <i class="fas fa-home"></i>
                {{ getPropertyTitle(request.propertyId) }}
              </p>
              <p class="message">{{ request.message }}</p>
              <div class="request-meta">
                <span><i class="fas fa-calendar"></i> {{ request.createdAt | date:'dd MMM yyyy' }}</span>
                @if (request.moveInDate) {
                  <span><i class="fas fa-sign-in-alt"></i> Ingreso: {{ request.moveInDate | date:'dd MMM yyyy' }}</span>
                }
              </div>
            </div>
            @if (request.status === 'PENDING') {
              <div class="request-actions">
                <button class="btn btn-success" (click)="approveRequest(request.id)">
                  <i class="fas fa-check me-1"></i> Aprobar
                </button>
                <button class="btn btn-danger" (click)="rejectRequest(request.id)">
                  <i class="fas fa-times me-1"></i> Rechazar
                </button>
                <button class="btn btn-outline">
                  <i class="fas fa-comment me-1"></i> Mensaje
                </button>
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
        &.active { background: #10b981; color: white; }
        .badge { background: rgba(0,0,0,0.1); padding: 0.125rem 0.5rem; border-radius: 1rem; font-size: 0.75rem; }
      }
    }
    .requests-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      background: white; border-radius: 1rem; padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .sender-info { display: flex; align-items: center; gap: 1rem;
      .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
      strong { display: block; color: #1f2937; }
      small { color: #6b7280; font-size: 0.8125rem; }
    }
    .status-badge {
      padding: 0.375rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      &.pending { background: #fef3c7; color: #d97706; }
      &.approved { background: #d1fae5; color: #059669; }
      &.rejected { background: #fee2e2; color: #dc2626; }
    }
    .request-body {
      .property-info { font-size: 0.9375rem; color: #1f2937; margin: 0 0 0.75rem;
        i { color: #10b981; margin-right: 0.5rem; }
      }
      .message { color: #4b5563; margin: 0 0 1rem; line-height: 1.5; }
    }
    .request-meta { display: flex; gap: 1.5rem; font-size: 0.8125rem; color: #6b7280;
      span { display: flex; align-items: center; gap: 0.375rem; }
    }
    .request-actions {
      display: flex; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
      .btn {
        padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer;
        display: flex; align-items: center; border: none; font-size: 0.875rem;
        &.btn-success { background: #10b981; color: white; }
        &.btn-danger { background: #ef4444; color: white; }
        &.btn-outline { background: white; border: 1px solid #e5e7eb; color: #6b7280; }
      }
    }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white;
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
  activeTab = signal<'pending' | 'all'>('pending');
  pendingCount = signal(0);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      const allRequests = this.mockDataService.getRequestsByReceiver(user.id);
      this.requests.set(allRequests);
      this.pendingCount.set(allRequests.filter(r => r.status === RequestStatus.PENDING).length);
    }
  }

  filteredRequests() {
    if (this.activeTab() === 'pending') {
      return this.requests().filter(r => r.status === RequestStatus.PENDING);
    }
    return this.requests();
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

  getRequesterName(senderId: string): string {
    const user = this.mockDataService.getUserById(senderId);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario';
  }

  getRequesterAvatar(senderId: string): string {
    const user = this.mockDataService.getUserById(senderId);
    return user?.avatar || 'https://ui-avatars.com/api/?name=User';
  }

  getRequesterOccupation(senderId: string): string {
    const user = this.mockDataService.getUserById(senderId) as any;
    return user?.occupation || 'Roomie';
  }

  getPropertyTitle(propertyId?: string): string {
    if (!propertyId) return 'Propiedad';
    const property = this.mockDataService.getPropertyById(propertyId);
    return property?.title || 'Propiedad';
  }

  approveRequest(id: string) {
    console.log('Aprobar solicitud:', id);
  }

  rejectRequest(id: string) {
    console.log('Rechazar solicitud:', id);
  }
}
