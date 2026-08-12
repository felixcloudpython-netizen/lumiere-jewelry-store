"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { productTags: number };
}

interface TagGroup {
  id: string;
  name: string;
  slug: string;
  order: number;
  tags: Tag[];
}

function slugify(text: string) {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function liveSlugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-");
}

const inputClass = "px-3 py-2 border border-neutral-200 text-sm outline-none focus:border-neutral-900 bg-white";

/**
 * Quản lý hệ thống phân loại đa chiều (multi-tag) — KHÁC hẳn Categories &
 * Collections (trang riêng, /admin/categories): ở đó 1 sản phẩm chỉ thuộc
 * đúng 1 category. Ở đây, admin tự tạo các "nhóm" (TagGroup) tuỳ ý tên (vd
 * Phân loại, Dòng sản phẩm, Collaboration...), mỗi nhóm chứa nhiều "giá trị"
 * (Tag) — 1 sản phẩm có thể gắn nhiều Tag thuộc nhiều nhóm khác nhau CÙNG LÚC.
 */
export default function AdminTagsPage() {
  const token = useAuthStore((s) => s.token);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    apiFetch<TagGroup[]>("/api/products/tag-groups").then(setTagGroups).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-wide">Tags & Filters</h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-2xl">
          Multi-dimensional tagging — unlike Categories (1 product = 1 category), a product can carry
          multiple tags across multiple groups at once (e.g. Type: Charm + Collaboration: Disney x Pandora).
          Used to build the mega menu &amp; product filters.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {tagGroups.map((group) => (
            <TagGroupCard key={group.id} group={group} token={token} onChange={load} />
          ))}
          <NewTagGroupForm token={token} onChange={load} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function TagGroupCard({ group, token, onChange }: { group: TagGroup; token: string | null; onChange: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [slug, setSlug] = useState(group.slug);
  const [error, setError] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  const saveGroup = async () => {
    if (!token) return;
    setError("");
    try {
      await apiFetch(`/api/products/tag-groups/${group.id}`, { method: "PATCH", token, body: { name, slug: slugify(slug) } });
      setIsEditing(false);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    }
  };

  const deleteGroup = async () => {
    if (!token) return;
    if (!confirm(`Delete group "${group.name}"? You must remove all tags inside it first.`)) return;
    try {
      await apiFetch(`/api/products/tag-groups/${group.id}`, { method: "DELETE", token });
      onChange();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete");
    }
  };

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTagName.trim()) return;
    setAddingTag(true);
    try {
      await apiFetch("/api/products/tags", {
        method: "POST", token,
        body: { name: newTagName.trim(), slug: slugify(newTagName), tagGroupId: group.id },
      });
      setNewTagName("");
      onChange();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not add tag");
    } finally {
      setAddingTag(false);
    }
  };

  const deleteTag = async (tag: Tag) => {
    if (!token) return;
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    try {
      await apiFetch(`/api/products/tags/${tag.id}`, { method: "DELETE", token });
      onChange();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Could not delete tag");
    }
  };

  return (
    <div className="bg-white border border-neutral-200 p-5">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input value={name} onChange={(e) => { setName(e.target.value); if (slug === slugify(name)) setSlug(slugify(e.target.value)); }} className={`${inputClass} flex-1 max-w-xs`} />
            <input value={slug} onChange={(e) => setSlug(liveSlugify(e.target.value))} className={`${inputClass} flex-1 max-w-xs text-neutral-400`} />
            <button onClick={saveGroup} className="p-1.5 hover:bg-green-50 text-green-600 rounded"><Check size={16} /></button>
            <button onClick={() => { setIsEditing(false); setName(group.name); setSlug(group.slug); }} className="p-1.5 hover:bg-neutral-100 rounded"><X size={16} /></button>
          </div>
        ) : (
          <h2 className="text-xs font-medium tracking-[0.2em] uppercase">{group.name}</h2>
        )}
        {!isEditing && (
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-neutral-100 rounded" title="Rename"><Pencil size={14} /></button>
            <button onClick={deleteGroup} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Delete group"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      <div className="flex flex-wrap gap-2 items-center">
        {group.tags.map((tag) => (
          <span key={tag.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-neutral-50 border border-neutral-200 text-xs">
            {tag.name}
            {tag._count.productTags > 0 && <span className="text-neutral-400">({tag._count.productTags})</span>}
            <button onClick={() => deleteTag(tag)} className="p-0.5 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        <form onSubmit={addTag} className="inline-flex items-center gap-1">
          <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag..." className={`${inputClass} text-xs py-1.5 w-28`} />
          <button type="submit" disabled={addingTag || !newTagName.trim()} className="p-1.5 bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 transition-colors">
            <Plus size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function NewTagGroupForm({ token, onChange }: { token: string | null; onChange: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError("");
    setIsSubmitting(true);
    try {
      await apiFetch("/api/products/tag-groups", { method: "POST", token, body: { name, slug: slugify(slug) } });
      setName(""); setSlug(""); setSlugTouched(false);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-dashed border-neutral-300 p-5">
      <h3 className="text-xs font-medium tracking-wider uppercase mb-4">+ New Tag Group</h3>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-1.5">Name</label>
          <input required value={name} onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} className={inputClass} placeholder="e.g. Collaboration" />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.15em] uppercase text-neutral-500 mb-1.5">Slug</label>
          <input required value={slug} onChange={(e) => { setSlug(liveSlugify(e.target.value)); setSlugTouched(true); }} className={inputClass} placeholder="e.g. collaboration" />
        </div>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-neutral-900 text-white text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors disabled:opacity-60">
          {isSubmitting ? "Creating..." : "Create Group"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
}
