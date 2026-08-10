'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductsResponse {
  data: Product[];
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const t = useTranslations('search');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [spotlight, setSpotlight] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dùng lại đúng tên category thật (đã có bản dịch sẵn) thay vì nhãn tiếng Anh
  // hardcode trước đây — bấm vào tự điền đúng từ khoá đang được dùng thật trong
  // hệ thống danh mục, không phải chuỗi tuỳ ý không liên quan tới dữ liệu.
  const popularTags = [
    tNav('menu.necklaces'), tNav('menu.bracelets'), tNav('menu.rings'), tNav('menu.earrings'),
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      // "Nổi bật" — lấy thật sản phẩm bán chạy (isBestseller) từ API, không phải
      // ảnh marketing dàn dựng sẵn (khác với ví dụ tham khảo) vì cửa hàng chưa có
      // hệ thống quản lý nội dung/ảnh chiến dịch riêng — dùng đúng dữ liệu có sẵn.
      apiFetch<ProductsResponse>('/api/products?bestseller=true&limit=4')
        .then((res) => setSpotlight(res.data))
        .catch(() => setSpotlight([]));
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (query.length <= 1) { setResults([]); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      apiFetch<ProductsResponse>(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <button onClick={onClose} className="absolute top-6 left-6 p-2 hover:bg-neutral-100 rounded-full z-10"><X size={22} /></button>

      <div className="max-w-3xl mx-auto pt-24 px-6 pb-16">
        <div className="relative">
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full pr-10 py-3 text-xl md:text-2xl font-light border-b border-neutral-900 bg-transparent outline-none placeholder:text-neutral-400" />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
        </div>

        {query.length > 1 ? (
          <div className="mt-8">
            {loading ? (
              <div className="flex justify-center mt-12">
                <div className="animate-spin w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs tracking-widest uppercase text-neutral-400 mb-4">{results.length} {t('results')}</p>
                {results.map((result) => (
                  <Link key={result.id} href={`/${locale}/product/${result.slug}`} onClick={onClose} className="flex items-center justify-between py-3 border-b border-neutral-100 group">
                    <div><p className="text-sm font-medium">{result.name}</p><p className="text-xs text-neutral-500 mt-0.5">{result.category.name}</p></div>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-center mt-12">{t('noResults', { query })}</p>
            )}
          </div>
        ) : (
          <>
            <div className="mt-10">
              <p className="text-sm mb-4">{t('popular')}</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button key={tag} onClick={() => setQuery(tag)}
                    className="px-4 py-2 text-xs bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {spotlight.length > 0 && (
              <div className="mt-12">
                <p className="text-sm mb-4">{t('spotlight')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {spotlight.map((product) => (
                    <Link key={product.id} href={`/${locale}/product/${product.slug}`} onClick={onClose} className="group">
                      <div className="relative aspect-square bg-neutral-50 overflow-hidden mb-2">
                        {product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-2xl">✦</div>
                        )}
                      </div>
                      <p className="text-xs text-center text-neutral-700 truncate">{product.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
