import Link from "next/link";
import { Suspense } from "react";

import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Link href="/home" className="font-semibold">
              모임 매니저
            </Link>
            <Suspense>
              <AppNav variant="top" />
            </Suspense>
          </div>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>
      <Suspense>
        <AppNav variant="bottom" />
      </Suspense>
      <Toaster position="top-center" />
    </div>
  );
}
