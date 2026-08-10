'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { ApiError } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Bố cục 2 cột riêng cho trang /account — khác với AuthGate.tsx (bản gọn,
 * dùng chung cho checkout/admin/khung chat nhỏ, những nơi không đủ chỗ cho
 * bố cục lớn kiểu này). Cột trái là khối trang trí thương hiệu (gradient +
 * biểu tượng ✦) — CỐ Ý không dùng ảnh thật lấy từ tìm kiếm web vì không kiểm
 * chứng được bản quyền/giấy phép sử dụng thương mại. Có thể thay bằng ảnh thật
 * của cửa hàng sau này (upload qua Cloudinary) nếu muốn.
 */
export default function AccountAuth() {
  const t = useTranslations('accountAuth');
  const { login, register } = useAuthStore();
  const [tab, setTab] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const underlineInput = "w-full pb-2 pt-4 text-sm bg-transparent border-b border-neutral-300 outline-none focus:border-neutral-900 transition-colors peer";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
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
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] bg-white border border-neutral-200">
      {/* Cột trái — khối trang trí thương hiệu, ẩn trên mobile */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 p-12">
        <span className="text-6xl font-light text-neutral-300 mb-6">✦</span>
        <h2 className="text-2xl font-light tracking-[0.3em] uppercase text-neutral-400">Lumière</h2>
      </div>

      {/* Cột phải — form */}
      <div className="p-8 md:p-12">
        <div className="flex gap-8 border-b border-neutral-200 mb-8">
          <button onClick={() => { setTab('signin'); setError(''); }}
            className={`pb-3 text-sm transition-colors border-b-2 -mb-px ${tab === 'signin' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}>
            {t('signIn')}
          </button>
          <button onClick={() => { setTab('create'); setError(''); }}
            className={`pb-3 text-sm transition-colors border-b-2 -mb-px ${tab === 'create' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400'}`}>
            {t('createAccount')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
          {tab === 'create' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder=" " className={underlineInput} />
                <label className="absolute left-0 top-4 text-sm text-neutral-400 transition-all pointer-events-none peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
                  {t('firstName')}*
                </label>
              </div>
              <div className="relative">
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder=" " className={underlineInput} />
                <label className="absolute left-0 top-4 text-sm text-neutral-400 transition-all pointer-events-none peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
                  {t('lastName')}*
                </label>
              </div>
            </div>
          )}

          <div className="relative">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder=" " className={underlineInput} />
            <label className="absolute left-0 top-4 text-sm text-neutral-400 transition-all pointer-events-none peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
              {t('emailLabel')}*
            </label>
          </div>

          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password}
              onChange={e => setPassword(e.target.value)} placeholder=" " className={`${underlineInput} pr-8`} />
            <label className="absolute left-0 top-4 text-sm text-neutral-400 transition-all pointer-events-none peer-focus:top-0 peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[11px]">
              {t('passwordLabel')}*
            </label>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-4 text-neutral-400 hover:text-neutral-900">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={isSubmitting}
            className="w-full py-4 bg-neutral-900 text-white text-xs tracking-[0.2em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
            {isSubmitting ? '...' : tab === 'signin' ? t('signInButton') : t('createAccountButton')}
          </button>

          <p className="text-[11px] text-neutral-400">{t('requiredFields')}</p>
        </form>

        {tab === 'signin' && (
          <div className="max-w-sm mt-12 pt-8 border-t border-neutral-100">
            <h3 className="text-lg font-light mb-4">{t('createAccountHeading')}</h3>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-xs text-neutral-600">
                <span className="mt-1.5 w-1 h-1 bg-neutral-900 flex-shrink-0" />
                {t('benefit1')}
              </li>
              <li className="flex items-start gap-2 text-xs text-neutral-600">
                <span className="mt-1.5 w-1 h-1 bg-neutral-900 flex-shrink-0" />
                {t('benefit2')}
              </li>
            </ul>
            <button onClick={() => { setTab('create'); setError(''); }}
              className="w-full py-4 border border-neutral-900 text-xs tracking-[0.2em] uppercase hover:bg-neutral-900 hover:text-white transition-colors">
              {t('createAccountButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
