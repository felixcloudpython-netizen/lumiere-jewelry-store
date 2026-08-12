"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";
import ImageUploader from "@/app/components/upload/ImageUploader";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  _count: { products: number };
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  story: string | null;
  heroImage: string | null;
  _count: { products: number };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Dùng riêng cho lúc đang gõ trực tiếp vào ô Slug — giống slugify() nhưng KHÔNG
// xoá dấu gạch ngang ở cuối, để gõ được slug nhiều từ (vd "wedding-rings") theo
// đúng nhịp gõ tự nhiên. slugify() đầy đủ chỉ áp dụng lúc tự động điền từ ô
// Name, hoặc lúc submit form để dọn sạch lần cuối trước khi gửi lên server.
function liveSlugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-");
}

const inputClass = "w-full px-4 py-2.5 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white";
const labelClass = "block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-1.5";

export default function AdminCategoriesPage() {
  const token = useAuthStore((s) => s.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    Promise.all([
      apiFetch<Category[]>("/api/products/categories"),
      apiFetch<Collection[]>("/api/products/collections"),
    ]).then(([cats, cols]) => {
      setCategories(cats);
      setCollections(cols);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Categories & Collections</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage product taxonomy — used to organize /jewelry and /collections pages.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <CategorySection categories={categories} token={token} onChange={load} />
          <CollectionSection collections={collections} token={token} onChange={load} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function CategorySection({ categories, token, onChange }: { categories: Category[]; token: string | null; onChange: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null); setName(""); setSlug(""); setSlugTouched(false);
    setDescription(""); setImage(""); setParentId(""); setError("");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id); setName(cat.name); setSlug(cat.slug); setSlugTouched(true);
    setDescription(cat.description ?? ""); setImage(cat.image ?? ""); setParentId(cat.parentId ?? ""); setError("");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setIsSubmitting(true);
    const body = { name, slug: slugify(slug), description: description || undefined, image: image || undefined, parentId: parentId || undefined };
    try {
      if (editingId) {
        await apiFetch(`/api/products/categories/${editingId}`, { method: "PATCH", token, body });
      } else {
        await apiFetch("/api/products/categories", { method: "POST", token, body });
      }
      resetForm();
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!token) return;
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await apiFetch(`/api/products/categories/${cat.id}`, { method: "DELETE", token });
      onChange();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete category");
    }
  };

  return (
    <section>
      <h2 className="text-sm font-medium tracking-wider uppercase mb-4">Categories</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Products</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-neutral-500">/jewelry/{cat.slug}</td>
                  <td className="px-4 py-3">{cat._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(cat)} className="p-1.5 hover:bg-neutral-100 rounded" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium tracking-wider uppercase">{editingId ? "Edit Category" : "New Category"}</h3>
            {editingId && <button type="button" onClick={resetForm}><X size={16} className="text-neutral-400 hover:text-neutral-900" /></button>}
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Rings" />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" required value={slug} onChange={(e) => { setSlug(liveSlugify(e.target.value)); setSlugTouched(true); }} className={inputClass} placeholder="e.g. rings" />
          </div>
          <div>
            <label className={labelClass}>Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[70px] resize-y`} placeholder="Shown under the category name in the navigation menu" />
          </div>
          <div>
            <label className={labelClass}>Image (optional)</label>
            <p className="text-[11px] text-neutral-400 mb-2">Chưa có ảnh thì menu điều hướng vẫn hiện dạng dòng chữ như hiện tại.</p>
            <ImageUploader maxFiles={1} existingImages={image ? [image] : []} onUpload={(urls) => setImage(urls[0] ?? "")} />
          </div>
          <div>
            <label className={labelClass}>Parent Category (optional)</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {categories.filter((c) => c.id !== editingId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {!editingId && <Plus size={14} />} {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Add Category"}
          </button>
        </form>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

function CollectionSection({ collections, token, onChange }: { collections: Collection[]; token: string | null; onChange: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEditingId(null); setName(""); setSlug(""); setSlugTouched(false);
    setDescription(""); setStory(""); setHeroImage(""); setError("");
  };

  const startEdit = (col: Collection) => {
    setEditingId(col.id); setName(col.name); setSlug(col.slug); setSlugTouched(true);
    setDescription(col.description ?? ""); setStory(col.story ?? ""); setHeroImage(col.heroImage ?? ""); setError("");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setIsSubmitting(true);
    const body = {
      name, slug: slugify(slug),
      description: description || undefined,
      story: story || undefined,
      heroImage: heroImage || undefined,
    };
    try {
      if (editingId) {
        await apiFetch(`/api/products/collections/${editingId}`, { method: "PATCH", token, body });
      } else {
        await apiFetch("/api/products/collections", { method: "POST", token, body });
      }
      resetForm();
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save collection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (col: Collection) => {
    if (!token) return;
    if (!confirm(`Delete collection "${col.name}"?`)) return;
    try {
      await apiFetch(`/api/products/collections/${col.id}`, { method: "DELETE", token });
      onChange();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete collection");
    }
  };

  return (
    <section>
      <h2 className="text-sm font-medium tracking-wider uppercase mb-4">Collections</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Products</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{col.name}</td>
                  <td className="px-4 py-3 text-neutral-500">/collections/{col.slug}</td>
                  <td className="px-4 py-3">{col._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(col)} className="p-1.5 hover:bg-neutral-100 rounded" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(col)} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-400">No collections yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium tracking-wider uppercase">{editingId ? "Edit Collection" : "New Collection"}</h3>
            {editingId && <button type="button" onClick={resetForm}><X size={16} className="text-neutral-400 hover:text-neutral-900" /></button>}
          </div>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Aura" />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input type="text" required value={slug} onChange={(e) => { setSlug(liveSlugify(e.target.value)); setSlugTouched(true); }} className={inputClass} placeholder="e.g. aura" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[70px] resize-y`} placeholder="Short tagline shown on collection cards" />
          </div>
          <div>
            <label className={labelClass}>Story (optional, longer copy)</label>
            <textarea value={story} onChange={(e) => setStory(e.target.value)} className={`${inputClass} min-h-[90px] resize-y`} />
          </div>
          <div>
            <label className={labelClass}>Hero Image</label>
            <ImageUploader maxFiles={1} existingImages={heroImage ? [heroImage] : []} onUpload={(urls) => setHeroImage(urls[0] ?? "")} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {!editingId && <Plus size={14} />} {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Add Collection"}
          </button>
        </form>
      </div>
    </section>
  );
}
