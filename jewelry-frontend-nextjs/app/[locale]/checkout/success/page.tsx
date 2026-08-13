'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { apiFetch } from '@/lib/api';

interface OrderStatus {
  id: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
}

/**
 * Khác với Stripe trước đây (biết ngay thanh toán thành công qua callback
 * onSuccess ngay trong trang), payOS chuyển hướng khách quay lại đây SAU KHI
 * họ hoàn tất ở trang payOS — nhưng việc XÁC NHẬN thật sự nằm ở webhook phía
 * backend (payos.service.ts), có thể đến sau vài giây. Trang này vì vậy phải
 * tự ĐỌC LẠI trạng thái đơn hàng từ server (dò lại vài lần) thay vì mặc định
 * coi "tới được trang này = đã thanh toán".
 */
export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout.success');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = useAuthStore((s) => s.token);
  const clearCart = useCartStore((s) => s.clearCart);

  const [status, setStatus] = useState<'checking' | 'paid' | 'failed' | 'timeout'>('checking');
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId || !token) {
      setStatus('timeout');
      return;
    }

    let cancelled = false;

    const poll = () => {
      apiFetch<OrderStatus>(`/api/orders/${orderId}`, { token })
        .then((order) => {
          if (cancelled) return;
          if (order.paymentStatus === 'PAID') {
            setStatus('paid');
            clearCart(); // chỉ xoá giỏ hàng SAU KHI xác nhận thanh toán thành công thật
          } else if (order.paymentStatus === 'FAILED') {
            setStatus('failed');
          } else {
            attemptsRef.current += 1;
            if (attemptsRef.current >= 10) {
              setStatus('timeout'); // webhook có thể đến muộn — không coi là lỗi hẳn
            } else {
              setTimeout(poll, 2000);
            }
          }
        })
        .catch(() => { if (!cancelled) setStatus('timeout'); });
    };

    poll();
    return () => { cancelled = true; };
  }, [orderId, token, clearCart]);

  return (
    <main className="pt-24 md:pt-32 pb-20 min-h-screen flex items-center justify-center text-center px-6">
      <div className="max-w-md">
        {status === 'checking' && (
          <>
            <div className="animate-spin w-10 h-10 border-2 border-neutral-900 border-t-transparent rounded-full mx-auto mb-6" />
            <h1 className="text-2xl font-light tracking-wide mb-3">{t('verifying')}</h1>
            <p className="text-sm text-neutral-500">{t('verifyingDesc')}</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <CheckCircle2 className="mx-auto mb-6 text-neutral-900" size={48} strokeWidth={1.2} />
            <h1 className="text-2xl font-light tracking-wide mb-3">{t('title')}</h1>
            <p className="text-sm text-neutral-500 mb-8">{t('subtitle')}</p>
            <Link href={`/${locale}/jewelry`} className="inline-block px-8 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
              {t('continueShopping')}
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto mb-6 text-red-500" size={48} strokeWidth={1.2} />
            <h1 className="text-2xl font-light tracking-wide mb-3">{t('failedTitle')}</h1>
            <p className="text-sm text-neutral-500 mb-8">{t('failedDesc')}</p>
            <Link href={`/${locale}/checkout`} className="inline-block px-8 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
              {t('tryAgain')}
            </Link>
          </>
        )}

        {status === 'timeout' && (
          <>
            <Clock className="mx-auto mb-6 text-neutral-400" size={48} strokeWidth={1.2} />
            <h1 className="text-2xl font-light tracking-wide mb-3">{t('processingTitle')}</h1>
            <p className="text-sm text-neutral-500 mb-8">{t('processingDesc')}</p>
            <Link href={`/${locale}/account`} className="inline-block px-8 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
              {t('viewOrders')}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
