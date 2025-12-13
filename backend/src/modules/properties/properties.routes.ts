import { Router } from 'express';
import * as propertiesController from './properties.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.dto';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes - available for browsing
router.get('/', propertiesController.findAll);

// Protected routes requiring authentication
router.get('/my', authGuard, propertiesController.findMyProperties);
router.get('/stats', authGuard, propertiesController.getStats);
router.get('/stats/all', authGuard, roleGuard(UserRole.ADMIN), propertiesController.getAllStats);
router.get('/:id', authGuard, propertiesController.findOne);

// Owner routes
router.post(
  '/',
  authGuard,
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  validationPipe(CreatePropertyDto),
  propertiesController.create
);
router.patch(
  '/:id',
  authGuard,
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  validationPipe(UpdatePropertyDto),
  propertiesController.update
);
router.patch(
  '/:id/status',
  authGuard,
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  propertiesController.updateStatus
);
router.delete(
  '/:id',
  authGuard,
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  propertiesController.remove
);

// Admin routes
router.patch(
  '/:id/verify',
  authGuard,
  roleGuard(UserRole.ADMIN),
  propertiesController.verify
);

export default router;
