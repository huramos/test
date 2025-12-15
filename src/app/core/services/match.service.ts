import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MatchStatus = 'ACTIVE' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Match {
  id: string;
  roomId: string;
  roomieId: string;
  requestId: string;
  status: MatchStatus;
  moveInDate?: Date;
  moveOutDate?: Date;
  monthlyRent: number;
  depositAmount?: number;
  depositPaid: boolean;
  contractSigned: boolean;
  contractUrl?: string;
  ownerRating?: number;
  ownerReview?: string;
  roomieRating?: number;
  roomieReview?: string;
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
      owner?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
        phone?: string;
      };
    };
  };
  roomie?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    phone?: string;
  };
  conversation?: {
    id: string;
  };
}

export interface MatchStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
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
export class MatchService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/matches`;

  getMyMatches(params?: { status?: MatchStatus; page?: number; limit?: number }): Observable<PaginatedResponse<Match>> {
    return this.http.get<PaginatedResponse<Match>>(this.baseUrl, { params: params as any });
  }

  getMatchById(id: string): Observable<Match> {
    return this.http.get<Match>(`${this.baseUrl}/${id}`);
  }

  updateMatch(id: string, data: {
    status?: MatchStatus;
    moveInDate?: string;
    moveOutDate?: string;
    depositPaid?: boolean;
    contractSigned?: boolean;
    contractUrl?: string;
  }): Observable<Match> {
    return this.http.patch<Match>(`${this.baseUrl}/${id}`, data);
  }

  rateRoomie(matchId: string, data: { rating: number; review?: string }): Observable<Match> {
    return this.http.post<Match>(`${this.baseUrl}/${matchId}/rate/roomie`, data);
  }

  rateOwner(matchId: string, data: { rating: number; review?: string }): Observable<Match> {
    return this.http.post<Match>(`${this.baseUrl}/${matchId}/rate/owner`, data);
  }

  getStats(): Observable<MatchStats> {
    return this.http.get<MatchStats>(`${this.baseUrl}/stats`);
  }
}
