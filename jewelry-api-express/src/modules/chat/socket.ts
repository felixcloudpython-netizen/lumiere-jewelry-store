import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

// Cùng quy tắc với REST endpoint GET /rooms/:roomId/messages (chat.routes.ts):
// admin được vào mọi phòng, còn user thường chỉ được vào phòng của chính mình
// (roomId dạng `user_<id>`). Trước đây `join_room`/`send_message` không hề kiểm
// tra điều này, nên user A có thể join phòng của user B nếu đoán được roomId.
function canAccessRoom(user: { id: string; role: string }, roomId: string): boolean {
  return user.role === 'ADMIN' || roomId.endsWith(user.id);
}

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      if (!user) return next(new Error('User not found'));

      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`⚡ User connected: ${user.email} (${user.id})`);

    // Join user's personal room
    socket.join(`user_${user.id}`);

    // Admin joins admin room
    if (user.role === 'ADMIN') {
      socket.join('admins');
    }

    // Load message history
    socket.on('join_room', async (roomId: string) => {
      if (!canAccessRoom(user, roomId)) {
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }
      socket.join(roomId);
      const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: 'asc' },
        take: 50,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      });
      socket.emit('message_history', messages);
    });

    // Send message
    socket.on('send_message', async (data: { roomId: string; content: string }) => {
      const { roomId, content } = data;

      if (!canAccessRoom(user, roomId)) {
        socket.emit('error', { message: 'Access denied to this room' });
        return;
      }

      const message = await prisma.message.create({
        data: {
          content,
          senderId: user.id,
          roomId,
          isAdmin: user.role === 'ADMIN',
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      });

      // Broadcast to room
      io.to(roomId).emit('new_message', message);

      // Notify admins of new customer message
      if (user.role !== 'ADMIN') {
        io.to('admins').emit('new_support_request', {
          roomId,
          userId: user.id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          preview: content.substring(0, 50),
          timestamp: message.createdAt,
        });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (roomId: string) => {
      if (!canAccessRoom(user, roomId)) return;

      await prisma.message.updateMany({
        where: {
          roomId,
          senderId: { not: user.id },
          read: false,
        },
        data: { read: true },
      });
      io.to(roomId).emit('messages_read', { roomId, by: user.id });
    });

    // Typing indicator
    socket.on('typing', (roomId: string) => {
      if (!canAccessRoom(user, roomId)) return;

      socket.to(roomId).emit('user_typing', {
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      });
    });

    socket.on('disconnect', () => {
      console.log(`⚡ User disconnected: ${user.email}`);
    });
  });

  return io;
}
