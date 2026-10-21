-- 공지/정산/리마인드 메일 발송용: 같은 모임 멤버의 이메일을 서버에서만 조회한다(클라이언트 노출 없음).
create function public.get_group_member_emails(gid uuid)
returns table (user_id uuid, email text, display_name text)
language sql
security definer
stable
set search_path = ''
as $$
  select p.id, p.email, p.full_name
  from public.profiles p
  join public.group_members gm on gm.user_id = p.id
  where gm.group_id = gid and public.is_group_member(gid) and p.email is not null;
$$;

revoke execute on function public.get_group_member_emails(uuid) from public, anon;
grant execute on function public.get_group_member_emails(uuid) to authenticated;
