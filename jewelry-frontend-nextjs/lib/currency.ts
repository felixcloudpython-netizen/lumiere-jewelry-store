/**
 * VND là zero-decimal currency (không có đơn vị nhỏ hơn như cent của USD) —
 * mọi số tiền trong hệ thống (Product.price, Order.total...) đều lưu THẲNG số
 * VNĐ nguyên, không cần chia/nhân 100 như quy ước cent trước đây.
 *
 * Dùng Intl.NumberFormat có sẵn của trình duyệt thay vì tự viết tay chuỗi định
 * dạng — tự động đúng dấu phân cách hàng nghìn kiểu Việt Nam (dấu chấm) và đặt
 * ký hiệu ₫ đúng vị trí, không cần đoán.
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
