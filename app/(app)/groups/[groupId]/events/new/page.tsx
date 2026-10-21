import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { EventForm } from "@/components/event/event-form";
import { getGroup, getMyRole } from "@/lib/dummy/queries";
import { requireUser } from "@/lib/supabase/auth";

async function NewEventPageContent({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await requireUser(`/groups/${groupId}/events/new`);
  const [group, myRole] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, user.id),
  ]);
  if (!group || !myRole) notFound();

  const groupHref = `/groups/${group.id}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={groupHref}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <h1 className="text-2xl font-bold">이벤트 만들기</h1>
      </div>
      {myRole === "host" ? (
        <EventForm
          mode="create"
          groupId={group.id}
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
