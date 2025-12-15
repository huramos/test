import { Router } from 'express';
import * as favoritesController from './favorites.controller';
import { authGuard, roleGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { CreateFavoriteDto } from './favorites.dto';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authGuard);

// Only ROOMIE can have favorites (for now)
router.post(
  '/',
  roleGuard(UserRole.ROOMIE),
  validationPipe(CreateFavoriteDto),
  favoritesController.create
);

router.get('/', roleGuard(UserRole.ROOMIE), favoritesController.findMyFavorites);
router.get('/count', roleGuard(UserRole.ROOMIE), favoritesController.getCount);
router.post('/check', roleGuard(UserRole.ROOMIE), favoritesController.checkMultiple);
router.get('/check/:propertyId', roleGuard(UserRole.ROOMIE), favoritesController.check);
router.post('/toggle/:propertyId', roleGuard(UserRole.ROOMIE), favoritesController.toggle);
router.delete('/:propertyId', roleGuard(UserRole.ROOMIE), favoritesController.remove);

export default router;
