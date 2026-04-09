import { useState, useEffect } from 'react';

const STORAGE_PREFIX = 'calendar_img_';
const MAX_WIDTH = 900;   // px — resized before saving
const JPEG_QUALITY = 0.82;

/** Resize + compress an uploaded File to a base64 JPEG DataURL */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Hook: manages per-month uploaded images.
 * Key format: `calendar_img_2026-04`
 */
export function useMonthImages() {
  // Cache all custom images in memory; keyed by "yyyy-MM"
  const [customImages, setCustomImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load all stored custom images on first mount
    const loaded: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith(STORAGE_PREFIX)) {
        const monthKey = key.slice(STORAGE_PREFIX.length);
        loaded[monthKey] = localStorage.getItem(key)!;
      }
    }
    setCustomImages(loaded);
  }, []);

  const saveCustomImage = (monthKey: string, dataUrl: string) => {
    localStorage.setItem(`${STORAGE_PREFIX}${monthKey}`, dataUrl);
    setCustomImages((prev) => ({ ...prev, [monthKey]: dataUrl }));
  };

  const removeCustomImage = (monthKey: string) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${monthKey}`);
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[monthKey];
      return next;
    });
  };

  const getCustomImage = (monthKey: string): string | null =>
    customImages[monthKey] ?? null;

  return { getCustomImage, saveCustomImage, removeCustomImage };
}
