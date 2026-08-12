"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "@/app/components/upload/ImageUploader";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface Category { id: string; name: string; slug: string; }
interface Collection { id: string; name: string; slug: string; }
interface TagGroup { id: string; name: string; slug: string; tags: { id: string; name: string; slug: string }[] }

export interface ProductFormInitialData {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku: string;
  categoryId: string;
  collectionId?: string | null;
  tagIds?: string[];
  metal: string;
  inventory: number;
  inStock: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  stones: string[];
  sizes: number[];
  images: string[];
}

const METALS = ['YELLOW_GOLD', 'WHITE_GOLD', 'ROSE_GOLD', 'SILVER', 'PLATINUM'];

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialData?: ProductFormInitialData;
}

export default function ProductForm({ mode, productId, initialData }: ProductFormProps) {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set(initialData?.tagIds ?? []));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    price: initialData ? String(initialData.price) : "",
    comparePrice: initialData?.comparePrice ? String(initialData.comparePrice) : "",
    sku: initialData?.sku ?? "",
    categoryId: initialData?.categoryId ?? "",
    collectionId: initialData?.collectionId ?? "",
    metal: initialData?.metal ?? "WHITE_GOLD",
    inventory: initialData ? String(initialData.inventory) : "",
    inStock: initialData?.inStock ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    isBestseller: initialData?.isBestseller ?? false,
    stones: initialData?.stones?.join(", ") ?? "",
    sizes: initialData?.sizes?.join(", ") ?? "",
  });

  // Category/Collection lấy từ API thật để có đúng ID (cuid) mà backend cần.
  useEffect(() => {
    apiFetch<Category[]>("/api/products/categories").then((cats) => {
      setCategories(cats);
      if (mode === 'create' && cats.length > 0 && !formData.categoryId) {
        setFormData((f) => ({ ...f, categoryId: cats[0].id }));
      }
    }).catch(() => {});
    apiFetch<Collection[]>("/api/products/collections").then(setCollections).catch(() => {});
    apiFetch<TagGroup[]>("/api/products/tag-groups").then(setTagGroups).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId); else next.add(tagId);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseInt(formData.price, 10),
        comparePrice: formData.comparePrice ? parseInt(formData.comparePrice, 10) : undefined,
        sku: formData.sku,
        categoryId: formData.categoryId,
        collectionId: formData.collectionId || undefined,
        tagIds: Array.from(selectedTagIds),
        metal: formData.metal,
        inventory: parseInt(formData.inventory, 10) || 0,
        inStock: formData.inStock,
        isFeatured: formData.isFeatured,
        isBestseller: formData.isBestseller,
        stones: formData.stones.split(",").map((s) => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n)),
        images,
      };

      if (mode === 'create') {
        await apiFetch("/api/products", { method: "POST", token, body: payload });
      } else {
        await apiFetch(`/api/products/${productId}`, { method: "PATCH", token, body: payload });
      }
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not ${mode === 'create' ? 'create' : 'update'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white";
  const labelClass = "block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-2";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-neutral-100 rounded">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-light tracking-wide">{mode === 'create' ? 'Add Product' : 'Edit Product'}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === 'create' ? 'Create a new jewelry product' : `Editing "${initialData?.name}"`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-8 space-y-8">
        <div>
          <label className={labelClass}>Product Images</label>
          <ImageUploader onUpload={setImages} maxFiles={5} existingImages={initialData?.images ?? []} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Product Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Diamond Solitaire Ring" required />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className={inputClass} placeholder="e.g. diamond-solitaire-ring" required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={`${inputClass} min-h-[120px] resize-y`} placeholder="Product description..." required />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Price (VNĐ)</label>
            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={inputClass} placeholder="3890000" required min={1} />
          </div>
          <div>
            <label className={labelClass}>Compare Price (VNĐ)</label>
            <input type="number" value={formData.comparePrice} onChange={e => setFormData({...formData, comparePrice: e.target.value})} className={inputClass} placeholder="5190000" min={1} />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className={inputClass} placeholder="AURA-RG-001" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Category</label>
            <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className={inputClass} required>
              {categories.length === 0 && <option value="">Loading...</option>}
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Collection</label>
            <select value={formData.collectionId} onChange={e => setFormData({...formData, collectionId: e.target.value})} className={inputClass}>
              <option value="">No Collection</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Metal</label>
            <select value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})} className={inputClass}>
              {METALS.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Inventory</label>
            <input type="number" value={formData.inventory} onChange={e => setFormData({...formData, inventory: e.target.value})} className={inputClass} placeholder="10" required min={0} />
          </div>
          <div>
            <label className={labelClass}>Stones (comma separated)</label>
            <input type="text" value={formData.stones} onChange={e => setFormData({...formData, stones: e.target.value})} className={inputClass} placeholder="Diamond, Pearl" />
          </div>
          <div>
            <label className={labelClass}>Sizes (comma separated)</label>
            <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className={inputClass} placeholder="5, 5.5, 6, 6.5" />
          </div>
        </div>

        {tagGroups.length > 0 && (
          <div>
            <label className={labelClass}>Tags</label>
            <p className="text-[11px] text-neutral-400 mb-3 normal-case tracking-normal">
              Optional — a product can carry multiple tags across multiple groups at once. Manage groups under Admin → Tags.
            </p>
            <div className="space-y-4 border border-neutral-200 p-4">
              {tagGroups.map((group) => (
                <div key={group.id}>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-neutral-400 mb-2">{group.name}</p>
                  {group.tags.length === 0 ? (
                    <p className="text-xs text-neutral-300">No tags in this group yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => {
                        const checked = selectedTagIds.has(tag.id);
                        return (
                          <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 text-xs border transition-colors ${checked ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-8">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="accent-neutral-900" />
            In Stock
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="accent-neutral-900" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formData.isBestseller} onChange={e => setFormData({...formData, isBestseller: e.target.checked})} className="accent-neutral-900" />
            Bestseller
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-4 pt-4 border-t border-neutral-200">
          <Link href="/admin/products" className="px-8 py-3 border border-neutral-200 text-xs tracking-[0.15em] uppercase hover:border-neutral-900 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-neutral-900 text-white text-xs tracking-[0.15em] uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
            {isSubmitting ? "Saving..." : mode === 'create' ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
