import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold">유효하지 않은 초대 링크입니다</h1>
      <Button asChild>
        <Link href="/home">홈으로 가기</Link>
      </Button>
    </section>
  );
}
