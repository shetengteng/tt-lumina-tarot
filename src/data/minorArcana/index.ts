import type { TarotCardDef, CardSuit } from '@/types';
import { WANDS } from './wands';
import { CUPS } from './cups';
import { SWORDS } from './swords';
import { PENTACLES } from './pentacles';

export const MINOR_ARCANA: TarotCardDef[] = [...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

export const SUITS: Record<CardSuit, { label: string; element: string; symbol: string; keywordZh: string }> = {
  wands: { label: '权杖', element: '火', symbol: '🜂', keywordZh: '行动 · 意志' },
  cups: { label: '圣杯', element: '水', symbol: '🜄', keywordZh: '情感 · 关系' },
  swords: { label: '宝剑', element: '风', symbol: '🜁', keywordZh: '思想 · 决断' },
  pentacles: { label: '钱币', element: '土', symbol: '🜃', keywordZh: '物质 · 身体' },
};

export function getCardsBySuit(suit: CardSuit): TarotCardDef[] {
  return MINOR_ARCANA.filter((c) => c.suit === suit);
}

export { WANDS, CUPS, SWORDS, PENTACLES };
