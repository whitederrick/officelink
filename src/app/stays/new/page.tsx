"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addListing, getBuildings, getUser, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { LoadingIntro } from "@/components/LoadingHouse";
import { Button } from "@/components/Button";
import { showToast } from "@/lib/toast";
import type { Building } from "@/types";

export default function NewStayPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingId, setBuildingId] = useState("");
  const [unit, setUnit] = useState("");
  const [hostNickname, setHostNickname] = useState("");
  const [pricePerDay, setPricePerDay] = useState(55000);
  const [minStay, setMinStay] = useState(3);
  const [rooms, setRooms] = useState(1);
  const [area, setArea] = useState(23);
  const [furnished, setFurnished] = useState(true);
  const [wifi, setWifi] = useState(true);
  const [kitchen, setKitchen] = useState(true);
  const [washer, setWasher] = useState(true);
  const [ac, setAc] = useState(true);
  const [heating, setHeating] = useState(true);
  const [utilities, setUtilities] = useState(true);
  const [hostLangs, setHostLangs] = useState<string[]>(["ko", "en"]);
  const [descEn, setDescEn] = useState("Cozy studio, fully furnished, near subway. Perfect for foreigners.");

  useEffect(() => {
    setMounted(true);
    if (!getUser()) {
      router.replace("/onboarding");
      return;
    }
    const bs = getBuildings();
    setBuildings(bs);
    if (bs.length > 0) setBuildingId(bs[0].id);
    const u = getUser();
    if (u) setHostNickname(u.nickname);
  }, [router]);

  if (!mounted) return <LoadingIntro />;

  const submit = () => {
    if (!buildingId || !unit.trim() || !hostNickname.trim() || !descEn.trim()) {
      showToast({ kind: "warning", title: "필수 항목을 입력해주세요" });
      return;
    }
    if (hostLangs.length === 0) {
      showToast({ kind: "warning", title: "호스트 가능 언어를 1개 이상 선택해주세요" });
      return;
    }
    addListing({
      id: uid(),
      hostId: getUser()?.id || "host",
      hostNickname: hostNickname.trim(),
      buildingId,
      buildingName: buildings.find((b) => b.id === buildingId)?.name || "",
      unitNumber: unit.trim(),
      pricePerDay,
      pricePerWeek: pricePerDay * 6,
      pricePerMonth: pricePerDay * 28,
      currency: "KRW",
      minStay,
      availableFrom: Date.now(),
      rooms,
      bathrooms: 1,
      area,
      furnished,
      utilities,
      wifi,
      kitchen,
      washer,
      ac,
      heating,
      hostLangs: hostLangs as any,
      description: { en: descEn, ko: descEn, ja: descEn, zh: descEn },
      rules: { ko: ["비흡연"], en: ["No smoking"], ja: ["禁煙"], zh: ["禁烟"] },
      views: 0,
      inquiries: 0,
      status: "open",
      createdAt: Date.now(),
    });
    showToast({ kind: "success", title: "매물 등록됨" });
    router.push("/stays");
  };

  const toggleLang = (l: string) =>
    setHostLangs(hostLangs.includes(l) ? hostLangs.filter((x) => x !== l) : [...hostLangs, l]);

  return (
    <div className="bg-white min-h-screen">
      <PageHeader title="단기임대 등록" back="history" />

      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">건물</label>
          <select
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm bg-white"
          >
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">호스트 닉네임</label>
          <input
            value={hostNickname}
            onChange={(e) => setHostNickname(e.target.value)}
            placeholder="예: Jenny (🇰🇷 5년차)"
            className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">호수</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="예: 1208"
            className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">일일 가격 (원)</label>
            <input
              type="number"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">최소 며칠</label>
            <input
              type="number"
              value={minStay}
              onChange={(e) => setMinStay(parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">방 개수</label>
            <input
              type="number"
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-concrete-700 mb-2 block">면적 (㎡)</label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(parseInt(e.target.value) || 0)}
              className="w-full h-11 px-3 border border-concrete-200 rounded-soft text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">🌐 호스트 가능 언어</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { v: "ko", label: "🇰🇷 한국어" },
              { v: "en", label: "🇺🇸 English" },
              { v: "ja", label: "🇯🇵 日本語" },
              { v: "zh", label: "🇨🇳 中文" },
            ].map((l) => {
              const on = hostLangs.includes(l.v);
              return (
                <button
                  key={l.v}
                  type="button"
                  onClick={() => toggleLang(l.v)}
                  className={`px-3 h-8 text-xs rounded-pill border ${
                    on
                      ? "bg-warm-500 text-white border-warm-500"
                      : "bg-white text-concrete-600 border-concrete-200"
                  }`}
                >
                  {on ? "✓ " : ""}{l.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">옵션</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["furnished", "🛋 가구", furnished, setFurnished],
              ["wifi", "📡 WiFi", wifi, setWifi],
              ["kitchen", "🍳 주방", kitchen, setKitchen],
              ["washer", "🧺 세탁기", washer, setWasher],
              ["ac", "❄️ 에어컨", ac, setAc],
              ["heating", "🔥 난방", heating, setHeating],
              ["utilities", "💡 공과금", utilities, setUtilities],
            ].map(([k, label, val, setter]: any) => (
              <button
                key={k as string}
                type="button"
                onClick={() => setter(!(val as boolean))}
                className={`p-2 text-xs rounded-soft border ${
                  val
                    ? "bg-sage-50 border-sage-200 text-sage-700"
                    : "bg-white border-concrete-200 text-concrete-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-concrete-700 mb-2 block">설명 (영어)</label>
          <textarea
            value={descEn}
            onChange={(e) => setDescEn(e.target.value)}
            rows={4}
            placeholder="Describe your place for foreigners. Mention nearby subway, amenities, etc."
            className="w-full text-sm leading-relaxed border border-concrete-200 rounded-soft p-3 focus:outline-none focus:border-warm-500 resize-none"
          />
        </div>

        <Button variant="primary" size="lg" full onClick={submit}>
          🏠 매물 등록
        </Button>
      </div>
    </div>
  );
}
