-- 참여자: 본인 행의 paid_claimed_at만 설정/취소(주최자가 이미 확정한 뒤에는 되돌릴 수 없음).
create function public.claim_settlement_payment(p_settlement_id uuid, p_claim boolean)
returns setof public.settlement_payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.settlement_payments%rowtype;
begin
  select * into v_row from public.settlement_payments
    where settlement_id = p_settlement_id and user_id = (select auth.uid())
    for update;
  if not found then
    raise exception 'not_payer';
  end if;
  if v_row.paid then
    raise exception 'already_confirmed';
  end if;

  update public.settlement_payments
    set paid_claimed_at = case when p_claim then now() else null end
    where settlement_id = p_settlement_id and user_id = (select auth.uid());

  return query select * from public.settlement_payments
    where settlement_id = p_settlement_id and user_id = (select auth.uid());
end;
$$;

revoke execute on function public.claim_settlement_payment(uuid, boolean) from public, anon;
grant execute on function public.claim_settlement_payment(uuid, boolean) to authenticated;

-- 주최자: 지정한 유저의 paid만 변경.
create function public.confirm_settlement_payment(p_settlement_id uuid, p_user_id uuid, p_paid boolean)
returns setof public.settlement_payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group_id uuid;
begin
  select e.group_id into v_group_id
    from public.settlements s join public.events e on e.id = s.event_id
    where s.id = p_settlement_id;
  if v_group_id is null then
    raise exception 'settlement_not_found';
  end if;
  if not public.is_group_host(v_group_id) then
    raise exception 'not_host';
  end if;

  update public.settlement_payments set paid = p_paid
    where settlement_id = p_settlement_id and user_id = p_user_id;
  if not found then
    raise exception 'payment_not_found';
  end if;

  return query select * from public.settlement_payments
    where settlement_id = p_settlement_id and user_id = p_user_id;
end;
$$;

revoke execute on function public.confirm_settlement_payment(uuid, uuid, boolean) from public, anon;
grant execute on function public.confirm_settlement_payment(uuid, uuid, boolean) to authenticated;
