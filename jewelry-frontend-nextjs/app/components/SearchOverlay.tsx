'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Product } from '@/types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductsResponse {
  data: Product[];
}

const POPULAR_SEARCHES = ['Ring', 'Necklace', 'Bracelet', 'Earrings'];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const t = useTranslations('search');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
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

  // Trước đây tìm trong `mockResults` — mảng 4 sản phẩm giả hardcode sẵn, không
  // liên quan gì tới sản phẩm thật trong DB. Giờ gọi thật GET /api/products
  // ?search=... (route public, không cần đăng nhập), debounce 300ms để không
  // gọi API dồn dập mỗi lần gõ phím.
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
    <div className="fixed inset-0 z-[100] bg-white/98 flex flex-col items-center pt-32 px-6">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
      <div className="w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full pl-10 pr-4 py-4 text-2xl font-light border-b-2 border-neutral-900 bg-transparent outline-none placeholder:text-neutral-300" />
        </div>
        {query.length > 1 && (
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
        )}
        {query.length <= 1 && (
          <div className="mt-12">
            <p className="text-xs tracking-widest uppercase text-neutral-400 mb-4">{t('popular')}</p>
            <div className="flex flex-wrap gap-3">
              {POPULAR_SEARCHES.map(tag => (
                <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 text-xs tracking-wider border border-neutral-200 hover:border-neutral-900 transition-colors">{tag}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
