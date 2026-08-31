-- ============================================================
-- 관리자 권한과 관리자용 정책
--   실행 후 아래 마지막 줄에서 본인 계정을 관리자로 등록해야 합니다.
-- ============================================================

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- 본인이 관리자인지만 확인할 수 있다 (다른 관리자 목록은 보이지 않는다)
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins
  for select using (auth.uid() = user_id);

-- 정책 안에서 쓰는 판별 함수.
-- security definer 라 admins 테이블 RLS를 우회한다 (정책 재귀 방지).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ── 관리자용 RLS 정책 ──────────────────────────────────────

-- 주제: 초안(draft)까지 전부 보고, 만들고, 고칠 수 있다
drop policy if exists "admins manage polls" on public.polls;
create policy "admins manage polls" on public.polls
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage options" on public.poll_options;
create policy "admins manage options" on public.poll_options
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read all counts" on public.poll_option_counts;
create policy "admins read all counts" on public.poll_option_counts
  for select using (public.is_admin());

-- 주제추천: 전부 읽고 상태를 바꿀 수 있다
drop policy if exists "admins read suggestions" on public.topic_suggestions;
create policy "admins read suggestions" on public.topic_suggestions
  for select using (public.is_admin());

drop policy if exists "admins update suggestions" on public.topic_suggestions;
create policy "admins update suggestions" on public.topic_suggestions
  for update using (public.is_admin()) with check (public.is_admin());

-- 광고: 등록·수정·삭제
drop policy if exists "admins manage ads" on public.ads;
create policy "admins manage ads" on public.ads
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 주제 열기 ──────────────────────────────────────────────
-- 'open' 인 주제는 하나뿐이므로, 새 주제를 열 때 기존 주제를 같이 닫아야 한다.
-- 두 동작을 한 함수 안에서 처리해 유니크 인덱스 충돌을 막는다.
create or replace function public.open_poll(p_poll_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 주제를 열 수 있습니다';
  end if;

  update public.polls
     set status = 'closed', closes_at = now()
   where status = 'open' and id <> p_poll_id;

  update public.polls
     set status = 'open', opens_at = now(), closes_at = null
   where id = p_poll_id;
end;
$$;

revoke all on function public.open_poll(uuid) from public;
grant execute on function public.open_poll(uuid) to authenticated;

-- ============================================================
-- ⬇ 본인 계정을 관리자로 등록 (이메일을 바꿔서 실행)
-- 먼저 사이트에서 한 번 로그인해 계정이 만들어져 있어야 합니다.
-- ============================================================
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'lhsno123@gmail.com'
-- on conflict (user_id) do nothing;
