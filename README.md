# 선택하다

하루 한 주제. 크게 고르고, 고른 순간 결과를 봅니다.

- **미니멀 · 흰 바탕**: 한 화면에 주제 하나. 장식 없음.
- **고르면 바로 집계**: 보기를 누르면 그 카드 안에서 막대가 차오르고, %와 참여 인원이 실시간으로 갱신됩니다.
- **1인 1표**: 이메일·비밀번호로 로그인 후 투표. 한 번 고르면 바꿀 수 없습니다.

## 대메뉴

| 경로 | 메뉴 |
| --- | --- |
| `/` | 선택하다 투표하기 |
| `/suggest` | 선택하다 주제추천 |
| `/board` | 오늘의 광고판 |
| `/admin` | 운영 화면 (관리자에게만 보입니다) |
| `/account` | 비밀번호 변경, 회원 탈퇴 (로그인 필요) |

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
3. `003_admin.sql`, `004_lock_votes.sql` 을 순서대로 실행합니다.
4. **Authentication → Providers → Email** 이 켜져 있는지 확인합니다 (기본값이 켜짐).
   가입하자마자 바로 로그인되게 하려면 같은 화면의 **Confirm email** 을 꺼두세요.
   켜두면 가입 후 메일의 확인 링크를 한 번 눌러야 합니다.
5. **Project Settings → API** 의 URL과 anon key 를 `.env` 에 넣습니다.

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 관리자 등록

관리자는 `admins` 테이블에 행이 있는 사용자입니다. 사이트에서 **한 번 로그인해 계정을
만든 뒤**, SQL Editor 에서 본인 이메일로 실행하세요.

```sql
insert into public.admins (user_id)
select id from auth.users where email = '본인이메일@example.com'
on conflict (user_id) do nothing;
```

등록되면 헤더에 '관리자' 링크가 생기고 `/admin` 에서 주제 등록·마감, 추천 채택,
광고 등록을 할 수 있습니다.

## 회원 탈퇴 기능 배포 (Edge Function)

anon key로는 사용자 계정을 지울 수 없어서, 탈퇴는 Supabase Edge Function을 하나
거칩니다. 이건 SQL Editor로 처리할 수 없고 **Supabase 대시보드에서 직접 배포**해야
합니다 (터미널 필요 없음).

1. Supabase 대시보드 → 왼쪽 메뉴 **Edge Functions** → **Deploy a new function**
2. 함수 이름에 정확히 `delete-account` 입력
3. `supabase/functions/delete-account/index.ts` 파일 내용을 그대로 복사해서 붙여넣기
4. Deploy

이 함수는 별도 secret 등록 없이 동작합니다 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_ANON_KEY`는 Supabase가 모든 Edge Function에 자동으로 넣어줍니다).
배포하지 않으면 `/account` 화면의 "탈퇴하기"를 눌러도 오류가 납니다.

## 비밀번호 재설정 링크가 되려면

**Authentication → URL Configuration** 의 **Redirect URLs** 에 배포된 주소를
와일드카드로 등록해야 합니다. Site URL 하나만으로는 `/reset-password` 같은
하위 경로로 오는 링크가 거부될 수 있습니다.

```
https://<배포된 도메인>/**
```

## 배포 (Vercel)

저장소를 Vercel 에 연결하면 됩니다. 프레임워크는 Vite 로 자동 인식됩니다.

- Build Command `npm run build` · Output Directory `dist`
- **Environment Variables** 에 `VITE_SUPABASE_URL` 과 `VITE_SUPABASE_ANON_KEY` 를 넣습니다.
  이 값들은 빌드 시점에 번들에 박히므로, 값을 바꾸면 재배포해야 반영됩니다.
- `vercel.json` 의 rewrite 가 `/suggest` 같은 주소를 새로고침해도 404 가 나지 않게 합니다.

배포 주소가 정해지면 Supabase **Authentication → URL Configuration** 의 Site URL 과
Redirect URLs 에 그 주소를 넣어야 로그인 링크가 제대로 돌아옵니다.

## 데이터 구조

| 테이블 | 역할 |
| --- | --- |
| `polls` | 주제. `status='open'` 인 주제는 항상 **하나만** (부분 유니크 인덱스로 강제) |
| `poll_options` | 보기 |
| `votes` | 표. `(poll_id, user_id)` 기본키로 1인 1표, UPDATE 정책 없음으로 변경 금지를 DB가 보장 |
| `poll_option_counts` | 집계 캐시. 트리거로 유지하고 Realtime 으로 방송 |
| `topic_suggestions` | 주제추천 |
| `ads` | 오늘의 광고판 |
| `admins` | 관리자 계정 |

## 법적 근거

이 서비스는 통계적 표본을 구성하는 공식 여론조사가 아닌 일반 사회 이슈에 대한
참고용 비공식 설문입니다. 공직선거법 제108조의 등록·신고 의무는 **선거에 관한
여론조사**(후보자·정당·특정 선거에 관한 조사)에 한정되고, 통계법상 승인통계
절차도 정부·공공기관이 공식 통계를 작성할 때 해당하는 것이라 민간이 운영하는
비공식 설문에는 적용되지 않습니다. 그래서 일반 사회 이슈만 다루는 한 별도
등록 없이 개인이 운영할 수 있습니다.

다만 이 경계를 넘지 않도록:
- 관리자 화면에 후보자·정당·선거 관련 주제를 피하라는 안내를 넣었습니다.
- 모든 페이지 하단과 첫 방문 팝업에 "공식 여론조사가 아닌 참고용 비공식 설문"
  임을 명시했습니다.
- 회원 정보(이메일·비밀번호)를 다루므로 `/terms`, `/privacy` 페이지를 두었습니다.
  광고를 유료로 팔기 시작하면 사업자등록·통신판매업 신고가 별도로 필요할 수
  있으니 그 시점에 다시 검토하세요.

이 내용은 참고용 정리이며, 실제 서비스를 상업적으로 확장할 계획이라면 변호사
등 전문가 확인을 권합니다.

집계를 `votes` 에서 매번 세지 않고 별도 테이블에 두는 이유: `votes` 는 RLS 로 "내 표"만 보이기 때문에
Realtime 구독으로 다른 사람의 표가 오지 않습니다. 누구나 읽을 수 있는 집계 테이블이 있어야
접속한 모든 사람의 화면에서 숫자가 같이 움직입니다.

## 아직 없는 것

- 지난 주제 결과 아카이브
- 광고 신청 폼 / 결제
- 이미지 업로드 (지금은 이미지 주소를 직접 넣습니다)
