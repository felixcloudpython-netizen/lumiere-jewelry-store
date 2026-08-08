"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface CustomersResponse {
  data: Customer[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function AdminCustomers() {
  const token = useAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<CustomersResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce tìm kiếm 400ms để không gọi API dồn dập mỗi lần gõ phím.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadCustomers = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    apiFetch<CustomersResponse>(`/api/users?${params}`, { token })
      .then((res) => { setCustomers(res.data); setMeta(res.meta); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load customers"))
      .finally(() => setLoading(false));
  }, [token, page, debouncedSearch]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Customers</h1>
        <p className="text-sm text-neutral-500 mt-1">View and manage customer accounts</p>
      </div>

      <div className="bg-white border border-neutral-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Contact</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Orders</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Total Spent</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-400">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-neutral-400">No customers found</td></tr>
            ) : customers.map((c) => (
              <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium">
                      {(c.firstName?.[0] ?? c.email[0]).toUpperCase()}
                    </div>
                    <span className="font-medium">{`${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-xs text-neutral-600"><Mail size={12} /> {c.email}</p>
                    {c.phone && <p className="flex items-center gap-1.5 text-xs text-neutral-500"><Phone size={12} /> {c.phone}</p>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded ${
                    c.role === 'ADMIN' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-6 py-4">{c.orderCount}</td>
                <td className="px-6 py-4 font-medium">${(c.totalSpent / 100).toLocaleString()}</td>
                <td className="px-6 py-4 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} customers)
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
