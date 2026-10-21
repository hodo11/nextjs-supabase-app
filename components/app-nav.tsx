"use client";

import { Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "홈", icon: Home },
  { href: "/groups", label: "모임 목록", icon: Users },
] as const;

interface AppNavProps {
  variant: "top" | "bottom";
}

export function AppNav({ variant }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주 메뉴"
      className={cn(
        variant === "top"
          ? "hidden items-center gap-1 sm:flex"
          : "bg-background fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t sm:hidden",
      )}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center justify-center gap-2 text-sm transition-colors",
              variant === "top"
                ? "hover:bg-accent rounded-md px-3 py-2"
                : "flex-col gap-1 py-2 text-xs",
              active
                ? "text-foreground font-semibold"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
