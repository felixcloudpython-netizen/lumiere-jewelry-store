import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

// Trang admin "Customers" trước đây không có API nào để lấy danh sách khách hàng
// (chỉ có /profile, tự lấy dữ liệu của chính user đang đăng nhập). Hàm này liệt
// kê toàn bộ user (mọi role, không chỉ CUSTOMER — để admin xem được cả tài khoản
// admin khác), phân trang + tìm theo email/tên, kèm số đơn hàng đã đặt.
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10', search } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true,
        _count: { select: { orders: true } },
        orders: { where: { paymentStatus: 'PAID' }, select: { total: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = users.map(({ orders, _count, ...user }) => ({
    ...user,
    orderCount: _count.orders,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
  }));

  res.json({
    data,
    meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true, role: true,
      addresses: true,
      orders: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, status: true, total: true, createdAt: true } },
      wishlist: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true } } } },
    },
  });
  res.json(user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { firstName, lastName, phone },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true },
  });
  res.json(user);
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  const address = await prisma.address.create({
    data: { ...req.body, userId: req.user!.id },
  });
  res.status(201).json(address);
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await prisma.address.deleteMany({ where: { id, userId: req.user!.id } });
  res.status(204).send();
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: req.user!.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    res.json({ action: 'removed' });
  } else {
    await prisma.wishlistItem.create({ data: { userId: req.user!.id, productId } });
    res.json({ action: 'added' });
  }
};
