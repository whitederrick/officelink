"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAddresses,
  getUser,
} from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { modeForRole, MODE_INFO } from "@/lib/display";
import type { UserRole } from "@/types";

interface Article {
  emoji: string;
  title: string;
  desc: string;
  steps: string[];
  tag: string;
}

const ARTICLES: Record<UserRole, Article[]> = {
  tenant: [
    {
      emoji: "🏠",
      title: "오피스텔 계약 시 꼭 체크할 5가지",
      desc: "계약 전 꼭 확인해야 할 항목들",
      steps: [
        "관리비에 포함된 항목 확인 (수도, 전기, 인터넷, 가스)",
        "보증금 반환 조건 명확히 (원상복구 범위)",
        "주차 가능 여부 및 추가 비용",
        "엘리베이터, 택배함, 보안 시스템 작동 상태",
        "이웃 소음 관련 관리사무소 연락처 저장",
      ],
      tag: "계약",
    },
    {
      emoji: "📦",
      title: "부재중 택배 안전하게 받기",
      desc: "1인 가구 필수 택배 수령 팁",
      steps: [
        "관리사무소 무인 택배함 이용 (보관 3일)",
        "도어락 비밀번호 변경 주기 (3개월)",
        "신뢰하는 제휴 보관함 앱 설치",
        "택배 도착 알림 켜두기 (Push)",
      ],
      tag: "생활",
    },
    {
      emoji: "💰",
      title: "관리비 절약하는 5가지 습관",
      desc: "월 1~3만원 아끼는 실전 팁",
      steps: [
        "에어컨 필터 월 1회 청소 (전력 10%↓)",
        "사용 안 하는 콘센트拔기 (待機電力 차단)",
        "LED 전구로 교체",
        "샤워 시간 1분 단축 (수도·가스 절감)",
        "관리비 고지서 꼼꼼히 확인 (이상 항목 제보)",
      ],
      tag: "절약",
    },
    {
      emoji: "🔧",
      title: "하자 발견 시 대처법",
      desc: "입주 후 1주일 내 처리하는 게 유리",
      steps: [
        "하자 체크리스트로 방 전체 기록 (사진 첨부)",
        "관리사무소에 즉시 접수 (AS 신청)",
        "임대인 연락처 확보",
        "심한 경우 내용증명 발송",
      ],
      tag: "하자",
    },
  ],
  landlord: [
    {
      emoji: "🏢",
      title: "오피스텔 운영 시 꼭 알아야 할 것",
      desc: "건물주로서의 기본",
      steps: [
        "관리사무소와 협업 체계 구축 (응답시간 24시간 이내)",
        "세입자 평가 시스템 운영 (리뷰/평점)",
        "보증금 반환 프로세스 명문화",
        "하자 보수 업체 풀 확보 (출장 1시간 이내)",
        "월 1회 건물 점검 일정 수립",
      ],
      tag: "운영",
    },
    {
      emoji: "💬",
      title: "리뷰에 답글 다는 법",
      desc: "좋은 평판은 진심 어린 답글에서",
      steps: [
        "부정적 리뷰에도 감정 빼고 답변",
        "구체적 개선 계획 함께 공개",
        "24시간 이내 첫 답변 권장",
        "분기별 자주 나오는 불만 분석",
      ],
      tag: "평판",
    },
  ],
  manager: [
    {
      emoji: "🔧",
      title: "AS 접수부터 처리까지 표준流程",
      desc: "응답속도가 평판을 만듭니다",
      steps: [
        "접수 후 1시간 이내 첫 연락 (전화/문자)",
        "현장 방문 일정 24시간 이내 확정",
        "처리 완료 후 세입자 확인 사인",
        "응답/처리 시간 데이터 기록 (평판 지표)",
        "월별 AS 처리 현황 리포트 작성",
      ],
      tag: "AS",
    },
    {
      emoji: "📢",
      title: "공지사항 잘 쓰는 법",
      desc: "읽히는 공지가 좋은 공지",
      steps: [
        "제목에 핵심 내용 (점검/공사/일정)",
        "본문에 일시, 영향 범위, 연락처",
        "Push 알림 동시 발송",
        "긴급도 표시 (뱃지)",
      ],
      tag: "공지",
    },
  ],
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "리뷰는 익명으로 작성되나요?",
    a: "네, 모든 리뷰는 닉네임으로만 표시되며 실명은 공개되지 않아요.",
  },
  {
    q: "내가 쓴 리뷰를 삭제할 수 있나요?",
    a: "프로필 > 내가 쓴 리뷰에서 직접 삭제할 수 있어요.",
  },
  {
    q: "AS 신청 후 얼마나 기다려야 하나요?",
    a: "보통 1-2시간 이내에 관리사무소에서 첫 연락을 드려요.",
  },
  {
    q: "건물 평점은 어떻게 계산되나요?",
    a: "리뷰의 항목별 별점 평균이에요. 가중치 없이 단순 평균입니다.",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setU] = useState<ReturnType<typeof getUser>>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.replace("/onboarding");
      return;
    }
    setU(u);
  }, [router]);

  if (!mounted || !user) return <LoadingIntro />;

  const mode = modeForRole(user.role);
  const articles = ARTICLES[mode];
  const info = MODE_INFO[mode];

  return (
    <div className="bg-white min-h-screen">
      <PageHeader
        title="도움말"
        subtitle={info.description}
        back="history"
      />

      {/* 모드 배지 */}
      <div className="px-4 pt-3">
        <div className={`warm-card p-3 flex items-center gap-2 ${
          mode === "tenant" ? "bg-warm-50 border-warm-200" :
          mode === "landlord" ? "bg-ink-50 border-ink-200" :
          "bg-sage-50 border-sage-200"
        }`}>
          <span className="text-2xl">{info.emoji}</span>
          <div className="flex-1">
            <div className="text-sm font-bold text-concrete-900">
              {info.label}을 위한 가이드
            </div>
            <div className="text-[11px] text-concrete-600">
              {mode === "tenant" && "오피스텔 1인 가구 생활의 모든 것"}
              {mode === "landlord" && "건물 운영에 필요한 핵심 정보"}
              {mode === "manager" && "민원·AS 응대 매뉴얼"}
            </div>
          </div>
        </div>
      </div>

      {/* 아티클 */}
      <section className="p-4 space-y-3">
        <h2 className="text-sm font-bold text-concrete-900">📚 가이드</h2>
        {articles.map((a) => (
          <details
            key={a.title}
            className="warm-card p-4 group"
            onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open ? a.title : null)}
          >
            <summary className="flex items-start gap-3 cursor-pointer list-none">
              <div className="text-2xl shrink-0">{a.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-concrete-900 mb-0.5">{a.title}</div>
                <div className="text-[11px] text-concrete-500">{a.desc}</div>
              </div>
              <span className="text-concrete-400 text-lg shrink-0 group-open:rotate-180 transition">
                ⌄
              </span>
            </summary>
            <div className="mt-3 pt-3 border-t border-concrete-100">
              <ol className="space-y-2">
                {a.steps.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-concrete-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-warm-100 text-warm-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </details>
        ))}
      </section>

      {/* FAQ */}
      <section className="px-4 pb-4">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">❓ 자주 묻는 질문</h2>
        <div className="warm-card divide-y divide-concrete-100">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="p-3 flex items-center gap-2 cursor-pointer list-none">
                <span className="flex-1 text-sm font-semibold text-concrete-900">{f.q}</span>
                <span className="text-concrete-400 text-base group-open:rotate-180 transition">⌄</span>
              </summary>
              <div className="px-3 pb-3 text-sm text-concrete-600 leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 고객센터 */}
      <section className="px-4 pb-6">
        <h2 className="text-sm font-bold text-concrete-900 mb-2">📞 고객센터</h2>
        <div className="warm-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-semibold text-concrete-900">전화 상담</div>
              <div className="text-xs text-concrete-500">평일 10:00 - 18:00</div>
            </div>
            <a
              href="tel:1588-0000"
              className="h-10 px-4 inline-flex items-center text-sm font-semibold bg-warm-500 text-white rounded-pill"
            >
              1588-0000
            </a>
          </div>
          <div className="text-[11px] text-concrete-500 pt-2 border-t border-concrete-100">
            ※ OFFICELINK MVP 데모 버전입니다.
          </div>
        </div>
      </section>
    </div>
  );
}
