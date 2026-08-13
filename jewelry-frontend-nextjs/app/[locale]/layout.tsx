import { Inter, Libre_Baskerville } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import StorefrontChrome from '../components/StorefrontChrome';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Chỉ dùng riêng cho tên category trong mega menu (mục "Trang sức") và tên mục
// trong "Cầu hôn" — theo đúng yêu cầu, KHÔNG áp dụng cho toàn site. Xem class
// `font-serif-display` trong tailwind.config.ts.
const libreBaskerville = Libre_Baskerville({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-libre-baskerville' });

export const metadata = {
  title: 'Lumière | Fine Jewelry',
  description: 'Luxury jewelry crafted with precision and timeless beauty',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${libreBaskerville.variable}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <StorefrontChrome>{children}</StorefrontChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
