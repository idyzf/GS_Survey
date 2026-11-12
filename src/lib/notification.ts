// Builds the admin notification for a submission. It is logged, not actually mailed.
import { describeAnswer, SCORED_QUESTIONS } from './answerText';
import { MAX_SCORED, POINTS_PER_QUESTION, randomId } from './scoring';
import type { Answer, EmailLogEntry, Question, SubmissionRecord } from '../types/survey';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const STYLES = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 24px; }
    .card { background-color: #11141c; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 680px; margin: 0 auto; }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #0284c7; color: #fff; }
    .score { font-size: 28px; font-weight: bold; color: #00e5ff; margin: 8px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #94a3b8; }
    .answers-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .answers-table th { text-align: left; background: #1e293b; color: #94a3b8; padding: 8px; }
    .answers-table td { padding: 8px; border-bottom: 1px solid #1e293b; vertical-align: top; }`;

function answerRow(question: Question, answer: Answer | undefined): string {
  const skipped = !answer || answer.isSkipped;
  const value = skipped
    ? '<span style="color: #64748b;">(Pergunta pulada - 0 pts)</span>'
    : escapeHtml(describeAnswer(question, answer, 'pt'));
  return `
            <tr>
              <td style="color: #38bdf8; font-weight: bold;">Q${question.id}</td>
              <td style="color: #94a3b8;">${escapeHtml(question.title.pt)}</td>
              <td style="color: #cbd5e1;">${value}<br/><small style="color: #64748b;">${skipped ? '⚪ 0 pts' : `✅ +${POINTS_PER_QUESTION} pts`}</small></td>
            </tr>`;
}

export function buildNotificationEmail(sub: SubmissionRecord, adminEmail: string): EmailLogEntry {
  const points = sub.totalPoints.toFixed(2);
  const contact = sub.emailContact
    ? `<div class="meta-row" style="color: #38bdf8;"><span>Contato voluntário: <strong>${escapeHtml(sub.emailContact)}</strong></span></div>`
    : '';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>${STYLES}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">CONCLUSAO DE SURVEY</span>
      <h2 style="margin: 8px 0; color: #ffffff;">Nova Participação Registrada</h2>
      <div class="score">+${points} PTS para ${escapeHtml(sub.teamName)}</div>
      <div class="meta-row"><span>ID: <strong>${sub.id}</strong></span><span>Data: <strong>${sub.timestamp}</strong></span></div>
      <div class="meta-row"><span>Perguntas respondidas: <strong>${sub.answeredCount}/${MAX_SCORED}</strong></span><span>Pularam: <strong>${sub.skippedCount}</strong></span></div>
      ${contact}
    </div>
    <h3 style="color: #f1f5f9; font-size: 16px;">Respostas Fornecidas:</h3>
    <table class="answers-table">
      <thead>
        <tr><th>Q#</th><th>Pergunta</th><th>Resposta</th></tr>
      </thead>
      <tbody>${SCORED_QUESTIONS.map((q) => answerRow(q, sub.answers[q.id])).join('')}
      </tbody>
    </table>
    <p style="margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;">
      Plataforma de Survey Genômica com Sistema de Pontuação por Equipes • Envio Automático Seguro
    </p>
  </div>
</body>
</html>
`;

  return {
    id: randomId('EML'),
    timestamp: sub.timestamp,
    to: adminEmail,
    subject: `[Survey Genômica] Nova Resposta Concluída: +${points} pts para ${sub.teamName}`,
    submissionId: sub.id,
    team: sub.teamName,
    points: sub.totalPoints,
    htmlBody,
  };
}
