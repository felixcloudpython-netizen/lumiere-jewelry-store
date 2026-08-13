'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import ProductListing from '@/app/components/ProductListing';

interface Category { name: string; slug: string; }

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const locale = useLocale();
  const t = useTranslations('shop');
  const [categoryName, setCategoryName] = useState<string | null>(null);

  // Trước đây tiêu đề trang tự "đoán" tên từ slug trong URL (titleCase(slug))
  // và KHÔNG BAO GIỜ được thay bằng tên thật — nếu category tên "Vòng tay 1"
  // nhưng slug "vong-tay-1", tiêu đề sẽ hiện sai "Vong Tay 1" thay vì đúng tên
  // đã đặt trong Admin. Giờ lấy đúng tên thật theo slug từ API.
  useEffect(() => {
    apiFetch<Category[]>('/api/products/categories')
      .then((cats) => setCategoryName(cats.find((c) => c.slug === categorySlug)?.name ?? categorySlug))
      .catch(() => setCategoryName(categorySlug));
  }, [categorySlug]);

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link href={`/${locale}/jewelry`} className="inline-flex items-center gap-2 text-xs tracking-wider text-neutral-500 hover:text-neutral-900 mb-8">
          <ChevronLeft size={14} /> {t('allJewelry')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] mb-12 text-center min-h-[1.2em]">
          {categoryName ?? ''}
        </h1>
        <ProductListing category={categorySlug} />
      </div>
    </main>
  );
}
