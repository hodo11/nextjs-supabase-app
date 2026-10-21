-- 리마인드 cron: pg_cron + pg_net으로 15분마다 app/api/cron/reminders를 호출한다.
-- 호출 대상 URL과 공유 비밀값은 vault에 저장해 배포 시 코드 변경 없이 값만 교체할 수 있게 한다.
select vault.create_secret(
  'http://localhost:3000',
  'cron_app_base_url',
  '리마인드 cron이 호출할 앱 기본 URL. 배포 후 실제 Vercel URL로 교체해야 한다.'
);

select vault.create_secret(
  encode(extensions.gen_random_bytes(32), 'hex'),
  'cron_secret',
  'app/api/cron/reminders 인증용 공유 비밀값. 앱의 CRON_SECRET 환경 변수와 동일해야 한다.'
);

select cron.schedule(
  'event-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'cron_app_base_url') || '/api/cron/reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 10000
  );
  $$
);
