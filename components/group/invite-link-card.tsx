"use client";

import { Copy, RefreshCw } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reissueInviteCode } from "@/lib/actions/invites";

interface InviteLinkCardProps {
  groupId: string;
  initialCode: string;
  // 복사는 모든 멤버가 할 수 있고, 재발급은 주최자만 할 수 있다.
  canReissue: boolean;
}

const subscribe = () => () => {};

// 초대 링크 복사(멤버 전체)·재발급(주최자).
export function InviteLinkCard({
  groupId,
  initialCode,
  canReissue,
}: InviteLinkCardProps) {
  const [code, setCode] = useState(initialCode);
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
  const link = `${origin}/invite/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("초대 링크를 복사했습니다");
    } catch {
      toast.error("복사하지 못했습니다. 링크를 직접 선택해 복사해 주세요");
    }
  }

  async function reissue() {
    const result = await reissueInviteCode(groupId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setCode(result.data.code);
    toast.success(
      "초대 코드를 재발급했습니다. 이전 링크는 더 이상 쓸 수 없습니다",
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-sm font-medium">초대 링크</p>
          <p className="text-muted-foreground text-xs">
            카톡방에 붙여 넣으면 누구나 이 링크로 모임에 참여할 수 있습니다.
          </p>
        </div>
        <p className="bg-muted rounded-md px-3 py-2 font-mono text-xs break-all">
          {link}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={copy}>
            <Copy />
            링크 복사
          </Button>
          {canReissue ? (
            <ConfirmDialog
              trigger={
                <Button size="sm" variant="outline">
                  <RefreshCw />
                  재발급
                </Button>
              }
              title="초대 코드를 재발급할까요?"
              description="기존 초대 링크는 즉시 무효가 됩니다. 이미 참여한 멤버에게는 영향이 없습니다."
              confirmLabel="재발급"
              onConfirm={reissue}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
