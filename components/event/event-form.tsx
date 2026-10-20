"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";

const EMPTY_VALUES: EventFormValues = {
  title: "",
  starts_at: "",
  location: "",
  capacity: "",
  rsvp_deadline: "",
  notice: "",
  notify_by_email: true,
};

interface EventFormProps {
  mode: "create" | "edit";
  defaultValues?: EventFormValues;
  cancelHref: string;
  redirectHref: string;
  // 수정 모드에서 이미 취소된 이벤트면 취소 버튼을 숨긴다.
  canCancelEvent?: boolean;
}

export function EventForm({
  mode,
  defaultValues = EMPTY_VALUES,
  cancelHref,
  redirectHref,
  canCancelEvent = false,
}: EventFormProps) {
  const router = useRouter();
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  function onSubmit(values: EventFormValues) {
    // 프로토타입: 저장하지 않고 안내만 표시한다.
    const mail = values.notify_by_email
      ? " 멤버에게 공지 메일을 보냅니다."
      : "";
    toast.success(
      `${mode === "create" ? "이벤트를 만들었습니다" : "이벤트를 수정했습니다"} (프로토타입).${mail}`,
    );
    router.push(redirectHref);
  }

  function cancelEvent() {
    toast.success("이벤트를 취소했습니다 (프로토타입)");
    router.push(redirectHref);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="예: 10월 다섯째 주 토요 수영" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="starts_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 일시</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rsvp_deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>응답 마감 일시</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>장소 (선택)</FormLabel>
                <FormControl>
                  <Input placeholder="예: 잠실 종합운동장 수영장" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>정원 (선택)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="비워 두면 제한 없음"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  정원을 넘으면 대기자로 등록됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>공지 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="준비물, 모이는 곳 등 멤버에게 알릴 내용을 적어 주세요."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notify_by_email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>멤버에게 이메일 발송</FormLabel>
                <FormDescription>
                  저장하면 모임 멤버 전원에게 이벤트 공지 메일을 보냅니다.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">
            {mode === "create" ? "이벤트 만들기" : "저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelHref)}
          >
            취소
          </Button>
          {mode === "edit" && canCancelEvent ? (
            <ConfirmDialog
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  className="sm:ml-auto"
                >
                  이벤트 취소하기
                </Button>
              }
              title="이벤트를 취소할까요?"
              description="취소하면 멤버의 응답이 비활성화되고 이벤트에 '취소됨'이 표시됩니다."
              confirmLabel="이벤트 취소"
              cancelLabel="돌아가기"
              onConfirm={cancelEvent}
            />
          ) : null}
        </div>
      </form>
    </Form>
  );
}
