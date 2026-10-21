"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { renameGroup } from "@/lib/actions/groups";
import { groupSchema, type GroupFormValues } from "@/lib/validations/group";

interface GroupNameEditorProps {
  groupId: string;
  initialName: string;
  canEdit: boolean;
}

// 모임 이름 표시 + 주최자 전용 이름 수정.
export function GroupNameEditor({
  groupId,
  initialName,
  canEdit,
}: GroupNameEditorProps) {
  const [name, setName] = useState(initialName);
  const [open, setOpen] = useState(false);
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: initialName },
  });

  async function onSubmit(values: GroupFormValues) {
    const result = await renameGroup(groupId, values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setName(result.data.name);
    setOpen(false);
    toast.success("모임 이름을 수정했습니다");
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold">{name}</h1>
      {canEdit ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="모임 이름 수정">
              <Pencil />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>모임 이름 수정</DialogTitle>
                  <DialogDescription>1~50자로 입력해 주세요.</DialogDescription>
                </DialogHeader>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모임 이름</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
      ) : null}
    </div>
  );
}
