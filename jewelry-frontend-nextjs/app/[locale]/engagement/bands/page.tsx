'use client';

import { useTranslations } from 'next-intl';
import ProductListing from '@/app/components/ProductListing';

// Cùng lý do như /engagement/rings — "wedding bands" cũng thuộc category "rings"
// trong schema hiện tại, chưa có category riêng cho nhẫn cưới.
export default function WeddingBandsPage() {
  const t = useTranslations('shop');
  const tNav = useTranslations('nav');

  return (
    <main className="pt-24 md:pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-3">{tNav('menu.weddingBands')}</h1>
          <p className="text-sm text-neutral-500">{t('weddingBandsDesc')}</p>
        </div>
        <ProductListing category="rings" />
      </div>
    </main>
  );
}
