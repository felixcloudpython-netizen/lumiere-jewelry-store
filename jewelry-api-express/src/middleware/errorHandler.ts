import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err.name === 'PrismaClientKnownRequestError') {
    const code = (err as any).code;
    if (code === 'P2002') return res.status(409).json({ error: 'Resource already exists' });
    if (code === 'P2025') return res.status(404).json({ error: 'Resource not found' });
  }

  res.status(500).json({ error: 'Internal server error' });
};
