# 모임 이벤트 관리 웹 MVP 개발 로드맵

링크 하나로 공지, 참석 확인, 정산, 카풀, 출석까지 끝내는 모임 운영 도구

**📅 최종 업데이트**: 2026-10-21
**📊 진행 상황**: Phase 2(M1) 구현 완료 (17/30 Tasks 완료)
**📄 기준 문서**: `docs/PRD.md`

## 개요

이 서비스는 수영·헬스·친구 모임의 주최자와, 카톡 링크로 들어오는 참여자를 위한 도구입니다. 카톡방과 엑셀에 흩어져 있던 모임 운영 업무를 링크 하나로 처리하며, 다음 기능을 제공합니다.

- **모임·초대 링크**: 모임을 만들고 초대 링크로 멤버를 자동 가입시킵니다. 역할(`host`/`member`)은 모임마다 따로 부여합니다.
- **이벤트·RSVP·공지**: 이벤트를 만들고 참석/불참/미정 응답을 받습니다. 정원과 대기자를 처리하고 공지·리마인드 메일을 보냅니다.
- **정산(N빵)**: 참석자 기준으로 금액을 균등 분할하고 입금 상태를 확인합니다.
- **카풀**: 운전자 등록, 탑승 신청과 승인을 좌석 수 제한 안에서 처리합니다.
- **출석 이력**: 이벤트 출석을 체크하고 멤버별 출석률을 보여줍니다.

### 현재 코드베이스 상태 (2026-10-20 기준)

- 구현 완료: Supabase 인증(이메일 + Google OAuth), `profiles` 테이블(`auth.users`와 1:1, 본인 행만 RLS 허용), `proxy.ts` → `lib/supabase/proxy.ts`의 `updateSession()` 세션 갱신
- 일부 구현: `app/auth/callback/route.ts`, `app/auth/confirm/route.ts`는 이미 `getSafeRedirectPath()`로 `next`를 검증합니다. 다만 `components/google-sign-in-button.tsx`의 `redirectTo`가 `next=/protected`로 고정되어 있고, 이메일 로그인 폼은 `next`를 읽지 않습니다.
- 미구현: 모임·이벤트 등 도메인 테이블, 도메인 페이지 전체, 이메일 발송, `pg_cron`, `/tasks` 디렉터리

### 기술 스택

- Next.js 16 App Router, React 19, TypeScript(strict)
- Tailwind CSS 3, shadcn/ui(new-york), Lucide React, 모바일 우선 레이아웃
- React Hook Form + Zod
- Supabase(Auth, Postgres, RLS, Cron(`pg_cron`), 필요 시 Edge Function)
- 이메일: Resend(또는 동급 서비스)
- 배포: Vercel
- 구조: 루트 `app/`, `components/`, `lib/` (`src/` 없음), 별칭 `@/*`

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악합니다.
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md`를 업데이트합니다.
   - 우선순위 작업은 마지막으로 완료된 작업 다음에 넣습니다.

2. **작업 생성**
   - 기존 코드베이스를 학습하고 현재 상태를 파악합니다.
   - `/tasks` 디렉터리에 새 작업 파일을 만듭니다(현재 디렉터리가 없으므로 Task 001 착수 시 `tasks/000-sample.md`와 함께 생성).
   - 명명 형식: `XXX-description.md` (예: `001-app-shell.md`, `005-ui-review.md`)
   - 고수준 명세, 관련 파일, 수락 기준, 구현 단계를 포함합니다.
   - **API/비즈니스 로직 작업에는 "## 테스트 체크리스트" 섹션을 반드시 넣습니다(Playwright MCP 테스트 시나리오).**
   - 마지막으로 완료된 작업 파일을 예시로 참고합니다. 예를 들어 현재 작업이 `012`라면 `011`과 `010`을 참고합니다.
   - 완료된 작업 파일은 체크된 박스와 변경 사항 요약을 담고 있습니다. 새 작업 파일은 빈 박스로 시작하고 변경 사항 요약을 넣지 않습니다. 초기 상태 샘플은 `000-sample.md`를 참고합니다.

3. **작업 구현**
   - 작업 파일의 명세를 따릅니다.
   - 기능을 구현합니다.
   - **API 연동과 비즈니스 로직 구현 시 Playwright MCP로 테스트를 수행합니다.**
   - 단계마다 작업 파일의 진행 상황을 업데이트합니다.
   - 구현을 마치면 Playwright MCP로 E2E 테스트를 실행합니다.
   - 테스트 통과를 확인한 뒤 다음 단계로 진행합니다.
   - DB 변경 Task는 마이그레이션 적용 후 Supabase advisor(`get_advisors`: security, performance)를 실행하고 경고를 해소합니다.
   - 커밋 전 `npm run check`(lint + typecheck + format:check)를 통과시킵니다.
   - 각 단계를 마치면 멈추고 추가 지시를 기다립니다. 특히 Task 005(UI 검토·보완) 뒤에는 반드시 사용자 확인을 받은 뒤 Phase 2로 넘어갑니다.

4. **로드맵 업데이트**
   - `/docs:update-roadmap`으로 완료된 Task를 ✅로 표시하고 진행 상황을 갱신합니다.

## 상태 표시 규칙

`/docs:update-roadmap` 커맨드가 아래 패턴을 기준으로 갱신합니다.

| 대상      | 대기/진행                           | 완료                                      |
| --------- | ----------------------------------- | ----------------------------------------- |
| Phase     | `### Phase N: 제목`                 | `### Phase N: 제목 ✅`                    |
| Task      | `- **Task XXX: 작업명** - 우선순위` | `- **Task XXX: 작업명** ✅ - 완료`        |
| Task      | `- **Task XXX: 작업명**` (대기)     | `- **Task XXX: 작업명** ✅ - 완료`        |
| 세부 항목 | `  - [ ] 항목`                      | `  - [x] 항목`                            |
| 참조      | -                                   | 완료 시 `  - See: /tasks/XXX-xxx.md` 추가 |

- `- 우선순위`는 지금 바로 시작할 Task 하나에만 붙입니다.
- 각 Task의 `기능` 줄은 PRD 4장 기능 ID와 우선순위(P0/P1), `선행` 줄은 먼저 끝나야 하는 Task를 뜻합니다. 이 두 줄은 체크 대상이 아닙니다.
- `완료 기준`으로 시작하는 체크 항목이 모두 체크되어야 Task를 완료로 표시합니다.

## 개발 단계

**UI 우선 순서**를 따릅니다. 먼저 Phase 1에서 M1~M4 전 기능의 모든 화면을 더미 데이터로 완성하고, 화면을 검토·보완한 뒤 사용자 확인을 받습니다. 이후 Phase 2~5는 PRD 10장의 마일스톤(M1 → M2 → M3 → M4) 순서대로 기능을 구현합니다. 화면은 이미 있으므로 각 Phase는 **DB 마이그레이션·RLS·타입 → 더미 데이터를 실제 쿼리·Server Action으로 교체 → 통합 테스트** 순서로 진행합니다. 정산·카풀·출석은 이벤트와 RSVP 위에서 동작하므로 Phase 3~5는 Phase 2에 의존합니다.

### Phase 1: UI/UX 프로토타입 (더미 데이터)

> 목표: DB·인증 연동 없이 `npm run dev`에서 M1~M4 핵심 플로우(홈 → 모임 → 이벤트 → RSVP → 정산·카풀·출석)를 모바일·데스크톱으로 훑어볼 수 있다. 이 Phase에서는 Supabase 쿼리, Server Action, 마이그레이션을 작성하지 않습니다.

> `proxy.ts` 영향 메모: `lib/supabase/proxy.ts`의 `updateSession()` 공개 경로(`/`, `/login*`, `/auth*`, `/instruments*`)에 프로토타입 라우트(`/home`, `/groups*`, `/events*`, `/invite*`)를 **추가하지 않습니다.** 프로토타입 화면은 기존 로그인(테스트 계정)으로 접속해 확인하므로 인증 없이 열리지 않습니다. `.env.local`이 비어 `hasEnvVars`가 `false`이면 proxy 검사가 통째로 생략되어 모든 화면이 공개되므로, 검토 전 환경 변수 설정을 확인합니다. `/invite` 공개 경로 추가와 로그인 `next` 복귀는 Task 008에서 처리합니다.

- **Task 001: 앱 셸과 전체 라우트 골격 구축** ✅ - 완료
  - 기능: 전 기능 공통 (F001~F017 페이지 자리 확보)
  - 선행: 없음
  - [x] 로그인 후 영역 공통 레이아웃 `app/(app)/layout.tsx` 생성: 헤더 메뉴(홈, 모임 목록, 로그아웃), 모바일 우선 내비게이션
  - [x] 아래 "페이지·라우트 매핑" 표의 모든 라우트에 빈 `page.tsx` 생성(M1~M4 전 페이지, 미구현 영역은 "준비 중" 표시)
  - [x] 링크 진입 전용 `app/invite/[code]/page.tsx`는 헤더 없는 별도 레이아웃으로 분리
  - [x] 프로토타입 확인용 최소 진입로만 마련: 기존 `/protected` 페이지에 `/home` 링크 추가(로그인 후 기본 경로 변경과 `app/protected/` 정리는 Task 008)
  - [x] `loading.tsx`, `not-found.tsx`, `error.tsx` 기본 골격 추가
  - [x] 완료 기준: 로그인한 사용자가 헤더로 모든 페이지에 이동할 수 있고, 비로그인 상태에서는 프로토타입 라우트가 로그인 페이지로 리디렉션되며, `npm run build`가 통과한다
  - See: /tasks/001-app-shell.md

- **Task 002: 도메인 타입·검증 스키마와 공통 컴포넌트·더미 데이터 준비** ✅ - 완료
  - 기능: 전 기능 공통
  - 선행: 없음 (Task 001과 병렬 가능)
  - [x] PRD 6장 기준 도메인 타입을 수기로 정의 `lib/types/domain.ts` (`Group`, `GroupMember`, `GroupRole`, `Event`, `EventStatus`, `Rsvp`, `RsvpStatus`, `Settlement`, `SettlementPayment`, `Ride`, `RideRequest`, `RideRequestStatus`). Task 007에서 생성 타입의 별칭으로 교체할 수 있도록 필드명은 DB 컬럼명과 동일하게 맞춘다
  - [x] Zod 스키마 `lib/validations/group.ts`, `event.ts`, `rsvp.ts`, `settlement.ts`, `ride.ts` (모임 이름 1~50자, 제목·일시 필수, 마감 < 시작 일시, 정원 > 0, 정산 금액 > 0, 좌석 1~8)
  - [x] shadcn/ui 추가: `form`, `dialog`, `tabs`, `badge`, `avatar`, `textarea`, `select`, `sonner`, `skeleton`, `alert-dialog`, `table`, `checkbox` 등
  - [x] 도메인 공통 컴포넌트 `components/group/*`, `components/event/*`: 모임 카드, 이벤트 카드(예정/지난/취소됨 배지), RSVP 집계 바, 멤버 아바타 목록, 빈 상태, 확인 다이얼로그
  - [x] 날짜·시간·금액 포맷 유틸(`lib/format.ts`, 한국 시간 기준, 원 단위 콤마)
  - [x] 도메인 타입 기반 더미 데이터 `lib/dummy/*.ts`: 모임 2~3개, 역할이 다른 멤버, 예정·마감·종료·취소 이벤트, 정원 초과 대기자, 정산·카풀·출석 샘플
  - [x] 프로토타입 전용 보기 전환: 검색 파라미터(예: `?as=host|member`)로 주최자/참여자 화면을 바꿔 볼 수 있게 하고, 실제 데이터 연동 시 제거할 수 있도록 한곳(`lib/dummy/preview.ts`)에 모은다
  - [x] 완료 기준: `npm run typecheck` 통과, 공통 컴포넌트가 375px 모바일 폭과 데스크톱에서 깨지지 않고, 다크 모드에서 읽을 수 있다
  - See: /tasks/002-domain-foundation.md

- **Task 003: M1 화면 UI 완성 (더미 데이터)** ✅ - 완료
  - 기능: F001, F002, F003, F004, F005, F006, F007, F008, F009, F010 (화면)
  - 선행: Task 001, Task 002
  - [x] 홈(`/home`): 내 할 일 목록(응답 대기 이벤트, 마감 임박 순), 최근 모임, 빈 상태
  - [x] 모임 목록(`/groups`), 모임 만들기(`/groups/new`, React Hook Form + Zod 폼)
  - [x] 모임 상세(`/groups/[groupId]`): 이벤트 탭(예정/지난), 초대 링크 복사·재발급 버튼(주최자), 모임 이름 수정, 멤버·출석 현황 탭 링크, 이벤트 만들기 버튼(주최자만)
  - [x] 멤버 관리(`/groups/[groupId]/members`): 역할 배지, 주최자 지정·해제·제거 메뉴, 마지막 주최자 비활성화와 안내 문구, 본인 탈퇴 버튼
  - [x] 이벤트 만들기·수정(`/groups/[groupId]/events/new`, `/events/[eventId]/edit`): React Hook Form + Zod 폼, 공지 입력, "멤버에게 이메일 발송" 체크박스, 취소 버튼
  - [x] 이벤트 상세(`/events/[eventId]`): RSVP 버튼(클릭 시 로컬 상태로 집계 변화), 참석·불참·미정·대기 집계와 참석자 이름, 대기자 안내 문구, 마감·취소 시 버튼 비활성화, 공지, 리마인드 예정/발송 상태
  - [x] 초대 수락(`/invite/[code]`): 모임 이름 확인, 로그인 유도, 무효 코드 안내(더미 코드별로 정상·무효·이미 멤버 상태 확인)
  - [x] 완료 기준: Playwright MCP로 더미 데이터 기준 M1 화면 플로우(홈 → 모임 → 이벤트 → RSVP 버튼)를 모바일·데스크톱 크기에서 스크린샷으로 확인
  - See: /tasks/003-m1-ui.md

- **Task 004: M2~M4 화면 UI 완성 (정산·카풀·출석, 더미 데이터)** ✅ - 완료
  - 기능: F010, F011, F012, F013, F014, F015, F016, F017 (화면)
  - 선행: Task 001, Task 002 (Task 003과 병렬 가능, 이벤트 상세 영역은 Task 003 이후 합침)
  - [x] 정산 페이지 `/events/[eventId]/settlement`: 주최자 입력 폼(총액·계좌, 참석자 수·1인당 금액 미리보기, 생성 확인 다이얼로그), 주최자 집계(미납·확인대기·완료)와 입금 확인 체크, 정산 메일 재발송 버튼, 참여자 "송금했어요" 표시
  - [x] 이벤트 상세의 "정산" 버튼(종료된 더미 이벤트에서만 노출)
  - [x] 이벤트 상세 카풀 영역: 차량 카드(출발지, 시각, 남은 좌석), 운전자 등록·수정 폼(좌석 1~8), 탑승 신청·취소 버튼, 신청 상태 배지(대기/승인/거절), 승인/거절 버튼(운전자·주최자)
  - [x] 이벤트 상세 출석 영역(주최자): `going` 응답자 체크 목록, 시작 전 비활성화 안내
  - [x] 출석 현황 페이지 `/groups/[groupId]/attendance`: 출석 횟수·출석률 정렬 표, 분모 0이면 "-", 참여자 보기에서는 본인 행만
  - [x] 홈 "내 할 일"에 미납 정산 섹션 추가
  - [x] 완료 기준: Playwright MCP로 더미 데이터 기준 정산·카풀·출석 화면을 주최자·참여자 보기와 모바일·데스크톱 크기에서 스크린샷으로 확인
  - See: /tasks/004-m2-m4-ui.md

- **Task 005: UI 검토·보완 (Playwright MCP 스크린샷 리뷰)** ✅ - 완료
  - 기능: F001~F017 (화면)
  - 선행: Task 003, Task 004
  - [x] Playwright MCP로 모든 라우트를 375px·1280px, 라이트·다크, 주최자·참여자 보기 조합으로 스크린샷 수집
  - [x] 화면별 개선점을 `tasks/005-ui-review.md`에 표로 정리(화면, 문제, 개선안, 반영 여부)
  - [x] 핵심 플로우 점검: 카톡 링크 진입(초대 수락 → 모임 상세 → 이벤트 상세 → RSVP)이 모바일 첫 화면에서 막힘 없이 이어지는지, 주최자 주요 작업(모임 → 이벤트 만들기 → 초대 링크 복사)의 단계 수
  - [x] 접근성 점검: 키보드 포커스 순서, 버튼·폼 라벨, 색 대비, 상태 배지가 색에만 의존하지 않는지
  - [x] 개선점 반영(공통 컴포넌트 우선 수정, 화면별 수정은 그다음)
  - [x] PRD와 어긋나는 보완 사항(페이지 구성, 라우트, 기능 범위 등)은 아래 "PRD 갱신 메모" 표에 기록하고 `docs/PRD.md` 갱신 대상으로 표시
  - [x] 완료 기준: 개선점 목록의 반영 대상이 모두 반영되고, 전체 라우트에서 콘솔 오류 0건, 수정 후 스크린샷이 `tasks/005-ui-review.md`에 첨부되어 있다
  - See: /tasks/005-ui-review.md
  - **테스트 체크리스트 (Playwright MCP)**
    - [x] 헤더 메뉴로 모든 페이지 이동, 깨진 링크 0건
    - [x] 375px에서 가로 스크롤 없음
    - [x] 주최자 보기에서만 주최자 메뉴(초대 코드 재발급, 권한 변경, 이벤트 만들기, 정산 생성, 승인, 출석 체크)가 보인다

> **[사용자 확인 지점]** Task 005가 끝나면 여기서 멈춥니다. 사용자가 `npm run dev`로 화면을 직접 확인하고 추가 보완 요청 또는 PRD 갱신 여부를 결정한 뒤에 Phase 2를 시작합니다.

### Phase 2: M1 모임·이벤트·RSVP·이메일 공지 기능 구현 ✅

> 완료 기준(PRD 10장): 주최자가 모임·이벤트를 만들고 링크로 초대해 참여자가 응답하며, 공지 메일이 발송된다.

#### 2-A. DB 마이그레이션·RLS·타입

- **Task 006: M1 데이터베이스 스키마와 RLS 마이그레이션 작성** ✅ - 완료
  - 기능: F002, F003, F004, F005, F006, F007, F008, F009 (데이터 기반)
  - 선행: Task 005 사용자 확인 (화면과 독립적이므로 기술적으로는 Phase 1과 병렬 가능)
  - [x] `supabase/migrations/<timestamp>_m1_groups_events.sql` 작성: `groups`, `group_members`, `events`, `rsvps`(PRD 6장, `attended` 컬럼은 M4에서 추가)
  - [x] 제약 조건: `groups.name` 1~50자, `invite_code` unique, `group_members.role in ('host','member')`, `events.status in ('active','cancelled')`, `rsvp_deadline < starts_at`, `capacity > 0 or null`, `rsvps.status in ('going','not_going','maybe','waitlisted')`
  - [x] RLS 헬퍼 함수 `public.is_group_member(group_id uuid)`, `public.is_group_host(group_id uuid)` 작성(`security definer`, `set search_path = ''`, `stable`, `anon`·`public` 실행 권한 회수)
  - [x] 모든 테이블 RLS 활성화: 조회는 같은 모임 멤버, 쓰기는 본인 행 또는 주최자. 정책 안의 `auth.uid()`는 `(select auth.uid())`로 감싼다
  - [x] `profiles` select 정책 확장 대신(이메일 노출 위험 재검토 후) `get_group_profiles`/`get_group_member_emails` RPC로 분리해 멤버 이름·이메일 조회 범위를 각각 제한했다(PRD 갱신 메모 참고)
  - [x] 마지막 주최자 보호 트리거: `group_members`의 마지막 `host` 강등·삭제를 DB에서 차단
  - [x] 외래 키·조회용 인덱스(`group_members(user_id)`, `events(group_id, starts_at)`, `rsvps(event_id, status, responded_at)`)
  - [x] 완료 기준: Supabase MCP로 마이그레이션 적용 후 `get_advisors`(security, performance) 경고 0건, 비멤버 계정으로 타 모임 행 조회가 0건임을 SQL로 확인
  - See: /tasks/006-m1-schema-rls.md

- **Task 007: 타입 생성과 도메인 타입·검증 스키마 정합화** ✅ - 완료
  - 기능: 전 기능 공통
  - 선행: Task 006
  - [x] Supabase MCP `generate_typescript_types`로 `lib/database.types.ts` 생성, `lib/supabase/server.ts`·`client.ts`의 클라이언트에 `Database` 제네릭 적용
  - [x] Task 002의 수기 도메인 타입 `lib/types/domain.ts`를 생성 타입 기반 별칭으로 교체(`Group`, `GroupMember`, `GroupRole`, `Event`, `Rsvp`, `RsvpStatus` 등), 더미 데이터 `lib/dummy/*`가 새 타입으로도 컴파일되는지 확인
  - [x] Task 002의 Zod 스키마(`lib/validations/group.ts`, `event.ts`, `rsvp.ts`)를 DB 제약과 대조(수정 불필요 확인)
  - [x] Server Action 공통 결과 타입(`ActionResult<T>`)과 에러 메시지 규칙 정의
  - [x] 타입 재생성 절차 문서화(`lib/database.types.ts` 상단 주석)
  - [x] 완료 기준: `npm run typecheck` 통과, 이후 Task에서 `any` 없이 Supabase 쿼리 결과를 사용할 수 있다
  - See: /tasks/007-types-and-validations.md

#### 2-B. 더미 데이터를 실제 쿼리·Server Action으로 교체

- **Task 008: 로그인 후 원래 링크 복귀와 초대 공개 경로 구현** ✅ - 완료
  - 기능: F001 (P0)
  - 선행: Task 001
  - [x] `lib/supabase/proxy.ts`의 `updateSession()` 공개 경로 조건에 `startsWith("/invite")` 추가(`createServerClient`와 `getClaims()` 사이에는 코드를 넣지 않는다). 다른 프로토타입 라우트는 공개 경로에 넣지 않는다
  - [x] 로그인 후 기본 이동 경로를 `/protected`에서 `/home`으로 변경하고, 스타터 전용 `app/protected/` 정리(`/home`으로 리다이렉트하는 얇은 페이지로 축소)
  - [x] 로그인 페이지가 `next` 검색 파라미터를 읽어 `components/login-form.tsx`(이메일 로그인 후 `router.push`)와 `components/google-sign-in-button.tsx`(`redirectTo`의 `next`)에 전달
  - [x] 회원가입·이메일 확인 경로(`emailRedirectTo` → `app/auth/confirm/route.ts`)에서도 `next` 보존
  - [x] 모든 경로에서 기존 `getSafeRedirectPath()`로 `/`로 시작하는 내부 경로만 허용(`//`, `/\`, 절대 URL 차단)
  - [x] 미인증 리디렉션 시 원래 경로를 `next`로 붙여 `/auth/login?next=...`로 이동
  - [x] 완료 기준: 비로그인으로 `/invite/[code]` 접속 → 로그인(Google·이메일) → 초대 수락 페이지로 돌아온다. `next=https://evil.com`은 `/home`으로 대체된다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 비로그인 `/invite/abc` 접속 시 로그인 페이지로 이동하고 URL에 `next=/invite/abc`가 포함된다(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [ ] 이메일 로그인 후 `/invite/abc`로 복귀한다
    - [ ] `next` 없이 로그인하면 `/home`으로 이동한다
    - [ ] 외부 URL·프로토콜 상대 경로 `next`가 무시된다
  - See: /tasks/008-auth-redirect-and-invite-public-route.md

- **Task 009: 모임 생성·수정·목록 기능 구현** ✅ - 완료
  - 기능: F002 (P0)
  - 선행: Task 006, Task 007, Task 003
  - [x] 모임 생성 Server Action: Zod 검증 → `groups` insert(`owner_id = auth.uid()`) → 생성자를 `host`로 `group_members` 등록. 원자성을 위해 `create_group(name)` RPC로 처리
  - [x] `invite_code` 생성 규칙(추측하기 어려운 랜덤 문자열, 충돌 시 재시도)
  - [x] 모임 목록 서버 컴포넌트 조회(내가 속한 모임과 내 역할)
  - [x] 모임 이름 수정(주최자만, RLS + UI 권한 분기, 프로토타입 보기 전환 대신 실제 역할 사용)
  - [x] 더미 데이터를 실제 쿼리로 교체(`/groups`, `/groups/new`, `/groups/[groupId]` 헤더)
  - [x] 완료 기준: 이름 1~50자만 생성되고, 생성 직후 생성자가 `host`로 등록되며 초대 코드가 발급된다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 모임 생성 → 목록과 상세에 표시, 역할 배지 `host`(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [ ] 빈 이름·51자 이름 제출 시 오류 메시지
    - [x] `member` 계정에서는 이름 수정 UI가 보이지 않고 직접 호출해도 RLS로 거부된다(SQL 세션 시뮬레이션으로 확인)
  - See: /tasks/009-group-crud.md

- **Task 010: 초대 링크 가입과 코드 재발급 구현** ✅ - 완료
  - 기능: F003 (P0), F001 (P0)
  - 선행: Task 008, Task 009
  - [x] 비멤버가 모임 이름을 볼 수 있도록 `get_group_preview(code)` RPC(`security definer`, 이름·멤버 수만 반환, `anon`도 호출 가능)
  - [x] `join_group_by_code(code)` RPC: 유효하면 `member`로 등록, 이미 멤버면 가입 생략 후 group_id 반환
  - [x] 초대 수락 페이지의 더미 상태를 실제 흐름으로 교체: 비로그인도 미리보기 표시 → 로그인 전이면 "로그인하고 참여하기" → 로그인 후 자동 가입 → 모임 상세로 이동
  - [x] 무효 코드: 오류 안내 후 홈으로 이동하는 분기
  - [x] 초대 코드 재발급 Server Action(주최자만), 이전 코드 즉시 무효
  - [x] 초대 링크 복사 버튼과 OG 메타데이터(`generateMetadata`로 모임 이름 미리보기)
  - [x] 완료 기준: 유효 코드로 `member` 가입, 재가입 시 중복 행이 생기지 않고, 재발급된 이전 코드는 무효 안내가 뜬다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 신규 계정으로 초대 링크 접속 → 로그인 → 자동 가입 → 모임 상세 진입(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [ ] 이미 멤버인 계정으로 재접속 시 바로 모임 상세로 이동
    - [ ] 재발급 후 이전 링크 접속 시 오류 안내 → 홈 이동
    - [ ] 존재하지 않는 코드 접속 시 무효 안내
  - See: /tasks/010-invite-join-and-reissue.md

- **Task 011: 멤버 목록과 권한 관리 구현** ✅ - 완료
  - 기능: F004 (P1)
  - 선행: Task 010
  - [x] 멤버 목록 조회(프로필 이름·아바타, 역할, 가입일)로 더미 데이터 교체, 모든 멤버가 조회 가능
  - [x] 주최자 지정·해제, 멤버 제거 Server Action(주최자만)
  - [x] 마지막 주최자 강등·제거·탈퇴 차단(DB 트리거 + UI 비활성화 + 안내 문구)
  - [x] 본인 모임 탈퇴(마지막 주최자 제외)
  - [x] 완료 기준: 주최자만 권한을 바꿀 수 있고 마지막 주최자는 어떤 경로로도 변경되지 않는다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 주최자가 멤버를 `host`로 지정 → 해당 멤버에게 주최자 메뉴 노출(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [x] 마지막 주최자 강등 시도 시 거부 메시지(SQL 세션 시뮬레이션으로 확인)
    - [x] `member` 계정의 권한 변경 직접 호출이 거부된다(SQL 세션 시뮬레이션으로 확인)
  - See: /tasks/011-member-management.md

- **Task 012: 이벤트 생성·수정·취소와 목록 구현** ✅ - 완료
  - 기능: F005 (P0)
  - 선행: Task 009
  - [x] 이벤트 생성·수정 Server Action: 제목·일시 필수, `rsvp_deadline < starts_at`, 정원 미입력 시 무제한
  - [x] 이벤트 취소(`status = 'cancelled'`): 목록에 "취소됨" 표시, RSVP 차단(실제 차단은 Task 013 RPC)
  - [x] 모임 상세 이벤트 탭: 예정/지난 이벤트 구분 조회로 더미 데이터 교체
  - [x] 이벤트 만들기 버튼은 주최자에게만 노출, 쓰기는 RLS로 주최자만 허용
  - [x] 완료 기준: 잘못된 마감 일시는 저장되지 않고, 취소된 이벤트는 RSVP가 막힌다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 이벤트 생성 → 모임 상세 예정 목록에 표시(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [ ] 마감 일시가 시작 일시 이후일 때 폼 오류
    - [ ] 취소 후 목록 "취소됨" 배지, 상세에서 RSVP 버튼 비활성화
  - See: /tasks/012-event-crud.md

- **Task 013: RSVP와 정원·대기자 처리 구현** ✅ - 완료
  - 기능: F007 (P0), F008 (P1)
  - 선행: Task 012
  - [x] `set_rsvp(event_id, status)` RPC: 마감·취소 검사, 정원 초과 시 `going` → `waitlisted`, 이벤트 행 잠금(`for update`)으로 동시 응답 경합 방지
  - [x] 참석자가 불참/미정으로 바꾸면 `responded_at`이 가장 빠른 대기자를 `going`으로 승급
  - [x] 주최자의 마감 후 수동 RSVP 변경
  - [x] 이벤트 상세의 로컬 상태 RSVP를 실제 RPC 호출로 교체: 참석·불참·미정·대기 인원수와 참석자 이름 표시, 대기자 등록 시 안내 문구
  - [x] 응답 후 `revalidatePath`로 집계 갱신
  - [x] 완료 기준: 정원 N명일 때 N+1번째 참석 응답은 대기자가 되고, 참석 취소 시 첫 대기자가 자동 승급한다(SQL 세션 시뮬레이션으로 재현 확인)
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 응답 변경(참석 → 미정 → 불참) 시 집계가 즉시 바뀐다(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [x] 정원 1 이벤트에서 두 번째 계정 참석 → 대기 안내, 첫 계정 불참 → 두 번째 계정 `going`(SQL 세션 시뮬레이션으로 확인)
    - [ ] 마감 이후 참여자 RSVP 버튼 비활성화, 주최자는 수동 변경 가능
    - [x] 비멤버가 RPC를 호출하면 거부된다(SQL 세션 시뮬레이션으로 확인)
  - See: /tasks/013-rsvp-capacity-waitlist.md

- **Task 014: 이메일 발송 기반과 공지 메일 구현** ✅ - 완료(코드 완성, 실제 발송 검증은 Task 017에서 키 발급 후)
  - 기능: F006 (P0)
  - 선행: Task 012
  - [x] 이메일 서비스(Resend) 연동 모듈 `lib/email/` 작성, 환경 변수 `RESEND_API_KEY`, `EMAIL_FROM`을 `.env.example`에 추가
  - [x] 메일 템플릿(공지, 이후 리마인드·정산 재사용) 작성, 이벤트 상세 링크 포함
  - [x] 공지 저장(이벤트 생성·수정 Server Action에 통합): "멤버에게 이메일 발송" 선택 시 해당 모임 전체 멤버에게 발송(수신자 이메일은 주최자 전용 RPC로 서버에서만 조회)
  - [x] 발송 실패 시 공지 저장은 유지하고 서버 로그로 실패 사유를 남긴다
  - [x] 공지는 이벤트 상세에 항상 표시(실제 `events.notice`)
  - [ ] 발신 도메인 SPF·DKIM 설정 — **Resend API 키 발급 후 Task 017에서 진행**
  - [x] 완료 기준(코드 범위): 발송 선택 시 모임 전체 멤버 수신, 미선택 시 발송 안 함, 실패 시 공지는 저장되고 오류만 로그
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 발송 선택 시 발송 API 호출 1회, 수신자 수 = 모임 멤버 수 — **Resend 키 발급 후 실제 발송 검증 필요**
    - [x] 발송 미선택 시 메일이 나가지 않는다(코드 분기로 보장)
    - [x] 발송 실패를 흉내 냈을 때 공지는 저장되고 실패가 로그로 남는다(RESEND_API_KEY 미설정 상태 자체가 이 경로를 검증)
  - See: /tasks/014-email-notice.md

- **Task 015: 응답 마감 리마인드 메일 구현** ✅ - 완료
  - 기능: F009 (P1)
  - 선행: Task 013, Task 014
  - [x] 리마인드 발송 엔드포인트(Route Handler `app/api/cron/reminders/route.ts`), 공유 비밀값으로 호출 인증
  - [x] `pg_cron`(+ `pg_net`) 작업 마이그레이션: 15분마다 마감 24시간 이내·`reminder_sent_at is null`·`active` 이벤트를 찾아 엔드포인트 호출(이 프로젝트에서 두 확장 모두 활성화 성공, Vercel Cron 대안 불필요)
  - [x] 대상은 미응답·`maybe` 멤버만, 발송 후 `reminder_sent_at` 기록으로 중복 방지
  - [x] 이벤트 상세 리마인드 예정/발송 시각 표시를 실제 값으로 교체(Task 012에서 이미 실데이터 연결됨)
  - [x] 완료 기준: 마감 24시간 전 1회만 발송되고 이미 응답한 멤버에게는 가지 않는다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 마감이 23시간 남은 이벤트로 엔드포인트를 수동 호출 → 미응답·미정 멤버만 발송, `reminder_sent_at` 기록 — **배포 후(`cron_app_base_url` 갱신, Resend 키 발급) 실제 발송까지 검증 필요**
    - [ ] 같은 엔드포인트 재호출 시 재발송되지 않는다
    - [x] 비밀값 없이 호출하면 401(코드 분기로 보장)
    - [x] 이벤트 상세에 리마인드 상태가 표시된다
  - See: /tasks/015-reminder-cron.md

- **Task 016: 홈 "내 할 일" 요약 구현** ✅ - 완료
  - 기능: F010 (P1)
  - 선행: Task 013
  - [x] 내가 속한 모임들에서 응답하지 않은 예정 이벤트 조회(마감 임박 순)로 더미 데이터 교체, 상단에 표시
  - [x] 최근 모임 목록(Task 009에서 이미 실데이터)
  - [x] M2 미납 정산 섹션은 더미 상태로 유지하고 Task 021에서 실제 데이터로 연결
  - [x] 빈 상태(할 일 없음) UI(Phase 1 구현 재사용)
  - [x] 완료 기준: RSVP하지 않은 이벤트만 나열되고, 응답하면 목록에서 사라진다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 미응답 이벤트가 홈에 표시 → 클릭 시 이벤트 상세 이동(실제 로그인 계정 필요, Task 017에서 사람과 함께 진행)
    - [ ] 응답 후 홈에서 사라진다
    - [ ] 취소된 이벤트와 지난 이벤트는 표시되지 않는다
  - See: /tasks/016-home-todo.md

#### 2-C. 통합 테스트

- **Task 017: M1 통합 테스트와 RLS 점검 및 배포**
  - 기능: F001~F010
  - 선행: Task 008 ~ Task 016
  - [ ] Playwright MCP 전체 플로우: 주최자 Google/이메일 로그인 → 모임 생성 → 이벤트 생성 + 공지 메일 → 초대 링크 공유 → 참여자 로그인 복귀·자동 가입 → RSVP — **미실행(실제 로그인 계정 필요, 사람과 함께 진행)**
  - [x] 분기점: 무효 초대 코드, 정원 초과 대기, 마감 후 RSVP 차단, 취소 이벤트 — SQL 세션 시뮬레이션(JWT claims 주입)으로 재현 확인
  - [x] 비멤버 계정으로 모든 M1 테이블·RPC 접근 수동 테스트(데이터 노출 0건) — SQL 세션 시뮬레이션으로 확인
  - [x] Supabase advisor 점검(security, performance) 경고 해소(의도된 RPC 노출·INFO 수준 외 없음)
  - [x] M1 화면에 `lib/dummy` 참조와 프로토타입 보기 전환(`?as=`)이 남아 있지 않은지 확인(M2~M4 영역 제외) — grep으로 확인
  - [ ] 모바일(375px) 레이아웃 점검, 콘솔 오류 0건 — **미실행(브라우저 E2E 필요)**
  - [ ] Vercel 배포, 환경 변수·Supabase Auth 리디렉션 URL·Resend 도메인 설정 — **미실행(외부 서비스 반영은 사용자 승인 필요)**
  - [ ] 완료 기준: PRD M1 완료 기준을 프로덕션 환경에서 재현한다 — **배포 전까지는 보류**
  - See: /tasks/017-m1-integration-and-deploy.md

### Phase 3: M2 정산 기능 구현

> 완료 기준(PRD 10장): 이벤트 종료 후 N빵 금액 안내와 입금 확인까지 앱에서 끝난다.

#### 3-A. DB 마이그레이션·RLS·타입

- **Task 018: 정산 스키마·RLS·타입 구축**
  - 기능: F011, F012, F013 (데이터 기반)
  - 선행: Phase 2 완료
  - [ ] `supabase/migrations/<timestamp>_m2_settlements.sql`: `settlements`(`event_id` unique, 금액 > 0), `settlement_payments`(PK: `settlement_id, user_id`)
  - [ ] RLS: 조회는 모임 멤버, 생성·`paid` 확정은 주최자, 참여자는 본인 `paid_claimed_at`만 변경(컬럼 단위 제한은 RPC 또는 트리거로 강제)
  - [ ] 타입 재생성(`lib/database.types.ts`), `Settlement`·`SettlementPayment` 도메인 타입을 생성 타입 별칭으로 교체, Task 002의 `lib/validations/settlement.ts`를 DB 제약과 대조
  - [ ] 완료 기준: advisor 경고 0건, `npm run typecheck` 통과

#### 3-B. 더미 데이터를 실제 쿼리·Server Action으로 교체

- **Task 019: 정산 생성(N빵) 구현**
  - 기능: F011 (P0)
  - 선행: Task 018
  - [ ] `create_settlement(event_id, total_amount, bank_info)` RPC: 주최자·이벤트 종료 검사, `going` 인원 0명이면 거부, 이벤트당 1건
  - [ ] `per_person = ceil(총액 / 인원 / 10) * 10` 계산, 생성 시점의 `going` 명단으로 `settlement_payments` 행 고정
  - [ ] 생성 전 참석자 수·1인당 금액 미리보기와 확인 다이얼로그를 실제 데이터로 연결
  - [ ] 이벤트 상세 "정산" 버튼 노출 조건을 실제 이벤트 종료 여부로 교체, 정산 페이지 더미 데이터를 실제 조회로 교체
  - [ ] 완료 기준: 30,001원 / 3명 → 10,010원이 저장되고, 같은 이벤트에 두 번째 정산은 생성되지 않는다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 금액 계산 경계값(나누어떨어짐, 10원 단위 올림)
    - [ ] 참석자 0명 이벤트에서 생성 거부
    - [ ] 이벤트 종료 전·`member` 계정의 생성 시도 거부
    - [ ] 생성 후 참석 응답이 바뀌어도 납부 대상 명단이 유지된다

- **Task 020: 정산 요청 이메일 구현**
  - 기능: F012 (P1)
  - 선행: Task 019, Task 014
  - [ ] 정산 생성 직후 `going` 참석자에게만 발송(금액, 계좌 정보, 정산 페이지 링크)
  - [ ] 발송 실패 시 정산은 유지하고 주최자에게 재발송 버튼 제공(Task 004의 버튼을 실제 동작으로 연결)
  - [ ] 완료 기준: 납부 대상자 전원이 메일을 받고, 불참·미정·대기 멤버는 받지 않는다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 수신자 목록 = `settlement_payments` 대상자
    - [ ] 메일 본문에 금액·계좌·링크 포함
    - [ ] 재발송 버튼 동작

- **Task 021: 입금 상태 체크와 홈 미납 정산 연동**
  - 기능: F013 (P0), F010 (P1, M2 확장)
  - 선행: Task 019, Task 016
  - [ ] 참여자 "송금했어요" Server Action: 본인 `paid_claimed_at`만 설정·취소
  - [ ] 주최자 입금 확인(`paid`) 체크·해제
  - [ ] 주최자 집계: 미납·확인대기·완료 건수
  - [ ] 홈 "내 할 일"의 미납 정산 섹션을 실제 데이터로 교체
  - [ ] 완료 기준: 참여자는 `paid`를 바꿀 수 없고, 주최자 집계가 상태 변화에 맞게 갱신된다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 참여자 송금 표시 → 주최자 화면 "확인대기" 증가
    - [ ] 주최자 입금 확인 → "완료" 증가, 참여자 홈에서 미납 항목 사라짐
    - [ ] 참여자가 타인 행 또는 `paid` 직접 변경 시 거부

#### 3-C. 통합 테스트

- **Task 022: M2 통합 테스트와 RLS 점검**
  - 기능: F010~F013
  - 선행: Task 019 ~ Task 021
  - [ ] Playwright MCP 플로우: 이벤트 종료 → 정산 생성 → 메일 → 송금 표시 → 입금 확인 → 전원 완료
  - [ ] 비멤버·비대상자 접근 테스트, advisor 점검
  - [ ] 정산 화면과 홈 미납 섹션에 `lib/dummy` 참조가 남아 있지 않은지 확인
  - [ ] 정산 완료 소요 시간 지표 측정 방법(생성 시각 ~ 마지막 `paid` 시각) 확보
  - [ ] 완료 기준: PRD M2 완료 기준을 프로덕션 환경에서 재현한다

### Phase 4: M3 카풀 기능 구현

> 완료 기준(PRD 10장): 운전자 등록, 탑승 신청·승인이 좌석 수 제한과 함께 동작한다.

#### 4-A. DB 마이그레이션·RLS·타입

- **Task 023: 카풀 스키마·RLS·타입 구축**
  - 기능: F014, F015 (데이터 기반)
  - 선행: Phase 3 완료 (기술적으로는 Phase 2만 필요)
  - [ ] `supabase/migrations/<timestamp>_m3_rides.sql`: `rides`(`seats` 1~8, `unique(event_id, driver_id)`), `ride_requests`(`status in ('pending','approved','rejected')`, `unique(ride_id, user_id)`)
  - [ ] RLS: 조회는 모임 멤버, `rides` 쓰기는 본인 운전자, `ride_requests` 신청은 본인, 승인·거절은 운전자 또는 주최자
  - [ ] 타입 재생성, `Ride`·`RideRequest` 도메인 타입을 생성 타입 별칭으로 교체, Task 002의 `lib/validations/ride.ts`를 DB 제약과 대조
  - [ ] 완료 기준: advisor 경고 0건, `npm run typecheck` 통과

#### 4-B. 더미 데이터를 실제 쿼리·Server Action으로 교체

- **Task 024: 운전자 등록 구현**
  - 기능: F014 (P1)
  - 선행: Task 023
  - [ ] 운전자 등록·수정·삭제 Server Action(출발지, 출발 시각, 좌석 수 1~8)
  - [ ] 같은 이벤트에 운전자 1인당 1건, 본인 등록건만 수정·삭제
  - [ ] 좌석 수를 승인 인원보다 적게 줄이는 수정 차단
  - [ ] 카풀 영역 차량 카드의 더미 데이터를 실제 조회로 교체
  - [ ] 완료 기준: 중복 등록과 타인 차량 수정이 거부된다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 등록 → 카풀 영역에 차량 표시
    - [ ] 좌석 0·9 입력 시 오류
    - [ ] 같은 이벤트 두 번째 등록 거부, 타인 계정의 수정·삭제 거부

- **Task 025: 탑승 신청·승인 구현**
  - 기능: F015 (P1)
  - 선행: Task 024
  - [ ] 탑승 신청·취소 Server Action, 신청자는 대기/승인/거절 상태 확인
  - [ ] `decide_ride_request(request_id, approve)` RPC: 운전자 또는 주최자만, 차량 행 잠금 후 승인 인원 ≤ 좌석 수 검사
  - [ ] 한 이벤트에서 사용자당 승인된 탑승 1건 제한(다른 차량 승인 시 거부)
  - [ ] 신청 상태 배지·승인/거절 버튼을 실제 데이터와 권한으로 연결
  - [ ] 완료 기준: 승인 인원이 좌석 수를 넘지 않고, 한 사용자가 두 차량에 동시에 승인되지 않는다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 신청 → 운전자 승인 → 신청자 화면 "승인" 표시
    - [ ] 좌석 1 차량에 두 번째 승인 시도 거부
    - [ ] 이미 승인된 사용자의 다른 차량 승인 거부
    - [ ] 주최자 승인·거절 가능, 일반 멤버는 불가

#### 4-C. 통합 테스트

- **Task 026: M3 통합 테스트와 RLS 점검**
  - 기능: F014, F015
  - 선행: Task 024, Task 025
  - [ ] Playwright MCP 플로우: 운전자 등록 → 여러 계정 신청 → 승인·거절 → 좌석 마감 표시
  - [ ] 비멤버 접근 테스트, advisor 점검
  - [ ] 카풀 영역에 `lib/dummy` 참조가 남아 있지 않은지 확인
  - [ ] 완료 기준: PRD M3 완료 기준을 프로덕션 환경에서 재현한다

### Phase 5: M4 출석 이력 기능 구현

> 완료 기준(PRD 10장): 출석 체크와 멤버별 출석률이 표시된다.

#### 5-A. DB 마이그레이션·RLS·타입

- **Task 027: 출석 스키마·RLS·타입 구축**
  - 기능: F016, F017 (데이터 기반)
  - 선행: Phase 4 완료 (기술적으로는 Phase 2만 필요)
  - [ ] `supabase/migrations/<timestamp>_m4_attendance.sql`: `rsvps.attended boolean` 추가
  - [ ] `attended`는 주최자만 변경(본인 RSVP 변경 정책과 분리, RPC 또는 트리거로 강제)
  - [ ] 출석률 집계 함수 `get_group_attendance(group_id)`(멤버는 본인 행, 주최자는 전체)
  - [ ] 타입 재생성, `Rsvp` 도메인 타입에 `attended` 반영
  - [ ] 완료 기준: advisor 경고 0건, `npm run typecheck` 통과

#### 5-B. 더미 데이터를 실제 쿼리·Server Action으로 교체

- **Task 028: 이벤트 출석 체크 구현**
  - 기능: F016 (P0)
  - 선행: Task 027
  - [ ] 출석 체크·해제 Server Action(주최자만, 이벤트 시작 이후만)
  - [ ] 대상은 `going` 응답자만 표시(출석 영역 더미 목록을 실제 조회로 교체)
  - [ ] 완료 기준: 시작 전에는 체크할 수 없고, 체크·해제가 즉시 반영된다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 시작 이후 주최자 체크 → 저장, 해제 → 저장
    - [ ] 시작 전 체크 시도 거부
    - [ ] `member` 계정의 체크 시도 거부, `going`이 아닌 멤버는 목록에 없음

- **Task 029: 멤버별 출석률 구현**
  - 기능: F017 (P1)
  - 선행: Task 028
  - [ ] 출석률 = 출석 수 / 지난 이벤트 중 참석 응답 수(%), 분모 0이면 "-" 표시
  - [ ] 모임 상세 "출석 현황" 탭 연결, 멤버는 본인 것만, 주최자는 전체(프로토타입 보기 전환 대신 실제 역할 사용)
  - [ ] 출석 횟수·출석률 정렬 표의 더미 데이터를 `get_group_attendance` 결과로 교체
  - [ ] 완료 기준: 계산값이 SQL 수동 계산과 일치하고 권한별 표시 범위가 맞다
  - **테스트 체크리스트 (Playwright MCP)**
    - [ ] 이벤트 3건(참석 응답 3, 출석 2) → 67% 표시
    - [ ] `member` 계정은 본인 행만, 주최자는 전체 행 표시
    - [ ] 취소된 이벤트·예정 이벤트는 분모에서 제외

#### 5-C. 통합 테스트

- **Task 030: M4 통합 테스트와 MVP 최종 점검**
  - 기능: F001~F017
  - 선행: Task 028, Task 029
  - [ ] Playwright MCP 전체 회귀 테스트(M1~M4 핵심 플로우)
  - [ ] 전 테이블 비멤버 접근 테스트, advisor 최종 점검
  - [ ] `lib/dummy/*`와 프로토타입 보기 전환(`lib/dummy/preview.ts`) 참조 0건 확인 후 제거
  - [ ] 성공 지표(RSVP 응답률, 주최자 재방문, 정산 완료 소요 시간) 측정 쿼리 준비
  - [ ] 완료 기준: PRD M4 완료 기준을 프로덕션 환경에서 재현하고 MVP 범위 전체가 동작한다

## PRD 갱신 메모

Task 005(UI 검토·보완)와 이후 Task에서 화면 보완 결과가 `docs/PRD.md`와 어긋나면 여기에 기록합니다. 사용자 확인 후 `docs/PRD.md`에 반영하고 "반영 여부"를 갱신합니다.

| 출처 Task | PRD 위치(장·표)                 | 변경 내용                                                                                                                                                                                                                   | 반영 여부                                       |
| --------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 005       | 4장 F005(이벤트 생성·수정·취소) | 시작 시각이 지난(종료된) 이벤트는 수정 링크를 숨기고 정산 버튼을 보여 준다. 종료 이벤트 수정 가능 여부를 PRD에 명시할지 결정 필요                                                                                           | 사용자 확인 대기                                |
| 005       | 4장 F001(초대 링크 가입)        | 초대 수락 후 이동 경로를 모임 목록이 아닌 해당 모임 상세로 한다(카톡 링크 진입 단계 단축)                                                                                                                                   | Task 010에서 구현 완료, PRD 반영 여부 확인 필요 |
| 006       | 6장 데이터 모델(profiles)       | `profiles` select 정책을 모임 멤버까지 넓히는 대신, 이름·아바타는 `get_group_profiles` RPC로, 이메일은 `get_group_member_emails`(주최자 전용) RPC로 분리했다. PRD에 "프로필 조회는 그룹 범위 RPC를 통한다"는 내용 반영 필요 | 사용자 확인 대기                                |

## 매핑 표

### 기능 ID → Task

| 기능 ID | 기능명                  | 우선순위 | 마일스톤 | 화면 Task          | 구현 Task          |
| ------- | ----------------------- | -------- | -------- | ------------------ | ------------------ |
| F001    | 인증 및 원래 링크 복귀  | P0       | M1       | Task 003           | Task 008, Task 010 |
| F002    | 모임 생성·수정          | P0       | M1       | Task 003           | Task 009           |
| F003    | 초대 링크 가입          | P0       | M1       | Task 003           | Task 010           |
| F004    | 멤버 목록·권한 관리     | P1       | M1       | Task 003           | Task 011           |
| F005    | 이벤트 생성·수정·취소   | P0       | M1       | Task 003           | Task 012           |
| F006    | 공지 작성·이메일 발송   | P0       | M1       | Task 003           | Task 014           |
| F007    | 참석 투표(RSVP)         | P0       | M1       | Task 003           | Task 013           |
| F008    | 정원·대기자 처리        | P1       | M1       | Task 003           | Task 013           |
| F009    | 응답 마감 리마인드 메일 | P1       | M1       | Task 003           | Task 015           |
| F010    | 홈 "내 할 일" 요약      | P1       | M1(+M2)  | Task 003, Task 004 | Task 016, Task 021 |
| F011    | 정산 생성(N빵)          | P0       | M2       | Task 004           | Task 019           |
| F012    | 정산 요청 이메일        | P1       | M2       | Task 004           | Task 020           |
| F013    | 입금 상태 체크          | P0       | M2       | Task 004           | Task 021           |
| F014    | 운전자 등록             | P1       | M3       | Task 004           | Task 024           |
| F015    | 탑승 신청·승인          | P1       | M3       | Task 004           | Task 025           |
| F016    | 이벤트 출석 체크        | P0       | M4       | Task 004           | Task 028           |
| F017    | 멤버별 출석률           | P1       | M4       | Task 004           | Task 029           |

공통 기반 Task(001, 002, 005, 006, 007, 018, 023, 027)와 통합 테스트 Task(017, 022, 026, 030)는 위 기능 전체를 받칩니다.

### 페이지 → 라우트 → Task (PRD 5장)

| 페이지               | 라우트(제안)                                             | 기능 ID                                  | 골격·UI Task                 | 기능 Task                                                  |
| -------------------- | -------------------------------------------------------- | ---------------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| 로그인 페이지        | `/auth/login` (기존)                                     | F001                                     | 기존 구현                    | Task 008                                                   |
| 초대 수락 페이지     | `/invite/[code]`                                         | F001, F003                               | Task 001, Task 003           | Task 008, Task 010                                         |
| 홈 페이지            | `/home`                                                  | F010                                     | Task 001, Task 003, Task 004 | Task 016, Task 021                                         |
| 모임 목록 페이지     | `/groups`                                                | F002                                     | Task 001, Task 003           | Task 009                                                   |
| 모임 만들기 페이지   | `/groups/new`                                            | F002                                     | Task 001, Task 003           | Task 009                                                   |
| 모임 상세 페이지     | `/groups/[groupId]`                                      | F002, F003, F005                         | Task 001, Task 003           | Task 009, Task 010, Task 012                               |
| 멤버 관리 페이지     | `/groups/[groupId]/members`                              | F004                                     | Task 001, Task 003           | Task 011                                                   |
| 이벤트 만들기 페이지 | `/groups/[groupId]/events/new`, `/events/[eventId]/edit` | F005, F006                               | Task 001, Task 003           | Task 012, Task 014                                         |
| 이벤트 상세 페이지   | `/events/[eventId]`                                      | F006, F007, F008, F009, F014, F015, F016 | Task 001, Task 003, Task 004 | Task 013, Task 014, Task 015, Task 024, Task 025, Task 028 |
| 정산 페이지          | `/events/[eventId]/settlement`                           | F011, F012, F013                         | Task 001, Task 004           | Task 019, Task 020, Task 021                               |
| 출석 현황 페이지     | `/groups/[groupId]/attendance`                           | F017                                     | Task 001, Task 004           | Task 029                                                   |

- 모든 페이지의 UI 검토·보완은 Task 005에서 함께 진행합니다.
- 이벤트 상세·정산 라우트를 `/events/[eventId]`로 두어 이메일 링크를 짧게 유지합니다. 모임 소속 확인은 RLS와 페이지 내부 조회로 처리합니다.
- 로그아웃(F001)은 Task 001의 공통 헤더에서 제공합니다.

### 기존 코드 연계 과제 (PRD 5장·6장) → Task

| 과제                                                                 | Task                                           |
| -------------------------------------------------------------------- | ---------------------------------------------- |
| `lib/supabase/proxy.ts` `updateSession()` 공개 경로에 `/invite` 추가 | Task 008 (Phase 1에서는 추가하지 않음)         |
| 로그인 후 `next` 복귀 보완(내부 경로만 허용)                         | Task 008                                       |
| 로그인 후 기본 경로 `/home` 변경과 `app/protected/` 정리             | Task 008 (Task 001은 임시 링크만)              |
| `profiles` 접근을 같은 모임 멤버까지 확장(RLS 대신 RPC로 분리)       | Task 006                                       |
| RLS 헬퍼 `is_group_member`, `is_group_host`                          | Task 006                                       |
| 마일스톤별 마이그레이션과 Supabase advisor 점검                      | Task 006, 018, 023, 027 (+ 017, 022, 026, 030) |
| 이메일 발송(Resend) 설정                                             | Task 014                                       |
| `pg_cron` 리마인드 설정                                              | Task 015                                       |

## 범위 밖 (2차 이후, PRD 4장)

결제 연동, 카카오 알림톡·푸시, 비균등 정산, 경로 최적화, 채팅, 반복 이벤트 자동 생성, 회비 장부, 프로필 상세 관리·설정·고급 검색은 이 로드맵에 포함하지 않습니다.
