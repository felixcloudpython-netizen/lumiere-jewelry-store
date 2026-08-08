export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: { name: string; slug: string };
  collection?: { name: string; slug: string };
  metal: string;
  stones?: string[];
  sizes: number[];
  sku: string;
  inStock: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  heroImage: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}
