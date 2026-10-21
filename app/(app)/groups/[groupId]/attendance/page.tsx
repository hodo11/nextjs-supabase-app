import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/page-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getViewerId,
  resolveViewRole,
  withView,
  type PreviewSearchParams,
} from "@/lib/dummy/preview";
import { getAttendanceStats, getGroup, getMyRole } from "@/lib/dummy/queries";
import { formatRate } from "@/lib/format";

async function AttendancePageContent({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams: PreviewSearchParams;
}) {
  const { groupId } = await params;
  const viewRole = await resolveViewRole(searchParams);
  const viewerId = getViewerId(viewRole);

  const [group, myRole, stats] = await Promise.all([
    getGroup(groupId),
    getMyRole(groupId, viewerId),
    getAttendanceStats(groupId),
  ]);
  if (!group || !myRole) notFound();

  const rate = (row: { attended: number; total: number }) =>
    row.total === 0 ? -1 : row.attended / row.total;

  // 참여자는 본인 행만 볼 수 있다. 출석률 높은 순, 같으면 출석 횟수 순.
  const rows = stats
    .filter((row) => myRole === "host" || row.profile.id === viewerId)
    .sort((a, b) => rate(b) - rate(a) || b.attended - a.attended);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={withView(`/groups/${group.id}`, viewRole)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {group.name}
        </Link>
        <h1 className="text-2xl font-bold">출석 현황</h1>
        <p className="text-muted-foreground text-sm">
          종료된 이벤트 중 참석(going)으로 응답한 횟수 대비 출석 횟수입니다.
          {myRole === "host" ? "" : " 내 기록만 표시됩니다."}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="표시할 출석 기록이 없습니다" />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead className="text-right">출석 횟수</TableHead>
                <TableHead className="text-right">출석률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.profile.id}>
                  <TableCell className="font-medium">
                    {row.profile.display_name}
                    {row.profile.id === viewerId ? (
                      <span className="text-muted-foreground ml-1 text-xs">
                        (나)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.total === 0 ? "-" : `${row.attended} / ${row.total}`}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatRate(row.attended, row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage(
  props: React.ComponentProps<typeof AttendancePageContent>,
) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AttendancePageContent {...props} />
    </Suspense>
  );
}
