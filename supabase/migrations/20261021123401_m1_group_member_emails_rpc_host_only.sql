-- 이메일은 멤버 전체가 아니라 주최자(발송 트리거 권한자)만 조회할 수 있도록 제한한다.
create or replace function public.get_group_member_emails(gid uuid)
returns table (user_id uuid, email text, display_name text)
language sql
security definer
stable
set search_path = ''
as $$
  select p.id, p.email, p.full_name
  from public.profiles p
  join public.group_members gm on gm.user_id = p.id
  where gm.group_id = gid and public.is_group_host(gid) and p.email is not null;
$$;
