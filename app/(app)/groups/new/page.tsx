import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { GroupForm } from "@/components/group/group-form";
import {
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";

async function NewGroupPageContent({
  searchParams,
}: {
  searchParams: PreviewSearchParams;
}) {
  const role = await resolveViewRole(searchParams);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <h1 className="text-2xl font-bold">모임 만들기</h1>
      <GroupForm
        cancelHref={withView("/groups", role)}
        redirectHref={withView("/groups", role)}
      />
    </div>
  );
}

export default function NewGroupPage(
  props: React.ComponentProps<typeof NewGroupPageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewGroupPageContent {...props} />
    </Suspense>
  );
}
