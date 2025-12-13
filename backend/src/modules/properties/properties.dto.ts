import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyStatus } from '@prisma/client';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  apartment?: string;

  @IsString()
  comuna: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsObject()
  coordinates?: { lat: number; lng: number };
}

class FeaturesDto {
  @IsNumber()
  @Min(1)
  totalRooms: number;

  @IsNumber()
  @Min(0)
  availableRooms: number;

  @IsNumber()
  @Min(1)
  bathrooms: number;

  @IsNumber()
  @Min(1)
  squareMeters: number;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @IsOptional()
  @IsBoolean()
  hasFurniture?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWifi?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAC?: boolean;

  @IsOptional()
  @IsBoolean()
  hasHeating?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWasher?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDryer?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBalcony?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTerrace?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGarden?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPool?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGym?: boolean;

  @IsOptional()
  @IsBoolean()
  hasSecurity?: boolean;

  @IsOptional()
  @IsBoolean()
  hasConcierge?: boolean;
}

class RulesDto {
  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  childrenAllowed?: boolean;

  @IsOptional()
  @IsNumber()
  maxOccupants?: number;

  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @IsOptional()
  @IsString()
  quietHoursEnd?: string;

  @IsOptional()
  @IsBoolean()
  guestsAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  partiesAllowed?: boolean;
}

export class CreatePropertyDto {
  @IsString({ message: 'El título es requerido' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PropertyType, { message: 'Tipo de propiedad inválido' })
  type: PropertyType;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => FeaturesDto)
  features: FeaturesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RulesDto)
  rules?: RulesDto;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commonExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositMonths?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumStay?: number;
}

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RulesDto)
  rules?: RulesDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  commonExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositMonths?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minimumStay?: number;
}

export class PropertyFilterDto {
  @IsOptional()
  @IsString()
  comuna?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMax?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rooms?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bathrooms?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  petsAllowed?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
