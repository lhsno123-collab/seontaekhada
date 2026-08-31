-- ============================================================
-- 선택하다 (seontaekhada) 초기 스키마
--   - 투표는 로그인 필수, 1인 1표 (변경은 가능)
--   - 집계는 poll_option_counts 테이블에 트리거로 누적하고
--     Realtime 으로 전원에게 실시간 방송한다.
-- ============================================================

-- ── 1. 주제 ────────────────────────────────────────────────
create table if not exists public.polls (
  id          uuid primary key default gen_random_uuid(),
  question    text not null check (char_length(question) between 2 and 200),
  subtitle    text,
  status      text not null default 'draft'
              check (status in ('draft', 'open', 'closed')),
  opens_at    timestamptz not null default now(),
  closes_at   timestamptz,
  created_at  timestamptz not null default now()
);

-- 동시에 진행되는 'open' 주제는 하나만. (하나의 주제만 크게 보여주는 기획)
create unique index if not exists polls_single_open_idx
  on public.polls ((status)) where status = 'open';

-- ── 2. 보기 ────────────────────────────────────────────────
create table if not exists public.poll_options (
  id        uuid primary key default gen_random_uuid(),
  poll_id   uuid not null references public.polls(id) on delete cascade,
  label     text not null check (char_length(label) between 1 and 60),
  position  smallint not null default 0
);

create index if not exists poll_options_poll_id_idx on public.poll_options(poll_id);

-- ── 3. 투표 (1인 1표) ──────────────────────────────────────
create table if not exists public.votes (
  poll_id    uuid not null references public.polls(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  option_id  uuid not null references public.poll_options(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create index if not exists votes_option_id_idx on public.votes(option_id);

-- ── 4. 집계 캐시 ───────────────────────────────────────────
-- votes 는 RLS 로 '내 표'만 보이기 때문에 Realtime 으로 남의 표를 받을 수 없다.
-- 그래서 누구나 읽을 수 있는 집계 테이블을 따로 두고 트리거로 유지한다.
create table if not exists public.poll_option_counts (
  option_id uuid primary key references public.poll_options(id) on delete cascade,
  poll_id   uuid not null references public.polls(id) on delete cascade,
  votes     integer not null default 0 check (votes >= 0)
);

create index if not exists poll_option_counts_poll_id_idx on public.poll_option_counts(poll_id);

-- 보기가 생기면 집계 행을 0으로 만들어 둔다 (0표 보기도 화면에 나와야 함)
create or replace function public.seed_option_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.poll_option_counts (option_id, poll_id, votes)
  values (new.id, new.poll_id, 0)
  on conflict (option_id) do nothing;
  return new;
end;
$$;

drop trigger if exists poll_options_seed_count on public.poll_options;
create trigger poll_options_seed_count
  after insert on public.poll_options
  for each row execute function public.seed_option_count();

-- 표가 들어오고/바뀌고/빠질 때마다 집계를 갱신한다
create or replace function public.apply_vote_to_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.poll_option_counts
       set votes = votes + 1
     where option_id = new.option_id;
  elsif (tg_op = 'UPDATE' and new.option_id is distinct from old.option_id) then
    update public.poll_option_counts
       set votes = votes - 1
     where option_id = old.option_id and votes > 0;
    update public.poll_option_counts
       set votes = votes + 1
     where option_id = new.option_id;
  elsif (tg_op = 'DELETE') then
    update public.poll_option_counts
       set votes = votes - 1
     where option_id = old.option_id and votes > 0;
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists votes_apply_counts on public.votes;
create trigger votes_apply_counts
  after insert or update or delete on public.votes
  for each row execute function public.apply_vote_to_counts();

-- ── 5. 주제 추천 ───────────────────────────────────────────
create table if not exists public.topic_suggestions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 2 and 200),
  options    text[] not null default '{}',
  note       text,
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists topic_suggestions_user_idx on public.topic_suggestions(user_id, created_at desc);

-- ── 6. 오늘의 광고판 ───────────────────────────────────────
create table if not exists public.ads (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  link_url   text,
  image_url  text,
  show_on    date not null default current_date,
  position   smallint not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ads_show_on_idx on public.ads(show_on, position);

-- ============================================================
-- RLS
-- ============================================================
alter table public.polls              enable row level security;
alter table public.poll_options       enable row level security;
alter table public.poll_option_counts enable row level security;
alter table public.votes              enable row level security;
alter table public.topic_suggestions  enable row level security;
alter table public.ads                enable row level security;

-- 주제/보기/집계: 누구나 읽기 (결과는 공개, 투표만 로그인 필요)
drop policy if exists "polls are public" on public.polls;
create policy "polls are public" on public.polls
  for select using (status in ('open', 'closed'));

drop policy if exists "options are public" on public.poll_options;
create policy "options are public" on public.poll_options
  for select using (
    exists (select 1 from public.polls p
             where p.id = poll_id and p.status in ('open', 'closed'))
  );

drop policy if exists "counts are public" on public.poll_option_counts;
create policy "counts are public" on public.poll_option_counts
  for select using (
    exists (select 1 from public.polls p
             where p.id = poll_id and p.status in ('open', 'closed'))
  );

-- 투표: 로그인한 본인 것만 읽고/넣고/바꾼다. 열려 있는 주제에만.
drop policy if exists "read own vote" on public.votes;
create policy "read own vote" on public.votes
  for select using (auth.uid() = user_id);

drop policy if exists "cast own vote" on public.votes;
create policy "cast own vote" on public.votes
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.polls p where p.id = poll_id and p.status = 'open')
    and exists (select 1 from public.poll_options o where o.id = option_id and o.poll_id = poll_id)
  );

drop policy if exists "change own vote" on public.votes;
create policy "change own vote" on public.votes
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.polls p where p.id = poll_id and p.status = 'open')
    and exists (select 1 from public.poll_options o where o.id = option_id and o.poll_id = poll_id)
  );

-- 주제 추천: 로그인 사용자가 본인 것만 쓰고 본다
drop policy if exists "read own suggestions" on public.topic_suggestions;
create policy "read own suggestions" on public.topic_suggestions
  for select using (auth.uid() = user_id);

drop policy if exists "write own suggestions" on public.topic_suggestions;
create policy "write own suggestions" on public.topic_suggestions
  for insert with check (auth.uid() = user_id);

-- 광고판: 오늘 게시분만 공개 읽기. 등록/수정은 service_role(관리자)만.
drop policy if exists "today ads are public" on public.ads;
create policy "today ads are public" on public.ads
  for select using (is_active and show_on = current_date);

-- ============================================================
-- Realtime: 집계 테이블 변경을 구독자 전원에게 방송
-- ============================================================
alter publication supabase_realtime add table public.poll_option_counts;
