import request from 'supertest';
import express from 'express';
import orderRoutes from '@/modules/orders/orders.routes';
import authRoutes from '@/modules/auth/auth.routes';
import { prisma } from '@/lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

describe('Orders API', () => {
  let token: string;
  let product: any;
  let category: any;

  beforeEach(async () => {
    // Register and login
    await request(app).post('/api/auth/register').send({
      email: 'order@test.com',
      password: 'password123',
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'order@test.com',
      password: 'password123',
    });
    token = loginRes.body.token;

    // Create category and product
    category = await prisma.category.create({
      data: { name: 'Test Cat', slug: 'test-cat' },
    });
    product = await prisma.product.create({
      data: {
        slug: 'order-product',
        name: 'Order Product',
        description: 'Test',
        price: 50000,
        sku: 'ORD-001',
        categoryId: category.id,
        metal: 'SILVER',
        sizes: [7],
        images: [],
        inventory: 5,
      },
    });
  });

  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'order@test.com',
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            address: '123 Main St',
            city: 'Hanoi',
            country: 'VN',
            postalCode: '10000',
            phone: '0901234567',
          },
          items: [{ productId: product.id, quantity: 1, size: 7 }],
          shipping: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.total).toBeGreaterThan(0);
    });

    it('should reject order with insufficient inventory', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'order@test.com',
          shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            address: '123 Main St',
            city: 'Hanoi',
            country: 'VN',
            postalCode: '10000',
            phone: '0901234567',
          },
          items: [{ productId: product.id, quantity: 100, size: 7 }],
          shipping: 0,
        });

      expect(res.status).toBe(400);
    });
  });
});
