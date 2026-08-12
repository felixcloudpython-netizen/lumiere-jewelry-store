"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store/cartStore";
import { apiFetch } from "@/lib/api";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import SearchOverlay from "./SearchOverlay";
import MiniCart from "./MiniCart";
import MegaMenu from "./MegaMenu";
// Tạm ẩn LanguageSwitcher (xem comment trong JSX bên dưới) — bỏ comment dòng
// này cùng lúc với dòng <LanguageSwitcher /> khi cần bật lại.
// import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  useEffect(() => {
    // Nhớ trạng thái đã đóng banner qua các lần ghé thăm sau — không hiện lại
    // phiền khách mỗi lần tải trang nếu họ đã bấm đóng rồi.
    if (localStorage.getItem("promoBannerDismissed") === "true") {
      setIsBannerVisible(false);
    }
  }, []);

  const dismissBanner = () => {
    setIsBannerVisible(false);
    localStorage.setItem("promoBannerDismissed", "true");
  };

  // Mục "Trang sức" và "Bộ sưu tập" trong mega menu giờ lấy THẬT từ Category/
  // Collection quản lý qua Admin → Categories (trước đây hardcode cứng 4 mục cố
  // định, không khớp gì với dữ liệu admin thực sự tạo/sửa/xoá). "Cầu hôn" và
  // "Quà tặng" không có model riêng tương ứng (đã thống nhất dùng filter
  // category=rings / bestseller ở trang danh sách), nên vẫn giữ tĩnh như cũ.
  interface MenuCategory { name: string; slug: string; description: string | null; image: string | null }
  interface MenuCollection { name: string; slug: string; description: string | null; heroImage: string | null }
  const [jewelryItems, setJewelryItems] = useState<MenuCategory[]>([]);
  const [collectionItems, setCollectionItems] = useState<MenuCollection[]>([]);

  useEffect(() => {
    apiFetch<MenuCategory[]>("/api/products/categories").then(setJewelryItems).catch(() => setJewelryItems([]));
    apiFetch<MenuCollection[]>("/api/products/collections").then(setCollectionItems).catch(() => setCollectionItems([]));
  }, []);

  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const { toggleCart, totalItems } = useCartStore();
  const cartCount = totalItems();

  const navItems = [
    { label: t("jewelry"), href: `/${locale}/jewelry`, children: jewelryItems.map((cat) => ({
      label: cat.name, href: `/${locale}/jewelry/${cat.slug}`, description: cat.description, image: cat.image,
    })) },
    { label: t("engagement"), href: `/${locale}/engagement`, children: [
      { label: t("menu.engagementRings"), href: `/${locale}/engagement/rings`, description: t("menu.engagementRingsDesc") },
      { label: t("menu.weddingBands"), href: `/${locale}/engagement/bands`, description: t("menu.weddingBandsDesc") },
      { label: t("menu.diamondGuide"), href: `/${locale}/engagement/guide`, description: t("menu.diamondGuideDesc") },
    ]},
    { label: t("collections"), href: `/${locale}/collections`, children: collectionItems.map((col) => ({
      label: col.name, href: `/${locale}/collections/${col.slug}`, description: col.description, image: col.heroImage,
    })) },
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
        {isBannerVisible && (
          <div className="relative bg-neutral-900 text-white text-[11px] tracking-wide text-center py-2 px-10">
            {t("promoBanner")}
            <button onClick={dismissBanner} aria-label="Đóng thông báo"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center flex-1 md:flex-none">
              <button className="md:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
            <Link href={`/${locale}`} className="flex-shrink-0">
              <h1 className="text-lg md:text-2xl font-light tracking-[0.15em] md:tracking-[0.3em] uppercase whitespace-nowrap">Lumière</h1>
            </Link>
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative"
                  onMouseEnter={() => item.children && setActiveMegaMenu(item.label)}>
                  <Link href={item.href} className={`text-[11px] tracking-[0.15em] uppercase py-5 border-b-2 transition-colors ${pathname.startsWith(item.href) ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-600 hover:text-neutral-900"}`}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="flex items-center justify-end flex-1 md:flex-none gap-0.5 md:gap-3">
              {/* Tạm ẩn theo yêu cầu (gây chồng lấn với logo trên mobile) — bỏ
                  comment dòng dưới để bật lại khi cần. */}
              {/* <LanguageSwitcher /> */}
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
        {/* Bọc chung cả thanh nav lẫn MegaMenu trong 1 vùng onMouseLeave duy
            nhất — di chuột từ chữ menu xuống panel bên dưới giờ không còn
            "thoát" khỏi vùng hover giữa chừng nữa. */}
        <div onMouseLeave={() => setActiveMegaMenu(null)}>
          <MegaMenu isOpen={!!activeMegaMenu} items={navItems.find(i => i.label === activeMegaMenu)?.children || []} onClose={() => setActiveMegaMenu(null)} />
        </div>
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
