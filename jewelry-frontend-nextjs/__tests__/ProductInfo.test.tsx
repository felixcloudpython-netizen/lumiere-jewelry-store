import { render, screen, fireEvent } from '@testing-library/react';
import ProductInfo from '@/app/[locale]/product/[slug]/ProductInfo';

const mockProduct = {
  id: 'test-1',
  slug: 'test-ring',
  name: 'Diamond Ring',
  description: 'Beautiful diamond ring',
  price: 1250000,
  comparePrice: 1380000,
  images: ['https://example.com/image.jpg'],
  category: { name: 'Rings', slug: 'rings' },
  collection: { name: 'Aura', slug: 'aura' },
  metal: 'WHITE_GOLD',
  stones: ['Diamond'],
  sizes: [5, 6, 7, 8],
  sku: 'AURA-RG-001',
  inStock: true,
};

describe('ProductInfo', () => {
  it('renders product name and price', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('Diamond Ring')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
  });

  it('renders size options', () => {
    render(<ProductInfo product={mockProduct} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('selects a size on click', () => {
    render(<ProductInfo product={mockProduct} />);
    const sizeBtn = screen.getByText('7');
    fireEvent.click(sizeBtn);
    expect(sizeBtn).toHaveClass('bg-neutral-900');
  });

  it('shows size guide modal', () => {
    render(<ProductInfo product={mockProduct} />);
    fireEvent.click(screen.getByText('product.sizeGuide'));
    expect(screen.getByText('Ring Size Guide')).toBeInTheDocument();
  });
});
