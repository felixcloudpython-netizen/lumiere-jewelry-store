'use client';

import { useTranslations } from 'next-intl';
import ProductListing from '@/app/components/ProductListing';

// Schema hiện không có khái niệm "quà tặng" riêng — dùng sản phẩm được đánh dấu
// "Bestseller" (isBestseller, đã có sẵn trong form Add/Edit Product ở admin) làm
// gợi ý quà tặng, thay vì bịa ra dữ liệu giả.
export default function GiftsPage() {
  const t = useTranslations('shop');

  return (
    <main className="pt-24 md:pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-3">{t('gifts')}</h1>
          <p className="text-sm text-neutral-500">{t('giftsDesc')}</p>
        </div>
        <ProductListing bestseller />
      </div>
    </main>
  );
}
