'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import ProductListing from '@/app/components/ProductListing';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function JewelryPage() {
  const locale = useLocale();
  const t = useTranslations('shop');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiFetch<Category[]>('/api/products/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <main className="pt-24 md:pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-3">{t('allJewelry')}</h1>
          <p className="text-sm text-neutral-500">{t('allJewelryDesc')}</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 md:mb-14">
            <p className="text-[13px] tracking-[0.2em] uppercase text-neutral-400 text-center mb-4 md:mb-6">{t('shopByCategory')}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/${locale}/jewelry/${cat.slug}`}
                  className="px-4 py-2.5 md:px-6 md:py-3 border border-neutral-200 text-[12px] tracking-[0.15em] hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
                >
                  {cat.name} <span className="opacity-50">({cat._count.products})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <ProductListing />
      </div>
    </main>
  );
}
