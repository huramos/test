import { Router } from 'express';
import * as matchesController from './matches.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { UpdateMatchDto, RateMatchDto } from './matches.dto';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authGuard);

// Common routes
router.get('/', matchesController.findMyMatches);
router.get('/stats', matchesController.getStats);
router.get('/:id', matchesController.findOne);

// Owner routes
router.patch(
  '/:id',
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  validationPipe(UpdateMatchDto),
  matchesController.update
);
router.post(
  '/:id/rate/roomie',
  roleGuard(UserRole.PROPIETARIO),
  validationPipe(RateMatchDto),
  matchesController.rateAsOwner
);

// Roomie routes
router.post(
  '/:id/rate/owner',
  roleGuard(UserRole.ROOMIE),
  validationPipe(RateMatchDto),
  matchesController.rateAsRoomie
);

export default router;
