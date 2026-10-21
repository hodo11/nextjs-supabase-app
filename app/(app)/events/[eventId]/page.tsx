import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  MapPin,
  Pencil,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttendancePanel } from "@/components/event/attendance-panel";
import { EventStatusBadge } from "@/components/event/event-status-badge";
import { RidePanel } from "@/components/event/ride-panel";
import { RsvpPanel } from "@/components/event/rsvp-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getEvent,
  getGroup,
  getMyRole,
  getProfile,
  getRides,
  getRsvps,
  getSettlement,
} from "@/lib/dummy/queries";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/lib/supabase/auth";

async function EventDetailPageContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await requireUser(`/events/${eventId}`);
  const viewerId = user.id;

  const found = await getEvent(eventId);
  if (!found) notFound();
  const { event, phase } = found;

  const [group, myRole, rsvps, viewer, rides, settlement] = await Promise.all([
    getGroup(event.group_id),
    getMyRole(event.group_id, viewerId),
    getRsvps(event.id),
    getProfile(viewerId),
    getRides(event.id),
    getSettlement(event.id),
  ]);
  if (!group || !myRole) notFound();
  const isHost = myRole === "host";

  const reminder = event.reminder_sent_at
    ? `발송됨 (${formatDateTime(event.reminder_sent_at)})`
    : phase === "upcoming" || phase === "closed"
      ? "예정 — 응답 마감 24시간 전에 미응답·미정 멤버에게 발송됩니다"
      : "발송하지 않음";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/groups/${group.id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <EventStatusBadge phase={phase} />
        </div>
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0" aria-hidden />
            {formatDateTime(event.starts_at)}
          </span>
          {event.location ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {event.location}
            </span>
          ) : null}
          <span>
            응답 마감 {formatDateTime(event.rsvp_deadline)}
            {event.capacity
              ? ` · 정원 ${event.capacity}명`
              : " · 정원 제한 없음"}
          </span>
        </div>
        {isHost || phase === "past" ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {isHost && phase !== "past" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}/edit`}>
                  <Pencil />
                  이벤트 수정
                </Link>
              </Button>
            ) : null}
            {phase === "past" ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/events/${event.id}/settlement`}>
                  <Wallet />
                  {settlement
                    ? "정산 보기"
                    : isHost
                      ? "정산 만들기"
                      : "정산 보기"}
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {event.notice ? (
        <Card>
          <CardContent className="flex flex-col gap-1 p-4">
            <h2 className="text-sm font-semibold">공지</h2>
            <p className="whitespace-pre-wrap text-sm">{event.notice}</p>
          </CardContent>
        </Card>
      ) : null}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Bell className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>리마인드 메일: {reminder}</span>
      </p>

      <RsvpPanel
        eventId={event.id}
        initialRsvps={rsvps.map((r) => ({
          user_id: r.user_id,
          status: r.status,
          responded_at: r.responded_at,
          profile: r.profile,
        }))}
        viewer={viewer}
        capacity={event.capacity}
        phase={phase}
      />

      {phase !== "cancelled" ? (
        <RidePanel
          initialRides={rides.map((ride) => ({
            id: ride.id,
            driver_id: ride.driver_id,
            driver: ride.driver,
            origin: ride.origin,
            depart_at: ride.depart_at,
            seats: ride.seats,
            requests: ride.requests.map((q) => ({
              id: q.id,
              user_id: q.user_id,
              status: q.status,
              profile: q.profile,
            })),
          }))}
          viewer={viewer}
          isHost={isHost}
          editable={phase === "upcoming" || phase === "closed"}
          eventStartsAt={event.starts_at}
        />
      ) : null}

      {isHost && phase !== "cancelled" ? (
        <AttendancePanel
          initialEntries={rsvps
            .filter((r) => r.status === "going")
            .map((r) => ({
              user_id: r.user_id,
              profile: r.profile,
              attended: r.attended,
            }))}
          enabled={phase === "past"}
        />
      ) : null}
    </div>
  );
}

export default function EventDetailPage(
  props: React.ComponentProps<typeof EventDetailPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EventDetailPageContent {...props} />
    </Suspense>
  );
}
