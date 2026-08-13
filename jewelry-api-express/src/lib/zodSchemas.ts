import { z } from 'zod';
import { Metal } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const createProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  comparePrice: z.number().int().positive().optional(),
  sku: z.string().min(1),
  categoryId: z.string().cuid(),
  collectionId: z.string().cuid().optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  metal: z.nativeEnum(Metal),
  stones: z.array(z.string()).default([]),
  sizes: z.array(z.number().int().positive()).default([]),
  images: z.array(z.string().url()).default([]),
  inventory: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const createOrderSchema = z.object({
  email: z.string().email(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    apartment: z.string().optional(),
    city: z.string(),
    country: z.string().default('VN'),
    postalCode: z.string(),
    phone: z.string(),
  }),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
    size: z.number().int().optional(),
  })).min(1),
  // Client chỉ được CHỌN phương thức ship, không được gửi thẳng SỐ TIỀN ship.
  // `discount` bằng số cũng KHÔNG còn được nhận từ client nữa — trước đây client có thể
  // tự gửi số tiền `discount` để thao túng `total` (ví dụ set gần bằng subtotal để mua
  // gần như miễn phí), vì `total` được dùng thẳng làm `amount` khi tạo yêu cầu thanh toán.
  // Nếu client vẫn gửi `shipping`/`discount` dạng số, Zod sẽ tự loại bỏ (strip); server
  // tự tra bảng giá + tự tính discount trong controller (xem src/lib/pricing.ts).
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
  couponCode: z.string().trim().min(1).optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
});

// Regex slug: chỉ chữ thường, số và dấu gạch ngang — khớp đúng định dạng URL
// đang dùng ở toàn bộ trang danh sách (/jewelry/rings, /collections/aura...).
const slugSchema = z.string().trim().min(1)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (vd: "wedding-rings")');

export const createCategorySchema = z.object({
  name: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  parentId: z.string().cuid().optional(),
});
export const updateCategorySchema = createCategorySchema.partial();

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().optional(),
  story: z.string().trim().optional(),
  heroImage: z.string().trim().optional(),
});
export const updateCollectionSchema = createCollectionSchema.partial();

export const createTagGroupSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugSchema,
  order: z.number().int().default(0),
});
export const updateTagGroupSchema = createTagGroupSchema.partial();

export const createTagSchema = z.object({
  name: z.string().trim().min(1),
  slug: slugSchema,
  tagGroupId: z.string().cuid(),
});
export const updateTagSchema = createTagSchema.partial();
