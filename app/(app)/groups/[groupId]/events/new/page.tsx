import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { EventForm } from "@/components/event/event-form";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import { getGroup, getMyRole } from "@/lib/dummy/queries";

async function NewEventPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { groupId } = await params;
  const viewRole = await resolveViewRole(searchParams);
  const [group, myRole] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, getViewerId(viewRole)),
  ]);
  if (!group || !myRole) notFound();

  const groupHref = withView(`/groups/${group.id}`, viewRole);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={groupHref}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <h1 className="text-2xl font-bold">이벤트 만들기</h1>
      </div>
      {myRole === "host" ? (
        <EventForm
          mode="create"
          cancelHref={groupHref}
          redirectHref={groupHref}
        />
      ) : (
        <EmptyState
          title="주최자만 이벤트를 만들 수 있습니다"
          description="이벤트가 필요하면 모임 주최자에게 요청해 주세요."
        />
      )}
    </div>
  );
}

export default function NewEventPage(
  props: React.ComponentProps<typeof NewEventPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewEventPageContent {...props} />
    </Suspense>
  );
}
