"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import type { Profile } from "@/lib/types/domain";

export interface AttendanceEntry {
  user_id: string;
  profile: Profile;
  attended: boolean;
}

interface AttendancePanelProps {
  initialEntries: AttendanceEntry[];
  // 이벤트 시작 전에는 출석을 체크할 수 없다.
  enabled: boolean;
}

// 주최자 전용 출석 체크(로컬 상태만 변경).
export function AttendancePanel({
  initialEntries,
  enabled,
}: AttendancePanelProps) {
  const [entries, setEntries] = useState(initialEntries);
  const attendedCount = entries.filter((e) => e.attended).length;

  function toggle(userId: string, attended: boolean) {
    setEntries((prev) =>
      prev.map((e) => (e.user_id === userId ? { ...e, attended } : e)),
    );
    toast.success(attended ? "출석으로 표시했습니다" : "출석을 해제했습니다");
  }

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="attendance-heading"
    >
      <div className="flex items-center justify-between">
        <h2 id="attendance-heading" className="text-lg font-semibold">
          출석 체크
        </h2>
        <span className="text-sm text-muted-foreground">
          {attendedCount} / {entries.length}명
        </span>
      </div>
      {!enabled ? (
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          이벤트가 시작된 뒤에 출석을 체크할 수 있습니다.
        </p>
      ) : null}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          참석(going)으로 응답한 사람이 없습니다.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {entries.map((e) => (
            <li key={e.user_id}>
              <label className="flex items-center gap-3 p-3 text-sm">
                <Checkbox
                  checked={e.attended}
                  disabled={!enabled}
                  onCheckedChange={(checked) =>
                    toggle(e.user_id, checked === true)
                  }
                />
                <span className="flex-1">{e.profile.display_name}</span>
                <span className="text-xs text-muted-foreground">
                  {e.attended ? "출석" : "미체크"}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
