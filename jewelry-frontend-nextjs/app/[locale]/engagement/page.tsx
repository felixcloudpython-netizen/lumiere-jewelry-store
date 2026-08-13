'use client';

import { useTranslations } from 'next-intl';
import ProductListing from '@/app/components/ProductListing';

// Schema (Category/Collection) không có khái niệm "Engagement" riêng — nhẫn cầu
// hôn về bản chất vẫn là category "rings". Dùng lại category đó thay vì bịa
// thêm dữ liệu giả. Nếu sau này muốn tách riêng, cần thêm category/collection
// "Engagement" thật qua DB rồi đổi filter bên dưới.
export default function EngagementPage() {
  const t = useTranslations('shop');

  return (
    <main className="pt-24 md:pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-3">{t('engagement')}</h1>
          <p className="text-sm text-neutral-500">{t('engagementDesc')}</p>
        </div>
        <ProductListing category="rings" />
      </div>
    </main>
  );
}
