/**
 * Arena types for the debate system.
 */
export type ArenaStatus = 'upcoming' | 'active' | 'voting' | 'closed';

export interface Arena {
  id: string;
  topic: string;
  topic_zh: string;
  dim1: string;
  dim2: string;
  side1_label: string;
  side2_label: string;
  status: ArenaStatus;
  starts_at: string | null;
  voting_at: string | null;
  ends_at: string | null;
  side1_count: number;
  side2_count: number;
  // Only present in detail view:
  side1_votes?: number;
  side2_votes?: number;
  winner?: number;
}

export interface ArenaPost {
  id: string;
  arena_id: string;
  user_id: string;
  side: 1 | 2;
  body: string;
  is_defector: boolean;
  created_at: string | null;
}
