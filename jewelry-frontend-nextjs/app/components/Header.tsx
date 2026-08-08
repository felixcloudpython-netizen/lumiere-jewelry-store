"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store/cartStore";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import SearchOverlay from "./SearchOverlay";
import MiniCart from "./MiniCart";
import MegaMenu from "./MegaMenu";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { toggleCart, totalItems } = useCartStore();
  const cartCount = totalItems();

  const navItems = [
    { label: t("jewelry"), href: `/${locale}/jewelry`, children: [
      { label: t("menu.rings"), href: `/${locale}/jewelry/rings`, description: t("menu.ringsDesc") },
      { label: t("menu.necklaces"), href: `/${locale}/jewelry/necklaces`, description: t("menu.necklacesDesc") },
      { label: t("menu.earrings"), href: `/${locale}/jewelry/earrings`, description: t("menu.earringsDesc") },
      { label: t("menu.bracelets"), href: `/${locale}/jewelry/bracelets`, description: t("menu.braceletsDesc") },
    ]},
    { label: t("engagement"), href: `/${locale}/engagement`, children: [
      { label: t("menu.engagementRings"), href: `/${locale}/engagement/rings`, description: t("menu.engagementRingsDesc") },
      { label: t("menu.weddingBands"), href: `/${locale}/engagement/bands`, description: t("menu.weddingBandsDesc") },
      { label: t("menu.diamondGuide"), href: `/${locale}/engagement/guide`, description: t("menu.diamondGuideDesc") },
    ]},
    { label: t("collections"), href: `/${locale}/collections`, children: [
      { label: t("menu.aura"), href: `/${locale}/collections/aura`, description: t("menu.auraDesc") },
      { label: t("menu.eternity"), href: `/${locale}/collections/eternity`, description: t("menu.eternityDesc") },
      { label: t("menu.luna"), href: `/${locale}/collections/luna`, description: t("menu.lunaDesc") },
      { label: t("menu.stellar"), href: `/${locale}/collections/stellar`, description: t("menu.stellarDesc") },
    ]},
    { label: t("gifts"), href: `/${locale}/gifts` },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveMegaMenu(null);
  }, [pathname]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"}`}>
        <div className="bg-neutral-900 text-white text-[11px] tracking-widest text-center py-2 uppercase">
          {t("shippingBanner")}
        </div>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href={`/${locale}`} className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <h1 className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase">Lumière</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative"
                  onMouseEnter={() => item.children && setActiveMegaMenu(item.label)}
                  onMouseLeave={() => setActiveMegaMenu(null)}>
                  <Link href={item.href} className={`text-[11px] tracking-[0.15em] uppercase py-5 border-b-2 transition-colors ${pathname.startsWith(item.href) ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-600 hover:text-neutral-900"}`}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors" aria-label={t("search")}>
                <Search size={18} strokeWidth={1.5} />
              </button>
              <Link href={`/${locale}/account`} className="hidden md:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <User size={18} strokeWidth={1.5} />
              </Link>
              <button onClick={toggleCart} className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors" aria-label={t("cart")}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-neutral-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
        <MegaMenu isOpen={!!activeMegaMenu} items={navItems.find(i => i.label === activeMegaMenu)?.children || []} onClose={() => setActiveMegaMenu(null)} />
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-32 px-6 md:hidden">
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link href={item.href} className="text-lg tracking-widest uppercase" onClick={() => setIsMobileMenuOpen(false)}>{item.label}</Link>
                {item.children && (
                  <div className="ml-4 mt-3 flex flex-col gap-3">
                    {item.children.map(child => (
                      <Link key={child.label} href={child.href} className="text-sm text-neutral-500" onClick={() => setIsMobileMenuOpen(false)}>{child.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MiniCart />
    </>
  );
}
