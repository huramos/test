import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../../core/services/property.service';
import { Property, PropertyType, PropertyStatus } from '../../../../core/models/property.model';

@Component({
  selector: 'app-editar-propiedad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Editar Propiedad</h2>
          <button class="close-btn" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
          <!-- Tabs -->
          <div class="tabs">
            <button type="button" class="tab" [class.active]="activeTab() === 'basic'" (click)="activeTab.set('basic')">
              <i class="fas fa-home"></i> Información
            </button>
            <button type="button" class="tab" [class.active]="activeTab() === 'address'" (click)="activeTab.set('address')">
              <i class="fas fa-map-marker-alt"></i> Ubicación
            </button>
            <button type="button" class="tab" [class.active]="activeTab() === 'features'" (click)="activeTab.set('features')">
              <i class="fas fa-list"></i> Características
            </button>
            <button type="button" class="tab" [class.active]="activeTab() === 'rules'" (click)="activeTab.set('rules')">
              <i class="fas fa-clipboard-list"></i> Reglas
            </button>
          </div>

          <!-- Basic Info Tab -->
          @if (activeTab() === 'basic') {
            <div class="tab-content" formGroupName="basic">
              <div class="form-group">
                <label for="title">Título de la propiedad *</label>
                <input type="text" id="title" formControlName="title">
              </div>

              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea id="description" formControlName="description" rows="3"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="type">Tipo de propiedad *</label>
                  <select id="type" formControlName="type">
                    <option value="APARTMENT">Departamento</option>
                    <option value="HOUSE">Casa</option>
                    <option value="STUDIO">Estudio</option>
                    <option value="LOFT">Loft</option>
                    <option value="SHARED_APARTMENT">Depto. Compartido</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="monthlyRent">Arriendo mensual (CLP) *</label>
                  <input type="number" id="monthlyRent" formControlName="monthlyRent">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="commonExpenses">Gastos comunes (CLP)</label>
                  <input type="number" id="commonExpenses" formControlName="commonExpenses">
                </div>

                <div class="form-group">
                  <label for="depositMonths">Meses de garantía</label>
                  <input type="number" id="depositMonths" formControlName="depositMonths" min="0" max="6">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="availableFrom">Disponible desde</label>
                  <input type="date" id="availableFrom" formControlName="availableFrom">
                </div>

                <div class="form-group">
                  <label for="minimumStay">Estadía mínima (meses)</label>
                  <input type="number" id="minimumStay" formControlName="minimumStay" min="1">
                </div>
              </div>
            </div>
          }

          <!-- Address Tab -->
          @if (activeTab() === 'address') {
            <div class="tab-content" formGroupName="address">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="street">Calle *</label>
                  <input type="text" id="street" formControlName="street">
                </div>

                <div class="form-group">
                  <label for="number">Número *</label>
                  <input type="text" id="number" formControlName="number">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="apartment">Depto/Oficina</label>
                  <input type="text" id="apartment" formControlName="apartment">
                </div>

                <div class="form-group">
                  <label for="comuna">Comuna *</label>
                  <select id="comuna" formControlName="comuna">
                    <option value="Santiago">Santiago</option>
                    <option value="Providencia">Providencia</option>
                    <option value="Las Condes">Las Condes</option>
                    <option value="Ñuñoa">Ñuñoa</option>
                    <option value="Vitacura">Vitacura</option>
                    <option value="La Florida">La Florida</option>
                    <option value="Maipú">Maipú</option>
                    <option value="Puente Alto">Puente Alto</option>
                    <option value="La Reina">La Reina</option>
                    <option value="Macul">Macul</option>
                    <option value="Peñalolén">Peñalolén</option>
                    <option value="San Miguel">San Miguel</option>
                    <option value="Estación Central">Estación Central</option>
                    <option value="Recoleta">Recoleta</option>
                    <option value="Independencia">Independencia</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ciudad *</label>
                  <input type="text" id="city" formControlName="city">
                </div>

                <div class="form-group">
                  <label for="region">Región *</label>
                  <input type="text" id="region" formControlName="region">
                </div>
              </div>
            </div>
          }

          <!-- Features Tab -->
          @if (activeTab() === 'features') {
            <div class="tab-content" formGroupName="features">
              <div class="form-row">
                <div class="form-group">
                  <label for="totalRooms">Total habitaciones *</label>
                  <input type="number" id="totalRooms" formControlName="totalRooms" min="1" max="20">
                </div>

                <div class="form-group">
                  <label for="availableRooms">Hab. disponibles *</label>
                  <input type="number" id="availableRooms" formControlName="availableRooms" min="0" max="20">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bathrooms">Baños *</label>
                  <input type="number" id="bathrooms" formControlName="bathrooms" min="1" max="10">
                </div>

                <div class="form-group">
                  <label for="squareMeters">Metros cuadrados *</label>
                  <input type="number" id="squareMeters" formControlName="squareMeters" min="10">
                </div>
              </div>

              <h4 class="section-title">Amenidades</h4>
              <div class="checkbox-grid">
                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasFurniture">
                  <i class="fas fa-couch"></i>
                  <span>Amoblado</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasWifi">
                  <i class="fas fa-wifi"></i>
                  <span>WiFi</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasParking">
                  <i class="fas fa-parking"></i>
                  <span>Estacionamiento</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasElevator">
                  <i class="fas fa-elevator"></i>
                  <span>Ascensor</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasHeating">
                  <i class="fas fa-temperature-high"></i>
                  <span>Calefacción</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasAC">
                  <i class="fas fa-snowflake"></i>
                  <span>Aire Acond.</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasWasher">
                  <i class="fas fa-tshirt"></i>
                  <span>Lavadora</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasDryer">
                  <i class="fas fa-wind"></i>
                  <span>Secadora</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasBalcony">
                  <i class="fas fa-building"></i>
                  <span>Balcón</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasTerrace">
                  <i class="fas fa-umbrella-beach"></i>
                  <span>Terraza</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasGarden">
                  <i class="fas fa-leaf"></i>
                  <span>Jardín</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="hasSecurity">
                  <i class="fas fa-shield-alt"></i>
                  <span>Seguridad</span>
                </label>
              </div>
            </div>
          }

          <!-- Rules Tab -->
          @if (activeTab() === 'rules') {
            <div class="tab-content" formGroupName="rules">
              <h4 class="section-title">Reglas de la propiedad</h4>
              <div class="checkbox-grid rules">
                <label class="checkbox-item">
                  <input type="checkbox" formControlName="petsAllowed">
                  <i class="fas fa-paw"></i>
                  <span>Mascotas permitidas</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="smokingAllowed">
                  <i class="fas fa-smoking"></i>
                  <span>Fumar permitido</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="childrenAllowed">
                  <i class="fas fa-child"></i>
                  <span>Niños permitidos</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="guestsAllowed">
                  <i class="fas fa-users"></i>
                  <span>Visitas permitidas</span>
                </label>

                <label class="checkbox-item">
                  <input type="checkbox" formControlName="partiesAllowed">
                  <i class="fas fa-music"></i>
                  <span>Fiestas permitidas</span>
                </label>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="success-message">
              <i class="fas fa-check-circle"></i>
              {{ successMessage() }}
            </div>
          }

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" (click)="toggleStatus()" [disabled]="statusLoading()">
              @if (statusLoading()) {
                <i class="fas fa-spinner fa-spin"></i>
              } @else if (property.status === 'INACTIVE') {
                <i class="fas fa-check"></i> Activar
              } @else {
                <i class="fas fa-ban"></i> Desactivar
              }
            </button>

            <div class="spacer"></div>

            <button type="button" class="btn btn-secondary" (click)="onClose()">
              Cancelar
            </button>

            <button type="submit" class="btn btn-primary" [disabled]="loading() || !form.valid">
              @if (loading()) {
                <i class="fas fa-spinner fa-spin"></i> Guardando...
              } @else {
                <i class="fas fa-save"></i> Guardar Cambios
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); display: flex;
      align-items: center; justify-content: center; z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: white; border-radius: 1rem; width: 100%;
      max-width: 700px; max-height: 90vh; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem; border-bottom: 1px solid #e5e7eb;
      h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #1f2937; }
    }

    .close-btn {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: #f3f4f6; cursor: pointer; color: #6b7280;
      transition: all 0.2s;
      &:hover { background: #e5e7eb; color: #1f2937; }
    }

    .modal-body {
      padding: 1.5rem; overflow-y: auto; flex: 1;
    }

    .tabs {
      display: flex; gap: 0.5rem; margin-bottom: 1.5rem;
      border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;
    }

    .tab {
      flex: 1; padding: 0.75rem; border: none; background: #f9fafb;
      border-radius: 0.5rem; font-weight: 500; color: #6b7280;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; gap: 0.5rem; transition: all 0.2s;
      font-size: 0.8125rem;

      &.active {
        background: #10b981; color: white;
      }

      &:hover:not(.active) {
        background: #e5e7eb;
      }

      i { font-size: 0.875rem; }
    }

    .tab-content {
      min-height: 300px;
    }

    .form-group {
      margin-bottom: 1rem;
      label {
        display: block; font-size: 0.875rem; font-weight: 500;
        color: #374151; margin-bottom: 0.5rem;
      }
      input, select, textarea {
        width: 100%; padding: 0.75rem 1rem; border: 1px solid #d1d5db;
        border-radius: 0.5rem; font-size: 0.9375rem;
        transition: border-color 0.2s;
        &:focus { outline: none; border-color: #10b981; }
      }
      textarea { resize: vertical; }
    }

    .form-row {
      display: flex; gap: 1rem;
      .form-group { flex: 1; }
      .form-group.flex-2 { flex: 2; }
    }

    .section-title {
      font-size: 0.9375rem; font-weight: 600; color: #1f2937;
      margin: 1.5rem 0 1rem; padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .checkbox-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
      &.rules { grid-template-columns: repeat(2, 1fr); }
    }

    .checkbox-item {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem; border: 1px solid #e5e7eb;
      border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;

      input { display: none; }
      i { color: #9ca3af; font-size: 1rem; width: 20px; text-align: center; }
      span { font-size: 0.8125rem; color: #6b7280; }

      &:hover { border-color: #10b981; background: #f0fdf4; }

      &:has(input:checked) {
        border-color: #10b981; background: #ecfdf5;
        i { color: #10b981; }
        span { color: #059669; font-weight: 500; }
      }
    }

    .error-message {
      background: #fef2f2; border: 1px solid #fecaca;
      color: #dc2626; padding: 0.75rem 1rem; border-radius: 0.5rem;
      margin-top: 1rem; font-size: 0.875rem;
      i { margin-right: 0.5rem; }
    }

    .success-message {
      background: #f0fdf4; border: 1px solid #bbf7d0;
      color: #16a34a; padding: 0.75rem 1rem; border-radius: 0.5rem;
      margin-top: 1rem; font-size: 0.875rem;
      i { margin-right: 0.5rem; }
    }

    .modal-footer {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
      background: #f9fafb;

      .spacer { flex: 1; }
    }

    .btn {
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 600; cursor: pointer; border: none;
      display: inline-flex; align-items: center; gap: 0.5rem;
      transition: all 0.2s; font-size: 0.875rem;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-secondary {
      background: white; border: 1px solid #d1d5db; color: #374151;
      &:hover:not(:disabled) { background: #f3f4f6; }
    }

    .btn-primary {
      background: #10b981; color: white;
      &:hover:not(:disabled) { background: #059669; }
    }

    .btn-outline-danger {
      background: white; border: 1px solid #ef4444; color: #ef4444;
      &:hover:not(:disabled) { background: #fef2f2; }
    }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
      .checkbox-grid { grid-template-columns: repeat(2, 1fr); }
      .checkbox-grid.rules { grid-template-columns: 1fr; }
      .tabs { flex-wrap: wrap; }
      .tab { flex: 1 1 45%; font-size: 0.75rem; padding: 0.5rem; }
    }
  `]
})
export class EditarPropiedadComponent implements OnInit {
  @Input({ required: true }) property!: Property;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);

  activeTab = signal<'basic' | 'address' | 'features' | 'rules'>('basic');
  loading = signal(false);
  statusLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form!: FormGroup;

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const p = this.property;
    const addr = p.address || {} as any;
    const feat = p.features || {} as any;
    const rules = p.rules || {} as any;

    this.form = this.fb.group({
      basic: this.fb.group({
        title: [p.title, Validators.required],
        description: [p.description || ''],
        type: [p.type, Validators.required],
        monthlyRent: [p.monthlyRent, [Validators.required, Validators.min(1)]],
        commonExpenses: [(p as any).commonExpenses || 0],
        depositMonths: [(p as any).depositMonths || 1],
        availableFrom: [p.availableFrom ? new Date(p.availableFrom).toISOString().split('T')[0] : ''],
        minimumStay: [(p as any).minimumStay || 6]
      }),
      address: this.fb.group({
        street: [addr.street || '', Validators.required],
        number: [addr.number || '', Validators.required],
        apartment: [addr.apartment || ''],
        comuna: [addr.comuna || '', Validators.required],
        city: [addr.city || 'Santiago', Validators.required],
        region: [addr.region || 'Metropolitana', Validators.required]
      }),
      features: this.fb.group({
        totalRooms: [feat.totalRooms || 1, [Validators.required, Validators.min(1)]],
        availableRooms: [feat.availableRooms || 1, [Validators.required, Validators.min(0)]],
        bathrooms: [feat.bathrooms || 1, [Validators.required, Validators.min(1)]],
        squareMeters: [feat.squareMeters || 50, [Validators.required, Validators.min(10)]],
        hasElevator: [feat.hasElevator || false],
        hasParking: [feat.hasParking || false],
        hasFurniture: [feat.hasFurniture || false],
        hasWifi: [feat.hasWifi || false],
        hasAC: [feat.hasAC || false],
        hasHeating: [feat.hasHeating || false],
        hasWasher: [feat.hasWasher || false],
        hasDryer: [feat.hasDryer || false],
        hasBalcony: [feat.hasBalcony || false],
        hasTerrace: [feat.hasTerrace || false],
        hasGarden: [feat.hasGarden || false],
        hasSecurity: [feat.hasSecurity || false]
      }),
      rules: this.fb.group({
        petsAllowed: [rules.petsAllowed || false],
        smokingAllowed: [rules.smokingAllowed || false],
        childrenAllowed: [rules.childrenAllowed ?? true],
        guestsAllowed: [rules.guestsAllowed ?? true],
        partiesAllowed: [rules.partiesAllowed || false]
      })
    });
  }

  onClose() {
    this.close.emit();
  }

  toggleStatus() {
    this.statusLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const newStatus = this.property.status === PropertyStatus.INACTIVE
      ? PropertyStatus.AVAILABLE
      : PropertyStatus.INACTIVE;

    this.propertyService.updateStatus(this.property.id, newStatus).subscribe({
      next: () => {
        this.property.status = newStatus;
        this.statusLoading.set(false);
        this.successMessage.set(newStatus === PropertyStatus.INACTIVE
          ? 'Propiedad desactivada'
          : 'Propiedad activada');
        setTimeout(() => {
          this.updated.emit();
        }, 1000);
      },
      error: (err) => {
        this.statusLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al cambiar el estado');
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.form.value;
    const updateData = {
      title: formValue.basic.title,
      description: formValue.basic.description || undefined,
      type: formValue.basic.type as PropertyType,
      monthlyRent: Number(formValue.basic.monthlyRent),
      commonExpenses: formValue.basic.commonExpenses ? Number(formValue.basic.commonExpenses) : undefined,
      depositMonths: formValue.basic.depositMonths ? Number(formValue.basic.depositMonths) : undefined,
      availableFrom: formValue.basic.availableFrom || undefined,
      minimumStay: formValue.basic.minimumStay ? Number(formValue.basic.minimumStay) : undefined,
      address: {
        street: formValue.address.street,
        number: formValue.address.number,
        apartment: formValue.address.apartment || undefined,
        comuna: formValue.address.comuna,
        city: formValue.address.city,
        region: formValue.address.region
      },
      features: {
        totalRooms: Number(formValue.features.totalRooms),
        availableRooms: Number(formValue.features.availableRooms),
        bathrooms: Number(formValue.features.bathrooms),
        squareMeters: Number(formValue.features.squareMeters),
        hasElevator: formValue.features.hasElevator,
        hasParking: formValue.features.hasParking,
        hasFurniture: formValue.features.hasFurniture,
        hasWifi: formValue.features.hasWifi,
        hasAC: formValue.features.hasAC,
        hasHeating: formValue.features.hasHeating,
        hasWasher: formValue.features.hasWasher,
        hasDryer: formValue.features.hasDryer,
        hasBalcony: formValue.features.hasBalcony,
        hasTerrace: formValue.features.hasTerrace,
        hasGarden: formValue.features.hasGarden,
        hasSecurity: formValue.features.hasSecurity
      },
      rules: {
        petsAllowed: formValue.rules.petsAllowed,
        smokingAllowed: formValue.rules.smokingAllowed,
        childrenAllowed: formValue.rules.childrenAllowed,
        guestsAllowed: formValue.rules.guestsAllowed,
        partiesAllowed: formValue.rules.partiesAllowed
      }
    };

    this.propertyService.updateProperty(this.property.id, updateData).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Propiedad actualizada correctamente');
        setTimeout(() => {
          this.updated.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al actualizar la propiedad');
      }
    });
  }
}
