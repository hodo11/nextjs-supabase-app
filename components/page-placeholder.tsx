import { Construction } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description?: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center">
        <Construction className="size-6" aria-hidden />
        <p className="text-sm font-medium">준비 중입니다</p>
        {description ? <p className="text-xs">{description}</p> : null}
      </div>
    </section>
  );
}
