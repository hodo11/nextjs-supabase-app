import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { GroupForm } from "@/components/group/group-form";
import { requireUser } from "@/lib/supabase/auth";

async function NewGroupPageContent() {
  await requireUser("/groups/new");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <h1 className="text-2xl font-bold">모임 만들기</h1>
      <GroupForm cancelHref="/groups" redirectHref="/groups" />
    </div>
  );
}

export default function NewGroupPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewGroupPageContent />
    </Suspense>
  );
}
