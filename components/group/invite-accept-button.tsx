"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { joinGroupByCode } from "@/lib/actions/invites";

interface InviteAcceptButtonProps {
  code: string;
  isLoggedIn: boolean;
}

export function InviteAcceptButton({
  code,
  isLoggedIn,
}: InviteAcceptButtonProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  if (!isLoggedIn) {
    return (
      <Button
        size="lg"
        className="w-full"
        onClick={() =>
          router.push(
            `/auth/login?next=${encodeURIComponent(`/invite/${code}`)}`,
          )
        }
      >
        로그인하고 참여하기
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isJoining}
      onClick={() => {
        setIsJoining(true);
        void joinGroupByCode(code);
      }}
    >
      {isJoining ? "참여하는 중..." : "모임 참여하기"}
    </Button>
  );
}
