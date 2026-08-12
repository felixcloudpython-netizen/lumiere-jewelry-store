"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, MessageSquare, LogOut, Tags } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Chat", href: "/admin/chat", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900 text-white flex flex-col">
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-lg font-light tracking-[0.2em] uppercase">Lumière Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white ring-1 ring-white/25 shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5 hover:ring-1 hover:ring-white/10"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-800">
        <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:text-white w-full">
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
