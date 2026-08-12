'use client';

import { useTranslations } from 'next-intl';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

// href="#" tạm thời — CẦN thay bằng link mạng xã hội thật của cửa hàng khi có
// (không tự bịa link giả trỏ tới đâu đó không tồn tại).
const SOCIAL_LINKS = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  const t = useTranslations('footer');

  const columns = [
    { title: t('clientCare'), items: [t('links.contactUs'), t('links.shippingReturns'), t('links.sizeGuide'), t('links.careRepair')] },
    { title: t('company'), items: [t('links.aboutUs'), t('links.sustainability'), t('links.careers'), t('links.press')] },
    { title: t('services'), items: [t('links.bookAppointment'), t('links.giftCards'), t('links.personalization'), t('links.storeLocator')] },
    { title: t('legal'), items: [t('links.privacyPolicy'), t('links.termsOfUse'), t('links.accessibility'), t('links.cookiePolicy')] },
  ];

  return (
    <footer className="border-t border-neutral-200 pt-12 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs pb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-medium tracking-wider uppercase mb-4">{col.title}</h4>
              <ul className="space-y-2 text-neutral-500">
                {col.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-neutral-400 tracking-wider order-2 md:order-1">{t('copyright')}</p>
          <span className="text-lg tracking-[0.2em] text-neutral-300 order-1 md:order-2">✦</span>
          <div className="flex items-center gap-4 order-3">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                <Icon size={16} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
