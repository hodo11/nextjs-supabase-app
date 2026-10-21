import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      className="text-muted-foreground flex justify-center py-20"
      role="status"
    >
      <Loader2 className="size-6 animate-spin" aria-label="불러오는 중" />
    </div>
  );
}
