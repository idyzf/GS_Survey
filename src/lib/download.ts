import { formatAnswer } from './notification';
import { SCORED_QUESTION_IDS } from './scoring';
import type { SubmissionRecord } from '../types/survey';

export function downloadFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export function submissionsToCsv(submissions: SubmissionRecord[]): string {
  const headers = [
    'Submission ID',
    'Timestamp',
    'Team ID',
    'Team Name',
    'Total Points',
    'Questions Answered',
    'Questions Skipped',
    'Email Contact (Q17)',
    'Language',
    ...SCORED_QUESTION_IDS.map((id) => `Q${id}_Answer`),
  ];
  const rows = submissions.map((s) =>
    [
      quote(s.id),
      quote(s.timestamp),
      quote(s.selectedTeam),
      quote(s.teamName),
      s.totalPoints,
      s.answeredCount,
      s.skippedCount,
      quote(s.emailContact ?? ''),
      quote(s.language),
      ...SCORED_QUESTION_IDS.map((id) => {
        const answer = s.answers?.[id];
        return !answer || answer.isSkipped ? 'SKIPPED' : quote(formatAnswer(answer));
      }),
    ].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
