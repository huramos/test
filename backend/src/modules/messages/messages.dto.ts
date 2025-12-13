import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsString({ message: 'El ID de la conversación es requerido' })
  conversationId: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsString({ message: 'El contenido es requerido' })
  content: string;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class MessageFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
