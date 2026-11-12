/// <reference types="google-apps-script" />
// Google Apps Script web app: stores each submission in the bound Google Sheet,
// emails the admin, and serves the live leaderboard. Bundled by scripts/build-backend.mjs.
import { DEFAULT_ADMIN_EMAIL } from '../src/config';
import { TEAMS } from '../src/data/teams';
import { buildNotificationEmail, formatAnswer } from '../src/lib/notification';
import { SCORED_QUESTION_IDS, buildLeaderboard, createSubmission, emptyScores } from '../src/lib/scoring';
import type {
  AdminData,
  Answers,
  AnswerData,
  EmailLogEntry,
  LeaderboardEntry,
  SubmissionRecord,
  SurveySubmissionPayload,
  TeamId,
} from '../src/types/survey';

type GetEvent = GoogleAppsScript.Events.DoGet;
type PostEvent = GoogleAppsScript.Events.DoPost;
type Output = GoogleAppsScript.Content.TextOutput;

const RESPONSES = {
  name: 'Respostas',
  headers: [
    'Submission ID',
    'Timestamp',
    'Team ID',
    'Team Name',
    'Other Team',
    'Total Points',
    'Answered',
    'Skipped',
    'Language',
    'Email Contact',
    ...SCORED_QUESTION_IDS.map((id) => `Q${id}`),
    'Answers JSON',
  ],
};
const EMAILS = {
  name: 'E-mails',
  headers: ['Email ID', 'Timestamp', 'To', 'Subject', 'Submission ID', 'Team', 'Points', 'Status', 'HTML'],
};
// Column positions (0-based) used when reading rows back.
const COL = { id: 0, timestamp: 1, team: 2, teamName: 3, other: 4, points: 5, answered: 6, skipped: 7, language: 8, contact: 9 };

const MAX_BODY_CHARS = 100_000;
const MAX_TEXT_CHARS = 2_000;
const MAX_CELL_CHARS = 49_000;
const LEADERBOARD_CACHE_SECONDS = 30;
const DEDUPE_CACHE_SECONDS = 6 * 60 * 60;

// ---------------------------------------------------------------------------
// Entry points (wired to global doGet/doPost/setup by the build script)
// ---------------------------------------------------------------------------

export function doGet(e: GetEvent): Output {
  return respond(() => {
    if ((e.parameter.action ?? 'leaderboard') !== 'leaderboard') throw new Error('Unknown action');
    return { teams: getLeaderboard() };
  });
}

export function doPost(e: PostEvent): Output {
  return respond(() => {
    const raw = e.postData?.contents ?? '';
    if (!raw || raw.length > MAX_BODY_CHARS) throw new Error('Invalid request');
    const body = JSON.parse(raw);
    switch (body.action) {
      case 'submit':
        return { submission: submit(body.payload) };
      case 'admin':
        requireAdminKey(body.key);
        return getAdminData();
      default:
        throw new Error('Unknown action');
    }
  });
}

/** Run once from the Apps Script editor: creates the tabs, an admin key, and sends a test email. */
export function setup(): void {
  getSheet(RESPONSES);
  getSheet(EMAILS);
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_KEY')) props.setProperty('ADMIN_KEY', Utilities.getUuid());
  MailApp.sendEmail({
    to: getAdminEmail(),
    subject: '[Survey Genômica] Backend configurado',
    htmlBody: `<p>O backend da survey está funcionando.</p><p>Chave do painel admin: <b>${props.getProperty('ADMIN_KEY')}</b></p>`,
  });
  Logger.log(`Setup ok. Admin key: ${props.getProperty('ADMIN_KEY')}. Notifications go to ${getAdminEmail()}.`);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function submit(raw: unknown): SubmissionRecord {
  const payload = sanitizePayload(raw);
  const cache = CacheService.getScriptCache();
  const dedupeKey = payload.clientId ? `submission:${payload.clientId}` : null;
  const previous = dedupeKey && cache.get(dedupeKey);
  if (previous) return JSON.parse(previous) as SubmissionRecord;

  const submission = createSubmission(payload);
  const lock = LockService.getScriptLock();
  lock.waitLock(20_000);
  try {
    getSheet(RESPONSES).appendRow(toResponseRow(submission));
  } finally {
    lock.releaseLock();
  }
  cache.remove('leaderboard');
  if (dedupeKey) cache.put(dedupeKey, JSON.stringify(submission), DEDUPE_CACHE_SECONDS);

  sendNotification(submission);
  return submission;
}

function sendNotification(submission: SubmissionRecord): void {
  const email = buildNotificationEmail(submission, getAdminEmail());
  try {
    MailApp.sendEmail({ to: email.to, subject: email.subject, htmlBody: email.htmlBody, name: 'Genomics Survey' });
    email.status = 'sent';
  } catch (err) {
    // The response is already saved in the sheet; a mail failure (e.g. daily quota) must not lose it.
    console.error('Email failed', err);
    email.status = 'failed';
  }
  getSheet(EMAILS).appendRow(
    [email.id, new Date(email.timestamp), email.to, email.subject, email.submissionId, email.team, email.points, email.status, email.htmlBody.slice(0, MAX_CELL_CHARS)].map(safeCell)
  );
}

function getLeaderboard(): LeaderboardEntry[] {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('leaderboard');
  if (cached) return JSON.parse(cached) as LeaderboardEntry[];

  const scores = emptyScores();
  for (const row of readRows(RESPONSES.name)) {
    const score = scores[row[COL.team] as TeamId];
    if (!score) continue;
    score.points += Number(row[COL.points]) || 0;
    score.participantsCount += 1;
  }
  const leaderboard = buildLeaderboard(scores);
  cache.put('leaderboard', JSON.stringify(leaderboard), LEADERBOARD_CACHE_SECONDS);
  return leaderboard;
}

function getAdminData(): AdminData {
  const submissions = readRows(RESPONSES.name)
    .map((row): SubmissionRecord => ({
      id: String(row[COL.id]),
      timestamp: toIso(row[COL.timestamp]),
      selectedTeam: row[COL.team] as TeamId,
      teamName: String(row[COL.teamName]),
      otherTeamText: String(row[COL.other]) || undefined,
      totalPoints: Number(row[COL.points]) || 0,
      answeredCount: Number(row[COL.answered]) || 0,
      skippedCount: Number(row[COL.skipped]) || 0,
      language: row[COL.language] === 'en' ? 'en' : 'pt',
      emailContact: String(row[COL.contact]) || undefined,
      answers: parseAnswers(row[row.length - 1]),
    }))
    .reverse();

  const emailLogs = readRows(EMAILS.name)
    .map(
      (row): EmailLogEntry => ({
        id: String(row[0]),
        timestamp: toIso(row[1]),
        to: String(row[2]),
        subject: String(row[3]),
        submissionId: String(row[4]),
        team: String(row[5]),
        points: Number(row[6]) || 0,
        status: row[7] === 'failed' ? 'failed' : 'sent',
        htmlBody: String(row[8]),
      })
    )
    .reverse();

  return {
    submissions,
    emailLogs,
    adminEmail: getAdminEmail(),
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respond(handler: () => unknown): Output {
  let body: unknown;
  try {
    body = handler();
  } catch (err) {
    body = { error: err instanceof Error ? err.message : String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function requireAdminKey(key: unknown): void {
  const expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected || key !== expected) throw new Error('Unauthorized');
}

function getAdminEmail(): string {
  return (
    PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') ||
    Session.getEffectiveUser().getEmail() ||
    DEFAULT_ADMIN_EMAIL
  );
}

function getSheet({ name, headers }: { name: string; headers: string[] }): GoogleAppsScript.Spreadsheet.Sheet {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function readRows(name: string): unknown[][] {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}

function toResponseRow(s: SubmissionRecord): unknown[] {
  return [
    s.id,
    new Date(s.timestamp),
    s.selectedTeam,
    s.teamName,
    s.otherTeamText ?? '',
    s.totalPoints,
    s.answeredCount,
    s.skippedCount,
    s.language,
    s.emailContact ?? '',
    ...SCORED_QUESTION_IDS.map((id) => (s.answers[id]?.isSkipped ? 'SKIPPED' : formatAnswer(s.answers[id]))),
    JSON.stringify(s.answers).slice(0, MAX_CELL_CHARS),
  ].map(safeCell);
}

/** Stops participant text from being evaluated as a spreadsheet formula. */
function safeCell(value: unknown): unknown {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? `'${value}` : value;
}

const toIso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));

function parseAnswers(value: unknown): Answers {
  try {
    return JSON.parse(String(value)) as Answers;
  } catch {
    return {};
  }
}

/** Accepts only the expected shape and size from the (untrusted) browser payload. */
function sanitizePayload(raw: unknown): SurveySubmissionPayload {
  const input = (raw ?? {}) as Record<string, any>;
  if (typeof input.selectedTeam !== 'string' || !(input.selectedTeam in TEAMS)) throw new Error('Unknown team');
  const clip = (v: unknown) => (typeof v === 'string' ? v.slice(0, MAX_TEXT_CHARS) : undefined);

  const answers: Answers = {};
  for (const id of SCORED_QUESTION_IDS) {
    const a = input.answers?.[id];
    if (!a || typeof a !== 'object') continue;
    let value: AnswerData | null = null;
    if (typeof a.value === 'string') value = clip(a.value)!;
    else if (Array.isArray(a.value)) value = a.value.filter((v: unknown) => typeof v === 'string').slice(0, 50).map(clip);
    else if (a.value && typeof a.value === 'object') {
      value = Object.fromEntries(
        Object.entries(a.value)
          .filter(([, n]) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 5)
          .slice(0, 50)
      ) as Record<string, number>;
    }
    answers[id] = { value, textDetail: clip(a.textDetail), isSkipped: Boolean(a.isSkipped) };
  }

  return {
    selectedTeam: input.selectedTeam as TeamId,
    otherTeamText: clip(input.otherTeamText),
    answers,
    language: input.language === 'en' ? 'en' : 'pt',
    clientId: clip(input.clientId),
  };
}
