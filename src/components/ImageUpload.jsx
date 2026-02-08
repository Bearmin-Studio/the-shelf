'use client';
import { useState, useRef } from 'react';

export default function ImageUpload({ value, onChange, type = 'cover', className = '' }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
        id={`upload-${type}`}
      />

      {value ? (
        type === 'avatar' ? (
          <div className="flex items-center gap-4">
            <img
              src={value}
              alt="Uploaded"
              className="w-20 h-20 object-cover rounded-full border-2 border-[var(--border)]"
            />
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`upload-${type}`}
                className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm font-medium cursor-pointer hover:bg-gray-100 text-center"
              >
                変更
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-lg text-red-500 text-sm font-medium hover:bg-red-50 border border-transparent hover:border-red-200"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-40 object-cover rounded-xl border border-[var(--border)]"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
              <label
                htmlFor={`upload-${type}`}
                className="px-3 py-1.5 rounded-lg bg-white text-sm font-medium cursor-pointer hover:bg-gray-100"
              >
                変更
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>
        )
      ) : (
        <label
          htmlFor={`upload-${type}`}
          className={`flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''} ${type === 'avatar' ? 'w-24 h-24 rounded-full' : 'h-40 rounded-xl'}`}
        >
          {isUploading ? (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[var(--accent)] rounded-full animate-spin" />
          ) : (
            <>
              <svg width={type === 'avatar' ? "24" : "32"} height={type === 'avatar' ? "24" : "32"} viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {type !== 'avatar' && (
                <>
                  <span className="text-sm text-[var(--text-tertiary)] mt-2">
                    クリックして画像をアップロード
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] mt-1">
                    JPG, PNG, WebP, GIF (5MB以下)
                  </span>
                </>
              )}
            </>
          )}
        </label>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
