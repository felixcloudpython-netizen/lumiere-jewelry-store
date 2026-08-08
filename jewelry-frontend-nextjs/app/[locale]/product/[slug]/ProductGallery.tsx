'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const t = useTranslations('product');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const next = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-neutral-50 overflow-hidden group">
        {images[activeIndex] ? (
          <Image src={images[activeIndex]} alt={`${name} - View ${activeIndex + 1}`} fill
            className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)} priority={activeIndex === 0} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
            <span className="text-neutral-300 text-6xl font-light">✦</span>
          </div>
        )}
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1.5 text-[10px] tracking-widest uppercase flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={12} /> {t('clickToZoom')}
          </div>
        )}
        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <ChevronLeft size={18} />
        </button>
        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button key={idx} onClick={() => { setActiveIndex(idx); setIsZoomed(false); }}
            className={`relative w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${idx === activeIndex ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'}`}>
            <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
