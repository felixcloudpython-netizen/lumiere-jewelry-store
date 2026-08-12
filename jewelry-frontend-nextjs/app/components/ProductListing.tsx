'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

interface ProductsResponse {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface TagGroup {
  id: string;
  name: string;
  slug: string;
  tags: { id: string; name: string; slug: string }[];
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
 *
 * Bộ lọc tag (multi-tag, quản lý qua Admin → Tags) — tick nhiều tag CÙNG LÚC,
 * kể cả khác nhóm (vd "Charm" + "Sinh nhật"), sản phẩm phải khớp ĐỦ TẤT CẢ tag
 * đã tick mới hiện ra (logic AND, khớp đúng backend). Nếu chưa có nhóm tag nào
 * được tạo qua Admin, toàn bộ khung lọc tự ẩn — không phá layout khi chưa có
 * dữ liệu.
 */
export default function ProductListing({ category, collection, bestseller }: ProductListingProps) {
  const t = useTranslations('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductsResponse['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    apiFetch<TagGroup[]>('/api/products/tag-groups').then(setTagGroups).catch(() => setTagGroups([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (category) params.set('category', category);
    if (collection) params.set('collection', collection);
    if (bestseller) params.set('bestseller', 'true');
    if (selectedTagIds.size > 0) params.set('tags', Array.from(selectedTagIds).join(','));

    apiFetch<ProductsResponse>(`/api/products?${params}`)
      .then((res) => { setProducts(res.data); setMeta(res.meta); })
      .catch(() => { setProducts([]); setMeta(null); })
      .finally(() => setLoading(false));
  }, [category, collection, bestseller, page, selectedTagIds]);

  const toggleTag = (tagId: string) => {
    setPage(1);
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId); else next.add(tagId);
      return next;
    });
  };

  const clearTags = () => { setPage(1); setSelectedTagIds(new Set()); };

  const hasFilters = tagGroups.length > 0 && tagGroups.some((g) => g.tags.length > 0);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-[0.15em] uppercase font-medium">{t('filters')}</p>
        {selectedTagIds.size > 0 && (
          <button onClick={clearTags} className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-2">
            {t('clearFilters')}
          </button>
        )}
      </div>
      {tagGroups.filter((g) => g.tags.length > 0).map((group) => (
        <div key={group.id}>
          <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 mb-3">{group.name}</p>
          <div className="space-y-2">
            {group.tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTagIds.has(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                  className="accent-neutral-900"
                />
                <span className="text-neutral-600 group-hover:text-neutral-900">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={hasFilters ? 'grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10' : ''}>
      {hasFilters && (
        <>
          {/* Desktop: cột lọc cố định bên trái */}
          <aside className="hidden lg:block">{filterPanel}</aside>

          {/* Mobile: nút mở khung lọc dạng overlay */}
          <div className="lg:hidden flex items-center justify-between mb-2">
            <button onClick={() => setIsMobileFilterOpen(true)} className="flex items-center gap-2 text-xs tracking-wider uppercase border border-neutral-200 px-4 py-2">
              <SlidersHorizontal size={14} /> {t('filters')} {selectedTagIds.size > 0 && `(${selectedTagIds.size})`}
            </button>
          </div>
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-[100] bg-white p-6 overflow-y-auto lg:hidden">
              <button onClick={() => setIsMobileFilterOpen(false)} className="absolute top-6 right-6 p-2"><X size={20} /></button>
              <div className="mt-12">{filterPanel}</div>
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full mt-8 py-3 bg-neutral-900 text-white text-xs tracking-wider uppercase">
                {t('showResults')}
              </button>
            </div>
          )}
        </>
      )}

      <div>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-500">{t('noProducts')}</p>
            <p className="text-sm text-neutral-400 mt-1">{t('checkBackSoon')}</p>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 ${hasFilters ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4'}`}>
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
          </>
        )}
      </div>
    </div>
  );
}
