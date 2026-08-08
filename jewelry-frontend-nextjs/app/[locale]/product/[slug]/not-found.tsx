'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function ProductNotFound() {
  const locale = useLocale();
  const t = useTranslations('shop');

  return (
    <main className="pt-28 pb-20 min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide mb-3">{t('productNotFound')}</h1>
        <p className="text-sm text-neutral-500 mb-8">{t('productNotFoundDesc')}</p>
        <Link href={`/${locale}/jewelry`} className="inline-block px-8 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
          {t('browseJewelry')}
        </Link>
      </div>
    </main>
  );
}
