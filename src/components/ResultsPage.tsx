import React, { useEffect, useState } from 'react';
import {
  Language,
  TeamId,
  TeamLeaderboardEntry,
  SubmissionRecord,
} from '../types/survey';
import { TEAMS, SURVEY_QUESTIONS } from '../data/surveyQuestions';
import { getLocalLeaderboard } from '../data/staticStorage';
import {
  Trophy,
  CheckCircle2,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Users,
  Calendar,
  Check,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ResultsPageProps {
  language: Language;
  latestSubmission?: {
    id: string;
    selectedTeam: TeamId;
    teamName: string;
    totalPoints: number;
    answeredCount: number;
    timestamp: string;
    answers: Record<number, any>;
  } | null;
  onRetake: () => void;
  onOpenAdmin: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  language,
  latestSubmission,
  onRetake,
  onOpenAdmin,
}) => {
  const [leaderboard, setLeaderboard] = useState<TeamLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  // Fetch live leaderboard from API or local fallback
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/survey/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.teams && data.teams.length > 0) {
          setLeaderboard(data.teams);
          setLastRefreshed(new Date().toLocaleTimeString());
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Live API unavailable, using local leaderboard:', err);
    }
    // Fallback for static GitHub Pages hosting
    setLeaderboard(getLocalLeaderboard());
    setLastRefreshed(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
    // Auto-refresh leaderboard every 12 seconds
    const interval = setInterval(fetchLeaderboard, 12000);

    // Fire celebratory confetti if latestSubmission exists and user scored points
    if (latestSubmission && latestSubmission.totalPoints > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00e5ff', '#a855f7', '#38bdf8', '#34d399'],
        });
      } catch (e) {
        // ignore in environments without canvas support
      }
    }

    return () => clearInterval(interval);
  }, [latestSubmission]);

  const activeTeamInfo = latestSubmission
    ? TEAMS[latestSubmission.selectedTeam] || TEAMS.bioinformatics
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadVoucher = () => {
    if (!latestSubmission) return;
    const textData = `
=====================================================
GENOME.DEV BIO-COMPUTATIONAL RESEARCH CONSORTIUM
OFFICIAL PARTICIPATION VOUCHER & VALIDATED SCORECARD
=====================================================
Voucher ID: ${latestSubmission.id}
Team Squad: ${latestSubmission.teamName} (${activeTeamInfo?.tag || '#BIOINFORMATICS'})
Ingestion Time: ${latestSubmission.timestamp}
Total Points Earned: +${latestSubmission.totalPoints.toFixed(2)} / 100 PTS
Questions Answered: ${latestSubmission.answeredCount} / 16

STATUS: 100% ANONYMOUS & CRYPTOGRAPHICALLY INGESTED
=====================================================
Thank you for participating in our survey!
Your contribution is valuable in helping us better
understand the genomics software development landscape.
`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VOUCHER-${latestSubmission.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#07090e] py-10 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-950/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Top notification banner if just completed */}
        {latestSubmission && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>{language === 'pt' ? 'Survey Concluída com Sucesso!' : 'Survey Successfully Completed!'}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 font-mono">
                    +{latestSubmission.totalPoints.toFixed(2)} PTS
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'pt'
                    ? `Seus pontos foram somados à equipe ${latestSubmission.teamName}. Notificação automática enviada para o e-mail administrativo.`
                    : `Points added to ${latestSubmission.teamName}. Automatic notification logged to administrator.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'pt' ? 'Copiado!' : 'Copied!') : (language === 'pt' ? 'Compartilhar' : 'Share')}</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Participation Voucher Scorecard matching screenshot          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Top Cyan neon accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

            {/* Voucher Header matching screenshot */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 tracking-wider uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  PARTICIPATION VOUCHER
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">SCORECARD</h3>
              </div>

              {/* Bio-Informatics Grid Glyph */}
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 p-2 shadow-inner">
                <div className="grid grid-cols-2 gap-1 w-full h-full">
                  <div className="bg-cyan-400 rounded-sm" />
                  <div className="bg-slate-700 rounded-sm" />
                  <div className="bg-slate-700 rounded-sm" />
                  <div className="bg-cyan-400 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Ingestion Meta info matching screenshot */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80 mb-5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                  TEAM MEMBER
                </span>
                <span className="text-cyan-300 font-bold text-xs sm:text-sm">
                  {activeTeamInfo?.tag || '#BIOINFORMATICS'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block tracking-wider uppercase">
                  INGESTION TIME
                </span>
                <span className="text-slate-300 text-xs">
                  {latestSubmission
                    ? new Date(latestSubmission.timestamp).toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
                    : '2026-11-09 13:48 UTC'}
                </span>
              </div>
            </div>

            {/* Validated Response Ledger header */}
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-slate-400 font-semibold tracking-wider uppercase">
                VALIDATED RESPONSE LEDGER
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                {latestSubmission
                  ? `${latestSubmission.answeredCount} / 16 Verified`
                  : '16 / 16 Verified'}
              </span>
            </div>

            {/* Itemized Verified Ledger List matching screenshot */}
            <div className="space-y-2 mb-6 max-h-[340px] overflow-y-auto pr-1">
              {SURVEY_QUESTIONS.slice(1).map((q, idx) => {
                const ans = latestSubmission?.answers?.[q.id];
                const isAnswered = ans && !ans.isSkipped;
                const displayVal = ans?.value
                  ? typeof ans.value === 'object'
                    ? 'Valores Registrados'
                    : String(ans.textDetail || ans.value)
                  : q.title[language];

                return (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-[#0a0d14] border border-slate-800/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="truncate">
                        <span className="text-slate-300 block truncate font-medium">
                          {q.title[language]}
                        </span>
                        {isAnswered && (
                          <span className="text-[10px] text-slate-400 block truncate font-mono">
                            {displayVal}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isAnswered || !latestSubmission ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Pulada</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gratitude quote box matching screenshot verbatim */}
            <div className="p-4 rounded-xl bg-[#0a0d14] border border-slate-800 text-xs text-slate-400 italic leading-relaxed mb-5">
              “Thank you for participating in our survey! Your contribution is valuable in helping us better understand the genomics software development landscape.”
            </div>

            {/* Download Voucher CTA */}
            {latestSubmission && (
              <button
                onClick={handleDownloadVoucher}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{language === 'pt' ? 'Baixar Comprovante (Voucher .txt)' : 'Download Voucher (.txt)'}</span>
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Teams Leaderboard matching screenshot                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Consortium benchmarks header matching screenshot */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 tracking-wider uppercase">
                <span>📊</span>
                <span>CONSORTIUM BENCHMARKS</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>6 Teams</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
              Teams Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              {language === 'pt'
                ? 'Telemetria de desempenho comparativo entre pipelines genômicos ativos e equipes de engenharia.'
                : 'Comparative performance telemetry across active genomic pipelines and lab engineering squads.'}
            </p>

            {/* Leaderboard Cards List */}
            <div className="space-y-4 mb-8">
              {leaderboard.map((team, idx) => {
                const isLead = idx === 0;
                const maxBenchmark = Math.max(...leaderboard.map((t) => t.points), 1000);
                const scorePercent = Math.min(100, Math.round((team.points / maxBenchmark) * 100));

                return (
                  <div
                    key={team.id}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isLead
                        ? 'bg-gradient-to-r from-[#0d1624] via-[#0f121a] to-[#0f121a] border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                        : idx === 1
                        ? 'bg-[#0f121a] border-sky-600/50'
                        : idx === 2
                        ? 'bg-[#0f121a] border-fuchsia-600/40'
                        : 'bg-[#0f121a] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono font-bold text-base sm:text-lg px-2.5 py-1 rounded-lg ${
                            isLead
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                              : idx === 1
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                              : idx === 2
                              ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          #{team.rank || idx + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold text-white">
                              {team.name}
                            </h4>
                            {isLead && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
                                <Trophy className="w-3 h-3 text-cyan-300" />
                                TOP SCORE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {team.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Points Display matching screenshot */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-cyan-300 tabular-nums">
                          {team.points.toLocaleString()}
                          <span className="text-xs text-slate-400 font-normal ml-1">
                            / 1000 PTS
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {team.participantsCount}{' '}
                          {language === 'pt' ? 'Participantes' : 'Participants'}
                        </div>
                      </div>
                    </div>

                    {/* Glowing Progress Bar matching screenshot */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-3 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isLead
                            ? 'bg-gradient-to-r from-cyan-400 to-sky-400 shadow-md shadow-cyan-400/40'
                            : idx === 1
                            ? 'bg-gradient-to-r from-sky-400 to-indigo-500'
                            : idx === 2
                            ? 'bg-gradient-to-r from-fuchsia-400 to-pink-500'
                            : 'bg-gradient-to-r from-slate-400 to-cyan-500'
                        }`}
                        style={{ width: `${Math.max(8, scorePercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar below leaderboard */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  {language === 'pt'
                    ? `Atualização em tempo real (${lastRefreshed})`
                    : `Live auto-sync (${lastRefreshed})`}
                </span>
                <button
                  onClick={fetchLeaderboard}
                  className="ml-2 text-cyan-400 hover:underline"
                >
                  {language === 'pt' ? 'Atualizar agora' : 'Refresh now'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onRetake}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:opacity-95 transition-all shadow-md shadow-cyan-500/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'pt' ? 'Realizar Nova Participação' : 'Take Survey Again'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
