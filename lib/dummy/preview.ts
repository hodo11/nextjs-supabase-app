// 프로토타입 전용: ?as=host|member 로 보는 사람(주최자/참여자)을 바꾼다.
// Phase 2에서 실제 인증 사용자로 교체하면서 이 파일을 제거한다.

export type ViewRole = "host" | "member";

export type PreviewSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

// 주최자 보기 = u1(g1·g2 주최자), 참여자 보기 = u2(g1·g2 멤버)
const VIEWER_IDS: Record<ViewRole, string> = {
  host: "u1",
  member: "u2",
};

export async function resolveViewRole(
  searchParams?: PreviewSearchParams,
): Promise<ViewRole> {
  const params = searchParams ? await searchParams : {};
  const value = Array.isArray(params.as) ? params.as[0] : params.as;
  // 파라미터가 없으면 주최자 보기(프로토타입 기본값), 알 수 없는 값은 최소 권한인 참여자로 처리한다.
  if (value === undefined || value === "host") return "host";
  return "member";
}

export function getViewerId(role: ViewRole): string {
  return VIEWER_IDS[role];
}

// 링크에 보기 전환 파라미터를 유지한다(기본값 host는 생략).
export function withView(href: string, role: ViewRole): string {
  if (role === "host") return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}as=${role}`;
}
