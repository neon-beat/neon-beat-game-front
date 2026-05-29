export interface BlindTestAnswerSnapshot {
  key: string;
  value: string;
  points: number;
  is_bonus: boolean;
}

export interface MultipleChoiceAnswerSnapshot {
  text: string;
  is_correct: boolean;
}

export interface OpenAnswerSnapshot {
  text: string;
}

export interface HintSnapshot {
  text: string;
}

export interface BlindTestQuestionSnapshot {
  type: 'blind_test';
  id: number;
  starts_at_ms: number;
  guess_duration_ms: number;
  url: string;
  answers: Record<string, BlindTestAnswerSnapshot>;
}

export interface MultipleChoiceQuestionSnapshot {
  type: 'multiple_choice';
  id: number;
  guess_duration_ms: number;
  prompt: string;
  url?: string;
  answers: Record<string, MultipleChoiceAnswerSnapshot>;
  hints: Record<string, HintSnapshot>;
}

export interface OpenQuestionSnapshot {
  type: 'open';
  id: number;
  guess_duration_ms: number;
  prompt: string;
  url?: string;
  answers: Record<string, OpenAnswerSnapshot>;
  hints: Record<string, HintSnapshot>;
}

export type QuestionSnapshot =
  | BlindTestQuestionSnapshot
  | MultipleChoiceQuestionSnapshot
  | OpenQuestionSnapshot;

export interface Team {
  id: string;
  buzzer_id?: string | null;
  name: string;
  score: number;
  color?: {
    h: number;
    s: number;
    v: number;
  };
}

export const GameState = {
  IDLE: 'idle',
  PREP_READY: 'prep_ready',
  PREP_PAIRING: 'prep_pairing',
  PAIRING: 'pairing',
  PLAYING: 'playing',
  PAUSED: 'pause',
  REVEAL: 'reveal',
  SCORES: 'scores',
} as const;

export type QuestionValidation = 'correct' | 'incomplete' | 'wrong';

export type PropositionState = 'hidden' | 'displayed' | 'revealed_true' | 'revealed_false';

export interface Proposition {
  key: string;
  text: string;
  state: PropositionState;
}

export type GameState = typeof GameState[keyof typeof GameState];
