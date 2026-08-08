import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/app/components/Header';

describe('Header', () => {
  it('renders logo', () => {
    render(<Header />);
    expect(screen.getByText('Lumière')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(<Header />);
    expect(screen.getByText('nav.jewelry')).toBeInTheDocument();
    expect(screen.getByText('nav.engagement')).toBeInTheDocument();
    expect(screen.getByText('nav.collections')).toBeInTheDocument();
  });

  it('toggles search overlay', () => {
    render(<Header />);
    const searchBtn = screen.getByLabelText('nav.search');
    fireEvent.click(searchBtn);
    expect(screen.getByPlaceholderText('Search products, collections...')).toBeInTheDocument();
  });
});
