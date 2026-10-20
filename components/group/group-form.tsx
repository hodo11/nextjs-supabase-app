"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { groupSchema, type GroupFormValues } from "@/lib/validations/group";

interface GroupFormProps {
  cancelHref: string;
  redirectHref: string;
}

export function GroupForm({ cancelHref, redirectHref }: GroupFormProps) {
  const router = useRouter();
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: GroupFormValues) {
    // 프로토타입: 저장하지 않고 안내만 표시한다.
    toast.success(`"${values.name}" 모임을 만들었습니다 (프로토타입)`);
    router.push(redirectHref);
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
          <Button type="submit">모임 만들기</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelHref)}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
