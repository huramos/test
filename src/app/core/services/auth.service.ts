import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, firstValueFrom } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { User, UserRole, RegisterData, SyncUserResponse, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private auth = inject(Auth);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private firebaseUserSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public firebaseUser$ = this.firebaseUserSubject.asObservable();

  private authInitializedSubject = new BehaviorSubject<boolean>(false);
  public authInitialized$ = this.authInitializedSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  // Flag to prevent sync during registration
  private isRegistering = false;

  private apiUrl = environment.apiUrl;

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      console.log('[AuthService] Firebase auth state changed:', firebaseUser?.email);
      this.firebaseUserSubject.next(firebaseUser);

      // Skip sync if we're in the middle of registration
      if (this.isRegistering) {
        console.log('[AuthService] Skipping sync - registration in progress');
        this.loadingSubject.next(false);
        this.authInitializedSubject.next(true);
        return;
      }

      if (firebaseUser) {
        try {
          const syncResponse = await this.syncUserWithBackend(firebaseUser);
          if (syncResponse.isRegistered && syncResponse.user) {
            this.currentUserSubject.next(syncResponse.user);
          } else {
            // User exists in Firebase but not in backend - needs registration
            this.currentUserSubject.next(null);
          }
        } catch (error) {
          console.error('[AuthService] Error syncing user:', error);
          this.currentUserSubject.next(null);
        }
      } else {
        this.currentUserSubject.next(null);
      }

      this.loadingSubject.next(false);
      this.authInitializedSubject.next(true);
    });
  }

  private async syncUserWithBackend(firebaseUser: FirebaseUser): Promise<SyncUserResponse> {
    const token = await firebaseUser.getIdToken();
    return firstValueFrom(
      this.http.post<SyncUserResponse>(
        `${this.apiUrl}/auth/sync`,
        { firebaseToken: token }
      )
    );
  }

  async getIdToken(): Promise<string | null> {
    const firebaseUser = this.firebaseUserSubject.value;
    if (firebaseUser) {
      return firebaseUser.getIdToken();
    }
    return null;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      this.loadingSubject.next(true);
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const syncResponse = await this.syncUserWithBackend(credential.user);

      if (!syncResponse.isRegistered) {
        return {
          success: false,
          message: 'Usuario no registrado. Por favor completa tu registro.'
        };
      }

      this.currentUserSubject.next(syncResponse.user!);
      return {
        success: true,
        message: 'Login exitoso',
        user: syncResponse.user
      };
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        message: this.getFirebaseErrorMessage(error.code)
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      this.loadingSubject.next(true);
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      const syncResponse = await this.syncUserWithBackend(credential.user);

      if (!syncResponse.isRegistered) {
        // New user from Google - needs to complete registration
        return {
          success: false,
          message: 'NEEDS_REGISTRATION'
        };
      }

      this.currentUserSubject.next(syncResponse.user!);
      return {
        success: true,
        message: 'Login exitoso',
        user: syncResponse.user
      };
    } catch (error: any) {
      console.error('[AuthService] Google login error:', error);
      return {
        success: false,
        message: this.getFirebaseErrorMessage(error.code)
      };
    } finally {
      this.loadingSubject.next(false);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      this.loadingSubject.next(true);
      const token = await this.getIdToken();

      if (!token) {
        this.isRegistering = false;
        return {
          success: false,
          message: 'No hay sesión de Firebase activa'
        };
      }

      const response = await firstValueFrom(
        this.http.post<User>(
          `${this.apiUrl}/auth/register`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      );

      // Update current user and mark auth as initialized
      this.currentUserSubject.next(response!);
      this.authInitializedSubject.next(true);

      return {
        success: true,
        message: 'Registro exitoso',
        user: response
      };
    } catch (error: any) {
      console.error('[AuthService] Register error:', error);
      return {
        success: false,
        message: error.error?.message || 'Error al registrar usuario'
      };
    } finally {
      this.isRegistering = false; // Always reset the flag
      this.loadingSubject.next(false);
    }
  }

  async createFirebaseAccount(email: string, password: string): Promise<{ success: boolean; message: string; firebaseUid?: string }> {
    try {
      // Set flag to prevent sync during registration
      this.isRegistering = true;
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      return {
        success: true,
        message: 'Cuenta Firebase creada',
        firebaseUid: credential.user.uid
      };
    } catch (error: any) {
      console.error('[AuthService] Create Firebase account error:', error);
      this.isRegistering = false; // Reset flag on error
      return {
        success: false,
        message: this.getFirebaseErrorMessage(error.code)
      };
    }
  }

  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer tu contraseña'
      };
    } catch (error: any) {
      console.error('[AuthService] Password reset error:', error);
      return {
        success: false,
        message: this.getFirebaseErrorMessage(error.code)
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getFirebaseUser(): FirebaseUser | null {
    return this.firebaseUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isFirebaseAuthenticated(): boolean {
    return this.firebaseUserSubject.value !== null;
  }

  needsRegistration(): boolean {
    return this.firebaseUserSubject.value !== null && this.currentUserSubject.value === null;
  }

  hasRole(role: UserRole): boolean {
    return this.getCurrentUser()?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getCurrentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  getUserRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  getDashboardRoute(role?: UserRole): string {
    const userRole = role || this.getUserRole();
    switch (userRole) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.PROPIETARIO:
        return '/propietario/dashboard';
      case UserRole.ROOMIE:
        return '/roomie/dashboard';
      default:
        return '/auth/login';
    }
  }

  async updateProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const token = await this.getIdToken();
      if (!token) {
        return { success: false, message: 'No autenticado' };
      }

      const response = await firstValueFrom(
        this.http.patch<User>(
          `${this.apiUrl}/auth/profile`,
          userData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      );

      const currentUser = this.currentUserSubject.value;
      if (currentUser && response) {
        this.currentUserSubject.next({ ...currentUser, ...response });
      }

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        user: response
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.error?.message || 'Error al actualizar perfil'
      };
    }
  }

  private getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
      'auth/invalid-credential': 'Credenciales inválidas'
    };
    return errorMessages[errorCode] || 'Error de autenticación';
  }
}
