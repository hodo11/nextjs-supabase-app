# 개발 가이드라인 (AI Agent 전용)

## 프로젝트 개요

- 제품: 모임 이벤트 관리 웹 MVP (모임 → 초대 링크 → 이벤트 → RSVP → 정산 → 카풀 → 출석)
- 스택: Next.js 16(App Router, `proxy.ts`), React 19, TypeScript strict, Tailwind CSS 3, shadcn/ui(new-york), Supabase(Auth·Postgres·RLS), npm
- 기준 문서: `docs/PRD.md`(요구사항), `docs/ROADMAP.md`(Task 순서·진행 상황). 충돌 시 **실제 코드 구조 > ROADMAP.md > PRD.md > `docs/guides/*`** 순으로 따른다.
- **`docs/guides/*`는 `src/` 구조와 Next.js 15.5.3을 전제로 작성되어 있다. 경로·API를 그대로 복사하지 않는다.**

## 디렉터리 구조

| 경로                                 | 용도                                                           |
| ------------------------------------ | -------------------------------------------------------------- |
| `app/`                               | 라우트 (루트 `app/`, `src/` 없음)                              |
| `app/auth/*`                         | 로그인·가입·콜백 (기존 구현, 수정 시 로그인 흐름 전체 확인)    |
| `app/protected/`                     | 스타터 데모 영역 (ROADMAP Task 008에서 `/home`으로 대체)       |
| `components/ui/`                     | shadcn 컴포넌트 (`npx shadcn@latest add`로만 추가)             |
| `components/`                        | 앱 컴포넌트. 도메인별 하위 폴더 `group/`, `event/` 사용        |
| `lib/supabase/`                      | Supabase 클라이언트·세션 갱신                                  |
| `lib/utils.ts`                       | `cn()`, `getSafeRedirectPath()`, `hasEnvVars`                  |
| `supabase/migrations/`               | SQL 마이그레이션 (타임스탬프 파일명)                           |
| `tasks/`                             | Task 파일 (`XXX-description.md`, 아직 없음, Task 001에서 생성) |
| `.claude/commands`, `.claude/agents` | 슬래시 커맨드·서브에이전트 정의                                |

- 경로 별칭은 `@/*` = 프로젝트 루트. `@/lib/...`, `@/components/...`로 import한다. `@/src/...`는 **금지**.
- `shrimp_data/`는 Shrimp Task Manager 데이터이며 untracked다. **커밋 대상에 넣지 않는다.**

## 코드 표준

- 새 `.md` 파일(README, 서브에이전트, 슬래시 커맨드, 문서)은 **한글**로 작성한다. 코드 블록 안의 코드·경로·식별자는 영어 원문을 유지한다.
- 대화 응답은 한글로 한다.
- 따옴표는 큰따옴표, import는 `@/` 별칭을 쓴다. 서식은 Prettier가 결정한다(`prettier-plugin-tailwindcss`가 `cn`/`cva` 안의 클래스도 정렬).
- 클래스 병합은 `cn()`(`@/lib/utils`)을 쓴다.
- 서버 컴포넌트를 기본으로 하고 상호작용이 필요한 컴포넌트에만 `"use client"`를 붙인다.
- 파일 수정 후 `.claude/hooks/format.mjs`가 Prettier를 자동 적용한다. 수동 포맷 불필요.
- 커밋 전 `npm run check`(lint + typecheck + format:check)를 통과시킨다.

## Supabase 규칙

### 클라이언트 선택

| 사용처                                      | import                                              |
| ------------------------------------------- | --------------------------------------------------- |
| 서버 컴포넌트, Server Action, Route Handler | `createClient` from `@/lib/supabase/server` (async) |
| 클라이언트 컴포넌트                         | `createClient` from `@/lib/supabase/client`         |

- **클라이언트를 전역 변수에 캐시하지 않는다.** 함수 호출마다 새로 생성한다.
- 환경 변수는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 쓴다. `.env`, `.env.local`은 읽기·수정이 deny되어 있다. 새 변수는 `.env.example`에만 추가한다.

### 세션·접근 제어 (`proxy.ts`)

- `proxy.ts`(루트)는 `lib/supabase/proxy.ts`의 `updateSession()`을 호출한다. `middleware.ts`를 만들지 않는다.
- `updateSession()`에서 `createServerClient`와 `supabase.auth.getClaims()` 사이에 코드를 넣지 않는다.
- `updateSession()`은 반환하는 `supabaseResponse`를 그대로 반환한다. 새 응답을 만들면 쿠키를 복사한다.
- 공개 경로 화이트리스트는 `lib/supabase/proxy.ts`의 `if (...)` 조건에 하드코딩되어 있다(`/`, `/login*`, `/auth*`, `/instruments*`). **새 공개 페이지(예: `/invite/[code]`)는 이 조건에 추가한다.**
- `hasEnvVars`가 `false`면 proxy 검사가 통째로 생략되어 모든 화면이 공개된다. 보호 동작을 검증하기 전에 `.env.local` 설정 여부를 확인한다.
- 로그인 후 이동 경로는 `getSafeRedirectPath(next, fallback)`로 검증한다. `next`를 쓰는 모든 경로(`app/auth/callback/route.ts`, `app/auth/confirm/route.ts`, `components/login-form.tsx`, `components/google-sign-in-button.tsx`)에서 이 함수를 거친다. 기본값 `"/protected"`는 ROADMAP Task 008에서 `/home`으로 바꾼다.

### 마이그레이션·RLS

- 마이그레이션은 `supabase/migrations/<YYYYMMDDHHMMSS>_<설명>.sql`로 추가한다. 기존 파일(`20261015000000_create_profiles_table.sql`)을 수정하지 않는다.
- 모든 테이블에 RLS를 켠다. 조회는 같은 모임 멤버, 쓰기는 본인 행 또는 주최자(`host`)다.
- 함수에는 `set search_path = ''`를 지정하고 테이블은 `public.` 접두사로 참조한다. `security definer` 함수는 `anon`·`public` 실행 권한을 회수한다.
- 멤버십 확인은 `public.is_group_member(group_id)`, `public.is_group_host(group_id)` 헬퍼로 한다. 정책 안에서 같은 테이블을 직접 서브쿼리하지 않는다(재귀 방지).
- 정책의 `auth.uid()`는 `(select auth.uid())`로 감싼다.
- 원자성이 필요한 동작(모임 생성 시 host 등록, 초대 가입, RSVP·대기자 승급, 정산 생성, 탑승 승인)은 RPC 또는 트리거로 구현한다.
- 컬럼 단위 권한이 필요한 필드(`settlement_payments.paid`, `paid_claimed_at`, `rsvps.attended`)는 RPC 또는 트리거로 강제한다. RLS만으로 해결하려 하지 않는다.
- DB 변경 Task는 적용 후 Supabase MCP `get_advisors`(security, performance) 경고를 0건으로 만든다.
- 스키마 변경 후 `generate_typescript_types`로 `lib/database.types.ts`를 재생성한다. 수기로 편집하지 않는다.
- `profiles`의 이메일은 같은 모임 멤버에게 노출하지 않는다. 메일 발송용 이메일은 서버에서만 조회한다.

## 기능 구현 규칙

- 데이터 변경은 Server Action, 조회는 서버 컴포넌트에서 한다.
- 폼은 React Hook Form + Zod로 구현하고 스키마는 `lib/validations/<도메인>.ts`에 둔다(`react-hook-form`, `zod`, `@hookform/resolvers`는 아직 미설치. 필요 시 `npm install`로 추가).
- Server Action 결과는 `ActionResult<T>` 공통 타입으로 반환한다. 오류 메시지는 한글로 쓴다.
- 도메인 용어·상태값은 PRD와 동일하게 쓴다: 역할 `host`/`member`, RSVP `going`/`not_going`/`maybe`/`waitlisted`, 이벤트 `active`/`cancelled`, 탑승 `pending`/`approved`/`rejected`.
- 정산 금액: `per_person = ceil(총액 / 인원 / 10) * 10`, 인원은 `going`만 센다.
- 모임의 마지막 `host`는 어떤 경로로도 강등·삭제하지 않는다(DB 트리거 + UI 비활성화).
- 모바일 우선(375px)으로 작성하고 다크 모드에서 읽히는지 확인한다.

## 워크플로우

### Phase 1 (UI 프로토타입) 규칙

- 더미 데이터는 `lib/dummy/*`에만 둔다. 화면은 도메인 타입(`lib/types/domain.ts`)에 맞춰 더미를 소비한다.
- 프로토타입 화면은 DB·인증 연동 없이 `npm run dev`에서 확인 가능해야 한다.
- 주최자/참여자 화면 전환은 `?as=host|member`로 한다. Task 030에서 제거한다.
- Phase 1 단계에서 `/invite` 공개 경로 추가와 `next` 복귀 수정을 하지 않는다. 이는 Task 008이다.
- **Task 005(UI 검토·보완) 이후 사용자 확인 전에는 Phase 2로 넘어가지 않는다.**

### Task 진행

1. `docs/ROADMAP.md`에서 `- 우선순위`가 붙은 Task를 찾는다. 그 Task의 `선행` 줄이 모두 완료됐는지 확인한다.
2. `tasks/XXX-description.md`를 만든다(고수준 명세, 관련 파일, 수락 기준, 구현 단계). API/비즈니스 로직 Task에는 `## 테스트 체크리스트`를 반드시 넣는다.
3. 구현한다. API·비즈니스 로직은 Playwright MCP로 테스트한다.
4. `npm run check` 통과를 확인한다.
5. **각 Task 완료 후 멈추고 사용자 지시를 기다린다.**

## 파일 연동 규칙

| 수정 대상                                           | 함께 수정할 파일                                                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 새 공개 경로 추가                                   | `lib/supabase/proxy.ts` 공개 경로 조건                                                                                                                                         |
| 로그인 후 기본 경로 변경                            | `lib/utils.ts`(`getSafeRedirectPath` fallback), `app/auth/callback/route.ts`, `app/auth/confirm/route.ts`, `components/login-form.tsx`, `components/google-sign-in-button.tsx` |
| DB 스키마 변경                                      | 마이그레이션 SQL → `lib/database.types.ts` 재생성 → `lib/validations/*`, `lib/types/domain.ts` 대조                                                                            |
| Task 추가·순서 변경·완료                            | `docs/ROADMAP.md`의 Task 번호, `선행` 줄, 매핑 표 3개, 상단 `X/Y Tasks`                                                                                                        |
| 요구사항 변경                                       | `docs/PRD.md`, `docs/ROADMAP.md`(PRD 갱신 메모 표)                                                                                                                             |
| 환경 변수 추가                                      | `.env.example`, `CLAUDE.md`                                                                                                                                                    |
| 새 라우트·구조 변경                                 | `CLAUDE.md`의 아키텍처 절                                                                                                                                                      |
| `.claude/commands/docs/update-roadmap.md` 패턴 변경 | `docs/ROADMAP.md`의 "상태 표시 규칙" 절                                                                                                                                        |

- ROADMAP의 체크 형식은 `- [ ]` → `- [x]`이다. `.claude/commands/docs/update-roadmap.md`는 `- ✅ 항목`·`X/12`를 가정하므로 **ROADMAP 갱신 시 ROADMAP의 "상태 표시 규칙"을 우선**한다.
- Task 번호를 바꾸면 `선행` 줄과 매핑 표(기능 ID → Task, 페이지 → 라우트 → Task, 기존 코드 연계 과제 → Task)를 모두 갱신한다.

## AI 의사결정 기준

- 구조가 모호하면: 실제 파일 구조 확인 → `CLAUDE.md` → `docs/ROADMAP.md` 순으로 따른다.
- PRD에 없는 동작이 필요하면: 구현하지 말고 사용자에게 묻는다. PRD 제외 범위(결제 연동, 알림톡·푸시, 비균등 정산, 채팅 등)는 구현하지 않는다.
- 스타터 코드(`app/protected/`, `components/tutorial/`, `components/hero.tsx`, `components/deploy-button.tsx`, `EnvVarWarning`)를 만나면: 새 기능에 재사용하지 않는다. 제거는 해당 Task에서만 한다.
- 새 shadcn 컴포넌트가 필요하면: 직접 작성하지 않고 shadcn MCP 또는 `npx shadcn@latest add`로 추가한다.
- 라이브러리 API가 불확실하면: context7 MCP로 문서를 확인한다.

## 금지 사항

- `.env`, `.env.local`, `package-lock.json`을 직접 읽거나 수정하지 않는다.
- `middleware.ts`를 만들지 않는다. `proxy.ts`를 사용한다.
- `src/` 디렉터리를 만들지 않는다.
- Supabase 클라이언트를 모듈 전역에 캐시하지 않는다.
- `createServerClient`와 `getClaims()` 사이에 코드를 넣지 않는다.
- `next` 파라미터를 `getSafeRedirectPath()` 없이 리디렉션에 쓰지 않는다.
- 기존 마이그레이션 파일을 수정하지 않는다. 새 파일을 추가한다.
- RLS 없는 테이블을 만들지 않는다.
- `lib/database.types.ts`를 수기로 편집하지 않는다.
- `git commit --no-verify` 등 훅을 우회하지 않는다. 훅이 실패하면 원인을 고친다.
- `shrimp_data/`를 커밋하지 않는다.

### 예시

| 하지 말 것                                        | 할 것                                               |
| ------------------------------------------------- | --------------------------------------------------- |
| `const supabase = createClient()`를 파일 최상단에 | 함수 안에서 `const supabase = await createClient()` |
| `router.push(next)`                               | `router.push(getSafeRedirectPath(next, "/home"))`   |
| `/invite` 접근 허용을 페이지 코드에서만 처리      | `lib/supabase/proxy.ts` 공개 경로 조건에도 추가     |
| 정책 안에서 `select ... from group_members` 직접  | `public.is_group_member(group_id)` 호출             |
| `import { x } from "@/src/lib/x"`                 | `import { x } from "@/lib/x"`                       |
