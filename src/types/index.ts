export type ThemeId = 'mystic' | 'minimal' | 'nature';

export type CardBackVariant = 'classic' | 'celestial' | 'sacred' | 'floral' | 'eye';

export type MinorIllustrationStyle = 'symbol' | 'geometric';

export type CardArtTheme = 'minimal' | 'rws' | 'aquatic';

export type EffectiveCardBack =
  | { kind: 'svg'; variant: CardBackVariant }
  | { kind: 'image'; src: string };

export type Locale = 'zh-CN' | 'en-US';

export type AnimationLevel = 'off' | 'lite' | 'full';

export type Arcana = 'major' | 'minor';

export type CardSuit = 'wands' | 'cups' | 'swords' | 'pentacles';

export type CardRank =
  | 'ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'page'
  | 'knight'
  | 'queen'
  | 'king';

export interface TarotCardDef {
  id: string;
  number: number;
  name: string;
  nameEn: string;
  arcana: Arcana;
  suit?: CardSuit;
  rank?: CardRank;
  keywords: string[];
  element?: string;
  planet?: string;
  zodiac?: string;
  symbol: string;
  summary: string;
  upright: {
    meaning: string;
    love: string;
    career: string;
    advice: string;
  };
  reversed: {
    meaning: string;
    love: string;
    career: string;
    advice: string;
  };
}

export interface SpreadPosition {
  index: number;
  name: string;
  role: string;
}

export interface SpreadDef {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  count: number;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  cardId: string;
  reversed: boolean;
  positionIndex: number;
}

export interface ReadingRecord {
  id: string;
  createdAt: number;
  spreadId: string;
  question: string;
  mood?: string;
  cards: DrawnCard[];
  note?: string;
}

export interface PaletteSwatch {
  name: string;
  token: string;
  hsl: string;
}
