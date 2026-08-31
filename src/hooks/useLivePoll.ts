import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { OptionCount, Poll, PollOption } from "@/lib/types";
import { DEMO_COUNTS, DEMO_OPTIONS, DEMO_POLL } from "@/lib/demo";
import { describeError } from "@/lib/errors";

export interface LivePoll {
  poll: Poll | null;
  options: PollOption[];
  /** option_id -> 표 수 */
  counts: Record<string, number>;
  /** 총 참여자 수 (1인 1표이므로 표의 합과 같다) */
  total: number;
  /** 내가 고른 보기. 아직 안 골랐으면 null */
  myOptionId: string | null;
  loading: boolean;
  error: string | null;
  /** 투표하기 / 선택 바꾸기 */
  vote: (optionId: string) => Promise<void>;
  voting: boolean;
}

/**
 * 지금 열려 있는 주제 하나를 불러오고, 집계를 Realtime 으로 계속 갱신한다.
 * 집계는 poll_option_counts 를 구독한다 — votes 는 RLS 때문에 남의 표가 오지 않는다.
 */
export function useLivePoll(userId: string | null): LivePoll {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myOptionId, setMyOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIdRef = useRef<string | null>(null);

  // ── 최초 로드 ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      // .env 가 비어 있으면 샘플 데이터로 화면을 보여준다 (투표는 이 브라우저 안에서만)
      if (!isSupabaseConfigured) {
        pollIdRef.current = DEMO_POLL.id;
        setPoll(DEMO_POLL);
        setOptions(DEMO_OPTIONS);
        setCounts({ ...DEMO_COUNTS });
        setMyOptionId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: openPoll, error: pollError } = await supabase
        .from("polls")
        .select("id, question, subtitle, status, opens_at, closes_at")
        .eq("status", "open")
        .order("opens_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (pollError) {
        setError(describeError(pollError.message));
        setLoading(false);
        return;
      }
      if (!openPoll) {
        setPoll(null);
        setLoading(false);
        return;
      }

      pollIdRef.current = openPoll.id;
      setPoll(openPoll as Poll);

      const [optionsRes, countsRes] = await Promise.all([
        supabase
          .from("poll_options")
          .select("id, poll_id, label, position")
          .eq("poll_id", openPoll.id)
          .order("position", { ascending: true }),
        supabase
          .from("poll_option_counts")
          .select("option_id, poll_id, votes")
          .eq("poll_id", openPoll.id),
      ]);

      if (cancelled) return;

      setOptions((optionsRes.data ?? []) as PollOption[]);
      setCounts(toCountMap((countsRes.data ?? []) as OptionCount[]));

      if (userId) {
        const { data: myVote } = await supabase
          .from("votes")
          .select("option_id")
          .eq("poll_id", openPoll.id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!cancelled) setMyOptionId(myVote?.option_id ?? null);
      } else {
        setMyOptionId(null);
      }

      if (!cancelled) setLoading(false);
    }

    // 네트워크 자체가 실패하면 promise 가 거부된다.
    // 잡아주지 않으면 loading 이 영원히 true 로 남아 '불러오는 중…' 에서 멈춘다.
    load().catch((thrown) => {
      if (cancelled) return;
      setError(describeError(thrown));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ── 실시간 집계 구독 ─────────────────────────────────────
  useEffect(() => {
    if (!poll || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`counts:${poll.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_option_counts",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          const row = payload.new as OptionCount | undefined;
          if (!row?.option_id) return;
          setCounts((prev) => ({ ...prev, [row.option_id]: row.votes }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll]);

  // ── 투표 ────────────────────────────────────────────────
  const vote = useCallback(
    async (optionId: string) => {
      const pollId = pollIdRef.current;
      if (!pollId || voting) return;
      if (!userId && isSupabaseConfigured) return;

      const previous = myOptionId;
      if (previous === optionId) return;

      // 낙관적 갱신 — 실시간 방송이 오기 전에도 바로 반응하게
      setVoting(true);
      setMyOptionId(optionId);
      setCounts((prev) => {
        const next = { ...prev };
        next[optionId] = (next[optionId] ?? 0) + 1;
        if (previous) next[previous] = Math.max(0, (next[previous] ?? 1) - 1);
        return next;
      });

      if (!isSupabaseConfigured) {
        setVoting(false);
        return;
      }

      const { error: voteError } = await supabase
        .from("votes")
        .upsert(
          { poll_id: pollId, user_id: userId!, option_id: optionId, updated_at: new Date().toISOString() },
          { onConflict: "poll_id,user_id" }
        );

      setVoting(false);

      if (voteError) {
        // 실패하면 되돌린다
        setMyOptionId(previous);
        setCounts((prev) => {
          const next = { ...prev };
          next[optionId] = Math.max(0, (next[optionId] ?? 1) - 1);
          if (previous) next[previous] = (next[previous] ?? 0) + 1;
          return next;
        });
        setError(describeError(voteError.message));
      }
    },
    [userId, myOptionId, voting]
  );

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return { poll, options, counts, total, myOptionId, loading, error, vote, voting };
}

function toCountMap(rows: OptionCount[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of rows) map[row.option_id] = row.votes;
  return map;
}
