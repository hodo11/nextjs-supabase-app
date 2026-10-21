# Task 015: 응답 마감 리마인드 메일 구현

## 개요

`pg_cron`+`pg_net`으로 15분마다 리마인드 엔드포인트를 호출해, 마감 24시간 이내 미응답·미정 멤버에게 1회 메일을 보낸다.

- 기능: F009 (P1)
- 선행: Task 013, 014

## 관련 파일

- `supabase/migrations/20261021123646_m1_reminder_cron.sql`(vault 비밀값, `cron.schedule`)
- `supabase/migrations/20261021123716_m1_move_pg_net_schema.sql`(`pg_net`을 `extensions` 스키마로 이동, advisor 경고 해소)
- `app/api/cron/reminders/route.ts`
- `lib/supabase/service.ts`(신규, service-role 클라이언트)
- `.env.example`(`CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`)

## 수락 기준

- [x] `pg_cron`, `pg_net` 활성화 성공(이 프로젝트 플랜에서 가능함을 확인 — Vercel Cron 대안은 불필요)
- [x] 마감 24시간 이내·`reminder_sent_at is null`·`active` 이벤트만 대상
- [x] 대상은 미응답·`maybe` 멤버만(= `going`/`not_going` 아닌 멤버)
- [x] 발송 성공 여부와 무관하게 1회 시도 후 `reminder_sent_at` 기록(재시도는 범위 밖)
- [x] 비밀값 없이 호출 시 401

## 구현 메모

- cron 호출 대상 URL(`cron_app_base_url`)과 인증값(`cron_secret`)은 `vault.decrypted_secrets`에 저장했다. **배포 후 `cron_app_base_url`을 실제 Vercel URL로 교체해야 한다**(지금은 `http://localhost:3000`이라 로컬 서버가 떠 있어도 Supabase 클라우드에서 도달 불가 — Task 017에서 갱신 필요).
- `cron_secret` 값과 앱의 `CRON_SECRET` 환경 변수가 반드시 같아야 한다. 값은 이 세션의 채팅 로그에서 사용자에게 전달했다(비밀값이라 이 파일·git에는 남기지 않는다).
- 리마인드 Route Handler는 사용자 세션이 없는 호출이라 쿠키 기반 `createClient()` 대신 RLS를 우회하는 `createServiceClient()`(service-role)를 쓴다. Task 014의 `sendEventNoticeEmail`(주최자 세션 전제, `get_group_member_emails` RPC 사용)은 재사용하지 않고 이메일 조회를 직접 쿼리한다.
