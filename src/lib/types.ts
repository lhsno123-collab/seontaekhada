export type PollStatus = "draft" | "open" | "closed";

export interface Poll {
  id: string;
  question: string;
  subtitle: string | null;
  status: PollStatus;
  opens_at: string;
  closes_at: string | null;
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
