import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lumière Jewelry API',
      version: '1.0.0',
      description: 'REST API for luxury jewelry e-commerce platform',
      contact: {
        name: 'Lumière Support',
        email: 'support@lumiere-jewelry.com',
      },
    },
    servers: [
      { url: 'http://localhost:3001/api', description: 'Development server' },
      { url: 'https://api.lumiere-jewelry.com/api', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cuid123' },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            slug: { type: 'string', example: 'diamond-solitaire-ring' },
            name: { type: 'string', example: 'Diamond Solitaire Ring' },
            description: { type: 'string' },
            price: { type: 'integer', description: 'Price in cents', example: 1250000 },
            comparePrice: { type: 'integer' },
            sku: { type: 'string', example: 'AURA-RG-001' },
            metal: { type: 'string', enum: ['YELLOW_GOLD', 'WHITE_GOLD', 'ROSE_GOLD', 'SILVER', 'PLATINUM'] },
            stones: { type: 'array', items: { type: 'string' } },
            sizes: { type: 'array', items: { type: 'integer' } },
            images: { type: 'array', items: { type: 'string' } },
            inventory: { type: 'integer' },
            inStock: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            isBestseller: { type: 'boolean' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] },
            paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
            subtotal: { type: 'integer' },
            shipping: { type: 'integer' },
            tax: { type: 'integer' },
            total: { type: 'integer' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'integer' },
            quantity: { type: 'integer' },
            size: { type: 'integer', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Lumière API Documentation',
  }));
  app.get('/api/docs.json', (_req, res) => res.json(specs));
}
