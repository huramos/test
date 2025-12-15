import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User, UserRole, UserStatus } from '../../../core/services/user.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios de la plataforma</p>
        </div>
        <div class="header-stats">
          <div class="stat">
            <span class="value">{{ totalUsers() }}</span>
            <span class="label">Total</span>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label>Rol</label>
          <select [(ngModel)]="filterRole" (change)="loadUsers()">
            <option value="">Todos</option>
            <option value="PROPIETARIO">Propietarios</option>
            <option value="ROOMIE">Roomies</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Estado</label>
          <select [(ngModel)]="filterStatus" (change)="loadUsers()">
            <option value="">Todos</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="PENDING">Pendientes</option>
            <option value="BANNED">Baneados</option>
          </select>
        </div>
        <div class="filter-group search">
          <label>Buscar</label>
          <input type="text" [(ngModel)]="searchTerm" (keyup.enter)="loadUsers()" placeholder="Email...">
        </div>
        <button class="btn btn-secondary" (click)="clearFilters()">
          <i class="fas fa-times"></i> Limpiar
        </button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Cargando usuarios...</span>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="loadUsers()">Reintentar</button>
        </div>
      } @else {
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td>
                    <div class="user-cell">
                      <img [src]="user.avatar || getDefaultAvatar(user)" class="avatar" alt="">
                      <span>{{ user.firstName }} {{ user.lastName }}</span>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td><span class="role-badge" [class]="user.role.toLowerCase()">{{ getRoleLabel(user.role) }}</span></td>
                  <td><span class="status-badge" [class]="user.status.toLowerCase()">{{ getStatusLabel(user.status) }}</span></td>
                  <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="actions">
                      <button class="btn-icon" title="Ver detalles" (click)="viewUser(user)">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-icon" title="Cambiar estado" (click)="openStatusModal(user)">
                        <i class="fas fa-toggle-on"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-row">
                    <i class="fas fa-users"></i>
                    <p>No se encontraron usuarios</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="currentPage() === 1" (click)="changePage(currentPage() - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            <span>Página {{ currentPage() }} de {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="currentPage() === totalPages()" (click)="changePage(currentPage() + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        }
      }

      <!-- View User Modal -->
      @if (selectedUser()) {
        <div class="modal-backdrop" (click)="closeModals()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Detalle de Usuario</h2>
              <button class="close-btn" (click)="closeModals()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="user-detail">
                <img [src]="selectedUser()?.avatar || getDefaultAvatar(selectedUser())" class="detail-avatar" alt="">
                <h3>{{ selectedUser()?.firstName }} {{ selectedUser()?.lastName }}</h3>
                <span class="role-badge" [class]="selectedUser()?.role?.toLowerCase()">
                  {{ getRoleLabel(selectedUser()?.role || '') }}
                </span>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Email</label>
                  <span>{{ selectedUser()?.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Teléfono</label>
                  <span>{{ selectedUser()?.phone || 'No registrado' }}</span>
                </div>
                <div class="detail-item">
                  <label>Estado</label>
                  <span class="status-badge" [class]="selectedUser()?.status?.toLowerCase()">
                    {{ getStatusLabel(selectedUser()?.status || '') }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Registro</label>
                  <span>{{ selectedUser()?.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModals()">Cerrar</button>
              <button class="btn btn-primary" (click)="openStatusModal(selectedUser()!)">
                <i class="fas fa-edit"></i> Cambiar Estado
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Status Modal -->
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
              <p class="modal-subtitle">{{ userToEdit()?.firstName }} {{ userToEdit()?.lastName }}</p>
              <div class="status-options">
                @for (status of statusOptions; track status.value) {
                  <label class="status-option" [class.selected]="newStatus === status.value">
                    <input type="radio" [value]="status.value" [(ngModel)]="newStatus" name="status">
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
              <button class="btn btn-primary" (click)="updateStatus()" [disabled]="updating()">
                @if (updating()) {
                  <i class="fas fa-spinner fa-spin"></i>
                }
                Guardar
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
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .header-stats .stat {
      background: white; padding: 0.75rem 1.25rem; border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;
      .value { display: block; font-size: 1.5rem; font-weight: 700; color: #6366f1; }
      .label { font-size: 0.75rem; color: #6b7280; }
    }
    .filters-section {
      display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;
      background: white; padding: 1.25rem; border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;
    }
    .filter-group {
      display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px;
      &.search { flex: 1; min-width: 200px; }
      label { font-size: 0.8125rem; font-weight: 500; color: #4b5563; }
      select, input {
        padding: 0.5rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; font-size: 0.875rem;
        &:focus { outline: none; border-color: #6366f1; }
      }
    }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer;
      border: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-primary { background: #6366f1; color: white; &:hover:not(:disabled) { background: #4f46e5; } }
    .btn-secondary { background: white; border: 1px solid #d1d5db; color: #374151; &:hover { background: #f3f4f6; } }
    .loading-state, .error-state {
      display: flex; flex-direction: column; align-items: center; padding: 4rem;
      color: #6b7280; gap: 1rem; background: white; border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 2rem; }
    }
    .loading-state i { color: #6366f1; }
    .error-state i { color: #ef4444; }
    .users-table {
      background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
      th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.8125rem; }
      td { font-size: 0.875rem; color: #4b5563; }
      tr:hover td { background: #f9fafb; }
    }
    .user-cell { display: flex; align-items: center; gap: 0.75rem;
      .avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #e5e7eb; }
      span { font-weight: 500; color: #1f2937; }
    }
    .role-badge {
      padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      &.propietario { background: #d1fae5; color: #059669; }
      &.roomie { background: #fef3c7; color: #d97706; }
      &.admin { background: #dbeafe; color: #2563eb; }
    }
    .status-badge {
      padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      &.active { background: #d1fae5; color: #059669; }
      &.inactive { background: #e5e7eb; color: #6b7280; }
      &.pending { background: #fef3c7; color: #d97706; }
      &.banned { background: #fee2e2; color: #dc2626; }
    }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon {
      width: 32px; height: 32px; border-radius: 0.375rem;
      border: 1px solid #e5e7eb; background: white;
      display: flex; align-items: center; justify-content: center;
      color: #6b7280; cursor: pointer;
      &:hover { border-color: #6366f1; color: #6366f1; }
    }
    .empty-row {
      text-align: center; padding: 3rem !important;
      i { font-size: 2rem; color: #d1d5db; margin-bottom: 0.5rem; display: block; }
      p { margin: 0; color: #6b7280; }
    }
    .pagination {
      display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem;
      span { font-size: 0.875rem; color: #6b7280; }
      .page-btn {
        width: 36px; height: 36px; border-radius: 0.5rem;
        border: 1px solid #e5e7eb; background: white; cursor: pointer;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
      }
    }
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex;
      align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-container {
      background: white; border-radius: 1rem; width: 100%; max-width: 480px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      &.status-modal { max-width: 400px; }
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
    .modal-subtitle { margin: 0 0 1rem; color: #6b7280; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #f9fafb;
      border-radius: 0 0 1rem 1rem;
    }
    .user-detail {
      text-align: center; margin-bottom: 1.5rem;
      .detail-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; background: #e5e7eb; }
      h3 { margin: 0 0 0.5rem; font-size: 1.25rem; color: #1f2937; }
    }
    .detail-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
      .detail-item {
        label { display: block; font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem; }
        span { font-size: 0.9375rem; color: #1f2937; }
      }
    }
    .status-options { display: flex; flex-direction: column; gap: 0.75rem; }
    .status-option {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem; border: 2px solid #e5e7eb; border-radius: 0.75rem; cursor: pointer;
      input { display: none; }
      &:hover { border-color: #c7d2fe; }
      &.selected { border-color: #6366f1; background: #eef2ff; }
      .option-content { display: flex; flex-direction: column; gap: 0.25rem;
        small { color: #6b7280; font-size: 0.8125rem; }
      }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal('');
  totalUsers = signal(0);
  totalPages = signal(1);
  currentPage = signal(1);

  selectedUser = signal<User | null>(null);
  showStatusModal = signal(false);
  userToEdit = signal<User | null>(null);
  newStatus = '';
  updating = signal(false);

  filterRole = '';
  filterStatus = '';
  searchTerm = '';

  statusOptions = [
    { value: 'ACTIVE', label: 'Activo', description: 'Usuario activo y verificado' },
    { value: 'INACTIVE', label: 'Inactivo', description: 'Usuario desactivado temporalmente' },
    { value: 'PENDING', label: 'Pendiente', description: 'Pendiente de verificación' },
    { value: 'BANNED', label: 'Baneado', description: 'Usuario bloqueado de la plataforma' }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set('');

    const params: any = { page: this.currentPage(), limit: 20 };
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalUsers.set(response.meta.total);
        this.totalPages.set(response.meta.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  clearFilters() {
    this.filterRole = '';
    this.filterStatus = '';
    this.searchTerm = '';
    this.currentPage.set(1);
    this.loadUsers();
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
  }

  viewUser(user: User) {
    this.selectedUser.set(user);
  }

  openStatusModal(user: User) {
    this.userToEdit.set(user);
    this.newStatus = user.status;
    this.showStatusModal.set(true);
    this.selectedUser.set(null);
  }

  closeModals() {
    this.selectedUser.set(null);
    this.showStatusModal.set(false);
    this.userToEdit.set(null);
  }

  updateStatus() {
    const user = this.userToEdit();
    if (!user || !this.newStatus) return;

    this.updating.set(true);

    this.userService.updateUserStatus(user.id, this.newStatus as UserStatus).subscribe({
      next: () => {
        this.updating.set(false);
        this.closeModals();
        this.loadUsers();
      },
      error: (err) => {
        this.updating.set(false);
        alert(err.error?.message || 'Error al actualizar el estado');
      }
    });
  }

  getDefaultAvatar(user?: User | null): string {
    const name = user ? `${user.firstName || ''}+${user.lastName || ''}` : 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=e5e7eb&color=374151`;
  }

  getRoleLabel(role: UserRole | string): string {
    const labels: Record<string, string> = {
      'ADMIN': 'Admin',
      'PROPIETARIO': 'Propietario',
      'ROOMIE': 'Roomie'
    };
    return labels[role] || role;
  }

  getStatusLabel(status: UserStatus | string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'PENDING': 'Pendiente',
      'BANNED': 'Baneado'
    };
    return labels[status] || status;
  }
}
