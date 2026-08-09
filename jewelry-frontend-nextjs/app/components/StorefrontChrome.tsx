'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ChatWidget from './chat/ChatWidget';

/**
 * Trước đây layout.tsx áp Header/Footer/ChatWidget của cửa hàng cho MỌI trang,
 * kể cả /admin — khu quản trị có sidebar/layout hoàn toàn riêng (AdminGuard +
 * AdminSidebar), không nên có banner shipping, menu điều hướng khách hàng, hay
 * nút chat nổi của cửa hàng. Trước đây Header (fixed ở đầu trang) đè lên chữ
 * "Dashboard" trong sidebar admin, gây rối bố cục.
 *
 * usePathname() trả về đường dẫn có/không kèm tiền tố locale tuỳ theo
 * `localePrefix: 'as-needed'` (vd "/admin/products" hoặc "/vi/admin/products"),
 * nên dùng .includes('/admin') để khớp cả 2 trường hợp thay vì so khớp cứng.
 */
export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <ChatWidget />
    </>
  );
}
