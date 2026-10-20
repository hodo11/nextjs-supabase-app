# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개요

Next.js(App Router) + Supabase 인증 스타터킷(`with-supabase` 템플릿)을 기반으로 한 앱입니다. React 19, TypeScript(strict), Tailwind CSS 3, shadcn/ui(new-york 스타일, `components.json`)를 사용합니다. 패키지 매니저는 npm(`package-lock.json`)입니다. 테스트 러너는 설정되어 있지 않습니다.

## 명령어

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # eslint .
```

환경 변수는 `.env.example`을 참고해 `.env.local`에 설정합니다: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. shadcn 컴포넌트는 `@/components/ui`에, 경로 별칭 `@/*`는 프로젝트 루트(`./*`)를 가리킵니다(`src/` 디렉터리 없음).

## 아키텍처

### Supabase 인증 흐름 (여러 파일에 걸쳐 있음)
- **`proxy.ts`(루트)** → `lib/supabase/proxy.ts`의 `updateSession()` 호출. Next.js 16부터 `middleware.ts` 대신 `proxy.ts`를 사용합니다(설치된 Next 버전 16.4.x). 모든 요청에서 세션 쿠키를 갱신하고, 미인증 사용자를 `/auth/login`으로 리다이렉트합니다. 공개 경로 화이트리스트(`/`, `/login*`, `/auth*`, `/instruments*`)가 이 파일에 하드코딩되어 있으므로 새 공개 페이지를 추가하려면 여기를 수정해야 합니다.
- `updateSession()`에서 `createServerClient`와 `supabase.auth.getClaims()` 사이에 다른 코드를 넣지 말고, 반환하는 `supabaseResponse` 객체를 그대로 반환해야 합니다(세션이 끊길 수 있음).
- **Supabase 클라이언트는 용도별로 분리**: 서버 컴포넌트/라우트 핸들러는 `lib/supabase/server.ts`의 `createClient()`(async, `cookies()` 사용), 클라이언트 컴포넌트는 `lib/supabase/client.ts`. Fluid compute 때문에 전역 변수에 클라이언트를 캐시하지 말고 함수마다 새로 생성합니다.
- 인증 페이지는 `app/auth/*`(login, sign-up, forgot-password, update-password, error, sign-up-success), 이메일 확인 콜백은 `app/auth/confirm/route.ts`입니다. 로그인한 사용자 전용 영역은 `app/protected/`입니다.
- `lib/utils.ts`의 `hasEnvVars`는 환경 변수 미설정 시 proxy 검사를 건너뛰고 `EnvVarWarning`을 표시하는 튜토리얼용 체크입니다(설정 완료 후 제거 가능).

### 데이터베이스
- 마이그레이션은 `supabase/migrations/`에 있습니다. 현재 `profiles` 테이블이 `auth.users`와 1:1이며, `on_auth_user_created` 트리거(`handle_new_user`, security definer)가 가입 시 행을 자동 생성하고 `set_updated_at` 트리거가 `updated_at`을 갱신합니다. RLS는 본인 행(`auth.uid() = id`)만 select/insert/update 허용합니다. 함수에는 `set search_path = ''`를 지정하는 패턴을 따릅니다.
- `.mcp.json`에 프로젝트에 연결된 Supabase MCP 서버가 설정되어 있어 스키마 조회/마이그레이션 적용에 사용할 수 있습니다.

## 프로젝트 문서 / Claude 설정
- `docs/guides/`에 한글 개발 가이드(컴포넌트 패턴, react-hook-form, Next.js, 스타일링, 프로젝트 구조)가 있습니다. 단, 일부는 `src/` 구조와 Next.js 15.5.3을 전제로 작성되어 있어 이 저장소의 실제 구조(루트 `app/`, `components/`, `lib/`)와 다릅니다. 실제 구조를 우선합니다.
- `.claude/agents/`(dev/docs 하위 서브에이전트), `.claude/commands/`(`/git:commit`, `/docs:update-roadmap`)에 프로젝트 전용 에이전트와 슬래시 커맨드가 정의되어 있습니다.
