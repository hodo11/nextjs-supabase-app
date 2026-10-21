-- 모임 생성: groups insert + 생성자를 host로 group_members 등록까지 원자적으로 처리한다.
create function public.generate_invite_code()
returns text
language sql
security definer
set search_path = ''
as $$
  select replace(replace(replace(encode(extensions.gen_random_bytes(6), 'base64'), '/', '_'), '+', '-'), '=', '');
$$;

revoke execute on function public.generate_invite_code() from public, anon, authenticated;

create function public.create_group(group_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group_id uuid;
  v_code text;
  v_attempt integer := 0;
begin
  loop
    v_attempt := v_attempt + 1;
    v_code := public.generate_invite_code();

    begin
      insert into public.groups (name, invite_code, owner_id)
      values (group_name, v_code, (select auth.uid()))
      returning id into v_group_id;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise exception 'invite_code_generation_failed';
      end if;
    end;
  end loop;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, (select auth.uid()), 'host');

  return v_group_id;
end;
$$;

revoke execute on function public.create_group(text) from public, anon;
grant execute on function public.create_group(text) to authenticated;
