-- 회원 프로필: 연령대(일반 개인정보)와 신념(정치적 성향, 민감정보)을 저장한다.
--
-- 신념은 개인정보보호법상 '민감정보'(사상·신념, 정치적 견해 등)에 해당해
-- 일반 약관 동의와 별도로, 수집에 동의한 경우에만 값을 저장한다.
-- 동의하지 않아도 가입 자체는 막지 않는다(political_stance를 null로 둔다).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age_group text check (age_group in ('10대', '20대', '30대', '40대', '50대')),
  political_stance text check (political_stance in ('중도', '보수', '진보', '해당없음')),
  political_stance_consented_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
