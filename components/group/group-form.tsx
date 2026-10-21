"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { createGroup } from "@/lib/actions/groups";
import { groupSchema, type GroupFormValues } from "@/lib/validations/group";

interface GroupFormProps {
  cancelHref: string;
  redirectHref: string;
}

export function GroupForm({ cancelHref }: GroupFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: GroupFormValues) {
    setIsSubmitting(true);
    const result = await createGroup(values);
    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
    // 성공 시 createGroup 내부에서 모임 상세로 redirect한다.
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>모임 이름</FormLabel>
              <FormControl>
                <Input placeholder="예: 토요 수영 모임" {...field} />
              </FormControl>
              <FormDescription>
                1~50자. 만든 뒤 초대 링크를 카톡방에 공유할 수 있습니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "만드는 중..." : "모임 만들기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => router.push(cancelHref)}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
