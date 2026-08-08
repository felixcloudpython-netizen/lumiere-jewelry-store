import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Gói `stripe` cài theo package.json là `^15.0.0`, hiện resolve về 15.12.0 — type
// definitions của bản này chỉ chấp nhận apiVersion '2024-04-10' (xem
// node_modules/stripe/types/lib.d.ts -> LatestApiVersion). Nếu sau này nâng cấp gói
// `stripe` lên bản mới hơn hỗ trợ API version mới hơn, phải cập nhật chuỗi này cùng lúc.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

export async function createPaymentIntent(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) throw new Error('Order not found');
  if (order.paymentStatus === 'PAID') throw new Error('Order already paid');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: order.total,
    currency: 'usd',
    metadata: { orderId: order.id, email: order.email },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentIntentId: paymentIntent.id },
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function handleWebhookEvent(payload: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      });
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      break;
    }
  }

  return event;
}
