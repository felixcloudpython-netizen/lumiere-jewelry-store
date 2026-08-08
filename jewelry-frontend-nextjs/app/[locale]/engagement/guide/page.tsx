'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// Đây là trang NỘI DUNG (bài viết hướng dẫn 4C của kim cương), khác hẳn các
// trang danh sách sản phẩm còn lại — không có "dữ liệu sản phẩm thật" nào để
// nối vào đây cả. Việc còn thiếu là VIẾT NỘI DUNG thật (câu chữ về carat, cut,
// clarity, color...), không phải việc nối API. Để trang không bị 404 nhưng
// cũng không bịa nội dung giả, tạm thời hiển thị placeholder trung thực.
export default function DiamondGuidePage() {
  const locale = useLocale();
  const t = useTranslations('shop');

  return (
    <main className="pt-28 pb-20 min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide mb-3">{t('engagement')}</h1>
        <p className="text-sm text-neutral-500 mb-8">{t('diamondGuideUnavailable')}</p>
        <Link href={`/${locale}/jewelry/rings`} className="text-xs tracking-widest uppercase underline underline-offset-4">
          {t('browseJewelry')}
        </Link>
      </div>
    </main>
  );
}
