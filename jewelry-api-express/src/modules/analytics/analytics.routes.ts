import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { getDashboardStats } from './analytics.controller';

const router = Router();

router.use(authenticate, requireAdmin);
router.get('/dashboard', getDashboardStats);

export default router;
