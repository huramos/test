export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  LOFT = 'LOFT',
  SHARED_APARTMENT = 'SHARED_APARTMENT'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  INACTIVE = 'INACTIVE'
}

export enum RentalType {
  ENTIRE = 'ENTIRE',
  BY_ROOMS = 'BY_ROOMS'
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  rentalType?: RentalType;
  address: PropertyAddress;
  features: PropertyFeatures;
  rules: PropertyRules;
  rooms: Room[];
  images: string[];
  monthlyRent: number;
  expenses?: number;
  availableFrom: Date;
  isVerified?: boolean;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyAddress {
  street: string;
  number: string;
  apartment?: string;
  comuna: string;
  city: string;
  region: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  nearbyPlaces?: string[];
}

export interface PropertyFeatures {
  totalRooms: number;
  availableRooms?: number;
  bathrooms: number;
  squareMeters?: number;
  furnished?: boolean;
  hasFurniture?: boolean;
  hasParking?: boolean;
  hasLaundry?: boolean;
  hasWifi?: boolean;
  hasHeating?: boolean;
  hasAC?: boolean;
  hasTerrace?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  hasSecurity?: boolean;
  hasElevator?: boolean;
  hasWasher?: boolean;
  hasDryer?: boolean;
  hasConcierge?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  floor?: number;
  floorNumber?: number;
}

export interface PropertyRules {
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partiesAllowed: boolean;
  visitorsAllowed?: boolean;
  guestsAllowed?: boolean;
  childrenAllowed?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  minStayMonths?: number;
  maxOccupants?: number;
  genderPreference?: 'male' | 'female' | 'any';
  studentsOnly?: boolean;
  workersOnly?: boolean;
  maxAge?: number;
  minAge?: number;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  squareMeters?: number;
  monthlyRent: number;
  isPrivateBathroom: boolean;
  isAvailable: boolean;
  currentOccupantId?: string;
  features: RoomFeatures;
  images: string[];
}

export interface RoomFeatures {
  hasBed: boolean;
  hasCloset: boolean;
  hasDesk: boolean;
  hasWindow: boolean;
  hasBalcony: boolean;
  hasPrivateEntrance: boolean;
}

export interface PropertyWithOwner extends Property {
  ownerName: string;
  ownerAvatar?: string;
  ownerRating?: number;
  ownerPhone?: string;
}

export interface PropertySearchFilters {
  query?: string;
  type?: PropertyType;
  comuna?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  availableFrom?: Date;
}
