import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { RequestService } from '../../../core/services/request.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';

interface SwipeProperty extends Property {
  swipeDirection?: 'left' | 'right' | null;
  isSwiping?: boolean;
  translateX?: number;
  rotate?: number;
}

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4 explore-container">
      <div class="explore-header">
        <h1>Explorar Propiedades</h1>
        <p>Desliza para encontrar tu próximo hogar</p>
        <div class="saved-count" (click)="showSavedModal.set(true)">
          <i class="fas fa-heart"></i>
          <span>{{ savedProperties().length }}</span>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando propiedades...</span>
        </div>
      } @else if (currentProperty()) {
        <div class="swipe-container">
          <!-- Card Stack -->
          <div class="card-stack">
            <!-- Background cards -->
            @for (prop of getVisibleStack(); track prop.id; let i = $index) {
              @if (i > 0) {
                <div class="stack-card" [style.transform]="'scale(' + (1 - i * 0.05) + ') translateY(' + (i * 10) + 'px)'" [style.z-index]="10 - i">
                </div>
              }
            }

            <!-- Main swipeable card -->
            <div class="swipe-card"
                 [class.swiping]="isSwiping()"
                 [class.swipe-left]="swipeDirection() === 'left'"
                 [class.swipe-right]="swipeDirection() === 'right'"
                 [style.transform]="getCardTransform()"
                 (mousedown)="onDragStart($event)"
                 (touchstart)="onTouchStart($event)">

              <!-- Image Gallery -->
              <div class="property-images">
                @if (currentProperty()?.images && currentProperty()!.images!.length > 0) {
                  <img [src]="currentProperty()!.images![currentImageIndex()]" [alt]="currentProperty()?.title">
                  @if (currentProperty()!.images!.length > 1) {
                    <div class="image-indicators">
                      @for (img of currentProperty()!.images!; track $index; let i = $index) {
                        <span class="indicator" [class.active]="i === currentImageIndex()" (click)="setImageIndex(i, $event)"></span>
                      }
                    </div>
                    <button class="nav-btn prev" (click)="prevImage($event)"><i class="fas fa-chevron-left"></i></button>
                    <button class="nav-btn next" (click)="nextImage($event)"><i class="fas fa-chevron-right"></i></button>
                  }
                } @else {
                  <div class="no-image">
                    <i class="fas fa-home"></i>
                  </div>
                }

                <div class="swipe-overlay" [class.visible]="swipeDirection()">
                  @if (swipeDirection() === 'right') {
                    <div class="overlay-content like">
                      <i class="fas fa-heart"></i>
                      <span>ME GUSTA</span>
                    </div>
                  } @else if (swipeDirection() === 'left') {
                    <div class="overlay-content nope">
                      <i class="fas fa-times"></i>
                      <span>PASAR</span>
                    </div>
                  }
                </div>

                <div class="price-badge">\${{ currentProperty()?.monthlyRent | number }}/mes</div>
              </div>

              <!-- Property Info -->
              <div class="property-info">
                <div class="property-header">
                  <div>
                    <h2>{{ currentProperty()?.title }}</h2>
                    <p class="location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ currentProperty()?.address?.comuna }}, {{ currentProperty()?.address?.city }}
                    </p>
                  </div>
                  <span class="type-badge">{{ getTypeLabel(currentProperty()?.type || '') }}</span>
                </div>

                <div class="property-features">
                  <div class="feature">
                    <i class="fas fa-bed"></i>
                    <span>{{ currentProperty()?.features?.totalRooms }} hab.</span>
                  </div>
                  <div class="feature">
                    <i class="fas fa-bath"></i>
                    <span>{{ currentProperty()?.features?.bathrooms }} baños</span>
                  </div>
                  @if (currentProperty()?.features?.squareMeters) {
                    <div class="feature">
                      <i class="fas fa-ruler-combined"></i>
                      <span>{{ currentProperty()?.features?.squareMeters }}m²</span>
                    </div>
                  }
                </div>

                <div class="property-tags">
                  @if (currentProperty()?.features?.hasWifi) {
                    <span class="tag"><i class="fas fa-wifi"></i> WiFi</span>
                  }
                  @if (currentProperty()?.features?.hasFurniture) {
                    <span class="tag"><i class="fas fa-couch"></i> Amoblado</span>
                  }
                  @if (currentProperty()?.rules?.petsAllowed) {
                    <span class="tag"><i class="fas fa-paw"></i> Mascotas</span>
                  }
                  @if (currentProperty()?.features?.hasParking) {
                    <span class="tag"><i class="fas fa-car"></i> Parking</span>
                  }
                </div>

                @if (currentProperty()?.description) {
                  <p class="description">{{ currentProperty()?.description }}</p>
                }
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="action-btn nope" (click)="swipeLeft()">
              <i class="fas fa-times"></i>
            </button>
            <button class="action-btn info" (click)="showDetails()">
              <i class="fas fa-info"></i>
            </button>
            <button class="action-btn like" (click)="swipeRight()">
              <i class="fas fa-heart"></i>
            </button>
          </div>

          <p class="swipe-hint">
            <i class="fas fa-hand-point-up"></i>
            Desliza a la derecha para guardar, izquierda para pasar
          </p>
        </div>
      } @else if (properties().length === 0) {
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No hay más propiedades</h3>
          <p>Has visto todas las propiedades disponibles</p>
          @if (savedProperties().length > 0) {
            <button class="btn btn-primary" (click)="showSavedModal.set(true)">
              Ver guardadas ({{ savedProperties().length }})
            </button>
          }
          <button class="btn btn-secondary" (click)="resetAndReload()">
            <i class="fas fa-redo"></i> Empezar de nuevo
          </button>
        </div>
      }
    </div>

    <!-- Saved Properties Modal -->
    @if (showSavedModal()) {
      <div class="modal-backdrop" (click)="showSavedModal.set(false)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2><i class="fas fa-heart"></i> Propiedades Guardadas</h2>
            <button class="close-btn" (click)="showSavedModal.set(false)">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            @if (savedProperties().length === 0) {
              <div class="empty-saved">
                <i class="far fa-heart"></i>
                <p>No has guardado propiedades aún</p>
              </div>
            } @else {
              <div class="saved-list">
                @for (property of savedProperties(); track property.id) {
                  <div class="saved-item">
                    <div class="saved-image">
                      @if (property.images && property.images.length > 0) {
                        <img [src]="property.images[0]" [alt]="property.title">
                      } @else {
                        <div class="no-img"><i class="fas fa-home"></i></div>
                      }
                    </div>
                    <div class="saved-info">
                      <h4>{{ property.title }}</h4>
                      <p>{{ property.address?.comuna }}</p>
                      <strong>\${{ property.monthlyRent | number }}/mes</strong>
                    </div>
                    <div class="saved-actions">
                      <button class="btn-icon" (click)="sendRequest(property)" title="Enviar solicitud">
                        <i class="fas fa-paper-plane"></i>
                      </button>
                      <button class="btn-icon remove" (click)="removeFromSaved(property)" title="Quitar">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Request Modal -->
    @if (requestProperty()) {
      <div class="modal-backdrop" (click)="closeRequestModal()">
        <div class="modal-container request-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Enviar Solicitud</h2>
            <button class="close-btn" (click)="closeRequestModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>¿Deseas enviar una solicitud para <strong>{{ requestProperty()?.title }}</strong>?</p>
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
  `,
  styles: [`
    .explore-container { min-height: calc(100vh - 64px); display: flex; flex-direction: column; align-items: center; }
    .explore-header {
      width: 100%; max-width: 500px;
      display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-bottom: 1rem;
      h1 { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin: 0; flex: 1; }
      p { width: 100%; color: #6b7280; margin: 0; font-size: 0.875rem; order: 3; }
      .saved-count {
        display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
        background: #fef2f2; border-radius: 2rem; cursor: pointer; transition: all 0.2s;
        i { color: #ef4444; }
        span { font-weight: 600; color: #ef4444; }
        &:hover { background: #fee2e2; }
      }
    }
    .swipe-container { width: 100%; max-width: 500px; }
    .loading-state {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #6b7280; gap: 1rem;
      i { font-size: 2rem; color: #f59e0b; }
    }
    .swipe-container { flex: 1; display: flex; flex-direction: column; }
    .card-stack { position: relative; flex: 1; perspective: 1000px; }
    .stack-card {
      position: absolute; top: 0; left: 0; right: 0; bottom: 60px;
      background: white; border-radius: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .swipe-card {
      position: absolute; top: 0; left: 0; right: 0; bottom: 60px;
      background: white; border-radius: 1.5rem; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); cursor: grab; user-select: none;
      z-index: 10; transition: box-shadow 0.2s;
      &.swiping { cursor: grabbing; transition: none; }
      &.swipe-left, &.swipe-right { transition: transform 0.3s ease-out, opacity 0.3s; }
      &.swipe-left { transform: translateX(-150%) rotate(-20deg) !important; opacity: 0; }
      &.swipe-right { transform: translateX(150%) rotate(20deg) !important; opacity: 0; }
    }
    .property-images {
      height: 55%; position: relative; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
      .no-image {
        width: 100%; height: 100%; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        display: flex; align-items: center; justify-content: center;
        i { font-size: 4rem; color: #d1d5db; }
      }
    }
    .image-indicators {
      position: absolute; top: 1rem; left: 50%; transform: translateX(-50%);
      display: flex; gap: 0.375rem;
      .indicator {
        width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5);
        cursor: pointer; transition: all 0.2s;
        &.active { width: 24px; border-radius: 4px; background: white; }
      }
    }
    .nav-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      width: 40px; height: 40px; border-radius: 50%; border: none;
      background: rgba(255,255,255,0.9); cursor: pointer; font-size: 1rem; color: #374151;
      &.prev { left: 0.75rem; }
      &.next { right: 0.75rem; }
      &:hover { background: white; }
    }
    .swipe-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.2s;
      &.visible { opacity: 1; }
      .overlay-content {
        padding: 1rem 2rem; border-radius: 0.5rem; border: 4px solid;
        transform: rotate(-20deg); font-weight: 800; font-size: 1.5rem;
        display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
        &.like { border-color: #10b981; color: #10b981; background: rgba(16,185,129,0.1); }
        &.nope { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.1); }
        i { font-size: 2rem; }
      }
    }
    .price-badge {
      position: absolute; bottom: 1rem; left: 1rem;
      background: rgba(0,0,0,0.85); color: white;
      padding: 0.5rem 1rem; border-radius: 0.5rem;
      font-weight: 700; font-size: 1.125rem;
    }
    .property-info { padding: 1.25rem; height: 45%; overflow-y: auto; }
    .property-header {
      display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;
      h2 { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      .location { font-size: 0.875rem; color: #6b7280; margin: 0;
        i { color: #f59e0b; margin-right: 0.375rem; }
      }
      .type-badge {
        padding: 0.25rem 0.75rem; background: #fef3c7; color: #d97706;
        border-radius: 1rem; font-size: 0.6875rem; font-weight: 600; white-space: nowrap;
      }
    }
    .property-features {
      display: flex; gap: 1.25rem; margin-bottom: 0.75rem;
      .feature { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; color: #6b7280;
        i { color: #9ca3af; }
      }
    }
    .property-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;
      .tag {
        padding: 0.25rem 0.625rem; background: #f3f4f6;
        border-radius: 0.375rem; font-size: 0.75rem; color: #6b7280;
        display: flex; align-items: center; gap: 0.25rem;
      }
    }
    .description { font-size: 0.875rem; color: #6b7280; margin: 0; line-height: 1.5; }
    .action-buttons {
      display: flex; justify-content: center; gap: 1.5rem; padding: 1rem 0;
      .action-btn {
        width: 60px; height: 60px; border-radius: 50%; border: none;
        cursor: pointer; font-size: 1.5rem; transition: all 0.2s;
        display: flex; align-items: center; justify-content: center;
        &.nope { background: white; color: #ef4444; box-shadow: 0 4px 12px rgba(239,68,68,0.2);
          &:hover { transform: scale(1.1); background: #fef2f2; }
        }
        &.info { background: white; color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.2); width: 48px; height: 48px; font-size: 1.25rem;
          &:hover { transform: scale(1.1); background: #eff6ff; }
        }
        &.like { background: white; color: #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.2);
          &:hover { transform: scale(1.1); background: #ecfdf5; }
        }
      }
    }
    .swipe-hint { text-align: center; font-size: 0.8125rem; color: #9ca3af; margin: 0;
      i { margin-right: 0.375rem; }
    }
    .empty-state {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; text-align: center; padding: 2rem;
      i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0 0 1.5rem; }
      .btn { margin-bottom: 0.75rem; }
    }
    .btn {
      padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600;
      cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-primary { background: #f59e0b; color: white; &:hover:not(:disabled) { background: #d97706; } &:disabled { opacity: 0.6; } }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; &:hover { background: #f3f4f6; } }

    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center;
      justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-container {
      background: white; border-radius: 1rem; width: 100%; max-width: 500px;
      max-height: 80vh; display: flex; flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      &.request-modal { max-width: 400px; }
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid #e5e7eb;
      h2 { margin: 0; font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;
        i { color: #ef4444; }
      }
    }
    .close-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; color: #6b7280;
      &:hover { background: #e5e7eb; }
    }
    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
      border-radius: 0 0 1rem 1rem;
    }
    .empty-saved { text-align: center; padding: 3rem; color: #9ca3af;
      i { font-size: 3rem; margin-bottom: 1rem; }
    }
    .saved-list { display: flex; flex-direction: column; gap: 1rem; }
    .saved-item {
      display: flex; gap: 1rem; padding: 1rem; background: #f9fafb;
      border-radius: 0.75rem; align-items: center;
      .saved-image {
        width: 80px; height: 60px; border-radius: 0.5rem; overflow: hidden; flex-shrink: 0;
        img { width: 100%; height: 100%; object-fit: cover; }
        .no-img { width: 100%; height: 100%; background: #e5e7eb; display: flex; align-items: center; justify-content: center;
          i { color: #d1d5db; }
        }
      }
      .saved-info { flex: 1; min-width: 0;
        h4 { font-size: 0.9375rem; font-weight: 600; color: #1f2937; margin: 0 0 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        p { font-size: 0.8125rem; color: #6b7280; margin: 0 0 0.25rem; }
        strong { font-size: 0.875rem; color: #059669; }
      }
      .saved-actions { display: flex; gap: 0.5rem;
        .btn-icon {
          width: 36px; height: 36px; border-radius: 0.5rem; border: 1px solid #e5e7eb;
          background: white; cursor: pointer; color: #6b7280;
          &:hover { border-color: #f59e0b; color: #f59e0b; }
          &.remove:hover { border-color: #ef4444; color: #ef4444; }
        }
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
  `]
})
export class ExplorarComponent implements OnInit {
  private propertyService = inject(PropertyService);
  private requestService = inject(RequestService);
  private favoriteService = inject(FavoriteService);

  properties = signal<SwipeProperty[]>([]);
  savedProperties = signal<Property[]>([]);
  savedPropertyIds = signal<Set<string>>(new Set());
  skippedIds = signal<Set<string>>(new Set());
  currentIndex = signal(0);
  loading = signal(false);
  loadingFavorites = signal(false);
  currentImageIndex = signal(0);

  // Swipe state
  isSwiping = signal(false);
  swipeDirection = signal<'left' | 'right' | null>(null);
  startX = 0;
  currentX = 0;

  // Modals
  showSavedModal = signal(false);
  requestProperty = signal<Property | null>(null);
  sendingRequest = signal(false);

  ngOnInit() {
    this.loadFavorites();
    this.loadProperties();
  }

  private loadFavorites() {
    this.loadingFavorites.set(true);
    this.favoriteService.getMyFavorites({ limit: 100 }).subscribe({
      next: (response) => {
        const favorites = response.data || [];
        const properties = favorites.map(f => f.property).filter(p => p) as Property[];
        const ids = new Set(favorites.map(f => f.propertyId));
        this.savedProperties.set(properties);
        this.savedPropertyIds.set(ids);
        this.loadingFavorites.set(false);
      },
      error: () => {
        this.loadingFavorites.set(false);
      }
    });
  }

  loadProperties() {
    this.loading.set(true);

    this.propertyService.getProperties({ status: PropertyStatus.AVAILABLE, limit: 50 }).subscribe({
      next: (response) => {
        const savedIds = this.savedPropertyIds();
        const filtered = (response.data || []).filter(p =>
          !savedIds.has(p.id) &&
          !this.skippedIds().has(p.id)
        );
        this.properties.set(filtered);
        this.currentIndex.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  currentProperty(): SwipeProperty | null {
    const props = this.properties();
    const idx = this.currentIndex();
    return idx < props.length ? props[idx] : null;
  }

  getVisibleStack(): SwipeProperty[] {
    const props = this.properties();
    const idx = this.currentIndex();
    return props.slice(idx, idx + 3);
  }

  getCardTransform(): string {
    if (!this.isSwiping()) return '';
    const diff = this.currentX - this.startX;
    const rotate = diff * 0.05;
    return `translateX(${diff}px) rotate(${rotate}deg)`;
  }

  onDragStart(event: MouseEvent) {
    this.startDrag(event.clientX);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onTouchStart(event: TouchEvent) {
    this.startDrag(event.touches[0].clientX);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('touchend', this.onTouchEnd);
  }

  private startDrag(x: number) {
    this.startX = x;
    this.currentX = x;
    this.isSwiping.set(true);
    this.swipeDirection.set(null);
  }

  private onMouseMove = (e: MouseEvent) => this.onDragMove(e.clientX);
  private onTouchMove = (e: TouchEvent) => this.onDragMove(e.touches[0].clientX);

  private onDragMove(x: number) {
    if (!this.isSwiping()) return;
    this.currentX = x;
    const diff = x - this.startX;
    if (diff > 50) {
      this.swipeDirection.set('right');
    } else if (diff < -50) {
      this.swipeDirection.set('left');
    } else {
      this.swipeDirection.set(null);
    }
  }

  private onMouseUp = () => this.endDrag();
  private onTouchEnd = () => this.endDrag();

  private endDrag() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);

    const diff = this.currentX - this.startX;
    if (diff > 100) {
      this.performSwipe('right');
    } else if (diff < -100) {
      this.performSwipe('left');
    } else {
      this.isSwiping.set(false);
      this.swipeDirection.set(null);
    }
  }

  swipeLeft() {
    this.swipeDirection.set('left');
    this.performSwipe('left');
  }

  swipeRight() {
    this.swipeDirection.set('right');
    this.performSwipe('right');
  }

  private performSwipe(direction: 'left' | 'right') {
    const property = this.currentProperty();
    if (!property) return;

    this.swipeDirection.set(direction);
    this.isSwiping.set(false);

    setTimeout(() => {
      if (direction === 'right') {
        // Add to favorites via API
        this.favoriteService.addFavorite(property.id).subscribe({
          next: () => {
            this.savedProperties.update(saved => [...saved, property]);
            this.savedPropertyIds.update(ids => new Set([...ids, property.id]));
          },
          error: (err) => {
            console.error('Error adding favorite:', err);
          }
        });
      } else {
        this.skippedIds.update(ids => new Set([...ids, property.id]));
      }

      this.currentImageIndex.set(0);
      this.currentIndex.update(i => i + 1);
      this.swipeDirection.set(null);
    }, 300);
  }

  showDetails() {
    const property = this.currentProperty();
    if (property) {
      this.requestProperty.set(property);
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    const images = this.currentProperty()?.images || [];
    if (images.length > 1) {
      this.currentImageIndex.update(i => (i - 1 + images.length) % images.length);
    }
  }

  nextImage(event: Event) {
    event.stopPropagation();
    const images = this.currentProperty()?.images || [];
    if (images.length > 1) {
      this.currentImageIndex.update(i => (i + 1) % images.length);
    }
  }

  setImageIndex(index: number, event: Event) {
    event.stopPropagation();
    this.currentImageIndex.set(index);
  }

  removeFromSaved(property: Property) {
    this.favoriteService.removeFavorite(property.id).subscribe({
      next: () => {
        this.savedProperties.update(saved => saved.filter(p => p.id !== property.id));
        this.savedPropertyIds.update(ids => {
          const newIds = new Set(ids);
          newIds.delete(property.id);
          return newIds;
        });
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
      }
    });
  }

  sendRequest(property: Property) {
    this.requestProperty.set(property);
    this.showSavedModal.set(false);
  }

  closeRequestModal() {
    this.requestProperty.set(null);
  }

  confirmRequest(message: string) {
    const property = this.requestProperty();
    if (!property) return;

    this.sendingRequest.set(true);

    this.requestService.createRequest({
      propertyId: property.id,
      message: message.trim() || undefined
    }).subscribe({
      next: () => {
        this.sendingRequest.set(false);
        this.closeRequestModal();
        this.removeFromSaved(property);
        // Show success message - could be improved with a toast
        alert('Solicitud enviada exitosamente');
      },
      error: (err) => {
        this.sendingRequest.set(false);
        alert(err.error?.message || 'Error al enviar la solicitud');
      }
    });
  }

  resetAndReload() {
    this.skippedIds.set(new Set());
    this.currentIndex.set(0);
    this.loadProperties();
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'APARTMENT': 'Departamento',
      'HOUSE': 'Casa',
      'STUDIO': 'Estudio',
      'LOFT': 'Loft',
      'SHARED_APARTMENT': 'Depto. Compartido'
    };
    return labels[type] || type;
  }

}
