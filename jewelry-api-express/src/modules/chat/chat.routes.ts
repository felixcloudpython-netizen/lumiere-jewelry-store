import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { prisma } from '@/lib/prisma';

const router = Router();

// Get user's chat rooms
router.get('/rooms', authenticate, async (req, res) => {
  const authReq = req as any;
  const isAdmin = authReq.user.role === 'ADMIN';

  if (isAdmin) {
    // Admin sees all rooms with unread counts
    const rooms = await prisma.$queryRaw`
      SELECT 
        m."roomId" as "roomId",
        u.id as "userId",
        u.email,
        u."firstName" as "firstName",
        u."lastName" as "lastName",
        COUNT(CASE WHEN m.read = false AND m."isAdmin" = false THEN 1 END)::int as "unreadCount",
        MAX(m."createdAt") as "lastMessageAt"
      FROM "Message" m
      JOIN "User" u ON m."senderId" = u.id
      WHERE m."isAdmin" = false
      GROUP BY m."roomId", u.id, u.email, u."firstName", u."lastName"
      ORDER BY MAX(m."createdAt") DESC
    `;
    res.json(rooms);
  } else {
    // Customer sees their own room
    const messages = await prisma.message.findMany({
      where: { senderId: authReq.user.id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    const roomId = messages[0]?.roomId || `user_${authReq.user.id}`;
    const unreadCount = await prisma.message.count({
      where: { roomId, senderId: { not: authReq.user.id }, read: false },
    });
    res.json([{ roomId, unreadCount }]);
  }
});

// Get messages for a room
router.get('/rooms/:roomId/messages', authenticate, async (req, res) => {
  const { roomId } = req.params;
  const authReq = req as any;

  // Verify access
  if (authReq.user.role !== 'ADMIN' && !roomId.endsWith(authReq.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  res.json(messages);
});

// Admin: Get unread message count
router.get('/unread', authenticate, requireAdmin, async (_req, res) => {
  const count = await prisma.message.count({
    where: { isAdmin: false, read: false },
  });
  res.json({ count });
});

export default router;
