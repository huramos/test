import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Property, PropertyType, PropertyStatus } from '../models/property.model';

export interface CreatePropertyDto {
  title: string;
  description?: string;
  type: PropertyType;
  address: {
    street: string;
    number: string;
    apartment?: string;
    comuna: string;
    city: string;
    region: string;
    zipCode?: string;
  };
  features: {
    totalRooms: number;
    availableRooms: number;
    bathrooms: number;
    squareMeters: number;
    floor?: number;
    hasElevator?: boolean;
    hasParking?: boolean;
    hasFurniture?: boolean;
    hasWifi?: boolean;
    hasAC?: boolean;
    hasHeating?: boolean;
    hasWasher?: boolean;
    hasDryer?: boolean;
    hasBalcony?: boolean;
    hasTerrace?: boolean;
    hasGarden?: boolean;
    hasPool?: boolean;
    hasGym?: boolean;
    hasSecurity?: boolean;
    hasConcierge?: boolean;
  };
  rules?: {
    petsAllowed?: boolean;
    smokingAllowed?: boolean;
    childrenAllowed?: boolean;
    maxOccupants?: number;
    quietHoursStart?: string;
    quietHoursEnd?: string;
    guestsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  monthlyRent: number;
  commonExpenses?: number;
  depositMonths?: number;
  images?: string[];
  availableFrom?: string;
  minimumStay?: number;
}

export interface PropertyFilterParams {
  comuna?: string;
  city?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  bathrooms?: number;
  petsAllowed?: boolean;
  page?: number;
  limit?: number;
}

export interface PropertyListResponse {
  data: Property[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertyStatsResponse {
  total: number;
  available: number;
  occupied: number;
  inactive: number;
  totalViews: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/properties`;

  /**
   * Get all properties with optional filters
   */
  getProperties(filters?: PropertyFilterParams): Observable<PropertyListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PropertyListResponse>(this.apiUrl, { params });
  }

  /**
   * Get properties owned by current user
   */
  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/my`);
  }

  /**
   * Get property stats for current user
   */
  getMyStats(): Observable<PropertyStatsResponse> {
    return this.http.get<PropertyStatsResponse>(`${this.apiUrl}/stats`);
  }

  /**
   * Get a single property by ID
   */
  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new property
   */
  createProperty(dto: CreatePropertyDto): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, dto);
  }

  /**
   * Update property
   */
  updateProperty(id: string, dto: Partial<CreatePropertyDto>): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Update property status
   */
  updateStatus(id: string, status: PropertyStatus): Observable<Property> {
    return this.http.patch<Property>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Delete property
   */
  deleteProperty(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get available properties (for roomies)
   */
  getAvailableProperties(filters?: PropertyFilterParams): Observable<PropertyListResponse> {
    const searchFilters = { ...filters, status: PropertyStatus.AVAILABLE };
    return this.getProperties(searchFilters);
  }

  /**
   * Get distinct comunas from available properties
   */
  getComunas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/comunas`);
  }
}
