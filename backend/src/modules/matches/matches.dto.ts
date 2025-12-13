import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchDto {
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  moveInDate?: string;

  @IsOptional()
  @IsString()
  moveOutDate?: string;

  @IsOptional()
  @IsBoolean()
  depositPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  contractSigned?: boolean;

  @IsOptional()
  @IsString()
  contractUrl?: string;
}

export class RateMatchDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}

export class MatchFilterDto {
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
