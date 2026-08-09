"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatVND } from "@/lib/currency";
import { useAuthStore } from "@/lib/store/authStore";

interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
}

interface OrderListItem {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { firstName?: string; lastName?: string; email: string } | null;
  email: string;
}

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  REFUNDED: "bg-neutral-200 text-neutral-700",
};

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    Promise.all([
      apiFetch<{ overview: DashboardOverview }>("/api/analytics/dashboard", { token }),
      apiFetch<{ data: OrderListItem[] }>("/api/orders?limit=5", { token }),
    ])
      .then(([analytics, orders]) => {
        setOverview(analytics.overview);
        setRecentOrders(orders.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!overview) return null;

  const stats = [
    { label: "Total Revenue", value: formatVND(overview.totalRevenue), change: overview.revenueChange, up: overview.revenueChange >= 0, icon: DollarSign },
    { label: "Total Orders", value: overview.totalOrders.toLocaleString(), change: overview.ordersChange, up: overview.ordersChange >= 0, icon: ShoppingCart },
    { label: "Products", value: overview.totalProducts.toLocaleString(), change: null, up: true, icon: Package },
    { label: "Customers", value: overview.totalCustomers.toLocaleString(), change: null, up: true, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                {stat.change !== null && (
                  <span className={`text-xs flex items-center gap-1 ${stat.up ? "text-green-600" : "text-red-600"}`}>
                    {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stat.change > 0 ? "+" : ""}{stat.change}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-medium">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wider uppercase">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-neutral-500 hover:text-neutral-900 underline">View All</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Order ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Total</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-6 py-4 font-medium">{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4">{order.user ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() || order.user.email : order.email}</td>
                <td className="px-6 py-4">{formatVND(order.total)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded ${statusColors[order.status] ?? 'bg-neutral-100 text-neutral-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
