import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { createCheckoutLink, handlePaymentWebhook } from './payos.service';

const router = Router();

// Tạo link thanh toán (yêu cầu đăng nhập)
router.post('/create-checkout', authenticate, async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const result = await createCheckoutLink(orderId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Webhook payOS — KHÔNG cần raw body như Stripe trước đây (payOS xác thực chữ
// ký trên object JSON đã parse, không phải trên chuỗi byte thô), nên dùng
// chung express.json() toàn cục là đủ, không cần middleware riêng trong app.ts.
router.post('/webhook', async (req, res) => {
  try {
    await handlePaymentWebhook(req.body);
    // payOS yêu cầu phản hồi mã 2XX để xác nhận đã nhận webhook thành công —
    // luôn trả 200 dù xử lý nội bộ có lỗi (log lỗi riêng), để tránh payOS hiểu
    // nhầm là chưa nhận được rồi gửi lại liên tục.
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('payOS webhook error:', err);
    res.status(200).json({ received: true });
  }
});

export default router;
