import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { DrawnCard, ReadingRecord } from '@/types';
import { uid } from '@/lib/utils';

const HISTORY_KEY = 'lumina-history';
const CURRENT_KEY = 'lumina-current-reading';

interface CurrentReading {
  spreadId: string;
  question: string;
  mood?: string;
  cards: DrawnCard[];
  startedAt: number;
}

function readHistory(): ReadingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCurrent(): CurrentReading | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as CurrentReading) : null;
  } catch {
    return null;
  }
}

export const useReadingStore = defineStore('reading', () => {
  const history = ref<ReadingRecord[]>(readHistory());
  const current = ref<CurrentReading | null>(readCurrent());

  const historySorted = computed(() =>
    [...history.value].sort((a, b) => b.createdAt - a.createdAt)
  );

  function startReading(spreadId: string, question: string, mood?: string) {
    current.value = {
      spreadId,
      question,
      mood,
      cards: [],
      startedAt: Date.now(),
    };
  }

  function setDrawnCards(cards: DrawnCard[]) {
    if (!current.value) return;
    current.value = { ...current.value, cards };
  }

  function finalizeReading(note?: string): ReadingRecord | null {
    if (!current.value || current.value.cards.length === 0) return null;
    const rec: ReadingRecord = {
      id: uid('rd'),
      createdAt: Date.now(),
      spreadId: current.value.spreadId,
      question: current.value.question,
      mood: current.value.mood,
      cards: current.value.cards,
      note,
    };
    history.value = [rec, ...history.value].slice(0, 100);
    return rec;
  }

  function clearCurrent() {
    current.value = null;
  }

  function removeRecord(id: string) {
    history.value = history.value.filter((r) => r.id !== id);
  }

  function updateNote(id: string, note: string) {
    history.value = history.value.map((r) => (r.id === id ? { ...r, note } : r));
  }

  function clearAll() {
    history.value = [];
  }

  watch(
    history,
    (v) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(v));
    },
    { deep: true }
  );

  watch(
    current,
    (v) => {
      if (typeof window === 'undefined') return;
      if (v) window.localStorage.setItem(CURRENT_KEY, JSON.stringify(v));
      else window.localStorage.removeItem(CURRENT_KEY);
    },
    { deep: true }
  );

  return {
    history,
    historySorted,
    current,
    startReading,
    setDrawnCards,
    finalizeReading,
    clearCurrent,
    removeRecord,
    updateNote,
    clearAll,
  };
});
