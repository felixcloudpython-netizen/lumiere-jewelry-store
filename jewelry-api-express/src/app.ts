import 'dotenv/config';
import express from 'express';
// PHẢI import trước khi định nghĩa bất kỳ route nào. Express 4 không tự bắt lỗi
// ném ra trong route handler `async` — nếu không có try/catch thủ công ở từng
// route (codebase này không có), lỗi sẽ trở thành unhandled rejection và request
// bị TREO VÔ THỜI HẠN thay vì trả lỗi rõ ràng (vd tạo category trùng tên/slug).
// Package này patch Express để tự động bắt lỗi async và chuyển tới errorHandler
// bên dưới — vốn đã có sẵn code xử lý P2002 (trùng)/P2025 (không tìm thấy)
// nhưng trước đây chưa từng thực sự được gọi tới.
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from '@/modules/auth/auth.routes';
import productRoutes from '@/modules/products/products.routes';
import orderRoutes from '@/modules/orders/orders.routes';
import userRoutes from '@/modules/users/users.routes';
import paymentRoutes from '@/modules/payments/payments.routes';
import uploadRoutes from '@/modules/upload/upload.routes';
import analyticsRoutes from '@/modules/analytics/analytics.routes';
import chatRoutes from '@/modules/chat/chat.routes';
import { errorHandler } from '@/middleware/errorHandler';
import { setupSwagger } from '@/lib/swagger';
import { setupSocketIO } from '@/modules/chat/socket';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));

// Stripe webhook needs raw body BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

setupSwagger(app);

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Jewelry API running on http://localhost:${PORT}`);
});

setupSocketIO(server);
