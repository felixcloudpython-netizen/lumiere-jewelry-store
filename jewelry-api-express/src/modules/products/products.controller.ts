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
    tags,
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

  // Lọc theo tag — ?tags=id1,id2 trả về sản phẩm có ĐỦ TẤT CẢ tag được chỉ
  // định (AND), không phải chỉ cần khớp 1 trong số đó. Mỗi tagId tương ứng 1
  // điều kiện "some" riêng trong mảng AND — Prisma yêu cầu CẢ mảng AND đều
  // đúng thì sản phẩm mới được tính.
  if (tags) {
    const tagIds = (tags as string).split(',').filter(Boolean);
    if (tagIds.length > 0) {
      where.AND = tagIds.map((tagId) => ({ tags: { some: { tagId } } }));
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        category: { select: { name: true, slug: true } },
        collection: { select: { name: true, slug: true } },
        tags: { include: { tag: { include: { tagGroup: true } } } },
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
    include: { category: true, collection: true, tags: { include: { tag: { include: { tagGroup: true } } } } },
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
    include: { category: true, collection: true, tags: { include: { tag: { include: { tagGroup: true } } } } },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
};

// tagIds không phải field trực tiếp của Product (là quan hệ nhiều-nhiều qua
// bảng nối ProductTag), nên phải tách riêng khỏi phần data thường, ghi qua
// nested write `tags: { create: [...] }` thay vì gán thẳng.
export const createProduct = async (req: Request, res: Response) => {
  const { tagIds, ...data } = req.body;
  const product = await prisma.product.create({
    data: {
      ...data,
      ...(tagIds && tagIds.length > 0 ? { tags: { create: tagIds.map((tagId: string) => ({ tagId })) } } : {}),
    },
    include: { category: true, collection: true, tags: { include: { tag: true } } },
  });
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tagIds, ...data } = req.body;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      // tagIds === undefined nghĩa là request này KHÔNG đụng gì tới tag (giữ
      // nguyên tag hiện có) — chỉ khi client THỰC SỰ gửi tagIds (kể cả mảng
      // rỗng, để chủ động bỏ hết tag) mới xoá-và-gán-lại toàn bộ.
      ...(tagIds !== undefined ? {
        tags: { deleteMany: {}, create: tagIds.map((tagId: string) => ({ tagId })) },
      } : {}),
    },
    include: { category: true, collection: true, tags: { include: { tag: true } } },
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

// ---------------------------------------------------------------------------
// TagGroup / Tag — hệ thống phân loại đa chiều, admin tự tạo nhóm + giá trị
// tuỳ ý (khác Category — xem chú thích đầu schema.prisma).
// ---------------------------------------------------------------------------

export const getTagGroups = async (_req: Request, res: Response) => {
  const tagGroups = await prisma.tagGroup.findMany({
    orderBy: { order: 'asc' },
    include: { tags: { include: { _count: { select: { productTags: true } } } } },
  });
  res.json(tagGroups);
};

export const createTagGroup = async (req: Request, res: Response) => {
  const tagGroup = await prisma.tagGroup.create({ data: req.body });
  res.status(201).json(tagGroup);
};

export const updateTagGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tagGroup = await prisma.tagGroup.update({ where: { id }, data: req.body });
  res.json(tagGroup);
};

export const deleteTagGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Xoá cả nhóm sẽ tự xoá theo toàn bộ Tag bên trong (onDelete: Cascade ở
  // schema) — cảnh báo rõ số lượng tag sẽ mất theo, để admin không xoá nhầm.
  const tagCount = await prisma.tag.count({ where: { tagGroupId: id } });
  if (tagCount > 0) {
    return res.status(409).json({ error: `Không thể xoá — nhóm này còn ${tagCount} tag bên trong. Xoá hết tag trước.` });
  }
  await prisma.tagGroup.delete({ where: { id } });
  res.status(204).send();
};

export const createTag = async (req: Request, res: Response) => {
  const tag = await prisma.tag.create({ data: req.body });
  res.status(201).json(tag);
};

export const updateTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tag = await prisma.tag.update({ where: { id }, data: req.body });
  res.json(tag);
};

export const deleteTag = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Khác Category, gắn tag vào sản phẩm không bắt buộc — xoá tag chỉ mất liên
  // kết, không phá sản phẩm. Vẫn cảnh báo số lượng để admin biết trước khi xoá.
  const count = await prisma.productTag.count({ where: { tagId: id } });
  if (count > 0) {
    return res.status(409).json({ error: `Không thể xoá — còn ${count} sản phẩm đang gắn tag này.` });
  }
  await prisma.tag.delete({ where: { id } });
  res.status(204).send();
};
