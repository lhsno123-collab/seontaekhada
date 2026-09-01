import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLivePoll } from "@/hooks/useLivePoll";
import { isSupabaseConfigured } from "@/lib/supabase";
import OptionCard from "@/components/OptionCard";
import ShareActions from "@/components/ShareActions";

export default function Vote() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { poll, options, counts, total, myOptionId, loading, error, vote, voting } =
    useLivePoll(user?.id ?? null);

  if (authLoading || loading) {
    return <Centered>불러오는 중…</Centered>;
  }

  if (error) {
    return <Centered>{error}</Centered>;
  }

  if (!poll) {
    return (
      <Centered>
        <p className="text-2xl font-medium mb-3">오늘의 주제를 준비하고 있습니다.</p>
        <p className="text-sm text-muted">곧 새로운 선택지가 올라옵니다.</p>
      </Centered>
    );
  }

  // 투표해야 결과가 보인다 — 결과를 먼저 보면 선택이 휘둘린다
  const revealed = myOptionId !== null;

  function handleSelect(optionId: string) {
    if (!user && isSupabaseConfigured) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    void vote(optionId);
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.25em] text-muted mb-6">오늘의 주제</p>

      <h1 className="text-3xl md:text-[2.75rem] font-semibold leading-[1.35] mb-4">
        {poll.question}
      </h1>
      {poll.subtitle && <p className="text-muted mb-10">{poll.subtitle}</p>}
      {!poll.subtitle && <div className="mb-10" />}

      <div className="space-y-3">
        {options.map((option) => {
          const votes = counts[option.id] ?? 0;
          const percent = total > 0 ? (votes / total) * 100 : 0;
          return (
            <OptionCard
              key={option.id}
              label={option.label}
              votes={votes}
              percent={percent}
              selected={myOptionId === option.id}
              revealed={revealed}
              disabled={voting || revealed}
              onSelect={() => handleSelect(option.id)}
            />
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between text-xs text-muted">
        <span className="tabular-nums">
          지금까지 <strong className="font-semibold text-ink">{total.toLocaleString()}명</strong>이 선택했습니다
        </span>
        {revealed ? (
          <span>선택을 완료했습니다 · 다시 바꿀 수 없습니다</span>
        ) : (
          <span>
            {user || !isSupabaseConfigured
              ? "선택하면 결과가 열립니다"
              : "로그인 후 선택할 수 있습니다"}
          </span>
        )}
      </div>

      {revealed && (
        <ShareActions
          question={poll.question}
          subtitle={poll.subtitle}
          total={total}
          options={options.map((option) => {
            const votes = counts[option.id] ?? 0;
            return {
              label: option.label,
              votes,
              percent: total > 0 ? (votes / total) * 100 : 0,
              selected: myOptionId === option.id,
            };
          })}
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-6 py-32 text-center text-muted">
      {children}
    </div>
  );
}
