import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BadRequestException } from '../filters/error.filter';

export const validationPipe = <T extends object>(dtoClass: new () => T) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      const messages = formatValidationErrors(errors);
      return res.status(400).json({
        message: messages.join(', '),
        error: 'Validation Error',
        statusCode: 400,
        details: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints
        }))
      });
    }

    req.body = dtoInstance;
    next();
  };
};

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      Object.values(error.constraints).forEach((message) => {
        messages.push(message);
      });
    }
    if (error.children && error.children.length > 0) {
      messages.push(...formatValidationErrors(error.children));
    }
  });

  return messages;
}
