import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { User, UserRole, UserStatus } from '../../../core/models/user.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios de la plataforma</p>
      </div>

      <div class="filters">
        <button class="filter-btn" [class.active]="filter() === 'all'" (click)="filter.set('all')">Todos</button>
        <button class="filter-btn" [class.active]="filter() === UserRole.PROPIETARIO" (click)="setFilter(UserRole.PROPIETARIO)">Propietarios</button>
        <button class="filter-btn" [class.active]="filter() === UserRole.ROOMIE" (click)="setFilter(UserRole.ROOMIE)">Roomies</button>
      </div>

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
            @for (user of filteredUsers(); track user.id) {
              <tr>
                <td>
                  <div class="user-cell">
                    <img [src]="user.avatar" class="avatar" alt="">
                    <span>{{ user.firstName }} {{ user.lastName }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td><span class="role-badge" [class]="user.role.toLowerCase()">{{ getRoleLabel(user.role) }}</span></td>
                <td><span class="status-badge" [class]="user.status.toLowerCase()">{{ getStatusLabel(user.status) }}</span></td>
                <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" title="Ver detalles"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon" title="Editar"><i class="fas fa-edit"></i></button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
      .filter-btn {
        padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white;
        border-radius: 0.5rem; font-weight: 500; color: #6b7280; cursor: pointer;
        &.active { background: #6366f1; color: white; border-color: #6366f1; }
      }
    }
    .users-table {
      background: white; border-radius: 1rem; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
      th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.8125rem; }
      td { font-size: 0.875rem; color: #4b5563; }
    }
    .user-cell { display: flex; align-items: center; gap: 0.75rem;
      .avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
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
      &.inactive { background: #fee2e2; color: #dc2626; }
      &.pending { background: #fef3c7; color: #d97706; }
    }
    .actions { display: flex; gap: 0.5rem;
      .btn-icon {
        width: 32px; height: 32px; border-radius: 0.375rem;
        border: 1px solid #e5e7eb; background: white;
        display: flex; align-items: center; justify-content: center;
        color: #6b7280; cursor: pointer;
        &:hover { border-color: #6366f1; color: #6366f1; }
      }
    }
  `]
})
export class UsuariosComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  users = signal<User[]>([]);
  filter = signal<'all' | UserRole>('all');
  UserRole = UserRole;

  ngOnInit() {
    this.users.set(this.mockDataService.getAllUsers());
  }

  setFilter(role: UserRole) {
    this.filter.set(role);
  }

  filteredUsers() {
    if (this.filter() === 'all') return this.users();
    return this.users().filter(u => u.role === this.filter());
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Admin',
      [UserRole.PROPIETARIO]: 'Propietario',
      [UserRole.ROOMIE]: 'Roomie'
    };
    return labels[role];
  }

  getStatusLabel(status: UserStatus): string {
    const labels: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: 'Activo',
      [UserStatus.INACTIVE]: 'Inactivo',
      [UserStatus.PENDING]: 'Pendiente',
      [UserStatus.BANNED]: 'Baneado'
    };
    return labels[status];
  }
}
