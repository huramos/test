import prisma from '../../config/prisma';
import { CreateFavoriteDto, FavoriteFilterDto } from './favorites.dto';

export class FavoritesService {
  async create(userId: string, dto: CreateFavoriteDto) {
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: dto.propertyId }
    });

    if (!property) {
      throw { statusCode: 404, message: 'Propiedad no encontrada' };
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: dto.propertyId
        }
      }
    });

    if (existing) {
      throw { statusCode: 400, message: 'Ya tienes esta propiedad en favoritos' };
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId: dto.propertyId
      },
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
      }
    });

    return {
      message: 'Propiedad agregada a favoritos',
      data: favorite
    };
  }

  async findByUser(userId: string, filters: FavoriteFilterDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
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
        skip,
        take: limit
      }),
      prisma.favorite.count({ where: { userId } })
    ]);

    return {
      data: favorites,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async remove(userId: string, propertyId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });

    if (!favorite) {
      throw { statusCode: 404, message: 'Favorito no encontrado' };
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    return {
      message: 'Propiedad eliminada de favoritos'
    };
  }

  async toggle(userId: string, propertyId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return {
        message: 'Propiedad eliminada de favoritos',
        isFavorite: false
      };
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw { statusCode: 404, message: 'Propiedad no encontrada' };
    }

    await prisma.favorite.create({
      data: {
        userId,
        propertyId
      }
    });

    return {
      message: 'Propiedad agregada a favoritos',
      isFavorite: true
    };
  }

  async check(userId: string, propertyId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      }
    });

    return {
      isFavorite: !!favorite
    };
  }

  async checkMultiple(userId: string, propertyIds: string[]) {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
        propertyId: { in: propertyIds }
      },
      select: { propertyId: true }
    });

    const favoriteIds = favorites.map(f => f.propertyId);

    return {
      favorites: propertyIds.reduce((acc, id) => {
        acc[id] = favoriteIds.includes(id);
        return acc;
      }, {} as Record<string, boolean>)
    };
  }

  async getCount(userId: string) {
    const count = await prisma.favorite.count({
      where: { userId }
    });

    return { count };
  }
}
