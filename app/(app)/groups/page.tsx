import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { GroupCard } from "@/components/group/group-card";
import { Button } from "@/components/ui/button";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import { getMyGroups } from "@/lib/dummy/queries";

async function GroupsPageContent({
  searchParams,
}: {
  searchParams: PreviewSearchParams;
}) {
  const role = await resolveViewRole(searchParams);
  const groups = await getMyGroups(getViewerId(role));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">모임 목록</h1>
        <Button asChild size="sm">
          <Link href={withView("/groups/new", role)}>
            <Plus />
            모임 만들기
          </Link>
        </Button>
      </div>
      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="참여 중인 모임이 없습니다"
          description="모임을 만들거나 초대 링크로 참여해 보세요."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {groups.map((g) => (
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
    </div>
  );
}

export default function GroupsPage(
  props: React.ComponentProps<typeof GroupsPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <GroupsPageContent {...props} />
    </Suspense>
  );
}
