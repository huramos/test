import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { firebaseAuth } from '../../config/firebase.config';
import { RegisterDto, UpdateProfileDto } from './auth.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException
} from '../../common/filters/error.filter';

export class AuthService {
  /**
   * Register a new user after Firebase authentication
   * Called from frontend after successful Firebase signup
   */
  async register(dto: RegisterDto) {
    // Verify that the Firebase UID exists
    try {
      await firebaseAuth.getUser(dto.firebaseUid);
    } catch (error) {
      throw new BadRequestException('Firebase UID inválido');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: dto.firebaseUid },
          { email: dto.email.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya está registrado');
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firebaseUid: dto.firebaseUid,
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar,
        role: dto.role,
        status: UserStatus.ACTIVE,
        emailVerified: true // Firebase handles email verification
      }
    });

    // If ROOMIE, create profile
    if (dto.role === UserRole.ROOMIE) {
      await prisma.roomieProfile.create({
        data: {
          userId: user.id,
          hasRoom: dto.hasRoom || false
        }
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status
      },
      message: 'Usuario registrado correctamente'
    };
  }

  /**
   * Sync/verify user from Firebase token
   * Called to check if Firebase user exists in our database
   */
  async syncUser(firebaseToken: string) {
    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
    } catch (error: any) {
      throw new UnauthorizedException('Token de Firebase inválido o expirado');
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { roomieProfile: true }
    });

    if (!user) {
      // User authenticated with Firebase but not registered in our system
      return {
        isRegistered: false,
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture
      };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return {
      isRegistered: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        roomieProfile: user.roomieProfile
      }
    };
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roomieProfile: true }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      roomieProfile: user.roomieProfile
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        avatar: dto.avatar
      }
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      status: updatedUser.status
    };
  }

  /**
   * Check if email is available for registration
   */
  async checkEmailAvailability(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    return {
      available: !user
    };
  }

  /**
   * Delete user account
   * Also deletes from Firebase
   */
  async deleteAccount(userId: string, firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Delete from Firebase
    try {
      await firebaseAuth.deleteUser(firebaseUid);
    } catch (error) {
      console.error('Error deleting Firebase user:', error);
    }

    // Delete from database (cascades to related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'Cuenta eliminada correctamente' };
  }
}
