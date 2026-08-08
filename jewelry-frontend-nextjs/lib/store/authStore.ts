'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiFetch } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

// ChatWidget.tsx và admin/chat/page.tsx đọc token trực tiếp qua
// `localStorage.getItem("token")` (quy ước có sẵn từ trước, đánh dấu
// "TODO: Get actual token from auth context"). Store này là nơi "auth context"
// đó, và tiếp tục ghi mirror ra đúng key "token" để 2 nơi kia chạy được luôn
// mà không cần sửa thêm gì.
function syncLegacyTokenMirror(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,

      login: async (email, password) => {
        const data = await apiFetch<{ user: AuthUser; token: string }>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        syncLegacyTokenMirror(data.token);
        set({ user: data.user, token: data.token });
      },

      register: async (payload) => {
        const data = await apiFetch<{ user: AuthUser; token: string }>('/api/auth/register', {
          method: 'POST',
          body: payload,
        });
        syncLegacyTokenMirror(data.token);
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        syncLegacyTokenMirror(null);
        set({ user: null, token: null });
      },

      updateUser: (partial) => {
        set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user }));
      },
    }),
    {
      name: 'jewelry-auth',
      onRehydrateStorage: () => (state) => {
        // Đồng bộ lại mirror "token" mỗi khi store được khôi phục từ localStorage
        // lúc tải trang, đảm bảo ChatWidget/admin chat luôn thấy token đúng.
        syncLegacyTokenMirror(state?.token ?? null);
        if (state) state.isHydrated = true;
      },
    }
  )
);
