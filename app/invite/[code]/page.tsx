import { Suspense } from "react";

import { PageSkeleton } from "@/components/page-skeleton";
import { CircleAlert, CircleCheck, Users } from "lucide-react";
import Link from "next/link";

import { InviteAcceptButton } from "@/components/group/invite-accept-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lookupInvite } from "@/lib/dummy/queries";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";

// 더미 초대 코드: swim-2026(이미 멤버), hike-2026(정상), 그 외(무효)
async function InvitePageContent({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { code } = await params;
  const role = await resolveViewRole(searchParams);
  const result = await lookupInvite(code, getViewerId(role));

  if (result.state === "invalid") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CircleAlert className="size-8 text-destructive" aria-hidden />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">유효하지 않은 초대 링크입니다</h1>
            <p className="text-sm text-muted-foreground">
              링크가 만료되었거나 주최자가 재발급했을 수 있습니다. 모임
              주최자에게 새 링크를 요청해 주세요.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={withView("/home", role)}>홈으로 가기</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (result.state === "already_member") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CircleCheck className="size-8 text-emerald-600" aria-hidden />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">이미 참여 중인 모임입니다</h1>
            <p className="text-sm text-muted-foreground">{result.group.name}</p>
          </div>
          <Button asChild>
            <Link href={withView(`/groups/${result.group.id}`, role)}>
              모임으로 이동
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">모임에 초대되었습니다</p>
          <h1 className="text-2xl font-bold">{result.group.name}</h1>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" aria-hidden />
            멤버 {result.member_count}명
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <InviteAcceptButton
            groupName={result.group.name}
            redirectHref={withView("/groups", role)}
          />
          <p className="text-xs text-muted-foreground">
            로그인 후 이 링크로 돌아와 바로 참여됩니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InvitePage(
  props: React.ComponentProps<typeof InvitePageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InvitePageContent {...props} />
    </Suspense>
  );
}
