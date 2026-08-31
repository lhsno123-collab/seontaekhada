import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * 매직 링크(이메일 1회용 링크) 로그인.
 * 비밀번호를 저장하지 않아 초기 운영 부담이 가장 적다.
 */
export default function Login() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || sending) return;

    if (!isSupabaseConfigured) {
      setError("Supabase 연결 정보가 없습니다. .env 파일을 채워주세요.");
      return;
    }

    setSending(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${from}` },
    });

    setSending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:py-32">
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-3">
        한 사람의 한 표를 위해.
      </h1>
      <p className="text-muted mb-12">
        이메일로 로그인 링크를 보내드립니다. 비밀번호는 없습니다.
      </p>

      {sent ? (
        <p className="rounded-xl border border-line px-5 py-4 text-sm">
          <strong className="font-medium">{email}</strong> 으로 로그인 링크를 보냈습니다.
          <br />
          메일함을 확인해 주세요.
        </p>
      ) : (
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
              className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none focus:border-ink transition-colors"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {sending ? "보내는 중…" : "로그인 링크 받기"}
          </button>
        </form>
      )}
    </div>
  );
}
