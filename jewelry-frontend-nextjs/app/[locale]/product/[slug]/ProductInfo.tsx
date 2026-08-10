'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Product } from '@/types';
import { useCartStore } from '@/lib/store/cartStore';
import { formatVND } from '@/lib/currency';
import { Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import SizeGuide from './SizeGuide';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const t = useTranslations('product');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const [selectedSize, setSelectedSize] = useState<number | undefined>(product.sizes[2]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) return;
    addItem(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => toggleCart(), 300);
  };

  const metalColors: Record<string, string> = {
    YELLOW_GOLD: 'bg-yellow-200',
    WHITE_GOLD: 'bg-gray-200',
    ROSE_GOLD: 'bg-rose-200',
    SILVER: 'bg-gray-300',
    PLATINUM: 'bg-gray-400',
  };

  return (
    <div className="lg:pt-8">
      <nav className="text-[11px] tracking-wider text-neutral-500 mb-4">
        <span className="hover:text-neutral-900 cursor-pointer">{tNav('home')}</span>
        <span className="mx-2">/</span>
        <span className="hover:text-neutral-900 cursor-pointer capitalize">{product.category.name}</span>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-light tracking-wide mb-2">{product.name}</h1>
      <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-4">{product.collection?.name} {t('collection')}</p>

      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xl font-medium">{formatVND(product.price)}</span>
        {product.comparePrice && (
          <span className="text-sm text-neutral-400 line-through">{formatVND(product.comparePrice)}</span>
        )}
      </div>

      <p className="text-sm text-neutral-600 leading-relaxed mb-8">{product.description}</p>

      <div className="mb-6">
        <label className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 block mb-3">
          {t('metal')}: <span className="text-neutral-900 capitalize">{product.metal.replace('_', ' ')}</span>
        </label>
        <div className="flex gap-2">
          {Object.entries(metalColors).map(([metal, color]) => (
            <button key={metal} disabled={product.metal !== metal}
              className={`w-8 h-8 rounded-full border-2 ${product.metal === metal ? 'border-neutral-900' : 'border-neutral-200 opacity-40'} ${color}`}
              title={metal.replace('_', ' ')} />
          ))}
        </div>
      </div>

      {product.sizes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] tracking-[0.2em] uppercase text-neutral-500">{t('selectSize')}</label>
            <button onClick={() => setShowSizeGuide(true)} className="text-[11px] underline underline-offset-2 text-neutral-500 hover:text-neutral-900">{t('sizeGuide')}</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {product.sizes.map((size) => (
              <button key={size} onClick={() => setSelectedSize(size)}
                className={`py-2.5 text-xs border transition-all ${selectedSize === size ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400'}`}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <label className="text-[11px] tracking-[0.2em] uppercase text-neutral-500 block mb-3">{t('quantity')}</label>
        <div className="flex items-center border border-neutral-200 w-fit">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-neutral-50 text-sm">−</button>
          <span className="px-4 py-3 text-sm min-w-[3rem] text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-neutral-50 text-sm">+</button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <button onClick={handleAddToCart} disabled={!selectedSize && product.sizes.length > 0}
          className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-all ${addedToCart ? 'bg-green-700 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800'} disabled:opacity-40 disabled:cursor-not-allowed`}>
          {addedToCart ? t('addedToBag') : t('addToBag')}
        </button>
        <button onClick={handleBuyNow} disabled={!selectedSize && product.sizes.length > 0}
          className="w-full py-4 border border-neutral-900 text-xs tracking-[0.2em] uppercase hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-40">
          {t('buyNow')}
        </button>
      </div>

      <div className="flex gap-4 mb-10">
        <button onClick={() => setIsWishlisted(!isWishlisted)} className={`flex items-center gap-2 text-xs tracking-wider ${isWishlisted ? 'text-red-500' : 'text-neutral-500 hover:text-neutral-900'}`}>
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} /> {isWishlisted ? t('saved') : t('addToWishlist')}
        </button>
        <button className="flex items-center gap-2 text-xs tracking-wider text-neutral-500 hover:text-neutral-900">
          <Share2 size={16} /> {t('share')}
        </button>
      </div>

      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center gap-3 text-xs text-neutral-600"><Truck size={16} strokeWidth={1.5} /><span>{t('freeShipping')}</span></div>
        <div className="flex items-center gap-3 text-xs text-neutral-600"><Shield size={16} strokeWidth={1.5} /><span>{t('warranty')}</span></div>
        <div className="flex items-center gap-3 text-xs text-neutral-600"><RotateCcw size={16} strokeWidth={1.5} /><span>{t('returns')}</span></div>
      </div>

      <p className="mt-6 text-[10px] text-neutral-400 tracking-wider">{t('sku')}: {product.sku}</p>
      {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
    </div>
  );
}
