'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Product } from '@/types';
import { formatVND } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations('product');

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden mb-4">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <span className="text-neutral-300 text-4xl font-light">✦</span>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] tracking-widest uppercase bg-neutral-900 text-white px-3 py-1.5">{t('outOfStock')}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium truncate group-hover:underline underline-offset-4">{product.name}</h3>
      <p className="text-xs text-neutral-500 mt-0.5">{product.category.name}</p>
      <div className="flex items-baseline gap-2 mt-1.5">
        <span className="text-sm">{formatVND(product.price)}</span>
        {product.comparePrice && (
          <span className="text-xs text-neutral-400 line-through">{formatVND(product.comparePrice)}</span>
        )}
      </div>
    </Link>
  );
}
