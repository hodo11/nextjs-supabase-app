# Task 007: 타입 생성과 도메인 타입·검증 스키마 정합화

## 개요

Supabase 생성 타입을 도입하고 도메인 타입을 그 별칭으로 교체한다. Server Action 공통 패턴을 확정한다.

- 기능: 전 기능 공통
- 선행: Task 006

## 관련 파일

- `lib/database.types.ts`(신규, `generate_typescript_types` 결과)
- `lib/supabase/server.ts`, `lib/supabase/client.ts`(`Database` 제네릭 적용)
- `lib/types/domain.ts`(생성 타입 별칭으로 교체)
- `lib/actions/types.ts`(신규, `ActionResult<T>`)
- `lib/supabase/auth.ts`(신규, `requireUser()`/`getOptionalUser()`)

## 수락 기준

- [x] `npm run typecheck` 통과
- [x] `Group`/`GroupMember`/`Event`/`Rsvp`가 생성 타입(`Tables<"...">`) 기반
- [x] `lib/validations/*`가 DB 제약과 일치함을 확인(수정 불필요)

## 구현 메모

- `role`/`status` 컬럼은 생성 타입에서 평문 `string`이라(체크 제약은 리터럴로 반영되지 않음) `Omit<Tables<"...">, "role"> & { role: GroupRole }` 패턴으로 좁혔다.
- `Rsvp`에는 DB에 아직 없는 `attended: boolean`을 수기로 얹었다(Phase 5에서 컬럼 추가 전까지 M4 더미 UI와의 타입 호환용 placeholder, 실쿼리는 `false` 채움).
- `requireUser()`는 `getClaims()`의 `sub`를 `id`로 정규화해 반환한다. 비로그인이면 `/auth/login?next=...`로 리다이렉트.
- 타입 재생성 절차: `mcp__supabase__generate_typescript_types` 실행 결과를 `lib/database.types.ts`에 그대로 반영(로컬 Supabase CLI 미연동 상태라 MCP 경로를 공식 절차로 삼는다).
