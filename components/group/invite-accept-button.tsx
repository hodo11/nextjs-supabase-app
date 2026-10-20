"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface InviteAcceptButtonProps {
  groupName: string;
  redirectHref: string;
}

// 프로토타입: 실제 참여 처리 없이 안내 후 이동한다(로그인 복귀·참여 처리는 Phase 2에서 구현).
export function InviteAcceptButton({
  groupName,
  redirectHref,
}: InviteAcceptButtonProps) {
  const router = useRouter();

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={() => {
        toast.success(`"${groupName}"에 참여했습니다 (프로토타입)`);
        router.push(redirectHref);
      }}
    >
      Google로 로그인하고 참여하기
    </Button>
  );
}
