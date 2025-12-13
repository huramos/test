import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, RegisterData } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

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
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      role: [UserRole.ROOMIE, Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.registerForm.patchValue({ role });
  }

  async onGoogleRegister() {
    this.loading.set(true);
    this.error.set(null);

    const result = await this.authService.loginWithGoogle();

    if (result.success && result.user) {
      // User already registered, go to dashboard
      const dashboardRoute = this.authService.getDashboardRoute(result.user.role);
      this.router.navigate([dashboardRoute]);
    } else if (result.message === 'NEEDS_REGISTRATION') {
      // New Google user, go to complete registration
      this.router.navigate(['/auth/complete-registration']);
    } else {
      this.error.set(result.message);
    }

    this.loading.set(false);
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password, firstName, lastName, phone, role } = this.registerForm.value;

    // Step 1: Create Firebase account
    const firebaseResult = await this.authService.createFirebaseAccount(email, password);

    if (!firebaseResult.success) {
      this.error.set(firebaseResult.message);
      this.loading.set(false);
      return;
    }

    // Step 2: Register in backend
    const registerData: RegisterData = {
      firebaseUid: firebaseResult.firebaseUid!,
      email,
      firstName,
      lastName,
      phone,
      role
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
}
