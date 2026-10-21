import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <LoginForm next={next} />
    </div>
  );
}

export default function Page(
  props: React.ComponentProps<typeof LoginPageContent>,
) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Suspense>
        <LoginPageContent {...props} />
      </Suspense>
    </div>
  );
}
