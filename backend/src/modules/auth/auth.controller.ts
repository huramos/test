import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../common/guards/auth.guard';

const authService = new AuthService();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación con Firebase y gestión de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar usuario en el sistema (después de Firebase auth)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firebaseUid
 *               - email
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               firebaseUid:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [PROPIETARIO, ROOMIE]
 *               hasRoom:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: El usuario ya está registrado
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/sync:
 *   post:
 *     summary: Sincronizar usuario de Firebase con el sistema
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firebaseToken
 *             properties:
 *               firebaseToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado de registro del usuario
 */
export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.syncUser(req.body.firebaseToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual autenticado
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autorizado
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getCurrentUser(req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Actualizar perfil del usuario
 *     tags: [Auth]
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
 *         description: Perfil actualizado
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.updateProfile(req.user!.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/check-email:
 *   get:
 *     summary: Verificar disponibilidad de email
 *     tags: [Auth]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de disponibilidad
 */
export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.checkEmailAvailability(req.query.email as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /auth/account:
 *   delete:
 *     summary: Eliminar cuenta de usuario
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Cuenta eliminada
 */
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.deleteAccount(req.user!.id, req.user!.firebaseUid);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
