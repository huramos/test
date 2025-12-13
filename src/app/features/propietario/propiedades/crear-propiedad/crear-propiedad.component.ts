import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService, CreatePropertyDto } from '../../../../core/services/property.service';
import { PropertyType } from '../../../../core/models/property.model';

@Component({
  selector: 'app-crear-propiedad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nueva Propiedad</h2>
          <button class="close-btn" (click)="onClose()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="modal-body">
          <!-- Step indicators -->
          <div class="steps">
            <div class="step" [class.active]="currentStep() === 1" [class.completed]="currentStep() > 1">
              <span class="step-number">1</span>
              <span class="step-label">Info Básica</span>
            </div>
            <div class="step" [class.active]="currentStep() === 2" [class.completed]="currentStep() > 2">
              <span class="step-number">2</span>
              <span class="step-label">Ubicación</span>
            </div>
            <div class="step" [class.active]="currentStep() === 3" [class.completed]="currentStep() > 3">
              <span class="step-number">3</span>
              <span class="step-label">Características</span>
            </div>
            <div class="step" [class.active]="currentStep() === 4">
              <span class="step-number">4</span>
              <span class="step-label">Reglas</span>
            </div>
          </div>

          <!-- Step 1: Basic Info -->
          @if (currentStep() === 1) {
            <div class="step-content" formGroupName="basic">
              <div class="form-group">
                <label for="title">Título de la propiedad *</label>
                <input type="text" id="title" formControlName="title"
                       placeholder="Ej: Departamento amoblado en Las Condes">
                @if (form.get('basic.title')?.touched && form.get('basic.title')?.errors?.['required']) {
                  <span class="error">El título es requerido</span>
                }
              </div>

              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea id="description" formControlName="description" rows="3"
                          placeholder="Describe tu propiedad..."></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="type">Tipo de propiedad *</label>
                  <select id="type" formControlName="type">
                    <option value="">Seleccionar</option>
                    <option value="DEPARTAMENTO">Departamento</option>
                    <option value="CASA">Casa</option>
                    <option value="HABITACION">Habitación</option>
                    <option value="ESTUDIO">Estudio</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="monthlyRent">Arriendo mensual (CLP) *</label>
                  <input type="number" id="monthlyRent" formControlName="monthlyRent"
                         placeholder="350000">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="commonExpenses">Gastos comunes (CLP)</label>
                  <input type="number" id="commonExpenses" formControlName="commonExpenses"
                         placeholder="50000">
                </div>

                <div class="form-group">
                  <label for="depositMonths">Meses de garantía</label>
                  <input type="number" id="depositMonths" formControlName="depositMonths"
                         placeholder="1" min="0" max="6">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="availableFrom">Disponible desde</label>
                  <input type="date" id="availableFrom" formControlName="availableFrom">
                </div>

                <div class="form-group">
                  <label for="minimumStay">Estadía mínima (meses)</label>
                  <input type="number" id="minimumStay" formControlName="minimumStay"
                         placeholder="6" min="1">
                </div>
              </div>
            </div>
          }

          <!-- Step 2: Location -->
          @if (currentStep() === 2) {
            <div class="step-content" formGroupName="address">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label for="street">Calle *</label>
                  <input type="text" id="street" formControlName="street"
                         placeholder="Ej: Av. Apoquindo">
                </div>

                <div class="form-group">
                  <label for="number">Número *</label>
                  <input type="text" id="number" formControlName="number"
                         placeholder="1234">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="apartment">Depto/Oficina</label>
                  <input type="text" id="apartment" formControlName="apartment"
                         placeholder="Ej: 501">
                </div>

                <div class="form-group">
                  <label for="comuna">Comuna *</label>
                  <select id="comuna" formControlName="comuna">
                    <option value="">Seleccionar</option>
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
                  <input type="text" id="city" formControlName="city" value="Santiago">
                </div>

                <div class="form-group">
                  <label for="region">Región *</label>
                  <input type="text" id="region" formControlName="region" value="Metropolitana">
                </div>
              </div>

              <div class="form-group">
                <label for="zipCode">Código Postal</label>
                <input type="text" id="zipCode" formControlName="zipCode"
                       placeholder="7550000">
              </div>
            </div>
          }

          <!-- Step 3: Features -->
          @if (currentStep() === 3) {
            <div class="step-content" formGroupName="features">
              <div class="form-row">
                <div class="form-group">
                  <label for="totalRooms">Total habitaciones *</label>
                  <input type="number" id="totalRooms" formControlName="totalRooms"
                         min="1" max="20">
                </div>

                <div class="form-group">
                  <label for="availableRooms">Hab. disponibles *</label>
                  <input type="number" id="availableRooms" formControlName="availableRooms"
                         min="0" max="20">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bathrooms">Baños *</label>
                  <input type="number" id="bathrooms" formControlName="bathrooms"
                         min="1" max="10">
                </div>

                <div class="form-group">
                  <label for="squareMeters">Metros cuadrados *</label>
                  <input type="number" id="squareMeters" formControlName="squareMeters"
                         min="10" max="1000">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="floor">Piso</label>
                  <input type="number" id="floor" formControlName="floor"
                         min="0" max="50">
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

          <!-- Step 4: Rules -->
          @if (currentStep() === 4) {
            <div class="step-content" formGroupName="rules">
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

              <div class="form-row">
                <div class="form-group">
                  <label for="maxOccupants">Máximo de ocupantes</label>
                  <input type="number" id="maxOccupants" formControlName="maxOccupants"
                         min="1" max="20" placeholder="4">
                </div>
              </div>

              <h4 class="section-title">Horas de silencio (opcional)</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="quietHoursStart">Desde</label>
                  <input type="time" id="quietHoursStart" formControlName="quietHoursStart">
                </div>

                <div class="form-group">
                  <label for="quietHoursEnd">Hasta</label>
                  <input type="time" id="quietHoursEnd" formControlName="quietHoursEnd">
                </div>
              </div>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errorMessage() }}
            </div>
          }

          <div class="modal-footer">
            @if (currentStep() > 1) {
              <button type="button" class="btn btn-secondary" (click)="previousStep()">
                <i class="fas fa-arrow-left me-2"></i>Anterior
              </button>
            }

            @if (currentStep() < 4) {
              <button type="button" class="btn btn-primary" (click)="nextStep()"
                      [disabled]="!isCurrentStepValid()">
                Siguiente<i class="fas fa-arrow-right ms-2"></i>
              </button>
            } @else {
              <button type="submit" class="btn btn-success" [disabled]="loading() || !form.valid">
                @if (loading()) {
                  <i class="fas fa-spinner fa-spin me-2"></i>Creando...
                } @else {
                  <i class="fas fa-check me-2"></i>Crear Propiedad
                }
              </button>
            }
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

    .steps {
      display: flex; gap: 0.5rem; margin-bottom: 2rem;
    }

    .step {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      padding: 0.75rem; border-radius: 0.5rem; background: #f9fafb;
      transition: all 0.2s;

      &.active {
        background: #d1fae5;
        .step-number { background: #10b981; color: white; }
        .step-label { color: #059669; }
      }

      &.completed {
        background: #ecfdf5;
        .step-number { background: #10b981; color: white; }
      }
    }

    .step-number {
      width: 28px; height: 28px; border-radius: 50%;
      background: #e5e7eb; display: flex; align-items: center;
      justify-content: center; font-size: 0.875rem; font-weight: 600;
      color: #6b7280; margin-bottom: 0.25rem;
    }

    .step-label {
      font-size: 0.75rem; color: #6b7280; font-weight: 500;
    }

    .step-content {
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
      .error { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; display: block; }
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

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 1rem;
      padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      padding: 0.75rem 1.5rem; border-radius: 0.5rem;
      font-weight: 600; cursor: pointer; border: none;
      display: inline-flex; align-items: center;
      transition: all 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-secondary {
      background: white; border: 1px solid #d1d5db; color: #374151;
      &:hover:not(:disabled) { background: #f3f4f6; }
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: white;
      &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
    }

    .me-2 { margin-right: 0.5rem; }
    .ms-2 { margin-left: 0.5rem; }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
      .checkbox-grid { grid-template-columns: repeat(2, 1fr); }
      .checkbox-grid.rules { grid-template-columns: 1fr; }
      .steps { flex-wrap: wrap; }
      .step { flex: 1 1 45%; }
    }
  `]
})
export class CrearPropiedadComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);

  currentStep = signal(1);
  loading = signal(false);
  errorMessage = signal('');

  form: FormGroup = this.fb.group({
    basic: this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      monthlyRent: ['', [Validators.required, Validators.min(1)]],
      commonExpenses: [0],
      depositMonths: [1],
      availableFrom: [''],
      minimumStay: [6]
    }),
    address: this.fb.group({
      street: ['', Validators.required],
      number: ['', Validators.required],
      apartment: [''],
      comuna: ['', Validators.required],
      city: ['Santiago', Validators.required],
      region: ['Metropolitana', Validators.required],
      zipCode: ['']
    }),
    features: this.fb.group({
      totalRooms: [1, [Validators.required, Validators.min(1)]],
      availableRooms: [1, [Validators.required, Validators.min(0)]],
      bathrooms: [1, [Validators.required, Validators.min(1)]],
      squareMeters: [50, [Validators.required, Validators.min(10)]],
      floor: [null],
      hasElevator: [false],
      hasParking: [false],
      hasFurniture: [false],
      hasWifi: [false],
      hasAC: [false],
      hasHeating: [false],
      hasWasher: [false],
      hasDryer: [false],
      hasBalcony: [false],
      hasTerrace: [false],
      hasGarden: [false],
      hasSecurity: [false]
    }),
    rules: this.fb.group({
      petsAllowed: [false],
      smokingAllowed: [false],
      childrenAllowed: [true],
      guestsAllowed: [true],
      partiesAllowed: [false],
      maxOccupants: [null],
      quietHoursStart: [''],
      quietHoursEnd: ['']
    })
  });

  onClose() {
    this.close.emit();
  }

  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.form.get('basic')?.valid ?? false;
      case 2:
        return this.form.get('address')?.valid ?? false;
      case 3:
        return this.form.get('features')?.valid ?? false;
      case 4:
        return true;
      default:
        return false;
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.errorMessage.set('Por favor completa todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue = this.form.value;
    const dto: CreatePropertyDto = {
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
        region: formValue.address.region,
        zipCode: formValue.address.zipCode || undefined
      },
      features: {
        totalRooms: Number(formValue.features.totalRooms),
        availableRooms: Number(formValue.features.availableRooms),
        bathrooms: Number(formValue.features.bathrooms),
        squareMeters: Number(formValue.features.squareMeters),
        floor: formValue.features.floor ? Number(formValue.features.floor) : undefined,
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
        partiesAllowed: formValue.rules.partiesAllowed,
        maxOccupants: formValue.rules.maxOccupants ? Number(formValue.rules.maxOccupants) : undefined,
        quietHoursStart: formValue.rules.quietHoursStart || undefined,
        quietHoursEnd: formValue.rules.quietHoursEnd || undefined
      },
      images: []
    };

    this.propertyService.createProperty(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al crear la propiedad');
      }
    });
  }
}
