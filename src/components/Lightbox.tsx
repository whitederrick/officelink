"use client";

import { useEffect } from "react";

export function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
      if (e.key === "ArrowRight" && index < images.length - 1) onChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onChange]);

  if (index < 0 || index >= images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-lg flex items-center justify-center active:bg-white/20"
      >
        ✕
      </button>
      <div className="absolute top-4 left-4 text-white text-sm">
        {index + 1} / {images.length}
      </div>
      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(index - 1);
          }}
          className="absolute left-2 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center active:bg-white/20"
        >
          ‹
        </button>
      )}
      {index < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(index + 1);
          }}
          className="absolute right-2 w-10 h-10 rounded-full bg-white/10 text-white text-2xl flex items-center justify-center active:bg-white/20"
        >
          ›
        </button>
      )}
      <img
        src={images[index]}
        alt=""
        className="max-w-full max-h-[85vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
