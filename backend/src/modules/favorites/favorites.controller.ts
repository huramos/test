import { Response, NextFunction } from 'express';
import { FavoritesService } from './favorites.service';
import { AuthRequest } from '../../common/guards/auth.guard';

const favoritesService = new FavoritesService();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gestión de propiedades favoritas
 */

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.create(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const findMyFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.findByUser(req.user!.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.remove(req.user!.id, req.params.propertyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const toggle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.toggle(req.user!.id, req.params.propertyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const check = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.check(req.user!.id, req.params.propertyId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const checkMultiple = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const propertyIds = req.body.propertyIds || [];
    const result = await favoritesService.checkMultiple(req.user!.id, propertyIds);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await favoritesService.getCount(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
