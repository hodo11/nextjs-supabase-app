# Task 014: 이메일 발송 기반과 공지 메일 구현

## 개요

Resend 기반 메일 발송 모듈과 이벤트 공지 메일을 구현한다. 사용자 확인: Resend API 키는 아직 없어 코드는 완성하고 발송은 키 설정 전까지 건너뛴다.

- 기능: F006 (P0)
- 선행: Task 012

## 관련 파일

- `supabase/migrations/20261021123355_m1_group_member_emails_rpc.sql`, `..._host_only.sql`(`get_group_member_emails`)
- `lib/email/{client,send-notice}.ts`, `lib/email/templates/notice.ts`
- `.env.example`(`RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SITE_URL`)
- `package.json`(`resend` 의존성)

## 수락 기준

- [x] `RESEND_API_KEY` 미설정 시 발송을 건너뛰고 이벤트/공지 저장은 유지
- [x] 발송 대상은 모임 멤버 전체(이메일은 주최자만 서버에서 조회 가능하도록 RLS 분리)
- [x] 발송 실패해도 저장은 유지, 서버 로그로 실패 사유 기록

## 구현 메모

- `profiles` 테이블 자체는 본인 전용 RLS를 유지하고, 이메일 조회는 `get_group_member_emails(gid)` RPC로 분리했다. 이 RPC는 **주최자만** 호출 가능(`is_group_host` 체크) — 일반 멤버가 다른 멤버의 이메일을 긁어모을 수 없게 했다.
- 실제 발송 검증(테스트 도메인 포함)과 SPF/DKIM 설정은 Task 017(배포) 직전으로 미룬다.
