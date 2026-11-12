// Browser-only persistence, used when no backend URL is configured (local development / demos).
import { DEFAULT_ADMIN_EMAIL } from '../config';
import { buildNotificationEmail } from './notification';
import { applySubmission, createSubmission, emptyScores } from './scoring';
import type { AdminData, SubmissionRecord, SurveySubmissionPayload, TeamScores } from '../types/survey';

const KEYS = {
  scores: 'genomics_survey_v2_scores',
  submissions: 'genomics_survey_v2_submissions',
  emailLogs: 'genomics_survey_v2_email_logs',
};
const MAX_STORED = 50;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the session still works, it just isn't persisted.
  }
}

export const getLocalScores = (): TeamScores => ({ ...emptyScores(), ...read(KEYS.scores, {}) });

export function recordLocalSubmission(payload: SurveySubmissionPayload): SubmissionRecord {
  const submission = createSubmission(payload);
  const scores = getLocalScores();
  applySubmission(scores, submission);
  write(KEYS.scores, scores);

  const admin = getLocalAdminData();
  write(KEYS.submissions, [submission, ...admin.submissions].slice(0, MAX_STORED));
  const email = buildNotificationEmail(submission, DEFAULT_ADMIN_EMAIL);
  write(KEYS.emailLogs, [email, ...admin.emailLogs].slice(0, MAX_STORED));
  return submission;
}

export const getLocalAdminData = (): AdminData => ({
  submissions: read(KEYS.submissions, []),
  emailLogs: read(KEYS.emailLogs, []),
  adminEmail: DEFAULT_ADMIN_EMAIL,
});
