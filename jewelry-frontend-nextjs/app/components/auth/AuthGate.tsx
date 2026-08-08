'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { ApiError } from '@/lib/api';

interface AuthGateProps {
  // Trước đây nhận "subtitle" là chuỗi hardcode sẵn từ nơi gọi (checkout truyền
  // tiếng Việt cứng, admin cũng truyền tiếng Việt cứng) — nên dù đổi ngôn ngữ,
  // dòng subtitle này không đổi theo. Giờ chỉ truyền NGỮ CẢNH, còn chữ thật lấy
  // từ messages/{locale}.json.
  context?: 'checkout' | 'admin' | 'chat';
  defaultMode?: 'login' | 'register';
  hideRegister?: boolean;
}

export default function AuthGate({
  context = 'checkout',
  defaultMode = 'login',
  hideRegister = false,
}: AuthGateProps) {
  const t = useTranslations('auth');
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const inputClass = 'w-full px-4 py-3 border border-neutral-200 text-sm outline-none focus:border-neutral-900 transition-colors bg-white';
  const labelClass = 'block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-2';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, firstName, lastName });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 border border-neutral-200 space-y-6">
      <div>
        <h2 className="text-lg font-light mb-1">
          {mode === 'login' ? t('checkoutTitle') : t('createAccount')}
        </h2>
        <p className="text-xs text-neutral-500">
          {context === 'admin' ? t('adminSubtitle') : context === 'chat' ? t('chatSubtitle') : t('checkoutSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && !hideRegister && (
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder={t('firstName')} value={firstName}
              onChange={e => setFirstName(e.target.value)} className={inputClass} />
            <input type="text" placeholder={t('lastName')} value={lastName}
              onChange={e => setLastName(e.target.value)} className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass}>{t('emailLabel')}</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t('passwordLabel')}</label>
          <input type="password" required minLength={8} value={password}
            onChange={e => setPassword(e.target.value)} className={inputClass} />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
          {isSubmitting ? t('pleaseWait') : mode === 'login' ? t('signIn') : t('createAccount')}
        </button>
      </form>

      {!hideRegister && (
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="text-xs text-neutral-500 underline underline-offset-4"
        >
          {mode === 'login' ? t('noAccount') : t('haveAccount')}
        </button>
      )}
    </div>
  );
}
