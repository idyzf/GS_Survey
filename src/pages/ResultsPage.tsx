import confetti from 'canvas-confetti';
import { Check, CheckCircle2, RotateCcw, Share2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Leaderboard } from '../components/results/Leaderboard';
import { Scorecard } from '../components/results/Scorecard';
import { TEAM_IDS } from '../data/teams';
import { fetchLeaderboard } from '../lib/api';
import { translator } from '../lib/i18n';
import type { Language, LeaderboardEntry, SubmissionRecord } from '../types/survey';

const REFRESH_MS = 12_000;

interface ResultsPageProps {
  language: Language;
  latestSubmission: SubmissionRecord | null;
  onRetake: () => void;
}

export function ResultsPage({ language, latestSubmission, onRetake }: ResultsPageProps) {
  const t = translator(language);
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState('');
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setTeams(await fetchLeaderboard());
    setLastRefreshed(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (latestSubmission && latestSubmission.totalPoints > 0) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#00e5ff', '#a855f7', '#38bdf8', '#34d399'] });
    }
  }, [latestSubmission]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-950/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {latestSubmission && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{t('Survey Concluída com Sucesso!', 'Survey Successfully Completed!')}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 font-mono">
                    +{latestSubmission.totalPoints.toFixed(2)} PTS
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {t(
                    `Seus pontos foram somados à equipe ${latestSubmission.teamName}. Notificação automática enviada para o e-mail administrativo.`,
                    `Points added to ${latestSubmission.teamName}. Automatic notification logged to administrator.`
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? t('Copiado!', 'Copied!') : t('Compartilhar', 'Share')}</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Scorecard language={language} submission={latestSubmission} />

          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 tracking-wider uppercase">
                <span>📊</span>
                <span>CONSORTIUM BENCHMARKS</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{TEAM_IDS.length} Teams</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Teams Leaderboard</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {t(
                'Telemetria de desempenho comparativo entre pipelines genômicos ativos e equipes de engenharia.',
                'Comparative performance telemetry across active genomic pipelines and lab engineering squads.'
              )}
            </p>

            <Leaderboard language={language} teams={teams} />

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{t(`Atualização em tempo real (${lastRefreshed})`, `Live auto-sync (${lastRefreshed})`)}</span>
                <button onClick={refresh} className="ml-2 text-cyan-400 hover:underline">
                  {t('Atualizar agora', 'Refresh now')}
                </button>
              </div>
              <button
                onClick={onRetake}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('Realizar Nova Participação', 'Take Survey Again')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
