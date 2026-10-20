import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        주소가 잘못되었거나 삭제된 페이지입니다.
      </p>
      <Button asChild>
        <Link href="/home">홈으로 가기</Link>
      </Button>
    </section>
  );
}
