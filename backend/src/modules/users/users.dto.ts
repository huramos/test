import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsObject,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, Gender, Occupation } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Estado inválido' })
  status: UserStatus;
}

class PreferencesDto {
  @IsOptional()
  @IsArray()
  preferredLocations?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  moveInDate?: string;

  @IsOptional()
  @IsString()
  stayDuration?: string;

  @IsOptional()
  @IsString()
  roommates?: string;

  @IsOptional()
  @IsBoolean()
  petFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  smokingAllowed?: boolean;

  @IsOptional()
  @IsString()
  preferredGender?: string;

  @IsOptional()
  @IsObject()
  preferredAgeRange?: { min: number; max: number };
}

class LifestyleDto {
  @IsOptional()
  @IsString()
  sleepSchedule?: string;

  @IsOptional()
  @IsString()
  workSchedule?: string;

  @IsOptional()
  @IsString()
  cleanlinessLevel?: string;

  @IsOptional()
  @IsString()
  socialLevel?: string;

  @IsOptional()
  @IsString()
  noiseLevel?: string;

  @IsOptional()
  @IsString()
  guests?: string;

  @IsOptional()
  @IsString()
  cooking?: string;
}

export class UpdateRoomieProfileDto {
  @IsOptional()
  @IsBoolean()
  hasRoom?: boolean;

  @IsOptional()
  @IsString()
  birthdate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Occupation)
  occupation?: Occupation;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LifestyleDto)
  lifestyle?: LifestyleDto;

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsArray()
  languages?: string[];
}

export class UserFilterDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
