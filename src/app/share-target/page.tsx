"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getShareTargetPayload } from "@/lib/pwa";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";

export default function ShareTargetPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const p = getShareTargetPayload();
    if (p) {
      setTitle(p.title || "");
      setText(p.text || "");
      setUrl(p.url || "");
    }
  }, []);

  const onImport = () => {
    showToast({ kind: "success", title: "공유 내용이 추가됐어요" });
    // Pretend to import as new post
    const drafts = JSON.parse(localStorage.getItem("officelink:drafts") || "[]");
    drafts.unshift({ id: Date.now().toString(), title: title || "(공유됨)", text, url, shared: true, at: Date.now() });
    localStorage.setItem("officelink:drafts", JSON.stringify(drafts));
    router.push("/write");
  };

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="📥 외부 콘텐츠 가져오기" back="history" />
      <div className="p-4 space-y-3">
        <div className="warm-card p-3 bg-sage-50 border-sage-200">
          <div className="text-sm font-bold text-concrete-900 mb-1">공유 받음</div>
          <div className="text-xs text-concrete-600">다른 앱에서 보낸 내용을 확인하고 게시글로 추가할 수 있어요.</div>
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">내용</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">링크</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm" />
        </div>
        <Button variant="primary" size="lg" full onClick={onImport}>📝 게시글로 추가</Button>
      </div>
    </div>
  );
}
