import { RoomStatus, UserRole, RentalType, PropertyStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { CreateRoomDto, UpdateRoomDto, RoomFilterDto } from './rooms.dto';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '../../common/filters/error.filter';

export class RoomsService {
  async create(userId: string, dto: CreateRoomDto) {
    // Verify property exists and user owns it
    const property = await prisma.property.findUnique({
      where: { id: dto.propertyId }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para agregar habitaciones a esta propiedad');
    }

    // Only allow rooms for BY_ROOMS rental type
    if (property.rentalType !== RentalType.BY_ROOMS) {
      throw new BadRequestException('Solo puedes agregar habitaciones a propiedades con arriendo por habitaciones');
    }

    const room = await prisma.room.create({
      data: {
        propertyId: dto.propertyId,
        name: dto.name,
        description: dto.description,
        squareMeters: dto.squareMeters,
        bedType: dto.bedType,
        hasPrivateBathroom: dto.hasPrivateBathroom,
        hasCloset: dto.hasCloset,
        hasDesk: dto.hasDesk,
        hasWindow: dto.hasWindow,
        hasAC: dto.hasAC,
        hasHeating: dto.hasHeating,
        hasTV: dto.hasTV,
        isFurnished: dto.isFurnished,
        monthlyRent: dto.monthlyRent,
        images: dto.images || [],
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        status: RoomStatus.AVAILABLE
      }
    });

    return room;
  }

  async findByProperty(propertyId: string, filters: RoomFilterDto) {
    const { status } = filters;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const where: any = { propertyId };

    if (status) {
      where.status = status;
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
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

  async findOne(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true
              }
            }
          }
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

    // Only owner or admin can update
    if (userRole !== UserRole.ADMIN && room.property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta habitación');
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        squareMeters: dto.squareMeters,
        bedType: dto.bedType,
        hasPrivateBathroom: dto.hasPrivateBathroom,
        hasCloset: dto.hasCloset,
        hasDesk: dto.hasDesk,
        hasWindow: dto.hasWindow,
        hasAC: dto.hasAC,
        hasHeating: dto.hasHeating,
        hasTV: dto.hasTV,
        isFurnished: dto.isFurnished,
        monthlyRent: dto.monthlyRent,
        images: dto.images,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : room.availableFrom
      }
    });

    return updatedRoom;
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

    // Check if room has active matches
    const activeMatch = await prisma.match.findFirst({
      where: {
        roomId: id,
        status: { in: ['ACTIVE', 'PENDING_PAYMENT', 'CONFIRMED'] }
      }
    });

    if (activeMatch) {
      throw new ForbiddenException('No puedes eliminar una habitación con un match activo');
    }

    await prisma.room.delete({ where: { id } });
    return { message: 'Habitación eliminada correctamente' };
  }

  async findAvailable(filters: RoomFilterDto) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const where = {
      status: RoomStatus.AVAILABLE,
      property: {
        rentalType: RentalType.BY_ROOMS,
        status: PropertyStatus.AVAILABLE
      }
    };

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          property: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        },
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
}
