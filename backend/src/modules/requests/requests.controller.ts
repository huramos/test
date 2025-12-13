import { Response, NextFunction } from 'express';
import { RequestsService } from './requests.service';
import { AuthRequest } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

const requestsService = new RequestsService();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Gestión de solicitudes de habitación
 */

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.create(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const findMyRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.findByRequester(req.user!.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findReceivedRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.findByOwner(req.user!.id, req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.findOne(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const respond = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.respond(
      req.params.id,
      req.user!.id,
      req.body
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.cancel(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await requestsService.getStats(req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
