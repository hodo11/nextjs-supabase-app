import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { CalendarCheck, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { EventCard } from "@/components/event/event-card";
import { GroupCard } from "@/components/group/group-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import {
  getMyGroups,
  getPendingRsvpTasks,
  getUnpaidSettlementTasks,
} from "@/lib/dummy/queries";
import { formatWon } from "@/lib/format";

async function HomePageContent({
  searchParams,
}: {
  searchParams: PreviewSearchParams;
}) {
  const role = await resolveViewRole(searchParams);
  const viewerId = getViewerId(role);
  const [tasks, groups, unpaid] = await Promise.all([
    getPendingRsvpTasks(viewerId),
    getMyGroups(viewerId),
    getUnpaidSettlementTasks(viewerId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">홈</h1>

      <section className="flex flex-col gap-3" aria-labelledby="todo-heading">
        <h2 id="todo-heading" className="text-lg font-semibold">
          내 할 일
        </h2>
        <h3 className="text-sm font-medium text-muted-foreground">
          응답을 기다리는 이벤트 (마감 임박 순)
        </h3>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="응답할 이벤트가 없습니다"
            description="새 이벤트가 올라오면 여기에 표시됩니다."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tasks.map(({ event, group, phase }) => (
              <li key={event.id}>
                <EventCard
                  event={event}
                  phase={phase}
                  groupName={group.name}
                  href={withView(`/events/${event.id}`, role)}
                />
              </li>
            ))}
          </ul>
        )}
        {unpaid.length > 0 ? (
          <>
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">
              내야 할 정산
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {unpaid.map(({ event, settlement, payment }) => (
                <li key={settlement.id}>
                  <Link
                    href={withView(`/events/${event.id}/settlement`, role)}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatWon(settlement.per_person)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            payment.paid_claimed_at ? "outline" : "secondary"
                          }
                        >
                          {payment.paid_claimed_at ? "확인 대기" : "미납"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="groups-heading">
        <div className="flex items-center justify-between">
          <h2 id="groups-heading" className="text-lg font-semibold">
            최근 모임
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href={withView("/groups", role)}>전체 보기</Link>
          </Button>
        </div>
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="아직 참여한 모임이 없습니다"
            description="모임을 만들거나 초대 링크로 참여해 보세요."
            action={
              <Button asChild size="sm">
                <Link href={withView("/groups/new", role)}>모임 만들기</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {groups.slice(0, 3).map((g) => (
              <li key={g.group.id}>
                <GroupCard
                  group={g.group}
                  role={g.my_role}
                  memberCount={g.member_count}
                  upcomingEventCount={g.upcoming_event_count}
                  href={withView(`/groups/${g.group.id}`, role)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function HomePage(
  props: React.ComponentProps<typeof HomePageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent {...props} />
    </Suspense>
  );
}
