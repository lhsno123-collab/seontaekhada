import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  fetchAllPolls,
  createPoll,
  openPoll,
  closePoll,
  deletePoll,
  cancelSchedule,
  type AdminPoll,
} from "@/lib/admin";

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  open: "진행 중",
  closed: "마감",
};

function formatSchedule(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PollManager({ onError }: { onError: (message: string) => void }) {
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [scheduledOpenAt, setScheduledOpenAt] = useState("");
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      setPolls(await fetchAllPolls());
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const parsedOptions = optionsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (saving || !question.trim() || parsedOptions.length < 2) return;

    setSaving(true);
    try {
      await createPoll({
        question: question.trim(),
        subtitle: subtitle.trim() || null,
        options: parsedOptions,
        scheduledOpenAt: scheduledOpenAt ? new Date(scheduledOpenAt).toISOString() : null,
      });
      setQuestion("");
      setSubtitle("");
      setOptionsText("");
      setScheduledOpenAt("");
      await reload();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function runOn(pollId: string, action: () => Promise<void>) {
    setBusyId(pollId);
    try {
      await action();
      await reload();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-16">
      {/* ── 새 주제 ── */}
      <section>
        <h2 className="mb-2 text-sm tracking-wide text-muted">새 주제 만들기</h2>
        <p className="mb-6 text-xs text-muted">
          특정 후보자·정당·선거에 관한 주제는 공직선거법상 별도 신고 대상이 될 수 있어
          피해주세요. 일반 사회 이슈는 규제 대상이 아닙니다.
        </p>
        <form onSubmit={handleCreate} className="space-y-6">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
            required
            placeholder="주제 (예: 주 4일제, 도입해야 할까요?)"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="부제 (선택 사항)"
            className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
          />
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            rows={4}
            placeholder={"보기를 한 줄에 하나씩\n찬성\n반대"}
            className="w-full resize-none border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
          />
          <label className="block">
            <span className="mb-2 block text-xs text-muted">
              예약 발행 (선택 사항 — 비워두면 "이 주제 열기"를 직접 눌러야 합니다)
            </span>
            <input
              type="datetime-local"
              value={scheduledOpenAt}
              onChange={(e) => setScheduledOpenAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="border-b border-line bg-transparent pb-2 text-sm outline-none transition-colors focus:border-ink"
            />
          </label>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !question.trim() || parsedOptions.length < 2}
              className="rounded-full bg-ink px-7 py-2.5 text-sm text-white transition-opacity disabled:opacity-30"
            >
              {saving ? "만드는 중…" : "초안으로 저장"}
            </button>
            <span className="text-xs text-muted">
              {parsedOptions.length < 2
                ? "보기는 2개 이상 필요합니다"
                : `보기 ${parsedOptions.length}개`}
            </span>
          </div>
        </form>
      </section>

      {/* ── 목록 ── */}
      <section>
        <h2 className="mb-6 text-sm tracking-wide text-muted">주제 목록</h2>

        {loading && <p className="text-sm text-muted">불러오는 중…</p>}
        {!loading && polls.length === 0 && (
          <p className="text-sm text-muted">아직 만든 주제가 없습니다.</p>
        )}

        <div className="space-y-3">
          {polls.map((poll) => {
            const busy = busyId === poll.id;
            const scheduled = poll.status === "draft" && !!poll.scheduled_open_at;
            return (
              <article key={poll.id} className="rounded-2xl border border-line px-6 py-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-medium">{poll.question}</p>
                    <p className="mt-1 text-xs text-muted">
                      {STATUS_LABEL[poll.status] ?? poll.status} · 총{" "}
                      {poll.total.toLocaleString()}명 참여
                      {scheduled && ` · ${formatSchedule(poll.scheduled_open_at!)}에 자동 발행`}
                    </p>
                  </div>
                  <span
                    className={[
                      "shrink-0 rounded-full px-3 py-1 text-[11px]",
                      poll.status === "open"
                        ? "bg-ink text-white"
                        : scheduled
                          ? "border border-ink/30 text-ink"
                          : "border border-line text-muted",
                    ].join(" ")}
                  >
                    {scheduled ? "예약됨" : STATUS_LABEL[poll.status] ?? poll.status}
                  </span>
                </div>

                <ul className="mb-4 space-y-1 text-sm text-muted">
                  {poll.options.map((option) => (
                    <li key={option.id} className="flex justify-between tabular-nums">
                      <span>{option.label}</span>
                      <span>
                        {option.votes.toLocaleString()}명
                        {poll.total > 0 &&
                          ` · ${((option.votes / poll.total) * 100).toFixed(1)}%`}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 text-xs">
                  {poll.status !== "open" && (
                    <button
                      onClick={() => runOn(poll.id, () => openPoll(poll.id))}
                      disabled={busy}
                      className="rounded-full bg-ink px-4 py-1.5 text-white disabled:opacity-30"
                    >
                      지금 바로 열기
                    </button>
                  )}
                  {poll.status === "open" && (
                    <button
                      onClick={() => runOn(poll.id, () => closePoll(poll.id))}
                      disabled={busy}
                      className="rounded-full border border-line px-4 py-1.5 disabled:opacity-30"
                    >
                      마감하기
                    </button>
                  )}
                  {scheduled && (
                    <button
                      onClick={() => runOn(poll.id, () => cancelSchedule(poll.id))}
                      disabled={busy}
                      className="rounded-full border border-line px-4 py-1.5 text-muted disabled:opacity-30"
                    >
                      예약 취소
                    </button>
                  )}
                  {poll.total === 0 && (
                    <button
                      onClick={() => {
                        if (!confirm("이 주제를 삭제할까요?")) return;
                        void runOn(poll.id, () => deletePoll(poll.id));
                      }}
                      disabled={busy}
                      className="rounded-full border border-line px-4 py-1.5 text-muted disabled:opacity-30"
                    >
                      삭제
                    </button>
                  )}
                </div>

                {poll.status !== "open" && polls.some((p) => p.status === "open") && (
                  <p className="mt-3 text-[11px] text-muted">
                    {scheduled ? "예약 시간이 되면" : "이 주제를 열면"} 지금 진행 중인 주제는
                    자동으로 마감됩니다.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
