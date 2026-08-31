import type { Poll, PollOption } from "@/lib/types";

/**
 * Supabase 연결 전에도 화면을 그대로 볼 수 있게 하는 샘플 데이터.
 * .env 를 채우면 자동으로 실제 데이터로 바뀐다.
 */
export const DEMO_POLL: Poll = {
  id: "demo-poll",
  question: "주 4일제, 도입해야 할까요?",
  subtitle: "2026년 8월 31일의 주제",
  status: "open",
  opens_at: new Date().toISOString(),
  closes_at: null,
};

export const DEMO_OPTIONS: PollOption[] = [
  { id: "demo-a", poll_id: "demo-poll", label: "도입해야 한다", position: 0 },
  { id: "demo-b", poll_id: "demo-poll", label: "지금은 이르다", position: 1 },
  { id: "demo-c", poll_id: "demo-poll", label: "반대한다", position: 2 },
];

export const DEMO_COUNTS: Record<string, number> = {
  "demo-a": 1284,
  "demo-b": 731,
  "demo-c": 402,
};
