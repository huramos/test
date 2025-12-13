import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, RegisterData } from '../../../core/models/user.model';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.scss']
})
export class CompleteRegistrationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registrationForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  firebaseUser = this.authService.getFirebaseUser();

  roles = [
    {
      value: UserRole.ROOMIE,
      label: 'Roomie',
      description: 'Busco un lugar para vivir o tengo una habitación disponible',
      icon: 'fa-user-friends'
    },
    {
      value: UserRole.PROPIETARIO,
      label: 'Propietario',
      description: 'Tengo una propiedad y busco arrendatarios',
      icon: 'fa-home'
    }
  ];

  selectedRole = signal<UserRole>(UserRole.ROOMIE);

  constructor() {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      role: [UserRole.ROOMIE, Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Pre-fill name from Google account if available
    if (this.firebaseUser?.displayName) {
      const nameParts = this.firebaseUser.displayName.split(' ');
      this.registrationForm.patchValue({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      });
    }
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.registrationForm.patchValue({ role });
  }

  async onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    if (!this.firebaseUser) {
      this.error.set('No hay sesión de Firebase activa');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { firstName, lastName, phone, role } = this.registrationForm.value;

    const registerData: RegisterData = {
      firebaseUid: this.firebaseUser.uid,
      email: this.firebaseUser.email!,
      firstName,
      lastName,
      phone,
      role,
      avatar: this.firebaseUser.photoURL || undefined
    };

    const result = await this.authService.register(registerData);

    this.loading.set(false);

    if (result.success) {
      this.success.set(true);
      setTimeout(() => {
        const dashboardRoute = this.authService.getDashboardRoute();
        this.router.navigate([dashboardRoute]);
      }, 1500);
    } else {
      this.error.set(result.message);
    }
  }

  async logout() {
    await this.authService.logout();
  }
}
