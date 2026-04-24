import type { TarotCardDef } from '@/types';
import { MAJOR_ARCANA } from './majorArcana';
import { MINOR_ARCANA, SUITS, getCardsBySuit } from './minorArcana';

export const ALL_CARDS: TarotCardDef[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function getCardById(id: string): TarotCardDef | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getCardsByArcana(arcana: 'major' | 'minor'): TarotCardDef[] {
  return ALL_CARDS.filter((c) => c.arcana === arcana);
}

export { MAJOR_ARCANA, MINOR_ARCANA, SUITS, getCardsBySuit };
