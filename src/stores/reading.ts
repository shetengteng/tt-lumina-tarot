import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { DrawnCard, ReadingRecord } from '@/types';
import { uid } from '@/lib/utils';
import {
  bulkPutReadings,
  clearReadings,
  deleteReading,
  getCurrentReading,
  listReadings,
  putReading,
  setCurrentReading,
} from '@/lib/db';

interface CurrentReading {
  spreadId: string;
  question: string;
  mood?: string;
  cards: DrawnCard[];
  startedAt: number;
}

function debounceAsync<T extends (...args: never[]) => Promise<void>>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void fn(...args);
    }, ms);
  };
}

function toPlain<T>(value: T): T {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

export const useReadingStore = defineStore('reading', () => {
  const history = ref<ReadingRecord[]>([]);
  const current = ref<CurrentReading | null>(null);
  const ready = ref(false);

  const readyPromise = (async () => {
    try {
      const [savedHistory, savedCurrent] = await Promise.all([
        listReadings(),
        getCurrentReading<CurrentReading>(),
      ]);
      history.value = savedHistory;
      current.value = savedCurrent;
    } finally {
      ready.value = true;
    }
  })();

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
    void putReading(toPlain(rec));
    return rec;
  }

  function clearCurrent() {
    current.value = null;
  }

  function removeRecord(id: string) {
    history.value = history.value.filter((r) => r.id !== id);
    void deleteReading(id);
  }

  function updateNote(id: string, note: string) {
    history.value = history.value.map((r) => (r.id === id ? { ...r, note } : r));
    const rec = history.value.find((r) => r.id === id);
    if (rec) void putReading(toPlain(rec));
  }

  function clearAll() {
    history.value = [];
    void clearReadings();
  }

  const persistHistory = debounceAsync(async (snapshot: ReadingRecord[]) => {
    await bulkPutReadings(snapshot);
  }, 250);

  const persistCurrent = debounceAsync(async (snapshot: CurrentReading | null) => {
    await setCurrentReading(snapshot);
  }, 200);

  watch(
    history,
    (v) => {
      if (!ready.value) return;
      persistHistory(toPlain(v));
    },
    { deep: true }
  );

  watch(
    current,
    (v) => {
      if (!ready.value) return;
      persistCurrent(v ? toPlain(v) : null);
    },
    { deep: true }
  );

  return {
    history,
    historySorted,
    current,
    ready,
    readyPromise,
    startReading,
    setDrawnCards,
    finalizeReading,
    clearCurrent,
    removeRecord,
    updateNote,
    clearAll,
  };
});
