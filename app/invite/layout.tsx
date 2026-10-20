import { Toaster } from "@/components/ui/sonner";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      {children}
      <Toaster position="top-center" />
    </main>
  );
}
