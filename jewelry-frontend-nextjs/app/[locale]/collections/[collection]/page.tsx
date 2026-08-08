'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import ProductListing from '@/app/components/ProductListing';

function titleCase(slug: string) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export default function CollectionDetailPage() {
  const params = useParams();
  const collection = params.collection as string;
  const locale = useLocale();
  const t = useTranslations('shop');

  return (
    <main className="pt-28 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <Link href={`/${locale}/collections`} className="inline-flex items-center gap-2 text-xs tracking-wider text-neutral-500 hover:text-neutral-900 mb-8">
          <ChevronLeft size={14} /> {t('allCollections')}
        </Link>
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] uppercase mb-12 text-center">
          {titleCase(collection)}
        </h1>
        <ProductListing collection={collection} />
      </div>
    </main>
  );
}
