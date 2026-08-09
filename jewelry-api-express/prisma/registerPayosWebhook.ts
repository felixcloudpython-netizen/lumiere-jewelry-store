/**
 * Đăng ký (hoặc cập nhật) URL webhook với payOS — CHỈ CẦN CHẠY 1 LẦN sau khi
 * deploy lần đầu, hoặc mỗi khi đổi domain backend. payOS cần biết URL này để
 * biết gửi thông báo "đã thanh toán" về đâu.
 *
 * Cách chạy (trong Terminal của Coolify, hoặc SSH vào server):
 *   npm run payos:register-webhook -- https://api.your-domain.com
 *
 * (chỉ cần domain gốc của BACKEND, script tự thêm "/api/payments/webhook")
 */
import 'dotenv/config';
import { confirmWebhookUrl } from '../src/modules/payments/payos.service';

async function main() {
  const backendBaseUrl = process.argv[2];

  if (!backendBaseUrl) {
    console.error('Cách dùng: npm run payos:register-webhook -- https://api.your-domain.com');
    process.exit(1);
  }

  const webhookUrl = `${backendBaseUrl.replace(/\/$/, '')}/api/payments/webhook`;

  console.log(`Đang đăng ký webhook URL: ${webhookUrl}`);
  try {
    const result = await confirmWebhookUrl(webhookUrl);
    console.log('✅ Đăng ký webhook thành công:', result);
  } catch (err) {
    console.error('❌ Đăng ký webhook thất bại:', err);
    process.exit(1);
  }
}

main();
