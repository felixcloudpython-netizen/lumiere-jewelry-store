import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getProducts = async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '12',
    category,
    collection,
    metal,
    minPrice,
    maxPrice,
    search,
    featured,
    bestseller,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};

  if (category) where.category = { slug: category as string };
  if (collection) where.collection = { slug: collection as string };
  if (metal) where.metal = metal as string;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice as string) * 100;
    if (maxPrice) where.price.lte = parseInt(maxPrice as string) * 100;
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  if (featured === 'true') where.isFeatured = true;
  if (bestseller === 'true') where.isBestseller = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        category: { select: { name: true, slug: true } },
        collection: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    data: products,
    meta: {
      page: parseInt(page as string),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const getProduct = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, collection: true },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

// Dùng riêng cho trang admin (form edit) — /:slug ở trên không dùng được ở đây vì
// trang edit chỉ có sẵn productId (từ danh sách sản phẩm), không có slug.
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, collection: true },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.create({
    data: req.body,
    include: { category: true, collection: true },
  });
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.update({
    where: { id },
    data: req.body,
    include: { category: true, collection: true },
  });
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
};

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json(categories);
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json(category);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await prisma.category.update({ where: { id }, data: req.body });
  res.json(category);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Chặn xoá category còn sản phẩm đang gắn vào — Product.categoryId là bắt buộc
  // (không optional) trong schema, xoá thẳng category sẽ khiến các sản phẩm đó
  // trỏ tới 1 category không tồn tại, phá vỡ toàn bộ trang danh sách/chi tiết
  // của những sản phẩm này.
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return res.status(409).json({ error: `Không thể xoá — còn ${count} sản phẩm đang thuộc danh mục này.` });
  }
  await prisma.category.delete({ where: { id } });
  res.status(204).send();
};

export const getCollections = async (_req: Request, res: Response) => {
  const collections = await prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
  });
  res.json(collections);
};

export const createCollection = async (req: Request, res: Response) => {
  const collection = await prisma.collection.create({ data: req.body });
  res.status(201).json(collection);
};

export const updateCollection = async (req: Request, res: Response) => {
  const { id } = req.params;
  const collection = await prisma.collection.update({ where: { id }, data: req.body });
  res.json(collection);
};

export const deleteCollection = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Khác với Category, Product.collectionId là optional trong schema — về mặt kỹ
  // thuật xoá collection sẽ không phá dữ liệu sản phẩm (chỉ mất liên kết). Nhưng
  // vẫn chặn xoá nếu còn sản phẩm gắn vào, để admin chủ động chuyển sản phẩm sang
  // collection khác (hoặc "No Collection") trước — tránh xoá nhầm ảnh hưởng tới
  // các trang /collections/[slug] đang hiển thị cho khách mà không báo trước.
  const count = await prisma.product.count({ where: { collectionId: id } });
  if (count > 0) {
    return res.status(409).json({ error: `Không thể xoá — còn ${count} sản phẩm đang thuộc bộ sưu tập này.` });
  }
  await prisma.collection.delete({ where: { id } });
  res.status(204).send();
};
