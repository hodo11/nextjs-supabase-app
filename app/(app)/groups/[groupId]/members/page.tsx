import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberList } from "@/components/group/member-list";
import { getGroup, getGroupMembers, getMyRole } from "@/lib/dummy/queries";
import { requireUser } from "@/lib/supabase/auth";

async function MembersPageContent({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const user = await requireUser(`/groups/${groupId}/members`);

  const [group, myRole, members] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, user.id),
    getGroupMembers(groupId),
  ]);
  if (!group || !myRole) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/groups/${group.id}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <h1 className="text-2xl font-bold">멤버 관리</h1>
      </div>
      <MemberList
        groupId={group.id}
        initialMembers={members.map((m) => ({
          user_id: m.user_id,
          role: m.role,
          profile: m.profile,
        }))}
        viewerId={user.id}
        leaveRedirectHref="/groups"
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
