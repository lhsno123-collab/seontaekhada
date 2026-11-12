import { useState, type FormEvent } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PASSWORD_RULE, PASSWORD_HINT } from "@/lib/password";
import { saveProfile } from "@/lib/profile";
import type { AgeGroup, PoliticalStance } from "@/lib/types";
import OAuthButtons from "@/components/OAuthButtons";
import ProfileFields from "@/components/ProfileFields";
import Turnstile, { isTurnstileConfigured } from "@/components/Turnstile";

export default function Signup() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [consented, setConsented] = useState(false);
  const [politicalStance, setPoliticalStance] = useState<PoliticalStance | "">("");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const passwordValid = PASSWORD_RULE.test(password);
  const passwordMatches = password.length > 0 && password === passwordCheck;
  const profileValid = !!ageGroup && (!consented || !!politicalStance);
  const captchaReady = !isTurnstileConfigured || !!captchaToken;

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !passwordValid || !passwordMatches || !profileValid || !captchaReady || signing)
      return;

    if (!isSupabaseConfigured) {
      setError("Supabase 연결 정보가 없습니다. .env 파일을 채워주세요.");
      return;
    }

    setSigning(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: captchaToken ? { captchaToken } : undefined,
    });

    if (signUpError) {
      setSigning(false);
      setError(
        /already registered|user already exists/i.test(signUpError.message)
          ? "이미 가입된 이메일입니다. 로그인해 주세요."
          : signUpError.message
      );
      return;
    }

    // Supabase 프로젝트에서 이메일 확인을 꺼두었다면 가입과 동시에 세션이 생겨 바로 로그인된다.
    // 세션이 있어야 RLS를 통과해 프로필을 저장할 수 있다 — 확인 메일을 눌러야 하는
    // 경우엔 여기서 저장하지 못하고, 나중에 로그인했을 때 ProfileGate가 다시 물어본다.
    if (data.session) {
      try {
        await saveProfile(data.session.user.id, {
          ageGroup: ageGroup as AgeGroup,
          politicalStance: politicalStance || null,
          consentedToStance: consented && !!politicalStance,
        });
      } catch {
        // 프로필 저장 실패는 가입 자체를 막지 않는다 — ProfileGate가 다음에 다시 물어본다.
      }
      window.location.assign(from);
      return;
    }

    setSigning(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-content px-6 py-24 md:py-32">
        <h1 className="mb-4 text-3xl font-semibold">가입이 거의 끝났습니다</h1>
        <p className="text-muted">
          받은 메일함에서 확인 링크를 한 번 눌러야 합니다. 이후에는 이메일과
          비밀번호로 바로 로그인할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:py-32">
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-3">
        회원가입
      </h1>
      <p className="text-muted mb-12">이메일과 비밀번호로 한 번만 가입하면 됩니다.</p>

      <div className="max-w-sm">
        <OAuthButtons redirectTo={from} />

        <div className="my-8 flex items-center gap-4 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          또는
          <span className="h-px flex-1 bg-line" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-8">
        <label className="block">
          <span className="mb-3 block text-xs tracking-wide text-muted">이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-3 block text-xs tracking-wide text-muted">
            비밀번호 ({PASSWORD_HINT})
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
          {password.length > 0 && !passwordValid && (
            <span className="mt-2 block text-xs text-red-600">
              영문 대/소문자·숫자·특수문자를 모두 넣어 8자 이상으로 만들어주세요.
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-3 block text-xs tracking-wide text-muted">비밀번호 확인</span>
          <input
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
          {passwordCheck.length > 0 && !passwordMatches && (
            <span className="mt-2 block text-xs text-red-600">
              비밀번호가 서로 다릅니다.
            </span>
          )}
        </label>

        <ProfileFields
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
          consented={consented}
          onConsentedChange={setConsented}
          politicalStance={politicalStance}
          onPoliticalStanceChange={setPoliticalStance}
        />

        <Turnstile onToken={setCaptchaToken} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={
            signing || !email.trim() || !passwordValid || !passwordMatches || !profileValid || !captchaReady
          }
          className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
        >
          {signing ? "가입 중…" : "회원가입"}
        </button>
      </form>

      <p className="mt-10 text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" state={{ from }} className="text-ink underline underline-offset-4">
          로그인
        </Link>
      </p>
    </div>
  );
}
