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
// Standard = miễn phí, Express = phí giao nhanh nội địa. Client chỉ được chọn
// PHƯƠNG THỨC chứ không được gửi thẳng SỐ TIỀN — server tự tra bảng giá này.
const SHIPPING_RATES = {
  standard: 0,
  express: 30_000, // 30.000₫
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
