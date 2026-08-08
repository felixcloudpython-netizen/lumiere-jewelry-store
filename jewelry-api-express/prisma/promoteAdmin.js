"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Nâng quyền một user đã đăng ký (qua /api/auth/register) lên ADMIN.
 *
 * Đây là cách khuyến nghị để tạo admin đầu tiên ở PRODUCTION, thay vì dùng
 * mật khẩu mặc định trong prisma/seed.ts:
 *   1. Tự đăng ký một tài khoản bình thường qua /api/auth/register bằng
 *      mật khẩu mạnh của chính bạn.
 *   2. Chạy: npm run db:promote-admin -- your-email@example.com
 *
 * Cách này không bao giờ để lộ một mật khẩu admin mặc định nào ra code/env.
 */
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Cách dùng: npm run db:promote-admin -- <email>');
        process.exit(1);
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error(`Không tìm thấy user với email "${email}". Hãy đăng ký tài khoản đó trước qua /api/auth/register.`);
        process.exit(1);
    }
    if (user.role === 'ADMIN') {
        console.log(`"${email}" đã là ADMIN từ trước, không cần làm gì thêm.`);
        return;
    }
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log(`✅ Đã nâng quyền "${email}" lên ADMIN.`);
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());
