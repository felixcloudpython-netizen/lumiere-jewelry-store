/**
 * Khớp CHÍNH XÁC với jewelry-api-express/src/lib/pricing.ts — đây chỉ là bản
 * hiển thị TRƯỚC khi đặt hàng (để khách thấy đúng số tiền ngay lúc chọn), số
 * tiền THẬT SỰ bị trừ luôn được server tự tính lại độc lập, không tin số này
 * từ client (xem lib/zodSchemas.ts phía backend — không nhận `shipping` từ
 * request). Đổi ngưỡng/mức phí thì phải sửa Ở CẢ 2 NƠI (file này + pricing.ts)
 * để tránh hiển thị sai lệch với số tiền thật.
 */
export const FREE_SHIPPING_THRESHOLD = 2_000_000; // 2.000.000₫
export const EXPRESS_SHIPPING_RATE = 30_000; // 30.000₫

export type ShippingMethod = 'standard' | 'express';

export function calculateShipping(method: ShippingMethod, subtotal: number): number {
  if (method === 'express') {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : EXPRESS_SHIPPING_RATE;
  }
  return 0;
}
