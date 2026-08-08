import request from 'supertest';
import express from 'express';
import productRoutes from '@/modules/products/products.routes';
import { prisma } from '@/lib/prisma';

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Products API', () => {
  let category: any;

  beforeEach(async () => {
    category = await prisma.category.create({
      data: { name: 'Test Rings', slug: 'test-rings' },
    });

    await prisma.product.create({
      data: {
        slug: 'test-ring',
        name: 'Test Ring',
        description: 'A test ring',
        price: 100000,
        sku: 'TEST-001',
        categoryId: category.id,
        metal: 'WHITE_GOLD',
        sizes: [6, 7, 8],
        images: ['https://example.com/image.jpg'],
        inventory: 10,
      },
    });
  });

  describe('GET /api/products', () => {
    it('should return paginated products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/products?category=test-rings');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should search products', async () => {
      const res = await request(app).get('/api/products?search=test');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('should return a single product', async () => {
      const res = await request(app).get('/api/products/test-ring');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Ring');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/non-existent');
      expect(res.status).toBe(404);
    });
  });
});
