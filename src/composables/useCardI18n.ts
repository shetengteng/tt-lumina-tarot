import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TarotCardDef } from '@/types';
import type { CardI18nMessages } from '@/i18n/locales/cards/types';

type CardField =
  | 'name'
  | 'summary'
  | 'upright.meaning'
  | 'upright.love'
  | 'upright.career'
  | 'upright.advice'
  | 'reversed.meaning'
  | 'reversed.love'
  | 'reversed.career'
  | 'reversed.advice';

function readNested(obj: CardI18nMessages, path: CardField): string {
  const segments = path.split('.');
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return '';
    }
  }
  return typeof cur === 'string' ? cur : '';
}

export function useCardI18n() {
  const { messages, locale } = useI18n();

  function getMessages(cardId: string): CardI18nMessages | undefined {
    const cur = messages.value[locale.value] as Record<string, unknown> | undefined;
    const cards = cur?.cards as Record<string, CardI18nMessages> | undefined;
    return cards?.[cardId];
  }

  function getName(card: Pick<TarotCardDef, 'id' | 'name' | 'nameEn'> | null | undefined): string {
    if (!card) return '';
    const m = getMessages(card.id);
    if (m?.name) return m.name;
    return locale.value === 'en-US' ? card.nameEn || card.name : card.name;
  }

  function getKeywords(card: Pick<TarotCardDef, 'id' | 'keywords'> | null | undefined): string[] {
    if (!card) return [];
    const m = getMessages(card.id);
    if (m?.keywords && m.keywords.length > 0) return m.keywords;
    return card.keywords ?? [];
  }

  function getField(card: Pick<TarotCardDef, 'id' | 'summary' | 'upright' | 'reversed'> | null | undefined, field: CardField): string {
    if (!card) return '';
    const m = getMessages(card.id);
    if (m) {
      const v = readNested(m, field);
      if (v) return v;
    }
    if (field === 'summary') return card.summary;
    if (field.startsWith('upright.')) {
      const sub = field.split('.')[1] as keyof typeof card.upright;
      return (card.upright as Record<string, string>)[sub] ?? '';
    }
    if (field.startsWith('reversed.')) {
      const sub = field.split('.')[1] as keyof typeof card.reversed;
      return (card.reversed as Record<string, string>)[sub] ?? '';
    }
    return '';
  }

  return {
    locale: computed(() => locale.value),
    getName,
    getKeywords,
    getField,
  };
}
