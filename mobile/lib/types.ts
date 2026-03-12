/** Shared types used across multiple screens. */

export interface RoomData {
  id: string;
  dimension: string | null;
  name: string;
  name_zh: string;
  description: string | null;
  room_type: 'dimension' | 'commons' | 'shadow';
  color: string;
  member_count: number;
}

export interface UserRoom {
  room_id: string;
  name: string;
  name_zh: string;
  dimension: string | null;
  room_type: string;
  color: string;
  role: 'home' | 'shadow' | 'joined';
}
