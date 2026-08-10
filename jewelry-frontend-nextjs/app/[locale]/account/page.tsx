'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { apiFetch } from '@/lib/api';
import { formatVND } from '@/lib/currency';
import AccountAuth from './AccountAuth';
import { LogOut } from 'lucide-react';

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

interface Profile {
  email: string;
  firstName?: string;
  lastName?: string;
  orders: OrderSummary[];
}

// Trước đây Header.tsx đã có sẵn link tới "/account" nhưng trang này chưa từng
// được xây — bấm vào icon tài khoản luôn ra 404. Trang này lấp đúng chỗ trống
// đó: chưa đăng nhập thì cho đăng nhập/đăng ký ngay tại đây (dùng lại AuthGate
// đã có sẵn), đã đăng nhập thì hiện thông tin cơ bản + lịch sử đơn hàng (dùng
// lại GET /api/users/profile đã có sẵn từ trước, vốn chỉ mới được dùng ở trang
// Settings của admin).
export default function AccountPage() {
  const t = useTranslations('account');
  const router = useRouter();
  const { token, user, logout, isHydrated } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<Profile>('/api/users/profile', { token })
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [token]);

  if (!isHydrated) {
    return (
      <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!token) {
    return (
      <main className="pt-28 pb-20 min-h-screen bg-neutral-50">
        <div className="max-w-4xl mx-auto px-6">
          <AccountAuth />
        </div>
      </main>
    );
  }

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="pt-28 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-light tracking-wide">{t('title')}</h1>
            <p className="text-sm text-neutral-500 mt-1">{user?.firstName} {user?.lastName} — {user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs tracking-wider uppercase text-neutral-500 hover:text-neutral-900">
            <LogOut size={16} /> {t('signOut')}
          </button>
        </div>

        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="text-xs tracking-[0.2em] uppercase font-medium mb-6">{t('orderHistory')}</h2>
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full" />
          ) : !profile?.orders || profile.orders.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('noOrders')}</p>
          ) : (
            <div className="space-y-4">
              {profile.orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-neutral-500">{t('orderPlaced', { date: new Date(order.createdAt).toLocaleDateString() })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatVND(order.total)}</p>
                    <p className="text-xs text-neutral-500 uppercase">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
