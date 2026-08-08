'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface SizeGuideProps {
  onClose: () => void;
}

export default function SizeGuide({ onClose }: SizeGuideProps) {
  const t = useTranslations('product');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded"><X size={18} /></button>
        <h2 className="text-lg font-light tracking-wide mb-2">{t('sizeGuideTitle')}</h2>
        <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
          {t('sizeGuideDesc')}
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="text-left py-3 font-medium tracking-wider uppercase">{t('sizeUS')}</th>
              <th className="text-left py-3 font-medium tracking-wider uppercase">{t('circumference')}</th>
              <th className="text-left py-3 font-medium tracking-wider uppercase">{t('diameter')}</th>
            </tr>
          </thead>
          <tbody>
            {[[5, 49.3, 15.7], [5.5, 50.6, 16.1], [6, 51.8, 16.5], [6.5, 53.1, 16.9], [7, 54.4, 17.3], [7.5, 55.7, 17.7], [8, 57.0, 18.1], [8.5, 58.3, 18.5]].map(([size, circ, diam]) => (
              <tr key={size} className="border-b border-neutral-100">
                <td className="py-3">{size}</td>
                <td className="py-3">{circ}</td>
                <td className="py-3">{diam}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 p-4 bg-neutral-50">
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            <strong>{t('sizeTipLabel')}</strong> {t('sizeTipText')}
          </p>
        </div>
      </div>
    </div>
  );
}
