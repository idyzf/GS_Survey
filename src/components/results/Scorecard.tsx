import { CheckCircle2, Download } from 'lucide-react';
import { TEAMS } from '../../data/teams';
import { describeAnswer, SCORED_QUESTIONS } from '../../lib/answerText';
import { downloadFile } from '../../lib/download';
import { translator } from '../../lib/i18n';
import { MAX_SCORED } from '../../lib/scoring';
import type { Language, SubmissionRecord } from '../../types/survey';

const THANK_YOU =
  'Thank you for participating in our survey! Your contribution is valuable in helping us better understand the genomics software development landscape.';

function voucherText(sub: SubmissionRecord, tag: string): string {
  return `
=====================================================
GENOME.DEV BIO-COMPUTATIONAL RESEARCH CONSORTIUM
OFFICIAL PARTICIPATION VOUCHER & VALIDATED SCORECARD
=====================================================
Voucher ID: ${sub.id}
Team Squad: ${sub.teamName} (${tag})
Ingestion Time: ${sub.timestamp}
Total Points Earned: +${sub.totalPoints.toFixed(2)} / 100 PTS
Questions Answered: ${sub.answeredCount} / ${MAX_SCORED}

STATUS: 100% ANONYMOUS & CRYPTOGRAPHICALLY INGESTED
=====================================================
Thank you for participating in our survey!
Your contribution is valuable in helping us better
understand the genomics software development landscape.
`;
}

/** Left column of the results page: the participant's voucher. */
export function Scorecard({ language, submission }: { language: Language; submission: SubmissionRecord | null }) {
  const t = translator(language);
  const tag = submission ? TEAMS[submission.selectedTeam].tag : TEAMS.bioinformatics.tag;

  return (
    <div className="lg:col-span-5 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            PARTICIPATION VOUCHER
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white">SCORECARD</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 p-2 shadow-inner">
          <div className="grid grid-cols-2 gap-1 w-full h-full">
            <div className="bg-cyan-400 rounded-sm" />
            <div className="bg-slate-700 rounded-sm" />
            <div className="bg-slate-700 rounded-sm" />
            <div className="bg-cyan-400 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80 mb-5 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block tracking-wider uppercase">TEAM MEMBER</span>
          <span className="text-cyan-300 font-bold text-xs sm:text-sm">{tag}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block tracking-wider uppercase">INGESTION TIME</span>
          <span className="text-slate-300 text-xs">
            {submission
              ? new Date(submission.timestamp).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
              : '2026-11-09 13:48 UTC'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-slate-400 font-semibold tracking-wider uppercase">VALIDATED RESPONSE LEDGER</span>
        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
          {submission?.answeredCount ?? MAX_SCORED} / {MAX_SCORED} Verified
        </span>
      </div>

      <div className="space-y-2 mb-6 max-h-[340px] overflow-y-auto pr-1">
        {SCORED_QUESTIONS.map((q, i) => {
          const answer = submission?.answers[q.id];
          const answered = answer && !answer.isSkipped;
          const summary = describeAnswer(q, answer, language);

          return (
            <div
              key={q.id}
              className="p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono text-[11px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="truncate">
                  <span className="text-slate-300 block truncate font-medium">{q.title[language]}</span>
                  {answered && <span className="text-[10px] text-slate-400 block truncate font-mono">{summary}</span>}
                </div>
              </div>
              <div className="shrink-0 flex items-center">
                {answered || !submission ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">Pulada</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-slate-400 italic leading-relaxed mb-5">
        “{THANK_YOU}”
      </div>

      {submission && (
        <button
          onClick={() => downloadFile(`VOUCHER-${submission.id}.txt`, voucherText(submission, tag), 'text/plain;charset=utf-8')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>{t('Baixar Comprovante (Voucher .txt)', 'Download Voucher (.txt)')}</span>
        </button>
      )}
    </div>
  );
}
