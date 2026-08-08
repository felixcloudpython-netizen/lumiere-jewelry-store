"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface OrderListItem {
  id: string;
  email: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: { firstName?: string; lastName?: string; email: string } | null;
  items: { id: string; quantity: number }[];
}

interface OrdersResponse {
  data: OrderListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const statusColors: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  REFUNDED: "bg-neutral-200 text-neutral-700",
};

export default function AdminOrders() {
  const token = useAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [meta, setMeta] = useState<OrdersResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    apiFetch<OrdersResponse>(`/api/orders?${params}`, { token })
      .then((res) => { setOrders(res.data); setMeta(res.meta); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [token, page, statusFilter]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Đổi trạng thái đơn hàng — trước đây không có UI nào gọi tới
  // PATCH /api/orders/:id/status dù backend đã có sẵn endpoint này.
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;

    // Backend chỉ gửi email thông báo giao hàng khi status=SHIPPED VÀ có
    // trackingNumber (xem orders.controller.ts updateOrderStatus). Không hỏi
    // ở đây thì trackingNumber luôn rỗng, email sẽ không bao giờ được gửi.
    let trackingNumber: string | undefined;
    if (newStatus === 'SHIPPED') {
      const input = window.prompt('Enter tracking number (leave blank to skip shipping-notification email):');
      if (input === null) return; // bấm Cancel -> huỷ đổi trạng thái
      trackingNumber = input.trim() || undefined;
    }

    setUpdatingId(orderId);
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        token,
        body: { status: newStatus, trackingNumber },
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Backend chưa hỗ trợ tìm kiếm theo tên khách/mã đơn — lọc trên trang dữ liệu
  // hiện có (giống hành vi bản mock trước đây), lọc status vẫn dùng API thật.
  const filtered = orders.filter((o) => {
    const customerName = o.user ? `${o.user.firstName ?? ''} ${o.user.lastName ?? ''}`.trim() || o.user.email : o.email;
    const q = search.toLowerCase();
    return customerName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search this page (customer, order id)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white"
        >
          <option value="ALL">All Status</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Order ID</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Items</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Total</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Payment</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-400">No orders found</td></tr>
            ) : filtered.map((order) => {
              const customerName = order.user ? `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() || order.user.email : order.email;
              const customerEmail = order.user?.email ?? order.email;
              return (
                <tr key={order.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-xs text-neutral-500">{customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                  <td className="px-6 py-4 font-medium">${(order.total / 100).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded ${
                      order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded border-0 outline-none cursor-pointer disabled:opacity-50 ${statusColors[order.status] ?? 'bg-neutral-100 text-neutral-700'}`}
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} orders)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 border border-neutral-200 hover:border-neutral-900 transition-colors disabled:opacity-40 disabled:hover:border-neutral-200"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="w-8 h-8 bg-neutral-900 text-white text-xs flex items-center justify-center">{meta.page}</span>
            <button
              onClick={() => setPage((p) => (meta.totalPages ? Math.min(meta.totalPages, p + 1) : p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 border border-neutral-200 hover:border-neutral-900 transition-colors disabled:opacity-40 disabled:hover:border-neutral-200"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
