import Dexie, { type Table } from 'dexie';
import type { ReadingRecord } from '@/types';

export interface KvRecord<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

export interface DailyDrawRecord {
  date: string;
  slots: Array<{ area: string; cardId: string; reversed: boolean }>;
  updatedAt: number;
}

class LuminaDB extends Dexie {
  readings!: Table<ReadingRecord, string>;
  dailyDraws!: Table<DailyDrawRecord, string>;
  kv!: Table<KvRecord, string>;

  constructor() {
    super('lumina-tarot');
    this.version(1).stores({
      readings: '&id, createdAt, spreadId',
      dailyDraws: '&date, updatedAt',
      kv: '&key, updatedAt',
    });
  }
}

let _db: LuminaDB | null = null;

export function db(): LuminaDB {
  if (!_db) _db = new LuminaDB();
  return _db;
}

function toPlain<T>(value: T): T {
  if (value === null || value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

const HISTORY_KEY = 'lumina-history';
const CURRENT_KEY = 'lumina-current-reading';
const DAILY_LEGACY_KEY = 'lumina-daily-insight';
const MIGRATED_FLAG_KEY = 'lumina-db-migrated-v1';

export async function listReadings(): Promise<ReadingRecord[]> {
  await migrateLegacyOnce();
  return db().readings.orderBy('createdAt').reverse().toArray();
}

export async function bulkPutReadings(records: ReadingRecord[]): Promise<void> {
  await db().readings.clear();
  if (records.length > 0) await db().readings.bulkPut(toPlain(records));
}

export async function putReading(record: ReadingRecord): Promise<void> {
  await db().readings.put(toPlain(record));
}

export async function deleteReading(id: string): Promise<void> {
  await db().readings.delete(id);
}

export async function clearReadings(): Promise<void> {
  await db().readings.clear();
}

export async function getCurrentReading<T>(): Promise<T | null> {
  await migrateLegacyOnce();
  const row = await db().kv.get(CURRENT_KEY);
  return (row?.value as T | undefined) ?? null;
}

export async function setCurrentReading<T>(v: T | null): Promise<void> {
  if (v === null) {
    await db().kv.delete(CURRENT_KEY);
    return;
  }
  await db().kv.put({ key: CURRENT_KEY, value: toPlain(v), updatedAt: Date.now() });
}

export async function getDailyDraw(date: string): Promise<DailyDrawRecord | null> {
  await migrateLegacyOnce();
  return (await db().dailyDraws.get(date)) ?? null;
}

export async function putDailyDraw(record: Omit<DailyDrawRecord, 'updatedAt'>): Promise<void> {
  await db().dailyDraws.put({ ...toPlain(record), updatedAt: Date.now() });
}

export async function searchReadings(term: string): Promise<ReadingRecord[]> {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return listReadings();
  await migrateLegacyOnce();
  const all = await db().readings.toArray();
  return all
    .filter((r) => {
      if (r.question?.toLowerCase().includes(trimmed)) return true;
      if (r.note?.toLowerCase().includes(trimmed)) return true;
      if (r.mood?.toLowerCase().includes(trimmed)) return true;
      return r.cards.some((c) => c.cardId.toLowerCase().includes(trimmed));
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

let _migratePromise: Promise<void> | null = null;

export function migrateLegacyOnce(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (_migratePromise) return _migratePromise;
  _migratePromise = (async () => {
    try {
      if (window.localStorage.getItem(MIGRATED_FLAG_KEY) === '1') return;
      await migrateLegacyHistory();
      await migrateLegacyCurrent();
      await migrateLegacyDaily();
      window.localStorage.setItem(MIGRATED_FLAG_KEY, '1');
    } catch (err) {
      console.warn('[lumina-db] legacy migration failed', err);
    }
  })();
  return _migratePromise;
}

async function migrateLegacyHistory(): Promise<void> {
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const existing = await db().readings.count();
    if (existing === 0 && parsed.length > 0) {
      await db().readings.bulkPut(parsed as ReadingRecord[]);
    }
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

async function migrateLegacyCurrent(): Promise<void> {
  const raw = window.localStorage.getItem(CURRENT_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const existing = await db().kv.get(CURRENT_KEY);
    if (!existing && parsed) {
      await db().kv.put({ key: CURRENT_KEY, value: parsed, updatedAt: Date.now() });
    }
    window.localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* ignore */
  }
}

async function migrateLegacyDaily(): Promise<void> {
  const raw = window.localStorage.getItem(DAILY_LEGACY_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { date?: string; slots?: DailyDrawRecord['slots'] };
    if (parsed?.date && Array.isArray(parsed.slots)) {
      const existing = await db().dailyDraws.get(parsed.date);
      if (!existing) {
        await db().dailyDraws.put({
          date: parsed.date,
          slots: parsed.slots,
          updatedAt: Date.now(),
        });
      }
    }
    window.localStorage.removeItem(DAILY_LEGACY_KEY);
  } catch {
    /* ignore */
  }
}
