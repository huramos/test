import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'PROPIETARIO' | 'ROOMIE';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'BANNED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
}

export interface RoomieProfile {
  id: string;
  userId: string;
  hasRoom: boolean;
  birthdate?: Date;
  gender?: string;
  occupation?: string;
  bio?: string;
  preferences?: {
    budgetMin?: number;
    budgetMax?: number;
    preferredComuna?: string[];
    moveInDate?: string;
    stayDuration?: string;
  };
  lifestyle?: {
    sleepSchedule?: string;
    noiseLevel?: string;
    cleanliness?: string;
    guests?: string;
    smoking?: boolean;
    pets?: boolean;
  };
  interests?: string[];
  languages?: string[];
  profileCompletion: number;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  // Admin routes
  getUsers(params?: { role?: UserRole; status?: UserStatus; search?: string; page?: number; limit?: number }): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(this.baseUrl, { params: params as any });
  }

  getUserById(id: string): Observable<User & { roomieProfile?: RoomieProfile }> {
    return this.http.get<User & { roomieProfile?: RoomieProfile }>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, data);
  }

  updateUserStatus(id: string, status: UserStatus): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/status`, { status });
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  // Roomie profile routes
  getMyRoomieProfile(): Observable<RoomieProfile> {
    return this.http.get<RoomieProfile>(`${this.baseUrl}/profile/roomie`);
  }

  updateMyRoomieProfile(data: Partial<RoomieProfile>): Observable<RoomieProfile> {
    return this.http.patch<RoomieProfile>(`${this.baseUrl}/profile/roomie`, data);
  }

  // Search roomies
  findRoomies(params?: { hasRoom?: boolean; comuna?: string; budgetMin?: number; budgetMax?: number; page?: number; limit?: number }): Observable<PaginatedResponse<RoomieProfile>> {
    return this.http.get<PaginatedResponse<RoomieProfile>>(`${this.baseUrl}/roomies`, { params: params as any });
  }
}
