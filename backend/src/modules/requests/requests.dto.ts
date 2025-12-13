import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus, RequestType } from '@prisma/client';

export class CreateRequestDto {
  @IsString({ message: 'El ID de la habitación es requerido' })
  roomId: string;

  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  proposedMoveIn?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  proposedStayMonths?: number;
}

export class RespondRequestDto {
  @IsEnum(['ACCEPTED', 'REJECTED'], {
    message: 'La respuesta debe ser ACCEPTED o REJECTED'
  })
  status: 'ACCEPTED' | 'REJECTED';

  @IsOptional()
  @IsString()
  responseMessage?: string;
}

export class RequestFilterDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
