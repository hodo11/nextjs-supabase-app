import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { EventForm } from "@/components/event/event-form";
import { Button } from "@/components/ui/button";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import { getEvent, getMyRole } from "@/lib/dummy/queries";
import { toDateTimeLocal } from "@/lib/format";

async function EditEventPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { eventId } = await params;
  const viewRole = await resolveViewRole(searchParams);
  const found = await getEvent(eventId);
  if (!found) notFound();
  const { event, phase } = found;

  const myRole = await getMyRole(event.group_id, getViewerId(viewRole));
  if (!myRole) notFound();

  const eventHref = withView(`/events/${event.id}`, viewRole);
  // 종료되었거나 취소된 이벤트는 URL로 직접 들어와도 수정할 수 없다.
  const editable = phase === "upcoming" || phase === "closed";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={eventHref}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {event.title}
        </Link>
        <h1 className="text-2xl font-bold">이벤트 수정</h1>
      </div>
      {myRole !== "host" ? (
        <EmptyState
          title="주최자만 이벤트를 수정할 수 있습니다"
          description="수정이 필요하면 모임 주최자에게 요청해 주세요."
        />
      ) : !editable ? (
        <EmptyState
          title={
            phase === "cancelled"
              ? "취소된 이벤트는 수정할 수 없습니다"
              : "종료된 이벤트는 수정할 수 없습니다"
          }
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={eventHref}>이벤트로 돌아가기</Link>
            </Button>
          }
        />
      ) : (
        <EventForm
          mode="edit"
          defaultValues={{
            title: event.title,
            starts_at: toDateTimeLocal(event.starts_at),
            location: event.location ?? "",
            capacity: event.capacity === null ? "" : String(event.capacity),
            rsvp_deadline: toDateTimeLocal(event.rsvp_deadline),
            notice: event.notice ?? "",
            notify_by_email: false,
          }}
          cancelHref={eventHref}
          redirectHref={eventHref}
          canCancelEvent
        />
      )}
    </div>
  );
}

export default function EditEventPage(
  props: React.ComponentProps<typeof EditEventPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditEventPageContent {...props} />
    </Suspense>
  );
}
