'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuthStore } from '@/lib/store/authStore';
import { apiFetch, ApiError } from '@/lib/api';
import Link from 'next/link';
import { ChevronLeft, Lock } from 'lucide-react';
import CheckoutForm, { ShippingFormData } from './CheckoutForm';
import OrderSummary from './OrderSummary';
import AuthGate from '@/app/components/auth/AuthGate';
import PaymentStep from './PaymentStep';

type CheckoutStep = 'information' | 'shipping' | 'payment';

interface OrderResponse {
  id: string;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tCart = useTranslations('cart');
  const locale = useLocale();
  const { items } = useCartStore();
  const token = useAuthStore((s) => s.token);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);

  const [step, setStep] = useState<CheckoutStep>('information');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-20 text-center">
        <h1 className="text-2xl font-light tracking-wide mb-4">{t('emptyBagTitle')}</h1>
        <Link href={`/${locale}/jewelry`} className="text-xs tracking-widest uppercase underline underline-offset-4">{tCart('continueShopping')}</Link>
      </main>
    );
  }

  // Orders API (orders.routes.ts) yêu cầu đăng nhập cho MỌI request — trước đây
  // frontend không có bất kỳ cách nào để lấy JWT token nên checkout không thể
  // hoạt động được. Chặn ở đây trước khi cho vào các bước checkout.
  //
  // Phải chờ `isAuthHydrated` trước khi kết luận "chưa đăng nhập": authStore
  // khôi phục token đã lưu từ localStorage bất đồng bộ ngay sau lần render đầu,
  // nếu kiểm tra `!token` ngay lập tức sẽ flash màn hình đăng nhập cho cả khách
  // đã đăng nhập từ trước, trong lúc chờ khôi phục xong.
  if (!isAuthHydrated) {
    return (
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!token) {
    return (
      <main className="pt-32 pb-20 min-h-screen bg-neutral-50">
        <div className="max-w-md mx-auto px-6">
          <AuthGate context="checkout" />
        </div>
      </main>
    );
  }

  const handleContinueToPayment = async (data: ShippingFormData) => {
    setError('');
    setIsProcessing(true);
    try {
      const order = await apiFetch<OrderResponse>('/api/orders', {
        method: 'POST',
        token,
        body: {
          email: data.email,
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            apartment: data.apartment || undefined,
            city: data.city,
            country: data.country,
            postalCode: data.postalCode,
            phone: data.phone,
          },
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.selectedSize,
          })),
          shippingMethod: data.shippingMethod,
        },
      });
      setOrderId(order.id);
      setStep('payment');
    } catch (err) {
      // Ví dụ lỗi thường gặp: sản phẩm hết hàng giữa lúc khách đang checkout
      // (orders.controller.ts kiểm tra tồn kho tại thời điểm tạo order).
      setError(err instanceof ApiError ? err.message : t('placeOrderError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'information', label: t('information') },
    { key: 'shipping', label: t('shipping') },
    { key: 'payment', label: t('payment') },
  ];

  return (
    <main className="pt-28 pb-20 min-h-screen bg-neutral-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <Link href={`/${locale}/jewelry`} className="inline-flex items-center gap-2 text-xs tracking-wider text-neutral-500 hover:text-neutral-900 mb-8">
          <ChevronLeft size={14} /> {tCart('continueShopping')}
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-4 mb-10">
              {steps.map((s, idx) => (
                <div key={s.key} className="flex items-center gap-4">
                  <button
                    onClick={() => s.key !== 'payment' && setStep(s.key)}
                    disabled={s.key === 'payment' && !orderId}
                    className={`text-[11px] tracking-[0.2em] uppercase pb-2 border-b-2 transition-colors ${step === s.key ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}>
                    {s.label}
                  </button>
                  {idx < steps.length - 1 && <span className="text-neutral-300">/</span>}
                </div>
              ))}
            </div>

            {step === 'payment' && orderId ? (
              <PaymentStep orderId={orderId} />
            ) : (
              <CheckoutForm
                step={step}
                onStepChange={setStep}
                onContinueToPayment={handleContinueToPayment}
                onShippingMethodChange={setShippingMethod}
                isProcessing={isProcessing}
                error={error}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <OrderSummary shippingMethod={shippingMethod} />
          </div>
        </div>
        <div className="mt-12 flex items-center justify-center gap-2 text-[11px] text-neutral-400 tracking-wider">
          <Lock size={12} /> {t('secure')}
        </div>
      </div>
    </main>
  );
}
