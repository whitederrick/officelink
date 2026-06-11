"use client";

import { useRef, useState } from "react";
import { showToast } from "@/lib/toast";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  size?: "sm" | "md";
}

export function ImagePicker({ images, onChange, max = 4, size = "md" }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const sz = size === "sm" ? "w-14 h-14" : "w-20 h-20";

  const add = (files: FileList | null) => {
    if (!files) return;
    const remain = max - images.length;
    if (remain <= 0) {
      showToast({ kind: "warning", title: `최대 ${max}장까지 첨부 가능` });
      return;
    }
    const list = Array.from(files).slice(0, remain);
    Promise.all(
      list.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            if (f.size > 500_000) {
              reject(new Error("500KB 이하만 가능"));
              return;
            }
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(f);
          }),
      ),
    )
      .then((dataUrls) => {
        onChange([...images, ...dataUrls]);
        showToast({ kind: "success", title: `${dataUrls.length}장 추가됨` });
      })
      .catch((e) => showToast({ kind: "error", title: e.message || "업로드 실패" }));
  };

  const remove = (i: number) => {
    const next = images.filter((_, idx) => idx !== i);
    onChange(next);
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap">
        {images.map((src, i) => (
          <div key={i} className={`relative ${sz} rounded-soft overflow-hidden border border-concrete-200`}>
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-coral-500 text-white text-xs flex items-center justify-center active:scale-95"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className={`${sz} rounded-soft border-2 border-dashed border-concrete-300 bg-concrete-50 flex flex-col items-center justify-center text-concrete-500 active:bg-concrete-100`}
          >
            <span className="text-xl">+</span>
            <span className="text-[10px]">{images.length}/{max}</span>
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
