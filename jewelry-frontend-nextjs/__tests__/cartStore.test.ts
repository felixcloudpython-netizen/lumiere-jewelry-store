import { useCartStore } from '@/lib/store/cartStore';

const mockProduct = {
  id: 'test-1',
  slug: 'test-product',
  name: 'Test Product',
  description: 'Test',
  price: 100000,
  images: [],
  category: { name: 'Rings', slug: 'rings' },
  metal: 'WHITE_GOLD',
  sizes: [6, 7],
  sku: 'TEST-001',
  inStock: true,
};

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false });
  });

  it('adds item to cart', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('increments quantity for same product and size', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    useCartStore.getState().addItem(mockProduct, 7);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('calculates total price correctly', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    useCartStore.getState().addItem(mockProduct, 7);
    expect(useCartStore.getState().totalPrice()).toBe(200000);
  });

  it('removes item from cart', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    useCartStore.getState().removeItem(mockProduct.id, 7);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    useCartStore.getState().updateQuantity(mockProduct.id, 5, 7);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes item when quantity set to 0', () => {
    useCartStore.getState().addItem(mockProduct, 7);
    useCartStore.getState().updateQuantity(mockProduct.id, 0, 7);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
