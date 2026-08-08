'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductsResponse {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ProductListingProps {
  category?: string;
  collection?: string;
  bestseller?: boolean;
}

/**
 * Component dùng chung cho MỌI trang danh sách sản phẩm (/jewelry, /jewelry/[category],
 * /collections/[collection], /gifts, /engagement/*) — luôn lấy dữ liệu thật từ
 * GET /api/products (route public, không cần đăng nhập), không có sản phẩm nào bị
 * hardcode. Khi bạn thêm/sửa sản phẩm qua trang Admin, các trang này tự động cập
 * nhật theo mà không cần sửa code.
 */
export default function ProductListing({ category, collection, bestseller }: ProductListingProps) {
  const t = useTranslations('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductsResponse['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (category) params.set('category', category);
    if (collection) params.set('collection', collection);
    if (bestseller) params.set('bestseller', 'true');

    apiFetch<ProductsResponse>(`/api/products?${params}`)
      .then((res) => { setProducts(res.data); setMeta(res.meta); })
      .catch(() => { setProducts([]); setMeta(null); })
      .finally(() => setLoading(false));
  }, [category, collection, bestseller, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500">{t('noProducts')}</p>
        <p className="text-sm text-neutral-400 mt-1">{t('checkBackSoon')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`w-9 h-9 text-xs flex items-center justify-center transition-colors ${
                p === page ? 'bg-neutral-900 text-white' : 'border border-neutral-200 hover:border-neutral-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
