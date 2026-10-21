import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/domain";

interface MemberAvatarListProps {
  profiles: Profile[];
  max?: number;
}

export function MemberAvatarList({ profiles, max = 5 }: MemberAvatarListProps) {
  const visible = profiles.slice(0, max);
  const rest = profiles.length - visible.length;

  return (
    <ul
      className="flex items-center -space-x-2"
      aria-label={`멤버 ${profiles.length}명`}
    >
      {visible.map((p) => (
        <li key={p.id} title={p.display_name}>
          <Avatar className="border-background border-2">
            <AvatarFallback>{p.display_name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="sr-only">{p.display_name}</span>
        </li>
      ))}
      {rest > 0 ? (
        <li>
          <Avatar className="border-background border-2">
            <AvatarFallback>+{rest}</AvatarFallback>
          </Avatar>
        </li>
      ) : null}
    </ul>
  );
}
