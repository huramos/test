import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-container">
      <header class="topbar">
        <div class="topbar-content">
          <div class="topbar-left">
            <div class="logo">
              <i class="fas fa-shield-alt"></i>
              <span>RoomMatch Admin</span>
            </div>
            <nav class="desktop-nav">
              <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
                <i class="fas fa-chart-line"></i> Dashboard
              </a>
              <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-link">
                <i class="fas fa-users"></i> Usuarios
              </a>
              <a routerLink="/admin/propiedades" routerLinkActive="active" class="nav-link">
                <i class="fas fa-building"></i> Propiedades
              </a>
              <a routerLink="/admin/solicitudes" routerLinkActive="active" class="nav-link">
                <i class="fas fa-clipboard-list"></i> Solicitudes
              </a>
              <a routerLink="/admin/reportes" routerLinkActive="active" class="nav-link">
                <i class="fas fa-file-alt"></i> Reportes
              </a>
            </nav>
          </div>
          <div class="topbar-right">
            <button class="mobile-menu-btn" (click)="toggleSidebar()">
              <i class="fas fa-bars"></i>
            </button>
            <div class="user-menu">
              <button class="user-btn" (click)="toggleUserMenu()">
                <span class="user-name">Admin</span>
                <div class="user-avatar">
                  <i class="fas fa-user-shield"></i>
                </div>
                <i class="fas fa-chevron-down chevron"></i>
              </button>
              <div class="user-dropdown" [class.show]="userMenuOpen()">
                <a routerLink="/admin/configuracion" class="dropdown-item" (click)="userMenuOpen.set(false)">
                  <i class="fas fa-cog"></i>
                  <span>Configuración</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item" (click)="logout(); $event.preventDefault()">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Cerrar Sesión</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="mobile-menu" [class.show]="sidebarOpen()">
        <div class="mobile-menu-overlay" (click)="toggleSidebar()"></div>
        <div class="mobile-menu-content">
          <nav>
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <i class="fas fa-chart-line"></i> Dashboard
            </a>
            <a routerLink="/admin/usuarios" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <i class="fas fa-users"></i> Usuarios
            </a>
            <a routerLink="/admin/propiedades" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <i class="fas fa-building"></i> Propiedades
            </a>
            <a routerLink="/admin/solicitudes" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <i class="fas fa-clipboard-list"></i> Solicitudes
            </a>
            <a routerLink="/admin/reportes" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
              <i class="fas fa-file-alt"></i> Reportes
            </a>
          </nav>
          <div class="mobile-menu-footer">
            <button class="btn btn-logout" (click)="logout(); closeSidebar()">
              <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f1f5f9;
    }

    .topbar {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .topbar-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-weight: 700;
      font-size: 1.25rem;

      i { font-size: 1.5rem; }
    }

    .desktop-nav {
      display: flex;
      gap: 0.5rem;

      .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        color: rgba(255, 255, 255, 0.9);
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.9375rem;
        transition: all 0.2s ease;

        i { font-size: 1rem; }

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        &.active {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          font-weight: 600;
        }
      }
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.5rem;
      transition: background 0.2s ease;

      &:hover { background: rgba(255, 255, 255, 0.15); }
    }

    .user-menu {
      position: relative;

      .user-btn {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover { background: rgba(255, 255, 255, 0.25); }

        .user-name {
          font-weight: 500;
          font-size: 0.9375rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            color: #6366f1;
            font-size: 0.875rem;
          }
        }

        .chevron {
          font-size: 0.75rem;
          transition: transform 0.2s ease;
        }
      }

      .user-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        z-index: 1001;

        &.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: #374151;
          text-decoration: none;
          transition: background 0.2s ease;

          i { font-size: 1rem; color: #6b7280; }
          span { font-weight: 500; }

          &:hover { background: #f3f4f6; }
          &:first-child { border-radius: 0.75rem 0.75rem 0 0; }
          &:last-child { border-radius: 0 0 0.75rem 0.75rem; }
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0;
        }
      }
    }

    .mobile-menu {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;

      &.show { display: block; }

      .mobile-menu-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }

      .mobile-menu-content {
        position: absolute;
        top: 0;
        right: 0;
        width: 280px;
        height: 100%;
        background: white;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;

        nav {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1rem;
            color: #374151;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: all 0.2s ease;

            i { font-size: 1.125rem; color: #6b7280; }

            &:hover { background: #f3f4f6; }

            &.active {
              background: #eef2ff;
              color: #6366f1;
              i { color: #6366f1; }
            }
          }
        }

        .mobile-menu-footer {
          margin-top: auto;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;

          .btn-logout {
            width: 100%;
            padding: 0.875rem;
            background: white;
            border: 2px solid #6366f1;
            color: #6366f1;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            transition: all 0.2s ease;

            &:hover {
              background: #6366f1;
              color: white;
            }
          }
        }
      }
    }

    .main-content {
      min-height: calc(100vh - 64px);
      background: #f1f5f9;
    }

    @media (max-width: 1024px) {
      .desktop-nav { display: none; }
      .mobile-menu-btn { display: block; }
      .user-menu .user-name { display: none; }
    }
  `]
})
export class AdminShellComponent {
  private authService = inject(AuthService);
  sidebarOpen = signal(false);
  userMenuOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  async logout() {
    this.userMenuOpen.set(false);
    await this.authService.logout();
  }
}
