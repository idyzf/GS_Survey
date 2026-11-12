import { RESPONSE_COLUMNS } from './answerText';
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
    ...RESPONSE_COLUMNS.map((c) => c.header),
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
      ...RESPONSE_COLUMNS.map((c) => quote(c.value(s.answers ?? {}))),
    ].join(',')
  );
  // BOM so Excel opens the accents correctly.
  return '\uFEFF' + [headers.map(quote).join(','), ...rows].join('\n');
}
