// Data access for the UI. Talks to the Google Apps Script backend when VITE_API_URL is set;
// otherwise keeps everything in this browser's localStorage (local development / demos).
import { buildLeaderboard } from './scoring';
import { getLocalAdminData, getLocalScores, recordLocalSubmission } from './localStore';
import type { AdminData, LeaderboardEntry, SubmissionRecord, SurveySubmissionPayload } from '../types/survey';

const API_URL = import.meta.env.VITE_API_URL;

export const hasBackend = Boolean(API_URL);

export class UnauthorizedError extends Error {}

async function call<T>(init: { query?: Record<string, string>; body?: unknown }): Promise<T> {
  const url = init.query ? `${API_URL}?${new URLSearchParams(init.query)}` : API_URL!;
  const res = await fetch(
    url,
    init.body === undefined
      ? undefined
      : {
          method: 'POST',
          // text/plain keeps this a "simple" CORS request, which Apps Script can answer.
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(init.body),
        }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data?.error === 'Unauthorized') throw new UnauthorizedError(data.error);
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function submitSurvey(payload: SurveySubmissionPayload): Promise<SubmissionRecord> {
  if (!hasBackend) return recordLocalSubmission(payload);
  const { submission } = await call<{ submission: SubmissionRecord }>({ body: { action: 'submit', payload } });
  return submission;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!hasBackend) return buildLeaderboard(getLocalScores());
  const { teams } = await call<{ teams: LeaderboardEntry[] }>({ query: { action: 'leaderboard' } });
  return teams;
}

export async function fetchAdminData(key: string): Promise<AdminData> {
  if (!hasBackend) return getLocalAdminData();
  return call<AdminData>({ body: { action: 'admin', key } });
}
