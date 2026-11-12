export type PollStatus = "draft" | "open" | "closed";

export interface Poll {
  id: string;
  question: string;
  subtitle: string | null;
  status: PollStatus;
  opens_at: string;
  closes_at: string | null;
  scheduled_open_at: string | null;
}

export interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  position: number;
}

export interface OptionCount {
  option_id: string;
  poll_id: string;
  votes: number;
}

export interface Ad {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  image_url: string | null;
  position: number;
}

export const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const POLITICAL_STANCES = ["중도", "보수", "진보", "해당없음"] as const;
export type PoliticalStance = (typeof POLITICAL_STANCES)[number];

export interface Profile {
  user_id: string;
  age_group: AgeGroup | null;
  political_stance: PoliticalStance | null;
}
