import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Configuración</h1>
        <p>Ajustes del sistema</p>
      </div>
      <div class="placeholder">
        <i class="fas fa-cog"></i>
        <h3>Configuración del sistema</h3>
        <p>Administra los ajustes generales de la plataforma</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem;
      h1 { font-size: 1.5rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
      p { color: #6b7280; margin: 0; }
    }
    .placeholder {
      text-align: center; padding: 4rem; background: white;
      border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      i { font-size: 4rem; color: #6366f1; margin-bottom: 1rem; opacity: 0.5; }
      h3 { color: #1f2937; margin: 0 0 0.5rem; }
      p { color: #6b7280; margin: 0; }
    }
  `]
})
export class ConfiguracionComponent {}
