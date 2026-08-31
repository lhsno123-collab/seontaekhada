import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Suggest() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/suggest" }} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("topic_suggestions").insert({
      user_id: user!.id,
      title: title.trim(),
      options,
      note: note.trim() || null,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setOptionsText("");
    setNote("");
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.25em] text-muted mb-6">주제추천</p>
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-3">
        모두가 고르고 싶은 주제를 알려주세요.
      </h1>
      <p className="text-muted mb-12">채택되면 오늘의 주제로 올라갑니다.</p>

      {done && (
        <p className="mb-8 rounded-xl border border-line px-5 py-4 text-sm">
          추천이 접수되었습니다. 검토 후 반영하겠습니다.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Field label="주제">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            placeholder="예) 주 4일제, 찬성인가요 반대인가요?"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none focus:border-ink transition-colors"
          />
        </Field>

        <Field label="보기 (한 줄에 하나씩, 선택 사항)">
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={4}
            placeholder={"찬성\n반대"}
            className="w-full resize-none border-b border-line bg-transparent pb-3 outline-none focus:border-ink transition-colors"
          />
        </Field>

        <Field label="덧붙이고 싶은 말 (선택 사항)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none border-b border-line bg-transparent pb-3 outline-none focus:border-ink transition-colors"
          />
        </Field>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
        >
          {submitting ? "보내는 중…" : "추천 보내기"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 block text-xs tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
