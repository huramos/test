import { Response, NextFunction } from 'express';
import { MatchesService } from './matches.service';
import { AuthRequest } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

const matchesService = new MatchesService();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Gestión de matches (arrendamientos acordados)
 */

export const findMyMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let result;
    if (req.user!.role === UserRole.ROOMIE) {
      result = await matchesService.findByRoomie(req.user!.id, req.query as any);
    } else {
      result = await matchesService.findByOwner(req.user!.id, req.query as any);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await matchesService.findOne(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await matchesService.update(
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

export const rateAsRoomie = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await matchesService.rateAsRoomie(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rateAsOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await matchesService.rateAsOwner(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await matchesService.getStats(req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
