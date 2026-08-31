import { supabase } from "@/lib/supabase";
import type { Poll } from "@/lib/types";

export interface AdminPoll extends Poll {
  created_at: string;
  options: { id: string; label: string; position: number; votes: number }[];
  total: number;
}

/** 초안까지 포함한 모든 주제를 보기·집계와 함께 불러온다. */
export async function fetchAllPolls(): Promise<AdminPoll[]> {
  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, question, subtitle, status, opens_at, closes_at, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!polls?.length) return [];

  const ids = polls.map((p) => p.id);

  const [{ data: options }, { data: counts }] = await Promise.all([
    supabase
      .from("poll_options")
      .select("id, poll_id, label, position")
      .in("poll_id", ids)
      .order("position", { ascending: true }),
    supabase.from("poll_option_counts").select("option_id, poll_id, votes").in("poll_id", ids),
  ]);

  const votesByOption = new Map<string, number>();
  for (const row of counts ?? []) votesByOption.set(row.option_id, row.votes);

  return polls.map((poll) => {
    const own = (options ?? [])
      .filter((o) => o.poll_id === poll.id)
      .map((o) => ({
        id: o.id,
        label: o.label,
        position: o.position,
        votes: votesByOption.get(o.id) ?? 0,
      }));

    return {
      ...(poll as Poll & { created_at: string }),
      options: own,
      total: own.reduce((sum, o) => sum + o.votes, 0),
    };
  });
}

/** 주제와 보기를 함께 만든다. 보기 저장에 실패하면 주제도 지워 반쪽 주제를 남기지 않는다. */
export async function createPoll(input: {
  question: string;
  subtitle: string | null;
  options: string[];
}): Promise<string> {
  const { data: poll, error } = await supabase
    .from("polls")
    .insert({ question: input.question, subtitle: input.subtitle, status: "draft" })
    .select("id")
    .single();

  if (error || !poll) throw new Error(error?.message ?? "주제를 만들지 못했습니다");

  const { error: optionError } = await supabase.from("poll_options").insert(
    input.options.map((label, index) => ({
      poll_id: poll.id,
      label,
      position: index,
    }))
  );

  if (optionError) {
    await supabase.from("polls").delete().eq("id", poll.id);
    throw new Error(optionError.message);
  }

  return poll.id;
}

/** 이 주제를 열고, 열려 있던 다른 주제는 닫는다 (DB 함수가 한 번에 처리) */
export async function openPoll(pollId: string): Promise<void> {
  const { error } = await supabase.rpc("open_poll", { p_poll_id: pollId });
  if (error) throw new Error(error.message);
}

export async function closePoll(pollId: string): Promise<void> {
  const { error } = await supabase
    .from("polls")
    .update({ status: "closed", closes_at: new Date().toISOString() })
    .eq("id", pollId);
  if (error) throw new Error(error.message);
}

export async function deletePoll(pollId: string): Promise<void> {
  const { error } = await supabase.from("polls").delete().eq("id", pollId);
  if (error) throw new Error(error.message);
}
