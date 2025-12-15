import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchService, Match, MatchStatus } from '../../../core/services/match.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="page-header">
        <h1>Mis Matches</h1>
        <p>Conexiones confirmadas con propietarios</p>
      </div>

      <div class="tabs">
        <button class="tab" [class.active]="activeTab() === 'active'" (click)="setTab('active')">
          Activos <span class="badge">{{ activeCount() }}</span>
        </button>
        <button class="tab" [class.active]="activeTab() === 'completed'" (click)="setTab('completed')">
          Completados
        </button>
        <button class="tab" [class.active]="activeTab() === 'all'" (click)="setTab('all')">
          Todos
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando matches...</span>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-secondary" (click)="loadMatches()">Reintentar</button>
        </div>
      } @else {
        <div class="matches-list">
          @for (match of filteredMatches(); track match.id) {
            <div class="match-card" [class.completed]="match.status === 'COMPLETED'" [class.cancelled]="match.status === 'CANCELLED'">
              <div class="match-header">
                <div class="owner-info">
                  <img [src]="getOwnerAvatar(match)" class="avatar" alt="Avatar">
                  <div>
                    <strong>{{ getOwnerName(match) }}</strong>
                    <small>Propietario</small>
                  </div>
                </div>
                <span class="status-badge" [class]="match.status.toLowerCase()">
                  {{ getStatusLabel(match.status) }}
                </span>
              </div>

              <div class="match-body">
                <div class="property-card">
                  <p class="property-title">
                    <i class="fas fa-home"></i>
                    {{ match.room?.property?.title || 'Propiedad' }}
                  </p>
                  <p class="room-name">{{ match.room?.name || 'Habitación' }}</p>
                  @if (match.room?.property?.address) {
                    <p class="address">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ match.room?.property?.address?.comuna }}, {{ match.room?.property?.address?.city }}
                    </p>
                  }
                </div>

                <div class="match-details">
                  <div class="detail-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>\${{ match.monthlyRent | number }}/mes</span>
                  </div>
                  @if (match.moveInDate) {
                    <div class="detail-item">
                      <i class="fas fa-sign-in-alt"></i>
                      <span>Ingreso: {{ match.moveInDate | date:'dd MMM yyyy' }}</span>
                    </div>
                  }
                  @if (match.moveOutDate) {
                    <div class="detail-item">
                      <i class="fas fa-sign-out-alt"></i>
                      <span>Salida: {{ match.moveOutDate | date:'dd MMM yyyy' }}</span>
                    </div>
                  }
                </div>

                <div class="match-badges">
                  <span class="info-badge" [class.success]="match.depositPaid">
                    <i class="fas" [class.fa-check]="match.depositPaid" [class.fa-clock]="!match.depositPaid"></i>
                    Depósito {{ match.depositPaid ? 'pagado' : 'pendiente' }}
                  </span>
                  <span class="info-badge" [class.success]="match.contractSigned">
                    <i class="fas" [class.fa-check]="match.contractSigned" [class.fa-clock]="!match.contractSigned"></i>
                    Contrato {{ match.contractSigned ? 'firmado' : 'pendiente' }}
                  </span>
                </div>

                @if (match.ownerRating) {
                  <div class="rating-section">
                    <strong>Tu calificación al propietario:</strong>
                    <div class="stars">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i class="fas fa-star" [class.filled]="star <= (match.ownerRating || 0)"></i>
                      }
                    </div>
                    @if (match.ownerReview) {
                      <p class="review-text">"{{ match.ownerReview }}"</p>
                    }
                  </div>
                }
              </div>

              <div class="match-actions">
                @if (match.status === 'COMPLETED' && !match.ownerRating) {
                  <button class="btn btn-primary" (click)="openRatingModal(match)">
                    <i class="fas fa-star"></i> Calificar Propietario
                  </button>
                }
                @if (match.room?.property?.owner?.phone) {
                  <a class="btn btn-secondary" [href]="'tel:' + match.room?.property?.owner?.phone">
                    <i class="fas fa-phone"></i> Llamar
                  </a>
                }
                @if (match.conversation?.id) {
                  <a class="btn btn-secondary" routerLink="/roomie/mensajes" [queryParams]="{conversation: match.conversation?.id}">
                    <i class="fas fa-comment"></i> Mensajes
                  </a>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <i class="fas fa-handshake"></i>
              <h3>No tienes matches</h3>
              <p>Cuando un propietario acepte tu solicitud, aparecerá aquí</p>
              <a routerLink="/roomie/buscar" class="btn btn-primary">
                <i class="fas fa-search"></i> Buscar Propiedades
              </a>
            </div>
          }
        </div>
      }
    </div>

    <!-- Rating Modal -->
    @if (ratingMatch()) {
      <div class="modal-backdrop" (click)="closeRatingModal()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Calificar Propietario</h3>
            <button class="close-btn" (click)="closeRatingModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Cómo fue tu experiencia con <strong>{{ getOwnerName(ratingMatch()!) }}</strong>?</p>

            <div class="rating-input">
              <label>Calificación</label>
              <div class="stars-input">
                @for (star of [1,2,3,4,5]; track star) {
                  <i class="fas fa-star"
                     [class.filled]="star <= selectedRating()"
                     (click)="selectedRating.set(star)"></i>
                }
              </div>
            </div>

            <div class="form-group">
              <label>Reseña (opcional)</label>
              <textarea #reviewText rows="3" placeholder="Comparte tu experiencia..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeRatingModal()">Cancelar</button>
            <button class="btn btn-primary"
                    (click)="submitRating(reviewText.value)"
                    [disabled]="selectedRating() === 0 || submittingRating()">
              @if (submittingRating()) {
                <i class="fas fa-spinner fa-spin"></i>
              }
              Enviar Calificación
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
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
    .matches-list { display: flex; flex-direction: column; gap: 1rem; }
    .match-card {
      background: white; border-radius: 1rem; padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      &.completed { border-left: 4px solid #10b981; }
      &.cancelled { opacity: 0.7; border-left: 4px solid #ef4444; }
    }
    .match-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .owner-info { display: flex; align-items: center; gap: 1rem;
      .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; background: #e5e7eb; }
      strong { display: block; color: #1f2937; }
      small { color: #6b7280; font-size: 0.8125rem; }
    }
    .status-badge {
      padding: 0.375rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      &.active, &.pending_payment { background: #fef3c7; color: #d97706; }
      &.confirmed { background: #dbeafe; color: #2563eb; }
      &.completed { background: #d1fae5; color: #059669; }
      &.cancelled { background: #fee2e2; color: #dc2626; }
    }
    .match-body {
      .property-card {
        background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;
        .property-title {
          font-size: 1rem; font-weight: 600; color: #1f2937; margin: 0 0 0.25rem;
          i { color: #f59e0b; margin-right: 0.5rem; }
        }
        .room-name { color: #4b5563; font-size: 0.875rem; margin: 0 0 0.5rem; }
        .address { color: #6b7280; font-size: 0.8125rem; margin: 0;
          i { margin-right: 0.375rem; }
        }
      }
    }
    .match-details { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem;
      .detail-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #4b5563;
        i { color: #6b7280; }
      }
    }
    .match-badges { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;
      .info-badge {
        display: flex; align-items: center; gap: 0.375rem;
        padding: 0.375rem 0.75rem; border-radius: 0.5rem;
        font-size: 0.75rem; background: #fef3c7; color: #d97706;
        &.success { background: #d1fae5; color: #059669; }
      }
    }
    .rating-section {
      padding: 1rem; background: #f9fafb; border-radius: 0.5rem; margin-top: 1rem;
      strong { font-size: 0.875rem; color: #374151; }
      .stars { margin: 0.5rem 0;
        i { color: #d1d5db; font-size: 1rem;
          &.filled { color: #fbbf24; }
        }
      }
      .review-text { font-style: italic; color: #6b7280; font-size: 0.875rem; margin: 0.5rem 0 0; }
    }
    .match-actions {
      display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
    }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer;
      display: inline-flex; align-items: center; gap: 0.5rem; border: none; font-size: 0.875rem;
      transition: all 0.2s; text-decoration: none;
      &:disabled { opacity: 0.6; cursor: not-allowed; }
      &.btn-primary { background: #f59e0b; color: white; &:hover:not(:disabled) { background: #d97706; } }
      &.btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; &:hover:not(:disabled) { background: #f3f4f6; } }
    }
    .empty-state {
      text-align: center; padding: 4rem 2rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #f59e0b; margin-bottom: 1rem; opacity: 0.5; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0 0 1.5rem; }
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
      p { margin: 0 0 1.5rem; color: #4b5563; }
    }
    .rating-input {
      margin-bottom: 1.5rem;
      label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
    }
    .stars-input {
      display: flex; gap: 0.5rem;
      i { font-size: 2rem; color: #d1d5db; cursor: pointer; transition: all 0.2s;
        &:hover, &.filled { color: #fbbf24; }
      }
    }
    .form-group {
      label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem; }
      textarea {
        width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;
        font-size: 0.9375rem; resize: vertical;
        &:focus { outline: none; border-color: #f59e0b; }
      }
    }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
      border-radius: 0 0 1rem 1rem;
    }
  `]
})
export class MatchesComponent implements OnInit {
  private matchService = inject(MatchService);

  matches = signal<Match[]>([]);
  activeTab = signal<'active' | 'completed' | 'all'>('active');
  activeCount = signal(0);
  loading = signal(false);
  error = signal('');
  ratingMatch = signal<Match | null>(null);
  selectedRating = signal(0);
  submittingRating = signal(false);

  ngOnInit() {
    this.loadMatches();
  }

  loadMatches() {
    this.loading.set(true);
    this.error.set('');

    this.matchService.getMyMatches({ limit: 50 }).subscribe({
      next: (response) => {
        this.matches.set(response.data);
        this.activeCount.set(response.data.filter(m =>
          m.status === 'ACTIVE' || m.status === 'PENDING_PAYMENT' || m.status === 'CONFIRMED'
        ).length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar los matches');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: 'active' | 'completed' | 'all') {
    this.activeTab.set(tab);
  }

  filteredMatches(): Match[] {
    const tab = this.activeTab();
    if (tab === 'active') {
      return this.matches().filter(m =>
        m.status === 'ACTIVE' || m.status === 'PENDING_PAYMENT' || m.status === 'CONFIRMED'
      );
    } else if (tab === 'completed') {
      return this.matches().filter(m => m.status === 'COMPLETED');
    }
    return this.matches();
  }

  getStatusLabel(status: MatchStatus): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Activo',
      'PENDING_PAYMENT': 'Pago Pendiente',
      'CONFIRMED': 'Confirmado',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
  }

  getOwnerName(match: Match): string {
    const owner = match.room?.property?.owner;
    if (!owner) return 'Propietario';
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Propietario';
  }

  getOwnerAvatar(match: Match): string {
    const owner = match.room?.property?.owner;
    if (owner?.avatar) return owner.avatar;
    const name = this.getOwnerName(match);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=374151`;
  }

  openRatingModal(match: Match) {
    this.ratingMatch.set(match);
    this.selectedRating.set(0);
  }

  closeRatingModal() {
    this.ratingMatch.set(null);
    this.selectedRating.set(0);
  }

  submitRating(review: string) {
    const match = this.ratingMatch();
    if (!match || this.selectedRating() === 0) return;

    this.submittingRating.set(true);

    this.matchService.rateOwner(match.id, {
      rating: this.selectedRating(),
      review: review || undefined
    }).subscribe({
      next: () => {
        this.submittingRating.set(false);
        this.closeRatingModal();
        this.loadMatches();
      },
      error: (err) => {
        this.submittingRating.set(false);
        alert(err.error?.message || 'Error al enviar la calificación');
      }
    });
  }
}
