'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string | null;
  _count: { products: number };
}

export default function CollectionsPage() {
  const locale = useLocale();
  const t = useTranslations('collections');
  const tShop = useTranslations('shop');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Collection[]>('/api/products/collections')
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pt-24 md:pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-3">{t('title')}</h1>
          <p className="text-sm text-neutral-500">{t('subtitle')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
          </div>
        ) : collections.length === 0 ? (
          <p className="text-center text-neutral-500 py-24">{tShop('noProducts')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link key={c.id} href={`/${locale}/collections/${c.slug}`} className="group relative block bg-neutral-50 aspect-[3/4] overflow-hidden hover:shadow-lg transition-shadow">
                {c.heroImage ? (
                  <>
                    <Image src={c.heroImage} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-8">
                      <h3 className="text-sm tracking-[0.2em] uppercase mb-2 text-white">{c.name}</h3>
                      {c.description && <p className="text-xs text-white/90 text-center">{c.description}</p>}
                      <p className="text-[11px] text-white/70 mt-3">{tShop('itemsCount', { count: c._count.products })}</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="w-20 h-20 rounded-full bg-neutral-200 mb-6 flex items-center justify-center text-2xl">✦</div>
                    <h3 className="text-sm tracking-[0.2em] uppercase mb-2">{c.name}</h3>
                    {c.description && <p className="text-xs text-neutral-500 text-center">{c.description}</p>}
                    <p className="text-[11px] text-neutral-400 mt-3">{tShop('itemsCount', { count: c._count.products })}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
