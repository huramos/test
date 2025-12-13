import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  private returnUrl: string = '/';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;

    const result = await this.authService.login(email, password);

    if (result.success && result.user) {
      const dashboardRoute = this.authService.getDashboardRoute(result.user.role);
      this.router.navigate([this.returnUrl !== '/' ? this.returnUrl : dashboardRoute]);
    } else if (result.message === 'NEEDS_REGISTRATION') {
      this.router.navigate(['/auth/complete-registration']);
    } else {
      this.error.set(result.message);
    }

    this.loading.set(false);
  }

  async onGoogleLogin() {
    this.loading.set(true);
    this.error.set(null);

    const result = await this.authService.loginWithGoogle();

    if (result.success && result.user) {
      const dashboardRoute = this.authService.getDashboardRoute(result.user.role);
      this.router.navigate([this.returnUrl !== '/' ? this.returnUrl : dashboardRoute]);
    } else if (result.message === 'NEEDS_REGISTRATION') {
      this.router.navigate(['/auth/complete-registration']);
    } else {
      this.error.set(result.message);
    }

    this.loading.set(false);
  }

  async onForgotPassword() {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.error.set('Ingresa tu email para recuperar la contraseña');
      return;
    }

    this.loading.set(true);
    const result = await this.authService.sendPasswordReset(email);
    this.loading.set(false);

    if (result.success) {
      this.error.set(null);
      alert(result.message);
    } else {
      this.error.set(result.message);
    }
  }
}
