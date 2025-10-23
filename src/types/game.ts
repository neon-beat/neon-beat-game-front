export interface Field {
  key: string;
  value: string;
  points: number;
}

export interface Song {
  id: string;
  starts_at_ms: number;
  guess_duration_ms: number;
  url: string;
  point_fields: Field[];
  bonus_fields: Field[];
}

export interface Team {
  id: string;
  buzzer_id?: string | null;
  name: string;
  score: number;
  color?: {
    h: number;
    s: number;
    v: number;
  }; // optional color for the team tile
}

export const GameState = {
  IDLE: 'idle',
  PREP_READY: 'prep_ready',
  PAIRING: 'pairing',
  PLAYING: 'playing',
  PAUSED: 'pause',
  REVEAL: 'reveal',
  SCORES: 'scores',
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

// Use named exports (no default) for types
