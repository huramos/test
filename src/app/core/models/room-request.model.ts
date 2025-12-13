export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum RequestType {
  ROOMIE_TO_PROPERTY = 'ROOMIE_TO_PROPERTY',
  ROOMIE_TO_ROOMIE = 'ROOMIE_TO_ROOMIE'
}

export interface RoomRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  roomId?: string;
  message: string;
  moveInDate?: Date;
  stayDurationMonths?: number;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

export interface RoomRequestWithDetails extends RoomRequest {
  senderName: string;
  senderAvatar?: string;
  senderOccupation?: string;
  senderAge?: number;
  senderRating?: number;
  receiverName: string;
  receiverAvatar?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  propertyImage?: string;
  roomName?: string;
  monthlyRent?: number;
}

export interface Match {
  id: string;
  requestId: string;
  propertyId?: string;
  roomId?: string;
  participants: MatchParticipant[];
  status: MatchStatus;
  startDate?: Date;
  endDate?: Date;
  monthlyRent: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum MatchStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface MatchParticipant {
  userId: string;
  role: 'owner' | 'roomie';
  joinedAt: Date;
}

export interface MatchWithDetails extends Match {
  propertyTitle?: string;
  propertyAddress?: string;
  propertyImage?: string;
  participantsInfo: {
    userId: string;
    name: string;
    avatar?: string;
    role: 'owner' | 'roomie';
    phone?: string;
    email?: string;
  }[];
}

export interface Conversation {
  id: string;
  matchId?: string;
  requestId?: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ConversationWithDetails extends Conversation {
  participantsInfo: {
    userId: string;
    name: string;
    avatar?: string;
  }[];
  messages: Message[];
}
