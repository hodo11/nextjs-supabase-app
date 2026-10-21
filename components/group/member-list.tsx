"use client";

import { LogOut, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  demoteFromHost,
  leaveGroup,
  promoteToHost,
  removeMember,
} from "@/lib/actions/members";
import type { GroupRole, Profile } from "@/lib/types/domain";

export interface MemberRow {
  user_id: string;
  role: GroupRole;
  profile: Profile;
}

type PendingAction =
  | { type: "promote" | "demote" | "remove"; member: MemberRow }
  | { type: "leave" };

interface MemberListProps {
  groupId: string;
  initialMembers: MemberRow[];
  viewerId: string;
  leaveRedirectHref: string;
}

const CONFIRM_COPY = {
  promote: {
    title: "주최자로 지정할까요?",
    description:
      "주최자는 이벤트 만들기, 초대 링크 관리, 정산 생성을 할 수 있습니다.",
    label: "지정",
  },
  demote: {
    title: "주최자 권한을 해제할까요?",
    description: "멤버로 돌아가며 주최자 기능을 쓸 수 없게 됩니다.",
    label: "해제",
  },
  remove: {
    title: "멤버를 내보낼까요?",
    description: "이 모임의 이벤트와 응답 내역을 더 이상 볼 수 없게 됩니다.",
    label: "내보내기",
  },
  leave: {
    title: "모임에서 나갈까요?",
    description: "다시 참여하려면 초대 링크가 필요합니다.",
    label: "나가기",
  },
} as const;

// 멤버 관리. 마지막 주최자는 강등·제거·탈퇴할 수 없다(DB 트리거로도 강제).
export function MemberList({
  groupId,
  initialMembers,
  viewerId,
  leaveRedirectHref,
}: MemberListProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hostCount = members.filter((m) => m.role === "host").length;
  const viewer = members.find((m) => m.user_id === viewerId);
  // 서버에서 받은 값이 아니라 현재 목록 기준으로 계산해, 본인을 강등하면 관리 메뉴가 바로 사라진다.
  const isHost = viewer?.role === "host";
  const viewerIsLastHost = viewer?.role === "host" && hostCount === 1;

  async function confirm() {
    if (!pending) return;
    setIsSubmitting(true);

    if (pending.type === "leave") {
      const result = await leaveGroup(groupId);
      if (!result.ok) {
        toast.error(result.error);
        setIsSubmitting(false);
        setPending(null);
        return;
      }
      toast.success("모임에서 나갔습니다");
      router.push(leaveRedirectHref);
      return;
    }

    const { member, type } = pending;
    const result =
      type === "promote"
        ? await promoteToHost(groupId, member.user_id)
        : type === "demote"
          ? await demoteFromHost(groupId, member.user_id)
          : await removeMember(groupId, member.user_id);

    if (!result.ok) {
      toast.error(result.error);
    } else {
      setMembers((prev) =>
        type === "remove"
          ? prev.filter((m) => m.user_id !== member.user_id)
          : prev.map((m) =>
              m.user_id === member.user_id
                ? { ...m, role: type === "promote" ? "host" : "member" }
                : m,
            ),
      );
      toast.success(
        `${member.profile.display_name}님: ${CONFIRM_COPY[type].label} 완료`,
      );
    }
    setIsSubmitting(false);
    setPending(null);
  }

  const copy = pending ? CONFIRM_COPY[pending.type] : null;

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y rounded-lg border">
        {members.map((m) => {
          const isSelf = m.user_id === viewerId;
          const isLastHost = m.role === "host" && hostCount === 1;
          return (
            <li key={m.user_id} className="flex items-center gap-3 p-3">
              <Avatar>
                <AvatarFallback>
                  {m.profile.display_name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.profile.display_name}
                  {isSelf ? (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (나)
                    </span>
                  ) : null}
                </p>
              </div>
              <Badge variant={m.role === "host" ? "default" : "secondary"}>
                {m.role === "host" ? "주최자" : "멤버"}
              </Badge>
              {isHost ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${m.profile.display_name} 관리 메뉴`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {m.role === "member" ? (
                      <DropdownMenuItem
                        onSelect={() =>
                          setPending({ type: "promote", member: m })
                        }
                      >
                        주최자로 지정
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled={isLastHost}
                        onSelect={() =>
                          setPending({ type: "demote", member: m })
                        }
                      >
                        주최자 해제
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      disabled={isLastHost || isSelf}
                      onSelect={() => setPending({ type: "remove", member: m })}
                    >
                      모임에서 내보내기
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </li>
          );
        })}
      </ul>

      {hostCount === 1 && isHost ? (
        <p className="text-xs text-muted-foreground">
          모임에는 주최자가 최소 1명 필요합니다. 다른 멤버를 주최자로 지정하기
          전에는 마지막 주최자를 해제하거나 내보낼 수 없습니다.
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-2">
        <Button
          variant="outline"
          disabled={viewerIsLastHost || isSubmitting}
          onClick={() => setPending({ type: "leave" })}
        >
          <LogOut />
          모임 나가기
        </Button>
        {viewerIsLastHost ? (
          <p className="text-xs text-muted-foreground">
            마지막 주최자는 나갈 수 없습니다. 먼저 다른 멤버를 주최자로 지정해
            주세요.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={copy?.title ?? ""}
        description={
          pending && pending.type !== "leave"
            ? `${pending.member.profile.display_name}님 — ${copy?.description}`
            : copy?.description
        }
        confirmLabel={copy?.label}
        onConfirm={confirm}
      />
    </div>
  );
}
