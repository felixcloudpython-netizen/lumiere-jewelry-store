import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from './upload.service';
import { authenticate, requireAdmin } from '@/middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP images allowed'));
  },
});

const router = Router();

router.post(
  '/single',
  authenticate,
  requireAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const result = await uploadImage(req.file.buffer);
      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/multiple',
  authenticate,
  requireAdmin,
  upload.array('images', 10),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

      const results = await Promise.all(
        files.map(file => uploadImage(file.buffer))
      );

      res.json(results.map(r => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
      })));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
