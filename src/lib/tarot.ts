import type { DrawnCard, SpreadDef } from '@/types';
import { ALL_CARDS } from '@/data/cards';
import { isReversed, shuffle } from './utils';

/**
 * 从 78 张完整塔罗牌（大阿卡那 22 + 小阿卡那 56）中抽取 N 张，
 * 为每张独立计算正/逆位。
 */
export function drawCards(spread: SpreadDef, reversedRate = 0.35): DrawnCard[] {
  const pool = shuffle(ALL_CARDS.map((c) => c.id));
  const picked = pool.slice(0, spread.count);
  return picked.map((cardId, index) => ({
    cardId,
    reversed: isReversed(reversedRate),
    positionIndex: index,
  }));
}
