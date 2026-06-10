"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  max?: number;
  height?: number;
  showLabels?: boolean;
}

/** 단순 막대 그래프 (SVG) */
export function BarChart({ data, max, height = 120, showLabels = true }: BarChartProps) {
  const m = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / m) * (height - 24);
        const color = d.color || "#f59e0b";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-[10px] font-semibold text-concrete-700">{d.value}</div>
            <div
              className="w-full rounded-t transition-all"
              style={{ height: Math.max(h, 2), background: color }}
            />
            {showLabels && (
              <div className="text-[9px] text-concrete-500 truncate w-full text-center">
                {d.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

/** 스파크라인 (라인) */
export function Sparkline({
  data,
  width = 240,
  height = 50,
  color = "#f59e0b",
  fillColor = "rgba(245, 158, 11, 0.15)",
}: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const fillPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="overflow-visible">
      <path d={fillPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

interface StarBarProps {
  star: number;
  count: number;
  total: number;
}

/** 별점 분포 한 줄 (별 + 막대 + 카운트) */
export function StarBar({ star, count, total }: StarBarProps) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="text-[11px] text-concrete-700 w-12 shrink-0 flex items-center gap-0.5">
        {star} <span className="text-warm-500">★</span>
      </div>
      <div className="flex-1 h-1.5 bg-concrete-100 rounded-pill overflow-hidden">
        <div className="h-full bg-warm-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-concrete-500 w-8 text-right">{count}</div>
    </div>
  );
}

interface TagCloudProps {
  tags: { tag: string; count: number; sentiment: "pos" | "neg" }[];
}

export function TagCloud({ tags }: TagCloudProps) {
  const max = Math.max(...tags.map((t) => t.count), 1);
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => {
        const size = 11 + Math.round((t.count / max) * 4);
        const cls =
          t.sentiment === "pos"
            ? "bg-sage-50 text-sage-700 border-sage-200"
            : "bg-coral-50 text-coral-600 border-coral-100";
        return (
          <span
            key={t.tag}
            className={`px-2.5 py-1 rounded-pill border text-xs font-medium ${cls}`}
            style={{ fontSize: size }}
          >
            {t.sentiment === "pos" ? "+" : "−"} {t.tag} ({t.count})
          </span>
        );
      })}
    </div>
  );
}
