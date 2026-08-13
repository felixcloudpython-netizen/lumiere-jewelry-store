import { Router } from 'express';
import {
  getProducts, getProduct, getProductById, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  getCollections, createCollection, updateCollection, deleteCollection,
  getTagGroups, createTagGroup, updateTagGroup, deleteTagGroup,
  createTag, updateTag, deleteTag,
} from './products.controller';
import { authenticate, requireAdmin } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  createProductSchema, updateProductSchema, createCategorySchema, updateCategorySchema,
  createCollectionSchema, updateCollectionSchema, createTagGroupSchema, updateTagGroupSchema,
  createTagSchema, updateTagSchema,
} from '@/lib/zodSchemas';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: featured
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 *                 meta: { type: object }
 */
router.get('/', getProducts);

router.get('/categories', getCategories);
router.post('/categories', authenticate, requireAdmin, validate(createCategorySchema), createCategory);
router.patch('/categories/:id', authenticate, requireAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, deleteCategory);

router.get('/collections', getCollections);
router.post('/collections', authenticate, requireAdmin, validate(createCollectionSchema), createCollection);
router.patch('/collections/:id', authenticate, requireAdmin, validate(updateCollectionSchema), updateCollection);
router.delete('/collections/:id', authenticate, requireAdmin, deleteCollection);

router.get('/tag-groups', getTagGroups);
router.post('/tag-groups', authenticate, requireAdmin, validate(createTagGroupSchema), createTagGroup);
router.patch('/tag-groups/:id', authenticate, requireAdmin, validate(updateTagGroupSchema), updateTagGroup);
router.delete('/tag-groups/:id', authenticate, requireAdmin, deleteTagGroup);

router.post('/tags', authenticate, requireAdmin, validate(createTagSchema), createTag);
router.patch('/tags/:id', authenticate, requireAdmin, validate(updateTagSchema), updateTag);
router.delete('/tags/:id', authenticate, requireAdmin, deleteTag);

router.get('/admin/:id', authenticate, requireAdmin, getProductById);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:slug', getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticate, requireAdmin, validate(createProductSchema), createProduct);

router.patch('/:id', authenticate, requireAdmin, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
