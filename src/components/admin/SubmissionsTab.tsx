import { Search } from 'lucide-react';
import { useState } from 'react';
import { translator } from '../../lib/i18n';
import { MAX_SCORED, POINTS_PER_QUESTION } from '../../lib/scoring';
import type { Language, SubmissionRecord } from '../../types/survey';

interface SubmissionsTabProps {
  language: Language;
  submissions: SubmissionRecord[];
  onReload: () => void;
}

export function SubmissionsTab({ language, submissions, onReload }: SubmissionsTabProps) {
  const t = translator(language);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SubmissionRecord | null>(null);

  const q = query.toLowerCase();
  const filtered = submissions.filter((s) =>
    [s.id, s.teamName, s.emailContact ?? ''].some((field) => field.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Buscar por ID, equipe ou e-mail...', 'Search by ID, team, or email...')}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          onClick={onReload}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
        >
          {t('Recarregar', 'Reload')}
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs font-mono">
          {t(
            'Nenhuma participação registrada ainda. Complete a survey para registrar a primeira!',
            'No survey submissions recorded yet. Complete the survey to record the first!'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setSelected(sub)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                selected?.id === sub.id
                  ? 'bg-[#141b29] border-cyan-400 shadow-md'
                  : 'bg-[#0f121a] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-300">{sub.id}</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  +{sub.totalPoints.toFixed(2)} PTS
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{sub.teamName}</h4>
              <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mb-2">
                <span>
                  Respondidas: {sub.answeredCount}/{MAX_SCORED}
                </span>
                <span>Puladas: {sub.skippedCount}</span>
                <span>Data: {new Date(sub.timestamp).toLocaleString()}</span>
              </div>
              {sub.emailContact && (
                <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/60 truncate">
                  Contato voluntário: {sub.emailContact}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-6 p-5 rounded-xl bg-[#090b10] border border-cyan-500/40">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>Detalhes da Submissão: {selected.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{selected.teamName}</span>
            </h4>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-white">
              Fechar detalhes
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono max-h-60 overflow-y-auto">
            {Object.entries(selected.answers ?? {}).map(([id, answer]) => (
              <div
                key={id}
                className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
              >
                <span className="text-cyan-400 font-bold shrink-0">Q{id}:</span>
                <div className="flex-1 text-slate-300">
                  {answer.isSkipped ? (
                    <span className="text-slate-400 italic">(Pergunta pulada - 0 pts)</span>
                  ) : answer.value && typeof answer.value === 'object' ? (
                    <pre className="text-[11px] whitespace-pre-wrap">{JSON.stringify(answer.value, null, 2)}</pre>
                  ) : (
                    <span>{String(answer.value || answer.textDetail || 'Respondido')}</span>
                  )}
                  {answer.textDetail && answer.textDetail !== answer.value && (
                    <div className="text-[11px] text-slate-400 mt-1">Detalhe: {answer.textDetail}</div>
                  )}
                </div>
                <span className="shrink-0 text-slate-400">
                  {answer.isSkipped ? '0 pts' : `+${POINTS_PER_QUESTION} pts`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
