export enum UserRole {
  ADMIN = 'ADMIN',
  PROPIETARIO = 'PROPIETARIO',
  ROOMIE = 'ROOMIE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BANNED = 'BANNED'
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Propietario extends User {
  role: UserRole.PROPIETARIO;
  properties: string[];
  verifiedOwner: boolean;
  rating?: number;
  totalReviews?: number;
}

export interface Roomie extends User {
  role: UserRole.ROOMIE;
  preferences: RoomiePreferences;
  hasRoom: boolean;
  currentPropertyId?: string;
  occupation?: string;
  age?: number;
  verifiedIdentity: boolean;
  rating?: number;
  totalReviews?: number;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions: string[];
}

export interface RoomiePreferences {
  minBudget?: number;
  maxBudget?: number;
  preferredZones?: string[];
  preferredCommunas?: string[];
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  preferredGender?: 'male' | 'female' | 'any';
  preferredAgeMin?: number;
  preferredAgeMax?: number;
  quietEnvironment?: boolean;
  studentsOnly?: boolean;
  workersOnly?: boolean;
}

export interface RegisterData {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.PROPIETARIO | UserRole.ROOMIE;
  phone?: string;
  avatar?: string;
  hasRoom?: boolean;
}

export interface SyncUserResponse {
  isRegistered: boolean;
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}
