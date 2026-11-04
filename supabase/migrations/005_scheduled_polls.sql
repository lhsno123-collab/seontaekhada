-- 예약 발행: 관리자가 미리 초안을 만들어두고 시간이 되면 자동으로 열리게 한다.

create extension if not exists pg_cron;

alter table public.polls
  add column if not exists scheduled_open_at timestamptz;

create index if not exists polls_scheduled_open_at_idx
  on public.polls (scheduled_open_at)
  where status = 'draft' and scheduled_open_at is not null;

-- cron이 호출하는 내부 함수. 사람이 아니라 스케줄러가 호출하므로 auth.uid()가 없다 —
-- 그래서 is_admin() 체크를 하지 않는 대신, 어떤 역할에도 실행 권한을 주지 않는다
-- (revoke 구문으로 클라이언트가 직접 호출하지 못하게 막음).
create or replace function public.run_scheduled_polls()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  due_poll_id uuid;
begin
  select id into due_poll_id
    from public.polls
   where status = 'draft'
     and scheduled_open_at is not null
     and scheduled_open_at <= now()
   order by scheduled_open_at asc
   limit 1;

  if due_poll_id is null then
    return;
  end if;

  update public.polls
     set status = 'closed', closes_at = now()
   where status = 'open' and id <> due_poll_id;

  update public.polls
     set status = 'open', opens_at = now(), closes_at = null
   where id = due_poll_id;
end;
$$;

revoke all on function public.run_scheduled_polls() from public, anon, authenticated;

-- 5분마다 예약 시간이 지난 초안이 있는지 확인한다. 재실행해도 안전하도록 먼저 지운다.
do $$
begin
  perform cron.unschedule('run-scheduled-polls');
exception when others then
  null;
end $$;

select cron.schedule(
  'run-scheduled-polls',
  '*/5 * * * *',
  $$select public.run_scheduled_polls();$$
);
