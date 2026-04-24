export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
}

export const MOODS: MoodOption[] = [
  { id: 'calm', label: '平静', emoji: '·' },
  { id: 'anxious', label: '焦虑', emoji: '✦' },
  { id: 'hopeful', label: '期待', emoji: '☀' },
  { id: 'lost', label: '迷茫', emoji: '☽' },
  { id: 'sad', label: '低落', emoji: '◌' },
  { id: 'curious', label: '好奇', emoji: '◎' },
];
