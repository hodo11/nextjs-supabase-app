import { Badge } from "@/components/ui/badge";
import type { EventPhase } from "@/lib/event-state";
import { cn } from "@/lib/utils";

const PHASE_LABEL: Record<EventPhase, string> = {
  upcoming: "예정",
  closed: "응답 마감",
  past: "지난 이벤트",
  cancelled: "취소됨",
};

const PHASE_STYLE: Record<EventPhase, string> = {
  upcoming: "",
  closed: "border-amber-500/50 text-amber-700 dark:text-amber-400",
  past: "",
  cancelled: "",
};

const PHASE_VARIANT = {
  upcoming: "default",
  closed: "outline",
  past: "secondary",
  cancelled: "destructive",
} as const;

// 색에만 의존하지 않도록 항상 텍스트 라벨을 함께 표시한다.
export function EventStatusBadge({ phase }: { phase: EventPhase }) {
  return (
    <Badge variant={PHASE_VARIANT[phase]} className={cn(PHASE_STYLE[phase])}>
      {PHASE_LABEL[phase]}
    </Badge>
  );
}
