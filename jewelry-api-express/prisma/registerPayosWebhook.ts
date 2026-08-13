/**
 * Đăng ký (hoặc cập nhật) URL webhook với payOS — CHỈ CẦN CHẠY 1 LẦN sau khi
 * deploy lần đầu, hoặc mỗi khi đổi domain backend. payOS cần biết URL này để
 * biết gửi thông báo "đã thanh toán" về đâu.
 *
 * Cách chạy (trong Terminal của Coolify, hoặc SSH vào server):
 *   npm run payos:register-webhook -- https://api.your-domain.com
 *
 * (chỉ cần domain gốc của BACKEND, script tự thêm "/api/payments/webhook")
 *
 * Tự chứa toàn bộ logic (không import gì từ src/) — container production thật
 * chỉ có thư mục dist/ (đã biên dịch) + prisma/, KHÔNG có thư mục src/ (chỉ tồn
 * tại lúc code đang phát triển/build, xem Dockerfile — runner stage không copy
 * src/). Import từ '../src/...' như bản trước đây chỉ chạy được ở máy dev, sẽ
 * lỗi "Cannot find module" khi chạy trên server thật.
 */
import 'dotenv/config';
import { PayOS } from '@payos/node';

async function main() {
  const backendBaseUrl = process.argv[2];

  if (!backendBaseUrl) {
    console.error('Cách dùng: npm run payos:register-webhook -- https://api.your-domain.com');
    process.exit(1);
  }

  if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    console.error('❌ Thiếu biến môi trường PAYOS_CLIENT_ID/PAYOS_API_KEY/PAYOS_CHECKSUM_KEY.');
    console.error('   Kiểm tra lại Environment Variables trong Coolify đã điền đủ 3 key chưa.');
    process.exit(1);
  }

  const webhookUrl = `${backendBaseUrl.replace(/\/$/, '')}/api/payments/webhook`;

  const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  });

  console.log(`Đang đăng ký webhook URL: ${webhookUrl}`);
  try {
    const result = await payos.webhooks.confirm(webhookUrl);
    console.log('✅ Đăng ký webhook thành công:', result);
  } catch (err) {
    console.error('❌ Đăng ký webhook thất bại:', err);
    process.exit(1);
  }
}

main();
