import { PropertyStatus, UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyFilterDto
} from './properties.dto';
import {
  NotFoundException,
  ForbiddenException
} from '../../common/filters/error.filter';

export class PropertiesService {
  async create(ownerId: string, dto: CreatePropertyDto) {
    const property = await prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        address: dto.address as any,
        features: dto.features as any,
        rules: dto.rules as any,
        monthlyRent: dto.monthlyRent,
        commonExpenses: dto.commonExpenses,
        depositMonths: dto.depositMonths,
        images: dto.images,
        minimumStay: dto.minimumStay,
        ownerId,
        status: PropertyStatus.AVAILABLE,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null
      }
    });

    return property;
  }

  async findAll(filters: PropertyFilterDto) {
    const {
      comuna,
      city,
      type,
      status,
      priceMin,
      priceMax,
      rooms,
      bathrooms,
      petsAllowed,
      page = 1,
      limit = 10
    } = filters;

    // Build where clause
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = PropertyStatus.AVAILABLE;
    }

    if (priceMin) {
      where.monthlyRent = { ...where.monthlyRent, gte: priceMin };
    }

    if (priceMax) {
      where.monthlyRent = { ...where.monthlyRent, lte: priceMax };
    }

    // For JSON field filtering in Prisma (address, features, rules)
    // Complex filtering on JSON fields may need raw queries

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: {
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
      }),
      prisma.property.count({ where })
    ]);

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
        rooms: true
      }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    // Increment views
    await prisma.property.update({
      where: { id },
      data: { views: property.views + 1 }
    });

    return {
      ...property,
      owner: {
        id: property.owner.id,
        firstName: property.owner.firstName,
        lastName: property.owner.lastName,
        avatar: property.owner.avatar,
        phone: property.owner.phone
      }
    };
  }

  async findByOwner(ownerId: string) {
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: { rooms: true },
      orderBy: { createdAt: 'desc' }
    });

    return properties;
  }

  async update(id: string, userId: string, userRole: UserRole, dto: UpdatePropertyDto) {
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    // Only owner or admin can update
    if (userRole !== UserRole.ADMIN && property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta propiedad');
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        status: dto.status,
        address: dto.address as any,
        features: dto.features as any,
        rules: dto.rules as any,
        monthlyRent: dto.monthlyRent,
        commonExpenses: dto.commonExpenses,
        depositMonths: dto.depositMonths,
        images: dto.images,
        minimumStay: dto.minimumStay,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : property.availableFrom
      }
    });

    return updatedProperty;
  }

  async updateStatus(id: string, userId: string, userRole: UserRole, status: PropertyStatus) {
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (userRole !== UserRole.ADMIN && property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta propiedad');
    }

    return await prisma.property.update({
      where: { id },
      data: { status }
    });
  }

  async verify(id: string) {
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    return await prisma.property.update({
      where: { id },
      data: { isVerified: true }
    });
  }

  async delete(id: string, userId: string, userRole: UserRole) {
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    if (userRole !== UserRole.ADMIN && property.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta propiedad');
    }

    await prisma.property.delete({ where: { id } });
    return { message: 'Propiedad eliminada correctamente' };
  }

  async getStats(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};

    const [total, available, occupied, totalViewsResult] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.count({ where: { ...where, status: PropertyStatus.AVAILABLE } }),
      prisma.property.count({ where: { ...where, status: PropertyStatus.OCCUPIED } }),
      prisma.property.aggregate({
        where,
        _sum: { views: true }
      })
    ]);

    return {
      total,
      available,
      occupied,
      inactive: total - available - occupied,
      totalViews: totalViewsResult._sum.views || 0
    };
  }
}
