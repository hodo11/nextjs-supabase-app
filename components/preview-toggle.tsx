"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

// 프로토타입 전용: 주최자/참여자 보기 전환. Phase 2에서 제거한다.
export function PreviewToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("as") === "member" ? "member" : "host";

  function hrefFor(role: "host" | "member") {
    const params = new URLSearchParams(searchParams.toString());
    if (role === "host") params.delete("as");
    else params.set("as", role);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div
      role="group"
      aria-label="프로토타입 보기 전환"
      className="flex items-center rounded-md border p-0.5 text-xs"
    >
      {(
        [
          ["host", "주최자"],
          ["member", "참여자"],
        ] as const
      ).map(([role, label]) => (
        <Link
          key={role}
          href={hrefFor(role)}
          aria-current={current === role ? "true" : undefined}
          className={cn(
            "rounded px-2 py-1",
            current === role
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
