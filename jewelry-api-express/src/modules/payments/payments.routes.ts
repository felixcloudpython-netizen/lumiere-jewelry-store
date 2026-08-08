import { Router } from 'express';
import express from 'express';
import { authenticate } from '@/middleware/auth';
import { createPaymentIntent, handleWebhookEvent } from './stripe.service';

const router = Router();

// Create payment intent (requires auth)
router.post('/create-intent', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const result = await createPaymentIntent(orderId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Stripe webhook (raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    await handleWebhookEvent(req.body, signature);
    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
