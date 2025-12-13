import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoomStatus, BedType } from '@prisma/client';

export class CreateRoomDto {
  @IsString({ message: 'El ID de la propiedad es requerido' })
  propertyId: string;

  @IsString({ message: 'El nombre es requerido' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @IsOptional()
  @IsEnum(BedType)
  bedType?: BedType;

  @IsOptional()
  @IsBoolean()
  hasPrivateBathroom?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCloset?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDesk?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWindow?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAC?: boolean;

  @IsOptional()
  @IsBoolean()
  hasHeating?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTV?: boolean;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean;

  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  availableFrom?: string;
}

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @IsOptional()
  @IsEnum(BedType)
  bedType?: BedType;

  @IsOptional()
  @IsBoolean()
  hasPrivateBathroom?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCloset?: boolean;

  @IsOptional()
  @IsBoolean()
  hasDesk?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWindow?: boolean;

  @IsOptional()
  @IsBoolean()
  hasAC?: boolean;

  @IsOptional()
  @IsBoolean()
  hasHeating?: boolean;

  @IsOptional()
  @IsBoolean()
  hasTV?: boolean;

  @IsOptional()
  @IsBoolean()
  isFurnished?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRent?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  availableFrom?: string;
}

export class RoomFilterDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMax?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasPrivateBathroom?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
