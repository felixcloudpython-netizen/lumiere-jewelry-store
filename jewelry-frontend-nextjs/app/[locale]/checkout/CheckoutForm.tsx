'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatVND } from '@/lib/currency';
import { calculateShipping } from '@/lib/shipping';
import { useCartStore } from '@/lib/store/cartStore';

type CheckoutStep = 'information' | 'shipping' | 'payment';

export interface ShippingFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  shippingMethod: 'standard' | 'express';
}

interface CheckoutFormProps {
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
  onContinueToPayment: (data: ShippingFormData) => void;
  onShippingMethodChange: (method: 'standard' | 'express') => void;
  isProcessing: boolean;
  error?: string;
}

export default function CheckoutForm({ step, onStepChange, onContinueToPayment, onShippingMethodChange, isProcessing, error }: CheckoutFormProps) {
  const t = useTranslations('checkout');
  const subtotal = useCartStore((s) => s.totalPrice());
  const [formData, setFormData] = useState<ShippingFormData>({
    email: '', firstName: '', lastName: '', address: '', apartment: '', city: '', country: 'US',
    postalCode: '', phone: '', shippingMethod: 'standard',
  });

  const updateField = (field: keyof ShippingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'shippingMethod') onShippingMethodChange(value as 'standard' | 'express');
  };

  const inputClass = "w-full px-4 py-3 border border-neutral-200 text-sm outline-none focus:border-neutral-900 transition-colors bg-white";
  const labelClass = "block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-2";

  // Giá hiển thị ở đây phải khớp đúng với logic thật ở backend
  // (jewelry-api-express/src/lib/pricing.ts) — Express miễn phí khi đơn hàng
  // đạt ngưỡng miễn phí vận chuyển, không còn hardcode 30.000₫ cố định như trước.
  const shippingMethods = [
    { id: 'standard' as const, label: t('standardShipping'), time: t('days57'), price: calculateShipping('standard', subtotal) },
    { id: 'express' as const, label: t('expressShipping'), time: t('days23'), price: calculateShipping('express', subtotal) },
  ];

  return (
    <div className="space-y-8">
      {step === 'information' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className={labelClass}>{t('contactInfo')}</label>
            <input type="email" placeholder={t('email')} value={formData.email} onChange={e => updateField('email', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t('shippingAddress')}</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder={t('firstName')} value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} className={inputClass} />
              <input type="text" placeholder={t('lastName')} value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} className={inputClass} />
            </div>
            <input type="text" placeholder={t('address')} value={formData.address} onChange={e => updateField('address', e.target.value)} className={`${inputClass} mt-4`} />
            <input type="text" placeholder={t('apartment')} value={formData.apartment} onChange={e => updateField('apartment', e.target.value)} className={`${inputClass} mt-4`} />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <input type="text" placeholder={t('city')} value={formData.city} onChange={e => updateField('city', e.target.value)} className={inputClass} />
              <select value={formData.country} onChange={e => updateField('country', e.target.value)} className={inputClass}>
                <option value="US">{t('countries.us')}</option>
                <option value="CA">{t('countries.ca')}</option>
                <option value="GB">{t('countries.gb')}</option>
                <option value="AU">{t('countries.au')}</option>
                <option value="VN">{t('countries.vn')}</option>
              </select>
              <input type="text" placeholder={t('postalCode')} value={formData.postalCode} onChange={e => updateField('postalCode', e.target.value)} className={inputClass} />
            </div>
            <input type="tel" placeholder={t('phonePlaceholder')} value={formData.phone} onChange={e => updateField('phone', e.target.value)} className={`${inputClass} mt-4`} />
          </div>
          <button onClick={() => onStepChange('shipping')} className="w-full py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors">
            {t('continueToShipping')}
          </button>
        </div>
      )}

      {step === 'shipping' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="p-4 bg-white border border-neutral-200">
            <div className="flex justify-between text-sm mb-1"><span className="text-neutral-500">{t('contact')}</span><span>{formData.email}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-500">{t('shipTo')}</span><span>{formData.address}, {formData.city}</span></div>
            <button onClick={() => onStepChange('information')} className="text-xs text-neutral-500 underline mt-2">{t('change')}</button>
          </div>
          <div>
            <label className={labelClass}>{t('shippingMethod')}</label>
            <div className="space-y-3">
              {shippingMethods.map(method => (
                <label key={method.id} className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${formData.shippingMethod === method.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" checked={formData.shippingMethod === method.id} onChange={() => updateField('shippingMethod', method.id)} className="accent-neutral-900" />
                    <div><p className="text-sm">{method.label}</p><p className="text-xs text-neutral-500">{method.time}</p></div>
                  </div>
                  <span className="text-sm">{method.price === 0 ? t('free') : formatVND(method.price)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onStepChange('information')} className="px-6 py-4 text-xs tracking-[0.2em] uppercase border border-neutral-200 hover:border-neutral-900 transition-colors">{t('back')}</button>
            <button onClick={() => onContinueToPayment(formData)} disabled={isProcessing}
              className="flex-1 py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
              {isProcessing ? t('placingOrder') : t('continueToPayment')}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
