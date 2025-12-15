import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property } from '../models/property.model';

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: Date;
  property?: Property;
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
export class FavoriteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/favorites`;

  getMyFavorites(params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Favorite>> {
    return this.http.get<PaginatedResponse<Favorite>>(this.baseUrl, { params: params as any });
  }

  addFavorite(propertyId: string): Observable<{ message: string; data: Favorite }> {
    return this.http.post<{ message: string; data: Favorite }>(this.baseUrl, { propertyId });
  }

  removeFavorite(propertyId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${propertyId}`);
  }

  toggleFavorite(propertyId: string): Observable<{ message: string; isFavorite: boolean }> {
    return this.http.post<{ message: string; isFavorite: boolean }>(`${this.baseUrl}/toggle/${propertyId}`, {});
  }

  checkFavorite(propertyId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.baseUrl}/check/${propertyId}`);
  }

  checkMultipleFavorites(propertyIds: string[]): Observable<{ favorites: Record<string, boolean> }> {
    return this.http.post<{ favorites: Record<string, boolean> }>(`${this.baseUrl}/check`, { propertyIds });
  }

  getFavoritesCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/count`);
  }
}
