import { Response, NextFunction } from 'express';
import { RoomsService } from './rooms.service';
import { AuthRequest } from '../../common/guards/auth.guard';

const roomsService = new RoomsService();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Gestión de habitaciones dentro de propiedades
 */

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.create(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const findByProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.findByProperty(req.params.propertyId, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.findOne(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.update(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.updateStatus(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body.status
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.delete(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findAvailable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await roomsService.findAvailable(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
