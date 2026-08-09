'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { formatVND } from '@/lib/currency';
import { X, Plus, Minus } from 'lucide-react';

export default function MiniCart() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const total = totalPrice();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-[90]" onClick={closeCart} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[100] shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <h2 className="text-xs tracking-[0.2em] uppercase font-medium">{t('title')}</h2>
            <button onClick={closeCart} className="p-1 hover:bg-neutral-100 rounded"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-neutral-400 text-sm mb-4">{t('empty')}</p>
                <button onClick={closeCart} className="text-xs tracking-widest uppercase underline underline-offset-4">{t('continueShopping')}</button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="flex gap-4">
                    <div className="relative w-20 h-20 bg-neutral-100 flex-shrink-0">
                      {item.product.images[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                          {item.selectedSize && <p className="text-xs text-neutral-500 mt-0.5">{t('size')}: {item.selectedSize}</p>}
                          <p className="text-sm mt-1">{formatVND(item.product.price)}</p>
                        </div>
                        <button onClick={() => removeItem(item.product.id, item.selectedSize)} className="text-neutral-400 hover:text-neutral-900 p-1"><X size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="w-7 h-7 border border-neutral-200 flex items-center justify-center hover:border-neutral-900 transition-colors"><Minus size={12} /></button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="w-7 h-7 border border-neutral-200 flex items-center justify-center hover:border-neutral-900 transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t px-6 py-5 space-y-4">
              <div className="flex justify-between items-center"><span className="text-sm">{t('subtotal')}</span><span className="text-sm font-medium">{formatVND(total)}</span></div>
              <p className="text-[11px] text-neutral-500">{t('shippingNote')}</p>
              {/* Trước đây href="/checkout" không có tiền tố locale — nếu đang ở
                  bản tiếng Việt (/vi/...), bấm vào sẽ nhảy sang bản tiếng Anh mặc
                  định (không tiền tố) thay vì giữ đúng "/vi/checkout". */}
              <Link href={`/${locale}/checkout`} onClick={closeCart} className="block w-full py-4 bg-neutral-900 text-white text-center text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">{t('checkout')}</Link>
              <button onClick={closeCart} className="block w-full text-center text-xs tracking-widest uppercase underline underline-offset-4">{t('continueShopping')}</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
