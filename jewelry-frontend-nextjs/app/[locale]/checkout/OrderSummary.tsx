'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { formatVND } from '@/lib/currency';
import { useState } from 'react';

// Khớp đúng SHIPPING_RATES trong jewelry-api-express/src/lib/pricing.ts
const SHIPPING_RATES: Record<'standard' | 'express', number> = { standard: 0, express: 30000 };

interface OrderSummaryProps {
  shippingMethod?: 'standard' | 'express';
}

export default function OrderSummary({ shippingMethod = 'standard' }: OrderSummaryProps) {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const { items, totalPrice } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const subtotal = totalPrice();
  // Khớp đúng bảng giá thật mà backend dùng để tính (xem
  // jewelry-api-express/src/lib/pricing.ts) — trước đây tự đoán theo ngưỡng
  // subtotal riêng, không liên quan gì đến phương thức ship khách thực sự chọn.
  const shipping = SHIPPING_RATES[shippingMethod];
  const total = subtotal + shipping;

  const applyPromo = () => {
    // Backend hiện chưa có hệ thống mã giảm giá thật (xem resolveDiscount() trong
    // pricing.ts luôn trả về 0) — trước đây ô này tự trừ 10% chỉ trên UI trong khi
    // số tiền thật bị trừ qua cổng thanh toán không hề giảm, khiến khách hiểu nhầm. Thông báo
    // rõ ràng thay vì áp một mức giảm giá giả không có thật.
    setPromoMessage(promoCode ? t('promoComingSoon') : '');
  };

  return (
    <div className="bg-white p-6 border border-neutral-200 lg:sticky lg:top-32">
      <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">{t('orderSummary')}</h2>
      <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={`${item.product.id}-${idx}`} className="flex gap-4">
            <div className="relative w-16 h-16 bg-neutral-100 flex-shrink-0">
              {item.product.images[0] ? (
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-200" />
              )}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-500 text-white text-[10px] rounded-full flex items-center justify-center">{item.quantity}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{item.product.name}</p>
              {item.selectedSize && <p className="text-[11px] text-neutral-500">{tCart('size')}: {item.selectedSize}</p>}
              <p className="text-xs mt-0.5">{formatVND(item.product.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <input type="text" placeholder={t('promoCode')} value={promoCode} onChange={e => setPromoCode(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-neutral-200 text-sm outline-none focus:border-neutral-900" />
        <button onClick={applyPromo} className="px-4 py-2.5 border border-neutral-900 text-xs tracking-wider uppercase hover:bg-neutral-900 hover:text-white transition-colors">{t('apply')}</button>
      </div>
      {promoMessage && <p className="text-xs text-neutral-500 -mt-4 mb-6">{promoMessage}</p>}
      <div className="space-y-3 text-sm border-t pt-4">
        <div className="flex justify-between"><span className="text-neutral-500">{tCart('subtotal')}</span><span>{formatVND(subtotal)}</span></div>
        <div className="flex justify-between"><span className="text-neutral-500">{t('shipping')}</span><span>{shipping === 0 ? t('free') : formatVND(shipping)}</span></div>
        <div className="flex justify-between text-base font-medium pt-3 border-t"><span>{t('total')}</span><span>{formatVND(total)}</span></div>
      </div>
      <p className="text-[10px] text-neutral-400 mt-4 leading-relaxed">{t('includingTaxes')}</p>
    </div>
  );
}
