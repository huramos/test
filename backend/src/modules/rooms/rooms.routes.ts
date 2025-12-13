import { Router } from 'express';
import * as roomsController from './rooms.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { CreateRoomDto, UpdateRoomDto } from './rooms.dto';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authGuard);

// List and get
router.get('/', roomsController.findAll);
router.get('/property/:propertyId', roomsController.findByProperty);
router.get('/:id', roomsController.findOne);

// Owner routes
router.post(
  '/',
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  validationPipe(CreateRoomDto),
  roomsController.create
);
router.patch(
  '/:id',
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  validationPipe(UpdateRoomDto),
  roomsController.update
);
router.patch(
  '/:id/status',
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  roomsController.updateStatus
);
router.delete(
  '/:id',
  roleGuard(UserRole.PROPIETARIO, UserRole.ADMIN),
  roomsController.remove
);

export default router;
