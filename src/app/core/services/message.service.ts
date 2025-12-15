import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  matchId: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  room: {
    id: string;
    name: string;
    property: {
      id: string;
      title: string;
    };
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
    type: MessageType;
  };
  unreadCount: number;
  lastMessageAt: Date;
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
export class MessageService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/messages`;

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.baseUrl}/conversations`);
  }

  getMessages(conversationId: string, params?: { page?: number; limit?: number }): Observable<PaginatedResponse<Message>> {
    return this.http.get<PaginatedResponse<Message>>(`${this.baseUrl}/conversations/${conversationId}`, { params: params as any });
  }

  sendMessage(data: { conversationId: string; content: string; type?: MessageType; attachmentUrl?: string }): Observable<Message> {
    return this.http.post<Message>(this.baseUrl, data);
  }

  markAsRead(conversationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/conversations/${conversationId}/read`, {});
  }

  getUnreadCount(): Observable<{ unread: number }> {
    return this.http.get<{ unread: number }>(`${this.baseUrl}/unread`);
  }
}
