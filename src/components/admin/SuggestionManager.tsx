import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createPoll } from "@/lib/admin";

interface Suggestion {
  id: string;
  title: string;
  options: string[];
  note: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export default function SuggestionManager({ onError }: { onError: (m: string) => void }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("topic_suggestions")
      .select("id, title, options, note, status, created_at")
      .order("created_at", { ascending: false });

    if (error) onError(error.message);
    setItems((data ?? []) as Suggestion[]);
    setLoading(false);
  }, [onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function setStatus(id: string, status: "accepted" | "rejected") {
    setBusyId(id);
    const { error } = await supabase
      .from("topic_suggestions")
      .update({ status })
      .eq("id", id);
    if (error) onError(error.message);
    await reload();
    setBusyId(null);
  }

  /** 추천을 그대로 주제 초안으로 옮긴다. 보기가 없으면 찬성/반대를 기본으로 넣는다. */
  async function acceptAsPoll(item: Suggestion) {
    setBusyId(item.id);
    try {
      const options = item.options.length >= 2 ? item.options : ["찬성", "반대"];
      await createPoll({ question: item.title, subtitle: null, options });
      await supabase.from("topic_suggestions").update({ status: "accepted" }).eq("id", item.id);
      await reload();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-sm text-muted">불러오는 중…</p>;
  if (items.length === 0) return <p className="text-sm text-muted">아직 들어온 추천이 없습니다.</p>;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-line px-6 py-5">
          <div className="mb-2 flex items-start justify-between gap-4">
            <p className="text-lg font-medium">{item.title}</p>
            <span className="shrink-0 text-[11px] text-muted">
              {item.status === "pending" ? "대기" : item.status === "accepted" ? "채택" : "반려"}
            </span>
          </div>

          {item.options.length > 0 && (
            <p className="mb-2 text-sm text-muted">보기: {item.options.join(" · ")}</p>
          )}
          {item.note && <p className="mb-3 text-sm text-muted">{item.note}</p>}

          {item.status === "pending" && (
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => acceptAsPoll(item)}
                disabled={busyId === item.id}
                className="rounded-full bg-ink px-4 py-1.5 text-white disabled:opacity-30"
              >
                채택하고 주제 초안 만들기
              </button>
              <button
                onClick={() => setStatus(item.id, "rejected")}
                disabled={busyId === item.id}
                className="rounded-full border border-line px-4 py-1.5 text-muted disabled:opacity-30"
              >
                반려
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
