import { Router } from 'express';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import * as roomsController from './rooms.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/available', roomsController.findAvailable);
router.get('/:id', roomsController.findOne);

// Protected routes (need authentication)
router.use(authGuard);

// Get rooms by property
router.get('/property/:propertyId', roomsController.findByProperty);

// Owner/Admin only routes
router.post('/', roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN), roomsController.create);
router.patch('/:id', roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN), roomsController.update);
router.patch('/:id/status', roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN), roomsController.updateStatus);
router.delete('/:id', roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN), roomsController.remove);

export default router;
