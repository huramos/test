import { Response, NextFunction } from 'express';
import { PropertiesService } from './properties.service';
import { AuthRequest } from '../../common/guards/auth.guard';
import { PropertyStatus } from '@prisma/client';

const propertiesService = new PropertiesService();

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Gestión de propiedades
 */

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Crear propiedad
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Propiedad creada
 */
export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.create(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Listar propiedades
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: comuna
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista de propiedades
 */
export const findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.findAll(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/my:
 *   get:
 *     summary: Mis propiedades (Propietario)
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Lista de mis propiedades
 */
export const findMyProperties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.findByOwner(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/stats:
 *   get:
 *     summary: Estadísticas de propiedades
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Estadísticas
 */
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.getStats(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/stats/all:
 *   get:
 *     summary: Estadísticas globales (Admin)
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: Estadísticas globales
 */
export const getAllStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.getStats();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Obtener propiedad por ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la propiedad
 */
export const findOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.findOne(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/{id}:
 *   patch:
 *     summary: Actualizar propiedad
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Propiedad actualizada
 */
export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.update(
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

/**
 * @swagger
 * /properties/{id}/status:
 *   patch:
 *     summary: Actualizar estado de propiedad
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, INACTIVE]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.updateStatus(
      req.params.id,
      req.user!.id,
      req.user!.role,
      req.body.status as PropertyStatus
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/{id}/verify:
 *   patch:
 *     summary: Verificar propiedad (Admin)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Propiedad verificada
 */
export const verify = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.verify(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Eliminar propiedad
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Propiedad eliminada
 */
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await propertiesService.delete(
      req.params.id,
      req.user!.id,
      req.user!.role
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};
