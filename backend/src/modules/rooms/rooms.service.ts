import { RoomStatus, UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import { CreateRoomDto, UpdateRoomDto, RoomFilterDto } from './rooms.dto';
import {
  NotFoundException,
  ForbiddenException
} from '../../common/filters/error.filter';

export class RoomsService {
  async create(userId: string, dto: CreateRoomDto) {
    // Verify property exists and belongs to user
    const property = await prisma.property.findUnique({
      where: { id: dto.propertyId }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para agregar habitaciones a esta propiedad');
    }

    const room = await prisma.room.create({
      data: {
        ...dto,
        status: RoomStatus.AVAILABLE,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null
      }
    });

    return room;
  }

  async findAll(filters: RoomFilterDto) {
    const {
      propertyId,
      status,
      priceMin,
      priceMax,
      hasPrivateBathroom,
      page = 1,
      limit = 10
    } = filters;

    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = RoomStatus.AVAILABLE;
    }

    if (priceMin) {
      where.monthlyRent = { ...where.monthlyRent, gte: priceMin };
    }

    if (priceMax) {
      where.monthlyRent = { ...where.monthlyRent, lte: priceMax };
    }

    if (hasPrivateBathroom !== undefined) {
      where.hasPrivateBathroom = hasPrivateBathroom;
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: { property: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.room.count({ where })
    ]);

    return {
      data: rooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByProperty(propertyId: string) {
    return await prisma.room.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async findOne(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        property: {
          include: { owner: true }
        }
      }
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    return room;
  }

  async update(id: string, userId: string, userRole: UserRole, dto: UpdateRoomDto) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    if (userRole !== UserRole.ADMIN && room.property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta habitación');
    }

    return await prisma.room.update({
      where: { id },
      data: {
        ...dto,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : room.availableFrom
      }
    });
  }

  async updateStatus(id: string, userId: string, userRole: UserRole, status: RoomStatus) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    if (userRole !== UserRole.ADMIN && room.property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta habitación');
    }

    return await prisma.room.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    if (userRole !== UserRole.ADMIN && room.property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta habitación');
    }

    await prisma.room.delete({ where: { id } });
    return { message: 'Habitación eliminada correctamente' };
  }
}
