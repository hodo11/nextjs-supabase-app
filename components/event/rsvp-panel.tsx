"use client";

import { Check, CircleHelp, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  RsvpSummaryBar,
  type RsvpCounts,
} from "@/components/event/rsvp-summary-bar";
import { Button } from "@/components/ui/button";
import { setRsvp } from "@/lib/actions/rsvps";
import type { EventPhase } from "@/lib/event-state";
import type { Profile, RsvpStatus } from "@/lib/types/domain";

export interface RsvpEntry {
  user_id: string;
  status: RsvpStatus;
  responded_at: string;
  profile: Profile;
}

interface RsvpPanelProps {
  eventId: string;
  initialRsvps: RsvpEntry[];
  viewer: Profile;
  capacity: number | null;
  phase: EventPhase;
}

type ChoosableStatus = Exclude<RsvpStatus, "waitlisted">;

const CHOICES: {
  status: ChoosableStatus;
  label: string;
  icon: typeof Check;
}[] = [
  { status: "going", label: "참석", icon: Check },
  { status: "maybe", label: "미정", icon: CircleHelp },
  { status: "not_going", label: "불참", icon: X },
];

const GROUP_LABEL: Record<RsvpStatus, string> = {
  going: "참석",
  maybe: "미정",
  not_going: "불참",
  waitlisted: "대기",
};

// 시각 문자열의 형식(+09:00 / Z)이 섞여도 순서가 맞도록 시각 값으로 비교한다.
function byRespondedAt(a: RsvpEntry, b: RsvpEntry) {
  return Date.parse(a.responded_at) - Date.parse(b.responded_at);
}

function countOf(rsvps: RsvpEntry[]): RsvpCounts {
  const counts: RsvpCounts = {
    going: 0,
    not_going: 0,
    maybe: 0,
    waitlisted: 0,
  };
  for (const r of rsvps) counts[r.status] += 1;
  return counts;
}

// 응답 버튼을 누르면 서버(set_rsvp RPC)가 정원 초과 시 대기 처리, 참석 취소 시 대기자 승급까지 처리한다.
export function RsvpPanel({
  eventId,
  initialRsvps,
  viewer,
  capacity,
  phase,
}: RsvpPanelProps) {
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const open = phase === "upcoming";
  const mine = rsvps.find((r) => r.user_id === viewer.id);
  const counts = countOf(rsvps);

  async function choose(status: ChoosableStatus) {
    if (!open || isSubmitting) return;
    // 같은 응답을 다시 눌러도 응답 시각(대기 순번)이 바뀌지 않도록 무시한다.
    if (
      mine?.status === status ||
      (status === "going" && mine?.status === "waitlisted")
    ) {
      return;
    }

    setIsSubmitting(true);
    const previouslyWaitlisted = new Set(
      rsvps.filter((r) => r.status === "waitlisted").map((r) => r.user_id),
    );
    const result = await setRsvp(eventId, status);
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setRsvps(result.data);
    const updated = result.data.find((r) => r.user_id === viewer.id);
    const promoted = result.data.find(
      (r) => r.status === "going" && previouslyWaitlisted.has(r.user_id),
    );
    if (promoted) {
      toast.info(
        `${promoted.profile.display_name}님이 대기에서 참석으로 승급되었습니다`,
      );
    }
    toast.success(
      updated?.status === "waitlisted"
        ? "정원이 가득 차 대기자로 등록되었습니다"
        : `${GROUP_LABEL[updated?.status ?? status]}으로 응답했습니다`,
    );
  }

  const groups = (["going", "maybe", "not_going", "waitlisted"] as const).map(
    (status) => ({
      status,
      entries: rsvps.filter((r) => r.status === status).sort(byRespondedAt),
    }),
  );

  return (
    <section className="flex flex-col gap-4" aria-labelledby="rsvp-heading">
      <h2 id="rsvp-heading" className="text-lg font-semibold">
        참석 여부
      </h2>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {CHOICES.map(({ status, label, icon: Icon }) => {
            const selected =
              mine?.status === status ||
              (status === "going" && mine?.status === "waitlisted");
            return (
              <Button
                key={status}
                variant={selected ? "default" : "outline"}
                disabled={!open || isSubmitting}
                aria-pressed={selected}
                onClick={() => choose(status)}
              >
                <Icon />
                {status === "going" && mine?.status === "waitlisted"
                  ? "대기 중"
                  : label}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground" role="status">
          {!open
            ? phase === "cancelled"
              ? "취소된 이벤트라 응답할 수 없습니다."
              : phase === "closed"
                ? "응답이 마감되었습니다."
                : "이미 종료된 이벤트입니다."
            : mine?.status === "waitlisted"
              ? "정원이 가득 차 대기 중입니다. 자리가 나면 순서대로 참석으로 바뀝니다."
              : mine
                ? "응답을 바꾸려면 다른 버튼을 누르세요."
                : "아직 응답하지 않았습니다."}
        </p>
        {open &&
        capacity !== null &&
        counts.going >= capacity &&
        mine?.status !== "going" ? (
          <p className="text-xs text-muted-foreground">
            정원 {capacity}명이 모두 찼습니다. 지금 참석을 누르면 대기자로
            등록됩니다.
          </p>
        ) : null}
      </div>

      <RsvpSummaryBar counts={counts} />

      <div className="flex flex-col gap-3">
        {groups.map(({ status, entries }) =>
          entries.length > 0 ? (
            <div key={status}>
              <h3 className="text-sm font-medium">
                {GROUP_LABEL[status]} {entries.length}명
              </h3>
              <p className="text-sm text-muted-foreground">
                {entries.map((e) => e.profile.display_name).join(", ")}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}
