import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  UpdateUserDto,
  UpdateUserStatusDto,
  UpdateRoomieProfileDto,
  UserFilterDto
} from './users.dto';
import {
  NotFoundException,
  ForbiddenException
} from '../../common/filters/error.filter';

export class UsersService {
  async findAll(filters: UserFilterDto) {
    const { role, status, search, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        roomieProfile: true
      }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async update(id: string, userId: string, userRole: UserRole, dto: UpdateUserDto) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Only admin or the user themselves can update
    if (userRole !== UserRole.ADMIN && id !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });

    return updatedUser;
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });

    return updatedUser;
  }

  async updateRoomieProfile(userId: string, dto: UpdateRoomieProfileDto) {
    let profile = await prisma.roomieProfile.findUnique({
      where: { userId }
    });

    const profileData = {
      hasRoom: dto.hasRoom,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      gender: dto.gender,
      occupation: dto.occupation,
      bio: dto.bio,
      preferences: dto.preferences as any,
      lifestyle: dto.lifestyle as any,
      interests: dto.interests,
      languages: dto.languages
    };

    if (!profile) {
      // Create profile if doesn't exist
      profile = await prisma.roomieProfile.create({
        data: {
          userId,
          ...profileData,
          profileCompletion: this.calculateProfileCompletion(profileData)
        }
      });
    } else {
      // Calculate profile completion
      const completionData = { ...profile, ...profileData };
      profile = await prisma.roomieProfile.update({
        where: { userId },
        data: {
          ...profileData,
          profileCompletion: this.calculateProfileCompletion(completionData)
        }
      });
    }

    return profile;
  }

  async getRoomieProfile(userId: string) {
    const profile = await prisma.roomieProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile) {
      throw new NotFoundException('Perfil de roomie no encontrado');
    }

    return profile;
  }

  async findRoomies(filters: {
    hasRoom?: boolean;
    comuna?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
  }) {
    const { hasRoom, comuna, budgetMin, budgetMax, page = 1, limit = 10 } = filters;

    const where: any = {
      user: {
        role: UserRole.ROOMIE,
        status: UserStatus.ACTIVE
      }
    };

    if (hasRoom !== undefined) {
      where.hasRoom = hasRoom;
    }

    // For JSON field filtering in Prisma, we use path queries
    // Note: Complex JSON queries may need raw SQL for PostgreSQL
    const profiles = await prisma.roomieProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.roomieProfile.count({ where });

    return {
      data: profiles.map((profile) => ({
        ...profile,
        user: {
          id: profile.user.id,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
          avatar: profile.user.avatar
        }
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado correctamente' };
  }

  private calculateProfileCompletion(profile: any): number {
    let completed = 0;
    const fields = [
      profile.birthdate,
      profile.gender,
      profile.occupation,
      profile.bio,
      profile.preferences,
      profile.lifestyle,
      profile.interests?.length,
      profile.languages?.length
    ];

    fields.forEach((field) => {
      if (field) completed++;
    });

    return Math.round((completed / fields.length) * 100);
  }
}
