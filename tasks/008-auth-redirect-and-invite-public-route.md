# Task 008: 로그인 후 원래 링크 복귀와 초대 공개 경로 구현

## 개요

`/invite`를 공개 경로로 열고, 로그인 후 원래 요청 경로(`next`)로 돌아가도록 한다. 기본 진입 경로를 `/protected`에서 `/home`으로 바꾼다.

- 기능: F001 (P0)
- 선행: Task 001

## 관련 파일

- `lib/supabase/proxy.ts`(`/invite` 공개 경로 추가, 미인증 리다이렉트 시 `next` 부착)
- `lib/utils.ts`(`getSafeRedirectPath` 기본 fallback을 `/home`으로)
- `app/auth/login/page.tsx`, `components/login-form.tsx`, `components/google-sign-in-button.tsx`(`next` 전달)
- `app/auth/confirm/route.ts`, `components/sign-up-form.tsx`, `components/update-password-form.tsx`
- `app/protected/page.tsx`(`/home`으로 리다이렉트하는 얇은 페이지로 축소)
- `lib/supabase/auth.ts`(`requireUser`/`getOptionalUser`)

## 수락 기준

- [x] 비로그인으로 `/invite/[code]` 접속 시 리다이렉트되지 않는다
- [x] 비로그인으로 보호된 경로 접속 시 `/auth/login?next=...`로 이동(원래 경로 보존)
- [x] 이메일·Google 로그인 모두 `next`로 복귀
- [x] `getSafeRedirectPath`가 오픈 리다이렉트를 차단(기존 구현 유지)

## 구현 메모

- `createServerClient`와 `getClaims()` 사이에는 코드를 넣지 않는 기존 규칙을 유지하고, 공개 경로 조건문만 수정했다.
- `app/protected/`는 스타터킷 튜토리얼이라 전체 삭제 대신 `/home`으로 리다이렉트하는 1줄짜리 페이지로 남겼다(북마크 호환).
