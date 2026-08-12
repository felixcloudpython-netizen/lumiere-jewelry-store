'use client';

import Link from 'next/link';
import Image from 'next/image';

interface MegaMenuProps {
  isOpen: boolean;
  items: { label: string; href: string; description?: string | null; image?: string | null }[];
  onClose: () => void;
}

export default function MegaMenu({ isOpen, items, onClose }: MegaMenuProps) {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-4 gap-8">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="group block" onClick={onClose}>
              {item.image ? (
                <>
                  <div className="relative aspect-square bg-neutral-50 overflow-hidden mb-3">
                    <Image src={item.image} alt={item.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="text-sm font-medium tracking-wider uppercase group-hover:underline underline-offset-4">{item.label}</h3>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium tracking-wider uppercase mb-2 group-hover:underline underline-offset-4">{item.label}</h3>
                  {item.description && <p className="text-xs text-neutral-500 leading-relaxed">{item.description}</p>}
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
