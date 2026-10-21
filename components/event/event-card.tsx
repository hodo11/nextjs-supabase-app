import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import { EventStatusBadge } from "@/components/event/event-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import type { EventPhase } from "@/lib/event-state";
import { formatDateTime } from "@/lib/format";
import type { Event, RsvpStatus } from "@/lib/types/domain";

const MY_RSVP_LABEL: Record<RsvpStatus, string> = {
  going: "참석",
  not_going: "불참",
  maybe: "미정",
  waitlisted: "대기",
};

interface EventCardProps {
  event: Event;
  phase: EventPhase;
  href: string;
  goingCount?: number;
  myStatus?: RsvpStatus | null;
  groupName?: string;
}

export function EventCard({
  event,
  phase,
  href,
  goingCount,
  myStatus,
  groupName,
}: EventCardProps) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring block rounded-xl focus-visible:ring-2 focus-visible:outline-hidden"
    >
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {groupName ? (
                <p className="text-muted-foreground truncate text-xs">
                  {groupName}
                </p>
              ) : null}
              <h3 className="truncate font-semibold">{event.title}</h3>
            </div>
            <EventStatusBadge phase={phase} />
          </div>
          <div className="text-muted-foreground flex flex-col gap-1 text-sm">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {formatDateTime(event.starts_at)}
            </span>
            {event.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{event.location}</span>
              </span>
            ) : null}
          </div>
          {goingCount !== undefined || myStatus ? (
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              {goingCount !== undefined ? (
                <span>
                  참석 {goingCount}명
                  {event.capacity ? ` / 정원 ${event.capacity}명` : ""}
                </span>
              ) : (
                <span />
              )}
              {myStatus ? (
                <span className="text-foreground font-medium">
                  내 응답: {MY_RSVP_LABEL[myStatus]}
                </span>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
