// Survey scoring and leaderboard rules. Shared by the browser and the Express server.
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

export function randomId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}-${Date.now().toString(36)}-${hex}`.toUpperCase();
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

export function seedScores(): TeamScores {
  return Object.fromEntries(
    TEAM_IDS.map((id) => [id, { points: TEAMS[id].seedPoints, participantsCount: TEAMS[id].seedParticipants }])
  ) as TeamScores;
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
    points: scores[id]?.points ?? TEAMS[id].seedPoints,
    participantsCount: scores[id]?.participantsCount ?? TEAMS[id].seedParticipants,
    rank: 0,
  }))
    .sort((a, b) => b.points - a.points)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}
