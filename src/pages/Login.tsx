import { useState, type FormEvent } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/** 이메일 + 비밀번호 로그인. 한 번 로그인하면 세션이 브라우저에 남아 계속 유지된다. */
export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password || signing) return;

    if (!isSupabaseConfigured) {
      setError("Supabase 연결 정보가 없습니다. .env 파일을 채워주세요.");
      return;
    }

    setSigning(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSigning(false);

    if (signInError) {
      setError(
        /invalid login credentials/i.test(signInError.message)
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : signInError.message
      );
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:py-32">
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-3">
        로그인
      </h1>
      <p className="text-muted mb-12">한 번 로그인하면 계속 유지됩니다.</p>

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
          <span className="mb-3 block text-xs tracking-wide text-muted">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={signing || !email.trim() || !password}
            className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {signing ? "로그인 중…" : "로그인"}
          </button>
          <Link to="/forgot-password" className="text-xs text-muted hover:text-ink">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </form>

      <p className="mt-10 text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link to="/signup" state={{ from }} className="text-ink underline underline-offset-4">
          회원가입
        </Link>
      </p>
    </div>
  );
}
