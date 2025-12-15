import { MatchStatus, RoomStatus, UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import { UpdateMatchDto, RateMatchDto, MatchFilterDto } from './matches.dto';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '../../common/filters/error.filter';

export class MatchesService {
  async findByRoomie(roomieId: string, filters: MatchFilterDto) {
    const { status } = filters;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const where: any = { roomieId };

    if (status) {
      where.status = status;
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          room: {
            include: {
              property: {
                include: { owner: true }
              }
            }
          },
          conversation: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.match.count({ where })
    ]);

    return {
      data: matches.map((match) => ({
        ...match,
        room: {
          ...match.room,
          property: {
            ...match.room.property,
            owner: {
              id: match.room.property.owner.id,
              firstName: match.room.property.owner.firstName,
              lastName: match.room.property.owner.lastName,
              avatar: match.room.property.owner.avatar,
              phone: match.room.property.owner.phone
            }
          }
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

  async findByOwner(ownerId: string, filters: MatchFilterDto) {
    const { status } = filters;
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;

    const where: any = {
      room: {
        property: {
          ownerId
        }
      }
    };

    if (status) {
      where.status = status;
    }

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          room: {
            include: { property: true }
          },
          roomie: true,
          conversation: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.match.count({ where })
    ]);

    return {
      data: matches.map((match) => ({
        ...match,
        roomie: {
          id: match.roomie.id,
          firstName: match.roomie.firstName,
          lastName: match.roomie.lastName,
          avatar: match.roomie.avatar,
          email: match.roomie.email,
          phone: match.roomie.phone
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

  async findOne(id: string, userId: string, userRole: UserRole) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            property: {
              include: { owner: true }
            }
          }
        },
        roomie: true,
        conversation: true
      }
    });

    if (!match) {
      throw new NotFoundException('Match no encontrado');
    }

    // Check access
    const isOwner = match.room.property.ownerId === userId;
    const isRoomie = match.roomieId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isRoomie && !isAdmin) {
      throw new ForbiddenException('No tienes acceso a este match');
    }

    return match;
  }

  async update(id: string, userId: string, userRole: UserRole, dto: UpdateMatchDto) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        room: {
          include: { property: true }
        }
      }
    });

    if (!match) {
      throw new NotFoundException('Match no encontrado');
    }

    const isOwner = match.room.property.ownerId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para actualizar este match');
    }

    // If confirmed, update room status
    if (dto.status === MatchStatus.CONFIRMED) {
      await prisma.room.update({
        where: { id: match.roomId },
        data: { status: RoomStatus.OCCUPIED }
      });
    }

    // If cancelled/completed, make room available again
    if (dto.status === MatchStatus.CANCELLED || dto.status === MatchStatus.COMPLETED) {
      await prisma.room.update({
        where: { id: match.roomId },
        data: { status: RoomStatus.AVAILABLE }
      });
    }

    return await prisma.match.update({
      where: { id },
      data: {
        ...dto,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : match.moveInDate,
        moveOutDate: dto.moveOutDate ? new Date(dto.moveOutDate) : match.moveOutDate
      }
    });
  }

  async rateAsRoomie(id: string, roomieId: string, dto: RateMatchDto) {
    const match = await prisma.match.findFirst({
      where: { id, roomieId }
    });

    if (!match) {
      throw new NotFoundException('Match no encontrado');
    }

    if (match.status !== MatchStatus.COMPLETED) {
      throw new BadRequestException('Solo puedes calificar matches completados');
    }

    if (match.ownerRating) {
      throw new BadRequestException('Ya has calificado este match');
    }

    return await prisma.match.update({
      where: { id },
      data: {
        ownerRating: dto.rating,
        ownerReview: dto.review || null
      }
    });
  }

  async rateAsOwner(id: string, ownerId: string, dto: RateMatchDto) {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        room: {
          include: { property: true }
        }
      }
    });

    if (!match || match.room.property.ownerId !== ownerId) {
      throw new NotFoundException('Match no encontrado');
    }

    if (match.status !== MatchStatus.COMPLETED) {
      throw new BadRequestException('Solo puedes calificar matches completados');
    }

    if (match.roomieRating) {
      throw new BadRequestException('Ya has calificado este match');
    }

    return await prisma.match.update({
      where: { id },
      data: {
        roomieRating: dto.rating,
        roomieReview: dto.review || null
      }
    });
  }

  async getStats(userId: string, role: UserRole) {
    let where: any = {};

    if (role === UserRole.PROPIETARIO) {
      where = {
        room: {
          property: {
            ownerId: userId
          }
        }
      };
    } else if (role === UserRole.ROOMIE) {
      where = { roomieId: userId };
    }

    const [total, active, completed] = await Promise.all([
      prisma.match.count({ where }),
      prisma.match.count({
        where: {
          ...where,
          status: { in: [MatchStatus.ACTIVE, MatchStatus.PENDING_PAYMENT, MatchStatus.CONFIRMED] }
        }
      }),
      prisma.match.count({ where: { ...where, status: MatchStatus.COMPLETED } })
    ]);

    return {
      total,
      active,
      completed,
      cancelled: total - active - completed
    };
  }
}
