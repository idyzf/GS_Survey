// Turns stored answers (option ids, likert maps) into readable text.
// Used by the spreadsheet, CSV export, notification email, admin panel and scorecard.
import { SURVEY_QUESTIONS } from '../data/questions';
import type { Answer, Answers, Language, Question } from '../types/survey';

export const SCORED_QUESTIONS = SURVEY_QUESTIONS.filter((q) => q.type !== 'team_select');

export const SKIPPED_TEXT: Record<Language, string> = { pt: '(pulada)', en: '(skipped)' };

const optionLabel = (q: Question, id: string, lang: Language) =>
  q.options?.find((o) => o.id === id)?.label[lang] ?? id;

const withDetail = (text: string, detail?: string) => (detail?.trim() ? `${text} — ${detail.trim()}` : text);

/** E.g. "Hospital / laboratório clínico", "Outra — Fiocruz", "Comunicação…: 4; Requisitos…: 2". */
export function describeAnswer(q: Question, answer: Answer | undefined, lang: Language = 'pt'): string {
  if (!answer || answer.isSkipped || answer.value == null) return SKIPPED_TEXT[lang];
  const { value, textDetail } = answer;

  switch (q.type) {
    case 'single_choice':
    case 'contact_optin':
      return withDetail(optionLabel(q, String(value), lang), textDetail);
    case 'multi_choice':
      return withDetail(
        (value as string[]).map((id) => optionLabel(q, id, lang)).join('; '),
        textDetail
      );
    case 'likert_grid': {
      const ratings = value as Record<string, number>;
      return (q.likertItems ?? [])
        .filter((item) => ratings[item.id])
        .map((item) => `${item.label[lang]}: ${ratings[item.id]}`)
        .join('; ');
    }
    default:
      return String(value);
  }
}

export interface ResponseColumn {
  header: string;
  value: (answers: Answers) => string | number;
}

/**
 * One column per question — and one per item of the likert grid, holding the 1–5 score —
 * with Portuguese headers and labels, so every response is directly readable in the sheet.
 */
export const RESPONSE_COLUMNS: ResponseColumn[] = SCORED_QUESTIONS.flatMap((q): ResponseColumn[] => {
  if (q.type === 'likert_grid') {
    return (q.likertItems ?? []).map((item) => ({
      header: `Q${q.id} – ${item.label.pt}`,
      value: (answers) => {
        const answer = answers[q.id];
        if (!answer || answer.isSkipped || !answer.value) return SKIPPED_TEXT.pt;
        return (answer.value as Record<string, number>)[item.id] ?? '';
      },
    }));
  }
  return [{ header: `Q${q.id} – ${q.title.pt}`, value: (answers) => describeAnswer(q, answers[q.id], 'pt') }];
});
