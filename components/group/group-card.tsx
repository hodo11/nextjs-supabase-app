import { CalendarDays, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Group, GroupRole } from "@/lib/types/domain";

interface GroupCardProps {
  group: Group;
  role: GroupRole;
  memberCount: number;
  upcomingEventCount: number;
  href: string;
}

export function GroupCard({
  group,
  role,
  memberCount,
  upcomingEventCount,
  href,
}: GroupCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">{group.name}</h3>
            <Badge variant={role === "host" ? "default" : "secondary"}>
              {role === "host" ? "주최자" : "멤버"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" aria-hidden />
              멤버 {memberCount}명
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              예정 {upcomingEventCount}건
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
