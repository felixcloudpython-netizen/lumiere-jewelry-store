"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { formatVND } from "@/lib/currency";
import { useAuthStore } from "@/lib/store/authStore";

interface ProductListItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  inventory: number;
  inStock: boolean;
  category: { name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsResponse {
  data: ProductListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export default function AdminProducts() {
  const token = useAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<ProductsResponse["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Danh mục dùng cho bộ lọc lấy từ API thật (/api/products/categories) — trước
  // đây là danh sách cứng không khớp gì với category thật trong DB.
  useEffect(() => {
    apiFetch<Category[]>("/api/products/categories").catch(() => []).then((cats) => setCategories(cats ?? []));
  }, []);

  const loadProducts = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    apiFetch<ProductsResponse>(`/api/products?${params}`, { token })
      .then((res) => { setProducts(res.data); setMeta(res.meta); })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load products"))
      .finally(() => setLoading(false));
  }, [token, page, search, categoryFilter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await apiFetch(`/api/products/${id}`, { method: "DELETE", token });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="bg-white border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Product</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">SKU</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Price</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Inventory</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 tracking-wider uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-400">No products found</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center text-xs">✦</div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-500">{product.sku}</td>
                <td className="px-6 py-4">{formatVND(product.price)}</td>
                <td className="px-6 py-4">{product.inventory}</td>
                <td className="px-6 py-4 text-neutral-500">{product.category?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] tracking-wider uppercase rounded ${
                    product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {product.inStock ? "Active" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-1.5 hover:bg-neutral-100 rounded transition-colors inline-flex"
                      title="Edit product"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={deletingId === product.id}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors disabled:opacity-50"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Showing page {meta.page} of {meta.totalPages || 1} ({meta.total} products)
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
