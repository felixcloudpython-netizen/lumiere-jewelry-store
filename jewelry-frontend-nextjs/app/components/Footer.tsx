'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  const columns = [
    { title: t('clientCare'), items: [t('links.contactUs'), t('links.shippingReturns'), t('links.sizeGuide'), t('links.careRepair')] },
    { title: t('company'), items: [t('links.aboutUs'), t('links.sustainability'), t('links.careers'), t('links.press')] },
    { title: t('services'), items: [t('links.bookAppointment'), t('links.giftCards'), t('links.personalization'), t('links.storeLocator')] },
    { title: t('legal'), items: [t('links.privacyPolicy'), t('links.termsOfUse'), t('links.accessibility'), t('links.cookiePolicy')] },
  ];

  return (
    <footer className="border-t border-neutral-200 py-12 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-medium tracking-wider uppercase mb-4">{col.title}</h4>
            <ul className="space-y-2 text-neutral-500">
              {col.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-neutral-400 mt-12 tracking-wider">{t('copyright')}</p>
    </footer>
  );
}
