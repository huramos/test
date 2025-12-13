import { Request, Response, NextFunction } from 'express';
import { envConfig } from '../../config/env.config';

export class HttpException extends Error {
  statusCode: number;
  error: string;

  constructor(message: string, statusCode: number, error?: string) {
    super(message);
    this.statusCode = statusCode;
    this.error = error || message;
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Solicitud inválida') {
    super(message, 400, 'Bad Request');
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'Unauthorized');
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403, 'Forbidden');
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404, 'Not Found');
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflicto') {
    super(message, 409, 'Conflict');
  }
}

export class InternalServerException extends HttpException {
  constructor(message: string = 'Error interno del servidor') {
    super(message, 500, 'Internal Server Error');
  }
}

export const errorFilter = (
  err: Error | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.error,
      statusCode: err.statusCode
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
      error: 'Validation Error',
      statusCode: 400
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido',
      error: 'Unauthorized',
      statusCode: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado',
      error: 'Unauthorized',
      statusCode: 401
    });
  }

  // Default error
  const isDev = envConfig.nodeEnv === 'development';
  return res.status(500).json({
    message: isDev ? err.message : 'Error interno del servidor',
    error: 'Internal Server Error',
    statusCode: 500,
    ...(isDev && { stack: err.stack })
  });
};
