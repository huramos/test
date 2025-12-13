import { Router } from 'express';
import * as authController from './auth.controller';
import { authGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { RegisterDto, SyncUserDto, UpdateProfileDto } from './auth.dto';

const router = Router();

// Public routes (no auth required)
router.post('/register', validationPipe(RegisterDto), authController.register);
router.post('/sync', validationPipe(SyncUserDto), authController.syncUser);
router.get('/check-email', authController.checkEmail);

// Protected routes (Firebase token required)
router.get('/me', authGuard, authController.getCurrentUser);
router.patch('/profile', authGuard, validationPipe(UpdateProfileDto), authController.updateProfile);
router.delete('/account', authGuard, authController.deleteAccount);

export default router;
