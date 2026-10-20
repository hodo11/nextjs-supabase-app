import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberList } from "@/components/group/member-list";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import { getGroup, getGroupMembers, getMyRole } from "@/lib/dummy/queries";

async function MembersPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { groupId } = await params;
  const viewRole = await resolveViewRole(searchParams);
  const viewerId = getViewerId(viewRole);

  const [group, myRole, members] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, viewerId),
    getGroupMembers(groupId),
  ]);
  if (!group || !myRole) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={withView(`/groups/${group.id}`, viewRole)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <h1 className="text-2xl font-bold">멤버 관리</h1>
      </div>
      <MemberList
        initialMembers={members.map((m) => ({
          user_id: m.user_id,
          role: m.role,
          profile: m.profile,
        }))}
        viewerId={viewerId}
        leaveRedirectHref={withView("/groups", viewRole)}
      />
    </div>
  );
}

export default function MembersPage(
  props: React.ComponentProps<typeof MembersPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MembersPageContent {...props} />
    </Suspense>
  );
}
