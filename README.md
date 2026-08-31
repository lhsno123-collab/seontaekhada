# 선택하다

하루 한 주제. 크게 고르고, 고른 순간 결과를 봅니다.

- **미니멀 · 흰 바탕**: 한 화면에 주제 하나. 장식 없음.
- **고르면 바로 집계**: 보기를 누르면 그 카드 안에서 막대가 차오르고, %와 참여 인원이 실시간으로 갱신됩니다.
- **1인 1표**: 로그인(이메일 매직 링크) 후 투표. 선택은 언제든 바꿀 수 있습니다.

## 대메뉴

| 경로 | 메뉴 |
| --- | --- |
| `/` | 선택하다 투표하기 |
| `/suggest` | 선택하다 주제추천 |
| `/board` | 오늘의 광고판 |

## 기술 스택

Vite · React 18 · TypeScript · Tailwind CSS · Supabase (Auth / Postgres / Realtime)

## 시작하기

```sh
npm install
cp .env.example .env   # 값은 아래 참고
npm run dev            # http://localhost:8080
```

`.env` 가 비어 있으면 **데모 모드**로 뜹니다. 샘플 주제로 화면과 집계 동작을 그대로 볼 수 있고,
투표는 그 브라우저 안에서만 반영됩니다. Supabase 값을 채우면 자동으로 실제 데이터로 바뀝니다.

## Supabase 연결

1. [supabase.com](https://supabase.com) 에서 프로젝트를 만듭니다.
2. **SQL Editor** 에서 `supabase/migrations/001_init.sql` 을 실행합니다.
   (첫 주제를 바로 띄우려면 `002_seed_example.sql` 도 실행)
3. **Authentication → Providers → Email** 에서 매직 링크를 켭니다.
4. **Project Settings → API** 의 URL과 anon key 를 `.env` 에 넣습니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 데이터 구조

| 테이블 | 역할 |
| --- | --- |
| `polls` | 주제. `status='open'` 인 주제는 항상 **하나만** (부분 유니크 인덱스로 강제) |
| `poll_options` | 보기 |
| `votes` | 표. `(poll_id, user_id)` 기본키로 1인 1표를 DB가 보장 |
| `poll_option_counts` | 집계 캐시. 트리거로 유지하고 Realtime 으로 방송 |
| `topic_suggestions` | 주제추천 |
| `ads` | 오늘의 광고판 |

집계를 `votes` 에서 매번 세지 않고 별도 테이블에 두는 이유: `votes` 는 RLS 로 "내 표"만 보이기 때문에
Realtime 구독으로 다른 사람의 표가 오지 않습니다. 누구나 읽을 수 있는 집계 테이블이 있어야
접속한 모든 사람의 화면에서 숫자가 같이 움직입니다.

## 아직 없는 것

- 관리자 화면 (주제 등록·마감, 추천 채택, 광고 등록) — 지금은 Supabase SQL Editor 로 처리
- 지난 주제 결과 아카이브
- 광고 신청 폼 / 결제
