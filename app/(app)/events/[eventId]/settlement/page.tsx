import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { SettlementPanel } from "@/components/settlement/settlement-panel";
import {
  getEvent,
  getMyRole,
  getRsvps,
  getSettlement,
  getSettlementPayments,
} from "@/lib/dummy/queries";
import { requireUser } from "@/lib/supabase/auth";

async function SettlementPageContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await requireUser(`/events/${eventId}/settlement`);
  const viewerId = user.id;

  const found = await getEvent(eventId);
  if (!found) notFound();
  const { event, phase } = found;

  const [myRole, rsvps, settlement] = await Promise.all([
    getMyRole(event.group_id, viewerId),
    getRsvps(event.id),
    getSettlement(event.id),
  ]);
  if (!myRole) notFound();

  const payments = settlement ? await getSettlementPayments(settlement.id) : [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/events/${event.id}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {event.title}
        </Link>
        <h1 className="text-2xl font-bold">정산</h1>
      </div>
      <SettlementPanel
        eventId={event.id}
        goingProfiles={rsvps
          .filter((r) => r.status === "going")
          .map((r) => r.profile)}
        initialSettlement={
          settlement
            ? {
                id: settlement.id,
                total_amount: settlement.total_amount,
                per_person: settlement.per_person,
                bank_info: settlement.bank_info,
              }
            : null
        }
        initialPayments={payments.map((p) => ({
          user_id: p.user_id,
          profile: p.profile,
          paid: p.paid,
          paid_claimed_at: p.paid_claimed_at,
        }))}
        isHost={myRole === "host"}
        viewerId={viewerId}
        canCreate={phase === "past"}
      />
    </div>
  );
}

export default function SettlementPage(
  props: React.ComponentProps<typeof SettlementPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettlementPageContent {...props} />
    </Suspense>
  );
}
