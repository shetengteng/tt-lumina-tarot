import { useI18n } from 'vue-i18n';
import type { CardRank, CardSuit, SpreadDef } from '@/types';

const SPREAD_KEY: Record<string, string> = {
  single: 'single',
  'three-card': 'threeCard',
  cross: 'cross',
  'celtic-lite': 'celticLite',
};

const SUIT_KEY: Record<CardSuit, string> = {
  wands: 'suitWands',
  cups: 'suitCups',
  swords: 'suitSwords',
  pentacles: 'suitPentacles',
};

const RANK_KEY: Record<CardRank, string> = {
  ace: 'rankAce',
  '2': 'rank2',
  '3': 'rank3',
  '4': 'rank4',
  '5': 'rank5',
  '6': 'rank6',
  '7': 'rank7',
  '8': 'rank8',
  '9': 'rank9',
  '10': 'rank10',
  page: 'rankPage',
  knight: 'rankKnight',
  queen: 'rankQueen',
  king: 'rankKing',
};

const ELEMENT_ZH_TO_KEY: Record<string, string> = {
  '火': 'elementFire',
  '水': 'elementWater',
  '风': 'elementAir',
  '土': 'elementEarth',
};

export function useTarotI18n() {
  const { t, te } = useI18n();

  function spreadName(spread: Pick<SpreadDef, 'id' | 'name'>): string {
    const key = SPREAD_KEY[spread.id];
    if (key && te(`spreads.${key}.name`)) return t(`spreads.${key}.name`);
    return spread.name;
  }

  function spreadSubtitle(spread: Pick<SpreadDef, 'id' | 'subtitle'>): string {
    const key = SPREAD_KEY[spread.id];
    if (key && te(`spreads.${key}.subtitle`)) return t(`spreads.${key}.subtitle`);
    return spread.subtitle;
  }

  function spreadDescription(spread: Pick<SpreadDef, 'id' | 'description'>): string {
    const key = SPREAD_KEY[spread.id];
    if (key && te(`spreads.${key}.description`)) return t(`spreads.${key}.description`);
    return spread.description;
  }

  function spreadPositionName(spreadId: string, posIndex: number, fallback: string): string {
    const key = SPREAD_KEY[spreadId];
    if (key && te(`spreads.${key}.pos${posIndex}`)) return t(`spreads.${key}.pos${posIndex}`);
    return fallback;
  }

  function suitLabel(suit: CardSuit): string {
    return t(`card.${SUIT_KEY[suit]}`);
  }

  function rankLabel(rank: CardRank): string {
    return t(`card.${RANK_KEY[rank]}`);
  }

  function elementLabel(element: string | undefined | null): string {
    if (!element) return '';
    const key = ELEMENT_ZH_TO_KEY[element];
    if (key && te(`card.${key}`)) return t(`card.${key}`);
    return element;
  }

  function moodLabel(moodId: string | undefined | null): string {
    if (!moodId) return '';
    if (te(`moods.${moodId}`)) return t(`moods.${moodId}`);
    return moodId;
  }

  return {
    spreadName,
    spreadSubtitle,
    spreadDescription,
    spreadPositionName,
    suitLabel,
    rankLabel,
    elementLabel,
    moodLabel,
  };
}
