/**
 * Toàn bộ logic tính phí ship & giảm giá phải nằm ở đây (server-side), KHÔNG được
 * nhận trực tiếp các con số này từ client — nếu không, client có thể tự set
 * `discount` cao tuỳ ý để giảm `total` xuống gần 0, vì `total` được dùng thẳng
 * làm `amount` khi tạo Stripe PaymentIntent.
 *
 * Đơn vị tiền tệ: cent (giống các field Int khác trong schema, ví dụ Product.price).
 */

// Khớp đúng 2 lựa chọn đã có sẵn ở UI (CheckoutForm.tsx, bước "shipping"):
// Standard = miễn phí, Express = $25. Trước đây UI chỉ hiển thị các số này để
// tham khảo còn giá trị thật lại do client tự gửi lên — giờ server tự tra bảng
// giá này, client chỉ được chọn PHƯƠNG THỨC chứ không được gửi thẳng SỐ TIỀN.
const SHIPPING_RATES = {
  standard: 0,
  express: 25_00,
} as const;

export type ShippingMethod = keyof typeof SHIPPING_RATES;

export function calculateShipping(method: string | undefined): number {
  return SHIPPING_RATES[method as ShippingMethod] ?? SHIPPING_RATES.standard;
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
