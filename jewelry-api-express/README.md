# Lumière Jewelry API

Luxury jewelry e-commerce REST API built with Express, Prisma, PostgreSQL.

## Features

- **Auth**: JWT-based authentication (register, login, me)
- **Products**: CRUD with filtering, sorting, pagination, search
- **Orders**: Transaction-safe order creation with inventory management
- **Payments**: Stripe PaymentIntent + webhook handling
- **Upload**: Cloudinary image upload (single/multiple)
- **Email**: Resend email templates (order confirmation, shipping)
- **Analytics**: Dashboard stats API (revenue, trends, top products)
- **Chat**: Real-time messaging with Socket.IO
- **Docs**: Swagger/OpenAPI documentation at `/api/docs`

## Quick Start

```bash
# Start database
docker-compose up -d

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# Run dev server
npm run dev

# API docs: http://localhost:3001/api/docs
```

## Testing

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=3001
CLIENT_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@lumiere-jewelry.com"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | - | Register |
| POST | /api/auth/login | - | Login |
| GET | /api/auth/me | Bearer | Current user |
| GET | /api/products | - | List products |
| GET | /api/products/:slug | - | Single product |
| POST | /api/products | Admin | Create product |
| POST | /api/orders | Bearer | Create order |
| GET | /api/orders | Bearer | List orders |
| POST | /api/payments/create-intent | Bearer | Stripe payment |
| POST | /api/upload/single | Admin | Upload image |
| GET | /api/analytics/dashboard | Admin | Dashboard stats |
| GET | /api/chat/rooms | Bearer | Chat rooms |
| GET | /api/docs | - | Swagger docs |
