"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
  };
  topProducts: { id: string; name: string; image: string; quantity: number; revenue: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
  salesByCategory: { category: string; revenue: number; quantity: number }[];
}

const COLORS = ["#1a1a1a", "#4a4a4a", "#7a7a7a", "#aaaaaa", "#dadada"];

export default function AnalyticsPage() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch<DashboardData>("/api/analytics/dashboard", { token })
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load analytics"))
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

  if (!data) return null;

  const { overview, topProducts, salesByDay, salesByCategory } = data;

  const stats = [
    { label: "Total Revenue", value: `$${(overview.totalRevenue / 100).toLocaleString()}`, change: overview.revenueChange, up: overview.revenueChange > 0, icon: DollarSign },
    { label: "Total Orders", value: overview.totalOrders.toLocaleString(), change: overview.ordersChange, up: overview.ordersChange > 0, icon: ShoppingCart },
    { label: "Customers", value: overview.totalCustomers.toLocaleString(), change: 0, up: true, icon: Users },
    { label: "Products", value: overview.totalProducts.toString(), change: 0, up: true, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">Detailed insights into your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                {stat.change !== 0 && (
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

      {/* Revenue Chart */}
      <div className="bg-white border border-neutral-200 p-6">
        <h2 className="text-sm font-medium tracking-wider uppercase mb-6">Revenue (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesByDay}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 12 }}
              formatter={(value: number) => [`$${(value / 100).toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="text-sm font-medium tracking-wider uppercase mb-6">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="revenue"
                nameKey="category"
              >
                {salesByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${(value / 100).toLocaleString()}`} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="text-sm font-medium tracking-wider uppercase mb-6">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 12 }} />
              <Bar dataKey="orders" fill="#1a1a1a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-medium tracking-wider uppercase">Top Selling Products</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Product</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Units Sold</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, idx) => (
              <tr key={product.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-neutral-900 text-white text-[10px] flex items-center justify-center rounded-full">{idx + 1}</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">{product.quantity}</td>
                <td className="px-6 py-4 text-right font-medium">${(product.revenue / 100).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
