import { PayOS } from '@payos/node';
import { prisma } from '@/lib/prisma';

// Khởi tạo LƯỜI (lazy) thay vì tạo ngay ở cấp module — SDK của payOS ném lỗi
// ngay lúc gọi `new PayOS(...)` nếu thiếu bất kỳ key nào trong 3 key
// (PAYOS_CLIENT_ID/API_KEY/CHECKSUM_KEY). Nếu tạo ở cấp module (chạy ngay lúc
// import file, tức lúc server khởi động), thiếu key sẽ làm CRASH TOÀN BỘ
// backend ngay từ đầu — kể cả các phần không liên quan gì tới thanh toán (duyệt
// sản phẩm, đăng nhập, admin...). Tạo lười trong hàm đảm bảo: nếu chưa có key
// (đang test, chưa đăng ký payOS), toàn bộ trang vẫn chạy bình thường, chỉ
// riêng bước "Thanh toán" báo lỗi rõ ràng khi thực sự bấm tới.
let payosInstance: PayOS | null = null;

function getPayOS(): PayOS {
  if (!payosInstance) {
    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
      throw new Error(
        'Chưa cấu hình payOS — thiếu PAYOS_CLIENT_ID/PAYOS_API_KEY/PAYOS_CHECKSUM_KEY. ' +
        'Đăng ký tại my.payos.vn rồi điền vào Environment Variables.'
      );
    }
    payosInstance = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });
  }
  return payosInstance;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Tạo link thanh toán payOS cho 1 order — khách sẽ được CHUYỂN HƯỚNG (redirect)
 * toàn trang sang trang thanh toán do payOS host (hiện QR chuyển khoản), khác
 * hẳn với Stripe Elements trước đây (nhúng form thẻ ngay trong trang). Đây là
 * mô hình chuẩn của payOS — không có cách nhúng form thanh toán trực tiếp vào
 * trang của mình.
 */
export async function createCheckoutLink(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new Error('Order not found');
  if (order.paymentStatus === 'PAID') throw new Error('Order already paid');

  const address = order.shippingAddress as ShippingAddress | null;
  const buyerName = [address?.firstName, address?.lastName].filter(Boolean).join(' ') || undefined;

  const CLIENT_URL = process.env.CLIENT_URL!;

  // description: payOS giới hạn độ dài (ví dụ chính thức của payOS dùng dạng
  // "Thanh toan don hang #12345", ~25-30 ký tự) — cắt ngắn để chắc chắn không
  // vượt giới hạn, dùng orderCode (số) thay vì order.id (cuid dài) cho gọn.
  const description = `Thanh toan DH #${order.orderCode}`.slice(0, 25);

  const paymentLink = await getPayOS().paymentRequests.create({
    orderCode: order.orderCode,
    amount: order.total,
    description,
    buyerName,
    buyerEmail: order.email,
    buyerPhone: address?.phone,
    returnUrl: `${CLIENT_URL}/checkout/success?orderId=${order.id}`,
    cancelUrl: `${CLIENT_URL}/checkout?cancelled=true`,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentLinkId: paymentLink.paymentLinkId },
  });

  return { checkoutUrl: paymentLink.checkoutUrl };
}

/**
 * Xác thực chữ ký webhook (bắt buộc — không tin bất kỳ request nào tự xưng là
 * payOS mà không kiểm tra signature, tránh giả mạo báo "đã thanh toán") rồi cập
 * nhật trạng thái đơn hàng tương ứng.
 */
export async function handlePaymentWebhook(payload: unknown) {
  const webhookData = await getPayOS().webhooks.verify(payload as Parameters<PayOS['webhooks']['verify']>[0]);

  const order = await prisma.order.findUnique({ where: { orderCode: webhookData.orderCode } });
  if (!order) {
    console.error(`Webhook payOS: không tìm thấy order với orderCode=${webhookData.orderCode}`);
    return;
  }

  // code "00" = thành công, mọi mã khác = thất bại (theo tài liệu payOS)
  if (webhookData.code === '00') {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'FAILED' },
    });
  }
}

/**
 * Đăng ký URL webhook với payOS — chỉ cần chạy 1 LẦN (hoặc mỗi khi domain thay
 * đổi), không phải chạy mỗi lần deploy. Xem prisma/registerPayosWebhook.ts.
 */
export async function confirmWebhookUrl(webhookUrl: string) {
  return getPayOS().webhooks.confirm(webhookUrl);
}
