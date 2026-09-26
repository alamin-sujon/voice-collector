import { openDB, type IDBPDatabase } from "idb";

export interface RecordingRecord {
  questionId: number;
  questionText: string;
  blob: Blob;
  mimeType: string;
  duration: number;
  createdAt: string;
  filename: string;
}

const DB_NAME = "voice-collect-db";
const STORE_NAME = "recordings";
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "questionId",
          });
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveRecording(record: RecordingRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, record);
}

export async function getRecording(
  questionId: number,
): Promise<RecordingRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, questionId);
}

export async function getAllRecordings(): Promise<RecordingRecord[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function getCompletedQuestionIds(): Promise<number[]> {
  const all = await getAllRecordings();
  return all.map((r) => r.questionId).sort((a, b) => a - b);
}

export async function deleteRecording(questionId: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, questionId);
}

export async function clearAllRecordings(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_NAME);
}

export async function getRecordingCount(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}
