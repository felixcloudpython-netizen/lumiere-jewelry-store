import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { AuthRequest } from '@/middleware/auth';
import { sendOrderConfirmation, sendShippingNotification } from '@/modules/email/email.controller';
import { calculateShipping, resolveDiscount } from '@/lib/pricing';

export const getOrders = async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'ADMIN';
  const { page = '1', limit = '10', status } = req.query;

  const where: any = isAdmin ? {} : { userId: req.user!.id };
  if (status) where.status = status;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    data: orders,
    meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
  });
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'ADMIN';

  const order = await prisma.order.findFirst({
    where: isAdmin ? { id } : { id, userId: req.user!.id },
    include: {
      items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } },
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { email, shippingAddress, items, shippingMethod, couponCode, notes } = req.body;
  // orders.routes.ts áp `router.use(authenticate)` cho toàn bộ router này,
  // nên req.user luôn tồn tại ở đây (không có luồng "guest checkout").
  const userId = req.user!.id;

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, name: true, inventory: true, inStock: true },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
    if (!product.inStock || product.inventory < item.quantity) {
      return res.status(400).json({ error: `${product.name} is out of stock` });
    }
    subtotal += product.price * item.quantity;
  }

  const shipping = calculateShipping(shippingMethod, subtotal);
  const discount = await resolveDiscount(couponCode, subtotal);
  const tax = Math.round((subtotal - discount) * 0.1);
  const total = subtotal + shipping + tax - discount;

  const order = await prisma.$transaction(async (tx) => {
    // Order.addressId là bắt buộc (relation tới Address) — tái sử dụng địa chỉ đã lưu
    // của user nếu trùng khớp, nếu chưa có thì tạo mới. `shippingAddress` (JSON) vẫn
    // được lưu nguyên trên Order như một bản snapshot tại thời điểm đặt hàng, không
    // bị ảnh hưởng nếu sau này user sửa/xoá địa chỉ trong sổ địa chỉ của họ.
    let address = await tx.address.findFirst({
      where: {
        userId,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      },
    });

    if (!address) {
      address = await tx.address.create({
        data: {
          userId,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address: shippingAddress.address,
          apartment: shippingAddress.apartment,
          city: shippingAddress.city,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
          phone: shippingAddress.phone,
        },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId: address.id,
        email,
        shippingAddress,
        subtotal,
        shipping,
        discount,
        tax,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: productMap.get(item.productId)!.name,
            price: productMap.get(item.productId)!.price,
            quantity: item.quantity,
            size: item.size,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  res.status(201).json(order);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  const order = await prisma.order.update({
    where: { id },
    data: { status, ...(trackingNumber && { trackingNumber }) },
    include: { items: { include: { product: true } } },
  });

  // Trước đây sendShippingNotification tồn tại sẵn nhưng không hề được gọi ở
  // đâu trong toàn bộ codebase — khách hàng không bao giờ nhận được email khi
  // đơn chuyển sang "Đã giao vận". Gửi khi status vừa chuyển sang SHIPPED và có
  // mã vận đơn. Không chặn response nếu gửi email thất bại (email chỉ là
  // thông báo phụ, không nên khiến việc cập nhật trạng thái đơn hàng bị lỗi).
  if (status === 'SHIPPED' && trackingNumber) {
    const shippingAddress = order.shippingAddress as { firstName?: string; lastName?: string } | null;
    const customerName = [shippingAddress?.firstName, shippingAddress?.lastName].filter(Boolean).join(' ') || 'Customer';
    sendShippingNotification(order.email, { orderId: order.id, customerName, trackingNumber }).catch((err) =>
      console.error('Failed to send shipping notification:', err)
    );
  }

  res.json(order);
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isAdmin = req.user?.role === 'ADMIN';

  const order = await prisma.order.findFirst({
    where: isAdmin ? { id } : { id, userId: req.user!.id },
    include: { items: true },
  });

  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return res.status(400).json({ error: 'Cannot cancel shipped/delivered order' });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { increment: item.quantity } },
      });
    }
    await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
  });

  res.json({ message: 'Order cancelled' });
};
