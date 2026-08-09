"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { locales, defaultLocale } from "@/i18n";

const languages = [
  { code: "en", label: "EN" },
  { code: "vi", label: "VI" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // middleware.ts dùng `localePrefix: 'as-needed'` — locale mặc định (en) KHÔNG
    // có tiền tố trong URL (vd. "/jewelry"), chỉ locale không-mặc-định mới có
    // (vd. "/vi/jewelry"). Trước đây `pathname.replace(`/${locale}`, ...)` giả định
    // MỌI locale đều có tiền tố, nên khi đang ở "en" (không tiền tố), pathname
    // không hề chứa "/en" để thay — .replace() không tìm thấy gì, trả về nguyên
    // pathname cũ, và nút bấm không có tác dụng gì cả.
    const localePattern = new RegExp(`^/(${locales.join('|')})(?=/|$)`);
    const pathWithoutLocale = pathname.replace(localePattern, '') || '/';
    const newPath = newLocale === defaultLocale ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 p-2 hover:bg-neutral-100 rounded-full transition-colors text-[11px] tracking-wider uppercase">
        <Globe size={14} strokeWidth={1.5} />
        {locale.toUpperCase()}
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`block w-full text-left px-4 py-2.5 text-xs hover:bg-neutral-50 transition-colors ${
              locale === lang.code ? "font-medium bg-neutral-50" : ""
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
