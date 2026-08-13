'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatVND } from '@/lib/currency';

interface MegaMenuItem {
  label: string;
  href: string;
  description?: string | null;
  image?: string | null;
  price?: number; // chỉ dùng cho cột "Nổi bật" (sản phẩm thật)
}

interface MegaMenuColumn {
  title?: string;
  items: MegaMenuItem[];
  // 'products' hiện dạng thẻ ảnh vuông + giá (cột "Nổi bật"). 'links' hiện
  // dạng danh mục thường (ảnh nếu có, không thì tên + mô tả) — giữ đúng hành
  // vi cũ.
  variant?: 'links' | 'products';
}

interface MegaMenuProps {
  isOpen: boolean;
  columns: MegaMenuColumn[];
  onClose: () => void;
}

/**
 * Bố cục nhiều cột song song trong cùng 1 mega menu (kiểu "Categories |
 * Collections | Featured" của Tiffany) — trước đây chỉ có 1 cột phẳng duy
 * nhất. Số cột co giãn theo dữ liệu thật hiện có, không cố định cứng.
 */
export default function MegaMenu({ isOpen, columns, onClose }: MegaMenuProps) {
  const visibleColumns = columns.filter((c) => c.items.length > 0);
  if (!isOpen || visibleColumns.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="flex gap-12">
          {visibleColumns.map((col, idx) => (
            <div key={col.title ?? idx} className={col.variant === 'products' ? 'flex-1' : 'flex-[2]'}>
              {col.title && (
                <p className="text-[13px] tracking-[0.15em] uppercase text-neutral-400 mb-4">{col.title}</p>
              )}
              <div className={col.variant === 'products' ? 'grid grid-cols-3 gap-4' : 'flex flex-wrap gap-x-8 gap-y-4'}>
                {col.items.map((item) => (
                  <Link key={item.label} href={item.href} className={`group block ${col.variant !== 'products' ? 'flex items-center gap-3' : ''}`} onClick={onClose}>
                    {col.variant === 'products' ? (
                      <>
                        <div className="relative aspect-square bg-neutral-50 overflow-hidden mb-2">
                          {item.image ? (
                            <Image src={item.image} alt={item.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-lg">✦</div>
                          )}
                        </div>
                        <p className="text-xs text-neutral-700 truncate group-hover:underline underline-offset-4">{item.label}</p>
                        {typeof item.price === 'number' && <p className="text-xs text-neutral-400">{formatVND(item.price)}</p>}
                      </>
                    ) : (
                      <>
                        {item.image && (
                          <div className="relative w-9 h-9 flex-shrink-0 bg-neutral-50 overflow-hidden">
                            <Image src={item.image} alt={item.label} fill className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-[13px] truncate group-hover:underline underline-offset-4">{item.label}</h3>
                          {item.description && <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5 line-clamp-2">{item.description}</p>}
                        </div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
