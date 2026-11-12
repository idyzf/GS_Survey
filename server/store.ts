// JSON-file persistence for the Express server (data/ is gitignored).
import fs from 'fs';
import path from 'path';
import { seedScores } from '../src/lib/scoring';
import type { EmailLogEntry, SubmissionRecord, TeamScores } from '../src/types/survey';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'survey_data.json');
const EMAIL_LOG_FILE = path.join(DATA_DIR, 'email_logs.json');
const MAX_EMAIL_LOGS = 100;

export interface Db {
  teams: TeamScores;
  submissions: SubmissionRecord[];
}

fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson<T>(file: string, fallback: () => T): T {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch (err) {
    console.error(`Could not read ${file}, using defaults:`, err);
  }
  return fallback();
}

const writeJson = (file: string, data: unknown) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

const emptyDb = (): Db => ({ teams: seedScores(), submissions: [] });

export function readDb(): Db {
  const db = readJson(DB_FILE, emptyDb);
  return { ...db, teams: { ...seedScores(), ...db.teams } };
}

export const saveDb = (db: Db) => writeJson(DB_FILE, db);
export const resetDb = () => saveDb(emptyDb());

export const readEmailLogs = () => readJson<EmailLogEntry[]>(EMAIL_LOG_FILE, () => []);

export function appendEmailLog(entry: EmailLogEntry): void {
  writeJson(EMAIL_LOG_FILE, [entry, ...readEmailLogs()].slice(0, MAX_EMAIL_LOGS));
}
