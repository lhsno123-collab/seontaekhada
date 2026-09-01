import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "@/lib/supabase";
import { requestPasswordReset } from "@/lib/account";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim() || sending) return;

    if (!isSupabaseConfigured) {
      setError("Supabase 연결 정보가 없습니다. .env 파일을 채워주세요.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:py-32">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
        비밀번호 재설정
      </h1>
      <p className="mb-12 text-muted">가입한 이메일로 재설정 링크를 보내드립니다.</p>

      {sent ? (
        <p className="max-w-sm rounded-xl border border-line px-5 py-4 text-sm">
          <strong className="font-medium">{email}</strong> 으로 링크를 보냈습니다. 메일함을
          확인해 주세요.
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
              className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {sending ? "보내는 중…" : "재설정 링크 받기"}
          </button>
        </form>
      )}

      <p className="mt-10 text-sm text-muted">
        <Link to="/login" className="text-ink underline underline-offset-4">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
