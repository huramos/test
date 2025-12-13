import { RequestStatus, RequestType, RoomStatus, MatchStatus, UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import { CreateRequestDto, RespondRequestDto, RequestFilterDto } from './requests.dto';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException
} from '../../common/filters/error.filter';

export class RequestsService {
  async create(requesterId: string, dto: CreateRequestDto) {
    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { property: true }
    });

    if (!room) {
      throw new NotFoundException('Habitación no encontrada');
    }

    if (room.status !== RoomStatus.AVAILABLE) {
      throw new BadRequestException('La habitación no está disponible');
    }

    // Check if user already has a pending request for this room
    const existingRequest = await prisma.roomRequest.findFirst({
      where: {
        roomId: dto.roomId,
        requesterId,
        status: RequestStatus.PENDING
      }
    });

    if (existingRequest) {
      throw new ConflictException('Ya tienes una solicitud pendiente para esta habitación');
    }

    // Set expiration date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const request = await prisma.roomRequest.create({
      data: {
        ...dto,
        requesterId,
        type: dto.type || RequestType.ROOM_REQUEST,
        status: RequestStatus.PENDING,
        proposedMoveIn: dto.proposedMoveIn ? new Date(dto.proposedMoveIn) : null,
        expiresAt
      }
    });

    return request;
  }

  async findByRequester(requesterId: string, filters: RequestFilterDto) {
    const { status, type, page = 1, limit = 10 } = filters;

    const where: any = { requesterId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [requests, total] = await Promise.all([
      prisma.roomRequest.findMany({
        where,
        include: {
          room: {
            include: { property: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.roomRequest.count({ where })
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findByOwner(ownerId: string, filters: RequestFilterDto) {
    const { status, type, page = 1, limit = 10 } = filters;

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

    if (type) {
      where.type = type;
    }

    const [requests, total] = await Promise.all([
      prisma.roomRequest.findMany({
        where,
        include: {
          room: {
            include: { property: true }
          },
          requester: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.roomRequest.count({ where })
    ]);

    return {
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const request = await prisma.roomRequest.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            property: {
              include: { owner: true }
            }
          }
        },
        requester: true
      }
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Check access
    const isOwner = request.room.property.ownerId === userId;
    const isRequester = request.requesterId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isRequester && !isAdmin) {
      throw new ForbiddenException('No tienes acceso a esta solicitud');
    }

    return request;
  }

  async respond(id: string, ownerId: string, dto: RespondRequestDto) {
    const request = await prisma.roomRequest.findUnique({
      where: { id },
      include: {
        room: {
          include: { property: true }
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.room.property.ownerId !== ownerId) {
      throw new ForbiddenException('No tienes permiso para responder esta solicitud');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Esta solicitud ya fue procesada');
    }

    const updatedRequest = await prisma.roomRequest.update({
      where: { id },
      data: {
        status: dto.status,
        responseMessage: dto.responseMessage || null,
        respondedAt: new Date()
      }
    });

    // If accepted, create match and conversation
    if (dto.status === RequestStatus.ACCEPTED) {
      // Update room status
      await prisma.room.update({
        where: { id: request.roomId },
        data: { status: RoomStatus.RESERVED }
      });

      // Create match
      const match = await prisma.match.create({
        data: {
          roomId: request.roomId,
          roomieId: request.requesterId,
          status: MatchStatus.ACTIVE,
          monthlyRent: request.room.monthlyRent,
          moveInDate: request.proposedMoveIn
        }
      });

      // Create conversation
      await prisma.conversation.create({
        data: {
          matchId: match.id,
          isActive: true
        }
      });

      // Reject other pending requests for this room
      await prisma.roomRequest.updateMany({
        where: {
          roomId: request.roomId,
          status: RequestStatus.PENDING,
          id: { not: id }
        },
        data: {
          status: RequestStatus.REJECTED,
          responseMessage: 'La habitación ya fue reservada',
          respondedAt: new Date()
        }
      });
    }

    return updatedRequest;
  }

  async cancel(id: string, requesterId: string) {
    const request = await prisma.roomRequest.findFirst({
      where: { id, requesterId }
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar solicitudes pendientes');
    }

    return await prisma.roomRequest.update({
      where: { id },
      data: { status: RequestStatus.CANCELLED }
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
      where = { requesterId: userId };
    }

    const [total, pending, accepted, rejected] = await Promise.all([
      prisma.roomRequest.count({ where }),
      prisma.roomRequest.count({ where: { ...where, status: RequestStatus.PENDING } }),
      prisma.roomRequest.count({ where: { ...where, status: RequestStatus.ACCEPTED } }),
      prisma.roomRequest.count({ where: { ...where, status: RequestStatus.REJECTED } })
    ]);

    return {
      total,
      pending,
      accepted,
      rejected
    };
  }
}
