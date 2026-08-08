"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.category.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.product.deleteMany();
    const rings = await prisma.category.create({ data: { name: 'Rings', slug: 'rings' } });
    const necklaces = await prisma.category.create({ data: { name: 'Necklaces', slug: 'necklaces' } });
    const earrings = await prisma.category.create({ data: { name: 'Earrings', slug: 'earrings' } });
    const bracelets = await prisma.category.create({ data: { name: 'Bracelets', slug: 'bracelets' } });
    const aura = await prisma.collection.create({
        data: { name: 'Aura', slug: 'aura', description: 'Architectural precision in gold and diamonds' },
    });
    const eternity = await prisma.collection.create({
        data: { name: 'Eternity', slug: 'eternity', description: 'Celebrating unbreakable bonds' },
    });
    await prisma.product.createMany({
        data: [
            {
                slug: 'diamond-solitaire-ring',
                name: 'Diamond Solitaire Ring',
                description: 'A timeless symbol of devotion featuring a brilliant round diamond in a classic six-prong setting.',
                price: 1250000,
                comparePrice: 1380000,
                sku: 'AURA-RG-001',
                categoryId: rings.id,
                collectionId: aura.id,
                metal: client_1.Metal.WHITE_GOLD,
                stones: ['Diamond'],
                sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8],
                images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
                inventory: 10,
                inStock: true,
                isBestseller: true,
            },
            {
                slug: 'gold-chain-necklace',
                name: 'Gold Chain Necklace',
                description: 'Elegant 18k gold chain necklace with a refined cable link design.',
                price: 320000,
                sku: 'ETER-NK-001',
                categoryId: necklaces.id,
                collectionId: eternity.id,
                metal: client_1.Metal.YELLOW_GOLD,
                sizes: [16, 18, 20],
                images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
                inventory: 25,
                inStock: true,
            },
            {
                slug: 'pearl-drop-earrings',
                name: 'Pearl Drop Earrings',
                description: 'Lustrous freshwater pearls suspended from delicate gold hooks.',
                price: 180000,
                sku: 'LUNA-ER-001',
                categoryId: earrings.id,
                metal: client_1.Metal.YELLOW_GOLD,
                stones: ['Pearl'],
                sizes: [],
                images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
                inventory: 15,
                inStock: true,
            },
            {
                slug: 'silver-cuff-bracelet',
                name: 'Silver Cuff Bracelet',
                description: 'Bold sculptural silver cuff bracelet with a polished finish.',
                price: 95000,
                sku: 'GUARD-BR-001',
                categoryId: bracelets.id,
                metal: client_1.Metal.SILVER,
                sizes: [6, 7, 8],
                images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'],
                inventory: 20,
                inStock: true,
            },
            {
                slug: 'round-brilliant-ring',
                name: 'Round Brilliant Engagement Ring',
                description: 'The finest round brilliant diamond set in platinum.',
                price: 2800000,
                sku: 'AURA-EN-001',
                categoryId: rings.id,
                collectionId: aura.id,
                metal: client_1.Metal.PLATINUM,
                stones: ['Diamond'],
                sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8],
                images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800'],
                inventory: 5,
                inStock: true,
                isFeatured: true,
            },
        ],
    });
    console.log('✅ Seed completed successfully');
    // Trước đây seed.ts không tạo User nào, và cũng không có API để nâng quyền
    // user thường lên ADMIN — nghĩa là sau khi deploy + migrate + seed, không có
    // cách nào đăng nhập vào /admin ngoài việc tự sửa DB bằng tay. Đoạn dưới đảm
    // bảo luôn có sẵn 1 tài khoản ADMIN, dùng `upsert` nên chạy seed nhiều lần
    // không tạo trùng hay ghi đè user đã đổi mật khẩu.
    //
    // Ở PRODUCTION: đặt ADMIN_EMAIL/ADMIN_PASSWORD thật (mật khẩu mạnh) trong
    // .env.prod trước khi seed lần đầu, rồi ĐỔI MẬT KHẨU ngay sau khi đăng nhập
    // lần đầu. Cách an toàn hơn cho production: tự đăng ký tài khoản qua
    // /api/auth/register bằng mật khẩu của chính bạn, rồi chạy
    // `npm run db:promote-admin -- you@your-domain.com` (xem prisma/promoteAdmin.ts)
    // thay vì dùng mật khẩu mặc định của seed.
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        console.warn('⚠️  ADMIN_EMAIL/ADMIN_PASSWORD chưa được set trong env — đang dùng giá trị mặc định ' +
            `(${adminEmail} / ${adminPassword}). CHỈ dùng cho local/dev. Đừng seed như vậy ở production.`);
    }
    const hashedAdminPassword = await bcryptjs_1.default.hash(adminPassword, 12);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {}, // user đã tồn tại (kể cả đã tự đổi mật khẩu) -> không đụng vào
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            firstName: 'Admin',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin account ready: ${adminEmail}`);
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => await prisma.$disconnect());
