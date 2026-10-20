"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Check, Clock, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatTime, fromDateTimeLocal, toDateTimeLocal } from "@/lib/format";
import type { Profile, RideRequestStatus } from "@/lib/types/domain";
import { rideSchema, type RideFormValues } from "@/lib/validations/ride";

export interface RideRequestEntry {
  id: string;
  user_id: string;
  status: RideRequestStatus;
  profile: Profile;
}

export interface RideEntry {
  id: string;
  driver_id: string;
  driver: Profile;
  origin: string;
  depart_at: string;
  seats: number;
  requests: RideRequestEntry[];
}

interface RidePanelProps {
  initialRides: RideEntry[];
  viewer: Profile;
  isHost: boolean;
  // 이벤트가 진행 가능(예정·응답 마감)일 때만 등록·신청할 수 있다.
  editable: boolean;
  // 새 차량 등록 폼의 기본 출발 시각 기준(이벤트 시작 시각)
  eventStartsAt: string;
}

const REQUEST_LABEL: Record<RideRequestStatus, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

// 색에만 의존하지 않도록 아이콘과 텍스트를 함께 쓴다.
function RequestBadge({ status }: { status: RideRequestStatus }) {
  const Icon =
    status === "approved" ? Check : status === "rejected" ? X : Clock;
  return (
    <Badge
      variant={
        status === "approved"
          ? "default"
          : status === "rejected"
            ? "destructive"
            : "outline"
      }
    >
      <Icon className="mr-1 size-3" aria-hidden />
      {REQUEST_LABEL[status]}
    </Badge>
  );
}

function RideFormDialog({
  trigger,
  title,
  defaultValues,
  onSubmit,
  minSeats = 0,
}: {
  trigger: React.ReactNode;
  title: string;
  defaultValues: RideFormValues;
  onSubmit: (values: RideFormValues) => void;
  // 승인된 탑승자 수 아래로 좌석을 줄일 수 없다(PRD F015: 승인 인원 ≤ 좌석 수).
  minSeats?: number;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<RideFormValues>({
    resolver: zodResolver(rideSchema),
    defaultValues,
  });

  function handleOpenChange(next: boolean) {
    // 닫았다 다시 열 때 이전 입력과 오류가 남지 않도록 초기화한다.
    if (next) form.reset(defaultValues);
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              if (Number(values.seats) < minSeats) {
                form.setError("seats", {
                  message: `승인된 탑승자가 ${minSeats}명이라 좌석을 ${minSeats} 미만으로 줄일 수 없습니다`,
                });
                return;
              }
              onSubmit(values);
              setOpen(false);
            })}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                출발지와 시각, 태울 수 있는 좌석 수(1~8)를 입력해 주세요.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출발지</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 강남역 2번 출구" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="depart_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>출발 시각</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>좌석 수</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// 카풀 영역(로컬 상태만 변경). 운전자·주최자는 신청을 승인/거절하고, 참여자는 탑승을 신청·취소한다.
export function RidePanel({
  initialRides,
  viewer,
  isHost,
  editable,
  eventStartsAt,
}: RidePanelProps) {
  const [rides, setRides] = useState(initialRides);

  const approvedCount = (ride: RideEntry) =>
    ride.requests.filter((r) => r.status === "approved").length;

  function addRide(values: RideFormValues) {
    setRides((prev) => [
      ...prev,
      {
        id: `ride-${crypto.randomUUID()}`,
        driver_id: viewer.id,
        driver: viewer,
        origin: values.origin,
        depart_at: fromDateTimeLocal(values.depart_at),
        seats: Number(values.seats),
        requests: [],
      },
    ]);
    toast.success("차량을 등록했습니다 (프로토타입)");
  }

  function updateRide(rideId: string, values: RideFormValues) {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              origin: values.origin,
              depart_at: fromDateTimeLocal(values.depart_at),
              seats: Number(values.seats),
            }
          : r,
      ),
    );
    toast.success("차량 정보를 수정했습니다 (프로토타입)");
  }

  function deleteRide(rideId: string) {
    setRides((prev) => prev.filter((r) => r.id !== rideId));
    toast.success("차량을 삭제했습니다 (프로토타입)");
  }

  function request(rideId: string) {
    if (hasMyRide) {
      toast.error(
        "차량을 등록한 운전자는 다른 차량에 탑승 신청할 수 없습니다. 먼저 내 차량을 삭제해 주세요.",
      );
      return;
    }
    if (hasActiveRequest) {
      toast.error(
        "이미 다른 차량에 신청했습니다. 기존 신청을 취소한 뒤 다시 신청해 주세요.",
      );
      return;
    }
    // 거절된 신청 기록은 그대로 두고 이 차량에 새로 신청한다.
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              requests: [
                ...r.requests,
                {
                  id: `req-${rideId}-${viewer.id}`,
                  user_id: viewer.id,
                  status: "pending",
                  profile: viewer,
                },
              ],
            }
          : r,
      ),
    );
    toast.success("탑승을 신청했습니다. 운전자가 승인하면 확정됩니다");
  }

  function cancelRequest(rideId: string) {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              requests: r.requests.filter((q) => q.user_id !== viewer.id),
            }
          : r,
      ),
    );
    toast.success("탑승 신청을 취소했습니다");
  }

  function decide(
    rideId: string,
    requestId: string,
    status: "approved" | "rejected",
  ) {
    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              requests: r.requests.map((q) =>
                q.id === requestId ? { ...q, status } : q,
              ),
            }
          : r,
      ),
    );
    toast.success(status === "approved" ? "승인했습니다" : "거절했습니다");
  }

  const hasMyRide = rides.some((r) => r.driver_id === viewer.id);
  // 대기·승인 상태의 신청만 "진행 중"으로 본다. 거절된 신청은 다른 차량에 다시 신청할 수 있다.
  const hasActiveRequest = rides.some((r) =>
    r.requests.some((q) => q.user_id === viewer.id && q.status !== "rejected"),
  );

  return (
    <section className="flex flex-col gap-3" aria-labelledby="ride-heading">
      <div className="flex items-center justify-between">
        <h2 id="ride-heading" className="text-lg font-semibold">
          카풀
        </h2>
        {editable && !hasMyRide ? (
          hasActiveRequest ? (
            // 탑승 신청 중인 사람은 운전자로 등록할 수 없다: 안내 후 막는다.
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast.error(
                  "탑승을 신청한 상태에서는 차량을 등록할 수 없습니다. 먼저 신청을 취소해 주세요.",
                )
              }
            >
              <Car />
              차량 등록
            </Button>
          ) : (
            <RideFormDialog
              trigger={
                <Button size="sm" variant="outline">
                  <Car />
                  차량 등록
                </Button>
              }
              title="차량 등록"
              defaultValues={{
                origin: "",
                depart_at: toDateTimeLocal(eventStartsAt),
                seats: "3",
              }}
              onSubmit={addRide}
            />
          )
        ) : null}
      </div>

      {rides.length === 0 ? (
        <EmptyState
          icon={Car}
          title="등록된 차량이 없습니다"
          description={
            editable
              ? "차가 있다면 '차량 등록'으로 빈 좌석을 공유해 보세요."
              : undefined
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rides.map((ride) => {
            const remaining = ride.seats - approvedCount(ride);
            const mine = ride.requests.find((q) => q.user_id === viewer.id);
            const isDriver = ride.driver_id === viewer.id;
            const canManage = isDriver || isHost;
            const visibleRequests = canManage
              ? ride.requests
              : ride.requests.filter((q) => q.user_id === viewer.id);

            return (
              <li key={ride.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{ride.origin}</p>
                        <p className="text-xs text-muted-foreground">
                          {ride.driver.display_name} 운전 ·{" "}
                          {formatTime(ride.depart_at)} 출발
                        </p>
                      </div>
                      <Badge variant={remaining > 0 ? "secondary" : "outline"}>
                        {remaining > 0 ? `남은 좌석 ${remaining}` : "만석"}
                      </Badge>
                    </div>

                    {visibleRequests.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {visibleRequests.map((q) => (
                          <li
                            key={q.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="truncate">
                              {q.profile.display_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <RequestBadge status={q.status} />
                              {canManage &&
                              editable &&
                              q.status === "pending" ? (
                                <>
                                  <Button
                                    size="sm"
                                    disabled={remaining <= 0}
                                    aria-label={`${q.profile.display_name} 승인`}
                                    onClick={() =>
                                      decide(ride.id, q.id, "approved")
                                    }
                                  >
                                    승인
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    aria-label={`${q.profile.display_name} 거절`}
                                    onClick={() =>
                                      decide(ride.id, q.id, "rejected")
                                    }
                                  >
                                    거절
                                  </Button>
                                </>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {isDriver && editable ? (
                        <RideFormDialog
                          trigger={
                            <Button size="sm" variant="outline">
                              차량 수정
                            </Button>
                          }
                          title="차량 수정"
                          minSeats={approvedCount(ride)}
                          defaultValues={{
                            origin: ride.origin,
                            depart_at: toDateTimeLocal(ride.depart_at),
                            seats: String(ride.seats),
                          }}
                          onSubmit={(values) => updateRide(ride.id, values)}
                        />
                      ) : null}
                      {isDriver && editable ? (
                        <ConfirmDialog
                          trigger={
                            <Button size="sm" variant="outline">
                              차량 삭제
                            </Button>
                          }
                          title="차량을 삭제할까요?"
                          description={
                            approvedCount(ride) > 0
                              ? `승인된 탑승자 ${approvedCount(ride)}명의 탑승이 취소됩니다. 탑승자에게 직접 알려 주세요.`
                              : "등록한 차량과 탑승 신청이 모두 사라집니다."
                          }
                          confirmLabel="삭제"
                          onConfirm={() => deleteRide(ride.id)}
                        />
                      ) : null}
                      {!isDriver && mine && mine.status !== "rejected" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!editable}
                          onClick={() => cancelRequest(ride.id)}
                        >
                          신청 취소
                        </Button>
                      ) : null}
                      {!isDriver && !mine ? (
                        <Button
                          size="sm"
                          disabled={!editable || remaining <= 0}
                          onClick={() => request(ride.id)}
                        >
                          탑승 신청
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
