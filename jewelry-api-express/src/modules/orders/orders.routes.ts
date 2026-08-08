import { Router } from 'express';
import {
  getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder,
} from './orders.controller';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from '@/lib/zodSchemas';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', validate(createOrderSchema), createOrder);
router.patch('/:id/status', requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;
