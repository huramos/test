import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RoomRequest {
  id: string;
  roomId: string;
  requesterId: string;
  type: 'ROOM_REQUEST' | 'ROOMIE_REQUEST';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
  message?: string;
  proposedMoveIn?: Date;
  proposedStayMonths?: number;
  responseMessage?: string;
  respondedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  room?: {
    id: string;
    name: string;
    monthlyRent: number;
    property: {
      id: string;
      title: string;
      address: any;
      ownerId: string;
    };
  };
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
  };
}

export interface RequestStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
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
export class RequestService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/requests`;

  getMyRequests(params?: { status?: string; page?: number; limit?: number }): Observable<PaginatedResponse<RoomRequest>> {
    return this.http.get<PaginatedResponse<RoomRequest>>(`${this.baseUrl}/my`, { params: params as any });
  }

  getReceivedRequests(params?: { status?: string; page?: number; limit?: number }): Observable<PaginatedResponse<RoomRequest>> {
    return this.http.get<PaginatedResponse<RoomRequest>>(`${this.baseUrl}/received`, { params: params as any });
  }

  getRequestById(id: string): Observable<RoomRequest> {
    return this.http.get<RoomRequest>(`${this.baseUrl}/${id}`);
  }

  createRequest(data: { roomId?: string; propertyId?: string; message?: string; proposedMoveIn?: string; proposedStayMonths?: number }): Observable<RoomRequest> {
    return this.http.post<RoomRequest>(this.baseUrl, data);
  }

  respondToRequest(id: string, data: { status: 'ACCEPTED' | 'REJECTED'; responseMessage?: string }): Observable<RoomRequest> {
    return this.http.post<RoomRequest>(`${this.baseUrl}/${id}/respond`, data);
  }

  cancelRequest(id: string): Observable<RoomRequest> {
    return this.http.post<RoomRequest>(`${this.baseUrl}/${id}/cancel`, {});
  }

  getStats(): Observable<RequestStats> {
    return this.http.get<RequestStats>(`${this.baseUrl}/stats`);
  }
}
