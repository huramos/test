import { Router } from 'express';
import * as usersController from './users.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authGuard);

// Roomie profile routes (must be before :id routes)
router.get('/profile/roomie', usersController.getMyRoomieProfile);
router.patch('/profile/roomie', usersController.updateMyRoomieProfile);

// Search roomies
router.get('/roomies', usersController.findRoomies);

// Admin routes
router.get('/', roleGuard(UserRole.ADMIN), usersController.findAll);
router.patch('/:id/status', roleGuard(UserRole.ADMIN), usersController.updateStatus);
router.delete('/:id', roleGuard(UserRole.ADMIN), usersController.remove);

// User routes
router.get('/:id', usersController.findOne);
router.patch('/:id', usersController.update);

export default router;
