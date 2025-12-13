import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthRequest } from '../../common/guards/auth.guard';

const usersService = new UsersService();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar usuarios (Admin)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, PROPIETARIO, ROOMIE]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, BANNED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
export const findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.findAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
export const findOne = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.findOne(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.update(
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
 * /users/{id}/status:
 *   patch:
 *     summary: Actualizar estado de usuario (Admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING, BANNED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.updateStatus(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/profile/roomie:
 *   get:
 *     summary: Obtener mi perfil de roomie
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Perfil de roomie
 */
export const getMyRoomieProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.getRoomieProfile(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/profile/roomie:
 *   patch:
 *     summary: Actualizar mi perfil de roomie
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
export const updateMyRoomieProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.updateRoomieProfile(req.user!.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/roomies:
 *   get:
 *     summary: Buscar roomies
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: hasRoom
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: comuna
 *         schema:
 *           type: string
 *       - in: query
 *         name: budgetMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista de roomies
 */
export const findRoomies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.findRoomies(req.query as any);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar usuario (Admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
