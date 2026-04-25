export type CardI18nMessages = {
  name: string;
  keywords: string[];
  summary: string;
  upright: { meaning: string; love: string; career: string; advice: string };
  reversed: { meaning: string; love: string; career: string; advice: string };
};

export type CardsLocaleMessages = Record<string, CardI18nMessages>;
