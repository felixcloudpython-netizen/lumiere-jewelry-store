'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
}

// Trước đây 6 bộ sưu tập ở đây bị hardcode cứng ("Aura", "Eternity", "Guardian"...),
// không liên quan gì tới dữ liệu thật trong DB — kể cả khi bạn thêm/xoá collection
// qua admin, phần này vẫn không đổi. Giờ lấy thật từ GET /api/products/collections
// (route public, không cần đăng nhập).
export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    apiFetch<Collection[]>('/api/products/collections').then(setCollections).catch(() => setCollections([]));
  }, []);

  return (
    <main>
      <section className="relative h-[600px] flex items-center justify-center text-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] uppercase mb-6">{t('hero.title')}</h1>
          <p className="text-neutral-600 max-w-xl mx-auto mb-10 leading-relaxed">{t('hero.subtitle')}</p>
          <Link href={`/${locale}/jewelry`} className="inline-block px-10 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
            {t('hero.cta')}
          </Link>
        </div>
      </section>

      {collections.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-center text-2xl font-light tracking-[0.2em] uppercase mb-2">{t('collections.title')}</h2>
            <p className="text-center text-sm text-neutral-500 mb-12">{t('collections.subtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((c) => (
                <Link key={c.id} href={`/${locale}/collections/${c.slug}`} className="group block bg-neutral-50 aspect-[3/4] flex flex-col items-center justify-center p-8 hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-neutral-200 mb-6 flex items-center justify-center text-2xl">✦</div>
                  <h3 className="text-sm tracking-[0.2em] uppercase mb-2">{c.name}</h3>
                  {c.description && <p className="text-xs text-neutral-500 text-center">{c.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
