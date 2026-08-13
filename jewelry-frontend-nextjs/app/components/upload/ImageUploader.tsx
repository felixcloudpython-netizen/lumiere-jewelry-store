"use client";

import { useState, useCallback, useId } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store/authStore";

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export default function ImageUploader({ onUpload, maxFiles = 5, existingImages = [] }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const token = useAuthStore((s) => s.token);
  // ID cố định "image-upload" trước đây gây trùng lặp khi có nhiều ImageUploader
  // cùng hiện trên 1 trang (vd trang Categories & Collections có cả form
  // Category lẫn Collection cùng lúc) — <label htmlFor> sẽ luôn bấm nhầm vào
  // input ẩn ĐẦU TIÊN tìm thấy trên trang thay vì đúng cái cạnh nó, khiến "click
  // to browse" không hoạt động (trong khi kéo-thả không dựa vào ID nên vẫn ổn).
  const inputId = useId();

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !token) return;
    const validFiles = Array.from(files).filter(f =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (validFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    validFiles.forEach(file => formData.append('images', file));

    try {
      // Gọi đúng domain API thật kèm Bearer token — trước đây dùng đường dẫn
      // tương đối "/api/upload/multiple" (sẽ 404 ở production vì frontend/backend
      // khác domain) và không hề gắn token dù route yêu cầu authenticate + requireAdmin.
      // apiFetch tự set Content-Type: application/json nên không dùng được ở đây
      // (multipart/form-data cần browser tự set boundary) — gọi fetch trực tiếp.
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/upload/multiple`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const newUrls = data.map((d: any) => d.url);
        const updated = [...images, ...newUrls].slice(0, maxFiles);
        setImages(updated);
        onUpload(updated);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, onUpload, token]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onUpload(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-500'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id={inputId}
        />
        <label htmlFor={inputId} className="cursor-pointer block">
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-neutral-400" />
              <p className="text-sm text-neutral-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload size={32} className="text-neutral-400" />
              <div>
                <p className="text-sm font-medium">Drag & drop images here</p>
                <p className="text-xs text-neutral-500 mt-1">or click to browse</p>
              </div>
              <p className="text-[10px] text-neutral-400">JPEG, PNG, WebP up to 5MB each</p>
            </div>
          )}
        </label>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-square bg-neutral-100 group">
              <Image src={url} alt={`Upload ${index + 1}`} fill className="object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-neutral-400">{images.length} / {maxFiles} images</p>
    </div>
  );
}
