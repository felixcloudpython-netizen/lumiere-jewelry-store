import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

// @types/jsonwebtoken 9.x định nghĩa `SignOptions.expiresIn` là `StringValue | number`,
// với `StringValue` là kiểu literal hẹp (vd. '7d', '15m', '3600') chứ không phải `string`
// thường — trong khi giá trị đọc từ `process.env` luôn có kiểu `string`. Hàm dưới đây vừa
// validate đúng định dạng ("<số>" hoặc "<số><đơn vị>", đơn vị như trong gói `ms`), vừa ép
// kiểu an toàn để khớp với `SignOptions['expiresIn']`, và fail-fast ngay lúc khởi động nếu
// `JWT_EXPIRES_IN` bị cấu hình sai, thay vì lỗi ngầm mỗi lần đăng nhập.
function parseExpiresIn(value: string): SignOptions['expiresIn'] {
  if (/^\d+(\.\d+)?\s?[a-zA-Z]*$/.test(value.trim())) {
    return value.trim() as SignOptions['expiresIn'];
  }
  throw new Error(
    `JWT_EXPIRES_IN không hợp lệ: "${value}". Dùng định dạng như "7d", "15m", "3600" (giây).`
  );
}

const JWT_EXPIRES_IN = parseExpiresIn(process.env.JWT_EXPIRES_IN || '7d');

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, firstName, lastName, phone },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.status(201).json({ user, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    token,
  });
};

export const me = async (req: Request, res: Response) => {
  const authReq = req as any;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user.id },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, addresses: true },
  });
  res.json(user);
};

export const changePassword = async (req: Request, res: Response) => {
  const authReq = req as any;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: authReq.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  res.json({ message: 'Password updated' });
};
