import { Router } from 'express';
import * as requestsController from './requests.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { CreateRequestDto, RespondRequestDto } from './requests.dto';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authGuard);

// Roomie routes
router.post(
  '/',
  roleGuard(UserRole.ROOMIE),
  validationPipe(CreateRequestDto),
  requestsController.create
);
router.get('/my', requestsController.findMyRequests);
router.post('/:id/cancel', roleGuard(UserRole.ROOMIE), requestsController.cancel);

// Owner routes
router.get('/received', roleGuard(UserRole.PROPIETARIO), requestsController.findReceivedRequests);
router.post(
  '/:id/respond',
  roleGuard(UserRole.PROPIETARIO),
  validationPipe(RespondRequestDto),
  requestsController.respond
);

// Common routes
router.get('/stats', requestsController.getStats);
router.get('/:id', requestsController.findOne);

export default router;
