"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBuildings, getUser } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import type { Building } from "@/types";

// 마포구 중심 좌표 (대략)
const MAP_CENTER = { lat: 37.566, lng: 126.901 };
const MAP_BBOX = { minLat: 37.54, maxLat: 37.59, minLng: 126.87, maxLng: 126.93 };

// 마포구 건물들 (시드 좌표)
const SEED_COORDS: Record<string, { lat: number; lng: number }> = {
  "b-1": { lat: 37.575, lng: 126.895 }, // 상암오벨리스크 1차
  "b-2": { lat: 37.575, lng: 126.897 }, // 상암오벨리스크 2차
  "b-3": { lat: 37.561, lng: 126.901 }, // 이안상암 1차
  "b-4": { lat: 37.578, lng: 126.892 }, // 상암 월드메르디앙
  "b-5": { lat: 37.566, lng: 126.926 }, // 연남동 로얄오피스텔
};

export default function MapPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    setBuildings(getBuildings());
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const project = (lat: number, lng: number) => {
    const x = ((lng - MAP_BBOX.minLng) / (MAP_BBOX.maxLng - MAP_BBOX.minLng)) * 100;
    const y = ((MAP_BBOX.maxLat - lat) / (MAP_BBOX.maxLat - MAP_BBOX.minLat)) * 100;
    return { x, y };
  };

  const selectedBuilding = selected ? buildings.find((b) => b.id === selected) : null;
  const selectedCoord = selected ? SEED_COORDS[selected] : null;

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="지도" subtitle="우리 동네 건물 위치" back="history" />

      <div className="relative w-full" style={{ height: "calc(100vh - 96px)" }}>
        {/* SVG 지도 */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          style={{ background: "#e5e8eb" }}
        >
          {/* 격자 */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 10}
              x2="100"
              y2={i * 10}
              stroke="#cdd3da"
              strokeWidth="0.1"
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 10}
              y1="0"
              x2={i * 10}
              y2="100"
              stroke="#cdd3da"
              strokeWidth="0.1"
            />
          ))}

          {/* 도로 (가짜) */}
          <path
            d="M 0 30 L 100 35 M 30 0 L 35 100 M 60 0 L 65 100 M 0 60 L 100 55 M 80 0 L 85 100"
            stroke="#ffffff"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 0 30 L 100 35 M 30 0 L 35 100 M 60 0 L 65 100 M 0 60 L 100 55 M 80 0 L 85 100"
            stroke="#9ba3ae"
            strokeWidth="0.3"
            fill="none"
            strokeDasharray="0.5 0.3"
          />

          {/* 한강 (왼쪽) */}
          <path
            d="M 0 0 L 0 100 L 5 100 Q 8 50 5 0 Z"
            fill="#bfdbfe"
            opacity="0.7"
          />

          {/* 건물 핀 */}
          {buildings.map((b) => {
            const coord = SEED_COORDS[b.id];
            if (!coord) return null;
            const p = project(coord.lat, coord.lng);
            const isSelected = selected === b.id;
            return (
              <g
                key={b.id}
                transform={`translate(${p.x}, ${p.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(b.id)}
              >
                <circle
                  r={isSelected ? 4 : 2.5}
                  fill={isSelected ? "#f59e0b" : "#1f6feb"}
                  stroke="white"
                  strokeWidth="0.5"
                />
                {isSelected && (
                  <circle
                    r="3"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.5"
                    opacity="0.5"
                  >
                    <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  y="-3"
                  textAnchor="middle"
                  fontSize="1.8"
                  fontWeight="bold"
                  fill={isSelected ? "#f59e0b" : "#0d1117"}
                >
                  {b.ratingAvg.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 줌 컨트롤 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col bg-white rounded-soft shadow-md overflow-hidden">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
            className="w-10 h-10 flex items-center justify-center text-lg active:bg-concrete-100 border-b border-concrete-100"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="w-10 h-10 flex items-center justify-center text-lg active:bg-concrete-100"
          >
            −
          </button>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-3 left-3 bg-white rounded-soft p-2 shadow-md text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink-600"></span>
            <span>건물 ({buildings.length})</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-warm-500"></span>
            <span>선택됨</span>
          </div>
        </div>

        {/* 선택된 건물 정보 */}
        {selectedBuilding && selectedCoord && (
          <div className="absolute bottom-3 right-3 left-3 bg-white rounded-soft p-4 shadow-lg animate-slide-up">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-concrete-900">
                  {selectedBuilding.name}
                </h3>
                <p className="text-[11px] text-concrete-500 truncate">
                  {selectedBuilding.address}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-7 h-7 flex items-center justify-center text-concrete-500 active:bg-concrete-100 rounded-full"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-warm-500 text-sm">★</span>
              <span className="text-sm font-bold text-warm-700">
                {selectedBuilding.ratingAvg.toFixed(1)}
              </span>
              <span className="text-[11px] text-concrete-500">
                리뷰 {selectedBuilding.ratingCount}개
              </span>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => router.push(`/building/${selectedBuilding.id}`)}
                className="flex-1 h-9 text-xs font-semibold bg-warm-500 text-white rounded-soft"
              >
                상세 보기
              </button>
              <button
                onClick={() => router.push(`/neighbors?building=${selectedBuilding.id}`)}
                className="flex-1 h-9 text-xs font-medium bg-concrete-100 text-concrete-700 rounded-soft"
              >
                이웃 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
