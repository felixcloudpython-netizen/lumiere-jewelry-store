'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import AuthGate from '@/app/components/auth/AuthGate';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Trước đây admin/layout.tsx dùng `function isAdmin() { return true; }` — một mock
 * luôn cho qua, kèm comment "TODO: Check JWT token role". Nghĩa là AI TRUY CẬP
 * /admin CŨNG VÀO ĐƯỢC, không cần đăng nhập hay có quyền admin.
 *
 * Lưu ý: API backend (requireAdmin middleware) đã luôn chặn đúng ở tầng dữ liệu —
 * không có token/role hợp lệ thì mọi request tới /api/... đều bị từ chối, nên
 * không ai lấy được dữ liệu thật qua lỗ hổng này. Nhưng khung giao diện admin
 * (sidebar, layout các trang) trước đây vẫn hiển thị được cho bất kỳ ai, và
 * không có cách nào đăng nhập vào /admin từ giao diện cả. Component này sửa cả
 * hai: chặn hiển thị UI admin nếu chưa đủ quyền, và cho phép đăng nhập ngay tại
 * đây.
 *
 * Token nằm trong localStorage (qua zustand persist), nên việc kiểm tra bắt
 * buộc phải chạy ở client — không có cách nào làm việc này ở Server Component.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
        <div className="w-full max-w-md">
          {/* hideRegister: tài khoản admin phải được tạo qua
              `npm run db:promote-admin -- <email>` (xem prisma/promoteAdmin.ts),
              không cho tự đăng ký thành admin từ giao diện này. */}
          <AuthGate context="admin" defaultMode="login" hideRegister />
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6 text-center">
        <div>
          <h1 className="text-xl font-light mb-2">Access denied</h1>
          <p className="text-sm text-neutral-500 mb-6">Tài khoản này không có quyền truy cập trang quản trị.</p>
          <Link href="/" className="text-xs tracking-widest uppercase underline underline-offset-4">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
