import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean
} from 'class-validator';
import { UserRole } from '@prisma/client';

// DTO para registrar usuario después de autenticarse con Firebase
export class RegisterDto {
  @IsString({ message: 'El Firebase UID es requerido' })
  firebaseUid: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString({ message: 'El nombre es requerido' })
  firstName: string;

  @IsString({ message: 'El apellido es requerido' })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsEnum([UserRole.PROPIETARIO, UserRole.ROOMIE], {
    message: 'El rol debe ser PROPIETARIO o ROOMIE'
  })
  role: typeof UserRole.PROPIETARIO | typeof UserRole.ROOMIE;

  @IsOptional()
  @IsBoolean()
  hasRoom?: boolean;
}

// DTO para sincronizar/verificar usuario con Firebase token
export class SyncUserDto {
  @IsString({ message: 'El Firebase token es requerido' })
  firebaseToken: string;
}

// DTO para actualizar perfil
export class UpdateProfileDto {
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
