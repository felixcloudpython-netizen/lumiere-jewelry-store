import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import StorefrontChrome from '../components/StorefrontChrome';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
      <body className={inter.variable}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <StorefrontChrome>{children}</StorefrontChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
