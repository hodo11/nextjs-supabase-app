import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { CalendarPlus, ClipboardCheck, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event/event-card";
import { GroupNameEditor } from "@/components/group/group-name-editor";
import { InviteLinkCard } from "@/components/group/invite-link-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNow } from "@/lib/dummy/clock";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import {
  getEventsByGroup,
  getGroup,
  getMyRole,
  getRsvps,
} from "@/lib/dummy/queries";

async function GroupDetailPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { groupId } = await params;
  const viewRole = await resolveViewRole(searchParams);
  const viewerId = getViewerId(viewRole);

  const [group, myRole, eventList, now] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, viewerId),
    getEventsByGroup(groupId),
    getNow(),
  ]);
  if (!group || !myRole) notFound();
  const isHost = myRole === "host";

  const rsvpsByEvent = new Map(
    await Promise.all(
      eventList.map(
        async ({ event }) => [event.id, await getRsvps(event.id)] as const,
      ),
    ),
  );

  // 시작 시각이 지난 이벤트(취소 포함)는 "지난" 탭, 나머지는 "예정" 탭
  const isPast = (startsAt: string) => new Date(startsAt) <= now;
  const upcoming = eventList
    .filter(({ event }) => !isPast(event.starts_at))
    .sort(
      (a, b) => Date.parse(a.event.starts_at) - Date.parse(b.event.starts_at),
    );
  const past = eventList.filter(({ event }) => isPast(event.starts_at));

  function renderList(list: typeof eventList, emptyTitle: string) {
    if (list.length === 0) {
      return <EmptyState icon={CalendarPlus} title={emptyTitle} />;
    }
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map(({ event, phase }) => {
          const rsvps = rsvpsByEvent.get(event.id) ?? [];
          return (
            <li key={event.id}>
              <EventCard
                event={event}
                phase={phase}
                href={withView(`/events/${event.id}`, viewRole)}
                goingCount={rsvps.filter((r) => r.status === "going").length}
                myStatus={rsvps.find((r) => r.user_id === viewerId)?.status}
              />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <GroupNameEditor initialName={group.name} canEdit={isHost} />
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={withView(`/groups/${group.id}/members`, viewRole)}>
              <Users />
              멤버
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={withView(`/groups/${group.id}/attendance`, viewRole)}>
              <ClipboardCheck />
              출석 현황
            </Link>
          </Button>
          {isHost ? (
            <Button asChild size="sm">
              <Link href={withView(`/groups/${group.id}/events/new`, viewRole)}>
                <CalendarPlus />
                이벤트 만들기
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <InviteLinkCard initialCode={group.invite_code} canReissue={isHost} />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">예정 {upcoming.length}</TabsTrigger>
          <TabsTrigger value="past">지난 {past.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {renderList(
            upcoming,
            isHost
              ? "예정된 이벤트가 없습니다. 첫 이벤트를 만들어 보세요."
              : "예정된 이벤트가 없습니다",
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {renderList(past, "지난 이벤트가 없습니다")}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function GroupDetailPage(
  props: React.ComponentProps<typeof GroupDetailPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GroupDetailPageContent {...props} />
    </Suspense>
  );
}
