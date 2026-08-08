import { Router } from 'express';
import {
  getAllUsers, getProfile, updateProfile, addAddress, deleteAddress, toggleWishlist,
} from './users.controller';
import { authenticate, requireAdmin } from '@/middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, getAllUsers);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);
router.post('/wishlist', toggleWishlist);

export default router;
