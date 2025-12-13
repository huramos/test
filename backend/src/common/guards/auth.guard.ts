import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../../config/firebase.config';
import { UserRole } from '@prisma/client';
import prisma from '../../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firebaseUid: string;
  };
}

export const authGuard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No autorizado',
        error: 'Token no proporcionado',
        statusCode: 401
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase token
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    // Find user in database by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });

    if (!user) {
      return res.status(401).json({
        message: 'No autorizado',
        error: 'Usuario no encontrado. Por favor regístrate primero.',
        statusCode: 401
      });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({
        message: 'Acceso denegado',
        error: 'Tu cuenta ha sido suspendida',
        statusCode: 403
      });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        message: 'Acceso denegado',
        error: 'Tu cuenta está inactiva',
        statusCode: 403
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firebaseUid: decodedToken.uid
    };

    next();
  } catch (error: any) {
    console.error('Auth error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        message: 'No autorizado',
        error: 'Token expirado',
        statusCode: 401
      });
    }

    return res.status(401).json({
      message: 'No autorizado',
      error: 'Token inválido',
      statusCode: 401
    });
  }
};

export const roleGuard = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'No autorizado',
        error: 'Usuario no autenticado',
        statusCode: 401
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acceso denegado',
        error: 'No tienes permisos para acceder a este recurso',
        statusCode: 403
      });
    }

    next();
  };
};
