# Lumière Jewelry Frontend (Next.js 14)

## Features

- **Responsive Header**: MegaMenu, Search overlay, MiniCart, Language switcher
- **Product Detail**: Image gallery with zoom, size guide, add to cart
- **Checkout**: 3-step checkout (Information → Shipping → Payment)
- **Cart**: Zustand store with localStorage persistence
- **Admin Dashboard**: Products, Orders, Analytics charts, Real-time chat
- **i18n**: Multi-language support (English / Vietnamese)
- **Chat Widget**: Floating real-time chat with customer support
- **Stripe**: Secure payment integration

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Testing

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Admin Routes

- `/admin` - Dashboard overview
- `/admin/products` - Product management
- `/admin/products/new` - Create product
- `/admin/orders` - Order management
- `/admin/analytics` - Analytics charts
- `/admin/chat` - Real-time customer chat
