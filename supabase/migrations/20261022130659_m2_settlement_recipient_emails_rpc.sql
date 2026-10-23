-- 정산 생성 시점에 고정된 settlement_payments 대상자에게만 보내기 위한 전용 RPC.
-- get_group_member_emails(모임 전체, 호스트 전용)와 달리 특정 정산의 대상자만 반환한다.
create function public.get_settlement_recipient_emails(sid uuid)
returns table (user_id uuid, email text, display_name text)
language sql
security definer
stable
set search_path = ''
as $$
  select p.id, p.email, p.full_name
  from public.settlement_payments sp
  join public.settlements s on s.id = sp.settlement_id
  join public.events e on e.id = s.event_id
  join public.profiles p on p.id = sp.user_id
  where sp.settlement_id = sid and public.is_group_host(e.group_id) and p.email is not null;
$$;

revoke execute on function public.get_settlement_recipient_emails(uuid) from public, anon;
grant execute on function public.get_settlement_recipient_emails(uuid) to authenticated;
