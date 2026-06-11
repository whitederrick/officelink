"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNotifLog, clearNotifLog, hasNotifPermission, requestNotifPermission, showLocalNotification } from "@/lib/pwa";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { showToast } from "@/lib/toast";

export default function NotifLogPage() {
  const router = useRouter();
  const [log, setLog] = useState<{ title: string; body: string; time: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hasPerm, setHasPerm] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLog(getNotifLog());
    setHasPerm(hasNotifPermission());
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="🔔 알림 로그" back="history" />
      <div className="p-4 space-y-3">
        <div className="warm-card p-3 bg-ink-50 border-ink-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{hasPerm ? "🔔" : "🔕"}</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-concrete-900">
                {hasPerm ? "알림 권한 활성화됨" : "알림 권한 꺼짐"}
              </div>
              <div className="text-[11px] text-concrete-600">
                {hasPerm ? "중요 알림을 받습니다" : "권한을 허용하면 알림을 받을 수 있어요"}
              </div>
            </div>
          </div>
          {!hasPerm && (
            <Button variant="primary" size="sm" full onClick={async () => {
              const r = await requestNotifPermission();
              if (r === "granted") {
                showToast({ kind: "success", title: "알림이 활성화됐어요" });
                setHasPerm(true);
              } else {
                showToast({ kind: "warning", title: "권한이 거부됐어요" });
              }
            }}>권한 허용</Button>
          )}
          {hasPerm && (
            <Button variant="secondary" size="sm" full onClick={() => {
              showLocalNotification({
                title: "OFFICELINK 테스트 알림",
                body: "알림이 정상적으로 동작합니다!",
                tag: "test",
              });
              setTimeout(() => setLog(getNotifLog()), 100);
            }}>테스트 알림 보내기</Button>
          )}
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-bold text-concrete-900">📋 최근 알림</div>
          {log.length > 0 && (
            <button
              onClick={() => { clearNotifLog(); setLog([]); }}
              className="text-[11px] text-coral-500"
            >전체 삭제</button>
          )}
        </div>

        {log.length === 0 ? (
          <EmptyState kind="empty" title="아직 알림이 없어요" description="테스트 알림을 보내보세요." />
        ) : (
          <div className="space-y-2">
            {log.map((n, i) => (
              <div key={i} className="warm-card p-3">
                <div className="flex items-start gap-2">
                  <span className="text-2xl shrink-0">🔔</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-concrete-900">{n.title}</div>
                    <div className="text-xs text-concrete-600">{n.body}</div>
                    <div className="text-[10px] text-concrete-400 mt-1">
                      {new Date(n.time).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
