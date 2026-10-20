import { cn } from "@/lib/utils";

export interface RsvpCounts {
  going: number;
  not_going: number;
  maybe: number;
  waitlisted: number;
}

const SEGMENTS = [
  { key: "going", label: "참석", bar: "bg-emerald-600" },
  { key: "maybe", label: "미정", bar: "bg-amber-500" },
  { key: "not_going", label: "불참", bar: "bg-slate-400" },
  { key: "waitlisted", label: "대기", bar: "bg-sky-500" },
] as const;

// 집계 바와 텍스트 범례를 함께 보여 준다(색 + 숫자 + 라벨).
export function RsvpSummaryBar({ counts }: { counts: RsvpCounts }) {
  const total = SEGMENTS.reduce((sum, s) => sum + counts[s.key], 0);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`참석 ${counts.going}명, 미정 ${counts.maybe}명, 불참 ${counts.not_going}명, 대기 ${counts.waitlisted}명`}
      >
        {total > 0
          ? SEGMENTS.map((s) =>
              counts[s.key] > 0 ? (
                <div
                  key={s.key}
                  className={cn(s.bar)}
                  style={{ width: `${(counts[s.key] / total) * 100}%` }}
                />
              ) : null,
            )
          : null}
      </div>
      <dl className="grid grid-cols-4 gap-2 text-center">
        {SEGMENTS.map((s) => (
          <div key={s.key}>
            <dt className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <span className={cn("size-2 rounded-full", s.bar)} aria-hidden />
              {s.label}
            </dt>
            <dd className="text-lg font-semibold">{counts[s.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
