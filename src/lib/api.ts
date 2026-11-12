// Data access for the UI. Uses the Express API when available and falls back to
// localStorage on static hosting, where /api does not exist.
import { buildLeaderboard } from './scoring';
import { getLocalAdminData, getLocalScores, recordLocalSubmission, resetLocalData } from './localStore';
import type { AdminData, LeaderboardEntry, SubmissionRecord, SurveySubmissionPayload } from '../types/survey';

async function request<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`/api${path}`, init);
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function submitSurvey(payload: SurveySubmissionPayload): Promise<SubmissionRecord> {
  const res = await request<{ submission: SubmissionRecord }>('/survey/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res?.submission ?? recordLocalSubmission(payload);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await request<{ teams: LeaderboardEntry[] }>('/survey/leaderboard');
  return res?.teams?.length ? res.teams : buildLeaderboard(getLocalScores());
}

export async function fetchAdminData(): Promise<AdminData> {
  return (await request<AdminData>('/admin')) ?? getLocalAdminData();
}

/** Resets scores to the benchmarks. Returns false when only local data was reset. */
export async function resetData(): Promise<boolean> {
  if (await request('/admin/reset', { method: 'POST' })) return true;
  resetLocalData();
  return false;
}
