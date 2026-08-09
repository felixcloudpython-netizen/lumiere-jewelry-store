/**
 * Toàn bộ logic tính phí ship & giảm giá phải nằm ở đây (server-side), KHÔNG được
 * nhận trực tiếp các con số này từ client — nếu không, client có thể tự set
 * `discount` cao tuỳ ý để giảm `total` xuống gần 0, vì `total` được dùng thẳng
 * làm `amount` khi tạo yêu cầu thanh toán.
 *
 * Đơn vị tiền tệ: VNĐ (Việt Nam Đồng) — khác với USD, VND KHÔNG có đơn vị nhỏ
 * hơn (zero-decimal currency, giống JPY/KRW). Product.price và mọi số tiền
 * trong hệ thống giờ lưu THẲNG số VNĐ nguyên (vd 3890000 = 3.890.000₫), không
 * còn "chia cho 100" như quy ước cent (USD) trước đây nữa.
 */

// Khớp đúng 2 lựa chọn đã có sẵn ở UI (CheckoutForm.tsx, bước "shipping"):
// Standard = luôn miễn phí. Express = có phí, TRỪ KHI đơn hàng đạt ngưỡng miễn
// phí vận chuyển (khớp đúng dòng chữ "Miễn phí vận chuyển cho đơn hàng trên
// 2.000.000₫" hiển thị ở banner/trang sản phẩm — xem messages/*.json
// "shippingBanner"/"freeShipping"). Đổi ngưỡng ở ĐÚNG 1 chỗ này, không cần sửa
// gì thêm ở nơi khác.
const FREE_SHIPPING_THRESHOLD = 2_000_000; // 2.000.000₫
const EXPRESS_SHIPPING_RATE = 30_000; // 30.000₫

export type ShippingMethod = 'standard' | 'express';

export function calculateShipping(method: string | undefined, subtotal: number): number {
  if (method === 'express') {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : EXPRESS_SHIPPING_RATE;
  }
  return 0; // standard luôn miễn phí, không phụ thuộc ngưỡng
}

/**
 * Chưa có model Coupon trong schema, nên hiện tại luôn trả về 0 — cố tình KHÔNG
 * nhận discount từ client thay vì "tin tưởng nhưng validate lỏng lẻo". Khi cần
 * tính năng mã giảm giá thật, thêm model Coupon (code, percentOff/amountOff,
 * validFrom/validTo, minSubtotal, usageLimit...) rồi tra cứu + tính toán ở đây.
 */
export async function resolveDiscount(_couponCode: string | undefined, _subtotal: number): Promise<number> {
  return 0;
}
