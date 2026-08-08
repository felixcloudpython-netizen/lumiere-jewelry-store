"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm, { ProductFormInitialData } from "../../ProductForm";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface ProductDetail extends ProductFormInitialData {
  id: string;
  category: { id: string };
  collection: { id: string } | null;
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const token = useAuthStore((s) => s.token);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !productId) return;
    apiFetch<ProductDetail>(`/api/products/admin/${productId}`, { token })
      .then(setProduct)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load product"))
      .finally(() => setLoading(false));
  }, [token, productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-900">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <p className="text-sm text-red-600">{error || "Product not found"}</p>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      initialData={{
        ...product,
        categoryId: product.category.id,
        collectionId: product.collection?.id ?? null,
      }}
    />
  );
}
