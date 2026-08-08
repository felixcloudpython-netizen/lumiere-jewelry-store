'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout.success');
  const locale = useLocale();
  const clearCart = useCartStore((s) => s.clearCart);

  // Giỏ hàng chỉ nên được xoá SAU KHI thanh toán thành công (tới được trang này),
  // không phải ngay lúc tạo order — nếu tạo order xong mà thanh toán thất bại,
  // khách vẫn cần giữ nguyên giỏ hàng để thử lại.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="pt-32 pb-20 min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-md">
        <CheckCircle2 className="mx-auto mb-6 text-neutral-900" size={48} strokeWidth={1.2} />
        <h1 className="text-2xl font-light tracking-wide mb-3">{t('title')}</h1>
        <p className="text-sm text-neutral-500 mb-8">
          {t('subtitle')}
        </p>
        {/* Trước đây href="/jewelry" thiếu tiền tố locale — từ trang success bản
            tiếng Việt bấm vào sẽ nhảy về bản tiếng Anh mặc định. */}
        <Link href={`/${locale}/jewelry`} className="inline-block px-8 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
          {t('continueShopping')}
        </Link>
      </div>
    </main>
  );
}
