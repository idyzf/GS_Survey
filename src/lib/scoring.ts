// Survey scoring and leaderboard rules. Shared by the browser and the Apps Script backend.
import { TEAMS, TEAM_IDS } from '../data/teams';
import type {
  Answer,
  Answers,
  LeaderboardEntry,
  SubmissionRecord,
  SurveySubmissionPayload,
  TeamScores,
} from '../types/survey';

export const POINTS_PER_QUESTION = 6.25;
/** Questions 2–17 are scored; question 1 only picks the team. */
export const SCORED_QUESTION_IDS = Array.from({ length: 16 }, (_, i) => i + 2);
export const MAX_SCORED = SCORED_QUESTION_IDS.length;
export const CONTACT_QUESTION_ID = 17;

export function isAnswered(answer?: Answer): boolean {
  if (!answer || answer.isSkipped) return false;
  const { value, textDetail } = answer;
  if (typeof value === 'string' && value.trim()) return true;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object' && Object.keys(value).length > 0) return true;
  return Boolean(textDetail?.trim());
}

export function countAnswered(answers: Answers): number {
  return SCORED_QUESTION_IDS.filter((id) => isAnswered(answers[id])).length;
}

/** Readable unique-enough id (not security sensitive). Works in browsers and Apps Script. */
export function randomId(prefix: string): string {
  const rand = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  return `${prefix}-${Date.now().toString(36)}-${rand}`.toUpperCase();
}

/** Normalizes the raw payload into the record that gets stored. */
export function createSubmission(payload: SurveySubmissionPayload): SubmissionRecord {
  const answers: Answers = {};
  for (const id of SCORED_QUESTION_IDS) {
    const raw = payload.answers?.[id];
    answers[id] = isAnswered(raw)
      ? { value: raw!.value, textDetail: raw!.textDetail || '', isSkipped: false }
      : { value: null, isSkipped: true };
  }

  const answeredCount = countAnswered(answers);
  const contact = answers[CONTACT_QUESTION_ID];
  const team = TEAMS[payload.selectedTeam];

  return {
    id: randomId('GEN'),
    timestamp: new Date().toISOString(),
    selectedTeam: payload.selectedTeam,
    teamName: team.name,
    otherTeamText: payload.selectedTeam === 'other' ? payload.otherTeamText : undefined,
    answers,
    totalPoints: answeredCount * POINTS_PER_QUESTION,
    answeredCount,
    skippedCount: MAX_SCORED - answeredCount,
    language: payload.language ?? 'pt',
    emailContact: contact.value === 'yes' ? contact.textDetail?.trim() || undefined : undefined,
  };
}

/** Every team starts at zero: the leaderboard only reflects real participation. */
export function emptyScores(): TeamScores {
  return Object.fromEntries(TEAM_IDS.map((id) => [id, { points: 0, participantsCount: 0 }])) as TeamScores;
}

export function applySubmission(scores: TeamScores, submission: SubmissionRecord): void {
  const score = scores[submission.selectedTeam];
  score.points = Math.round((score.points + submission.totalPoints) * 100) / 100;
  score.participantsCount += 1;
}

export function buildLeaderboard(scores: TeamScores): LeaderboardEntry[] {
  return TEAM_IDS.map((id) => ({
    id,
    name: TEAMS[id].name,
    subtitle: TEAMS[id].subtitle,
    points: scores[id]?.points ?? 0,
    participantsCount: scores[id]?.participantsCount ?? 0,
    rank: 0,
  }))
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}
