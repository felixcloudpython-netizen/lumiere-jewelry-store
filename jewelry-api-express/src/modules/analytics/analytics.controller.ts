import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { AuthRequest } from '@/middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    revenueLast30Days,
    revenuePrevious30Days,
    ordersLast30Days,
    ordersPrevious30Days,
    topProducts,
    salesByDay,
    salesByCategory,
  ] = await Promise.all([
    // Total revenue
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    // Total orders
    prisma.order.count(),
    // Total customers
    prisma.user.count(),
    // Total products
    prisma.product.count(),
    // Revenue last 30 days
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: 'PAID' },
    }),
    // Revenue previous 30 days
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, paymentStatus: 'PAID' },
    }),
    // Orders last 30 days
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    // Orders previous 30 days
    prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    // Top products
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Sales by day (last 30 days)
    prisma.$queryRaw`
      SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE created_at >= ${thirtyDaysAgo} AND payment_status = 'PAID'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
    // Sales by category
    prisma.$queryRaw`
      SELECT c.name as category, SUM(oi.price * oi.quantity) as revenue, SUM(oi.quantity) as quantity
      FROM "OrderItem" oi
      JOIN "Product" p ON oi.product_id = p.id
      JOIN "Category" c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY revenue DESC
    `,
  ]);

  // Get product names for top products
  const topProductIds = topProducts.map(p => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, images: true },
  });
  const productMap = new Map(products.map(p => [p.id, p]));

  const currentRevenue = revenueLast30Days._sum.total || 0;
  const previousRevenue = revenuePrevious30Days._sum.total || 0;
  const revenueChange = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
    : '0';

  const currentOrders = ordersLast30Days;
  const previousOrders = ordersPrevious30Days;
  const ordersChange = previousOrders > 0
    ? ((currentOrders - previousOrders) / previousOrders * 100).toFixed(1)
    : '0';

  res.json({
    overview: {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueChange: parseFloat(revenueChange),
      ordersChange: parseFloat(ordersChange),
    },
    topProducts: topProducts.map(tp => ({
      id: tp.productId,
      name: productMap.get(tp.productId)?.name || 'Unknown',
      image: productMap.get(tp.productId)?.images[0] || '',
      quantity: tp._sum.quantity,
      revenue: tp._sum.price,
    })),
    salesByDay: (salesByDay as any[]).map((d: any) => ({
      date: d.date.toISOString().split('T')[0],
      revenue: Number(d.revenue),
      orders: Number(d.orders),
    })),
    salesByCategory: (salesByCategory as any[]).map((c: any) => ({
      category: c.category,
      revenue: Number(c.revenue),
      quantity: Number(c.quantity),
    })),
  });
};
