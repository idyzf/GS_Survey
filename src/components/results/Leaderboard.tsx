import { Trophy } from 'lucide-react';
import type { Language, LeaderboardEntry } from '../../types/survey';

/** Card, rank badge and bar styles for 1st, 2nd, 3rd and everyone else. */
const RANK_STYLES = [
  {
    card: 'bg-gradient-to-r from-[#0d1624] via-[#0f121a] to-[#0f121a] border-cyan-500/70 shadow-lg shadow-cyan-500/10',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50',
    bar: 'bg-gradient-to-r from-cyan-400 to-sky-400 shadow-md shadow-cyan-400/40',
  },
  {
    card: 'bg-[#0f121a] border-sky-600/50',
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-400/40',
    bar: 'bg-gradient-to-r from-sky-400 to-indigo-500',
  },
  {
    card: 'bg-[#0f121a] border-fuchsia-600/40',
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/40',
    bar: 'bg-gradient-to-r from-fuchsia-400 to-pink-500',
  },
  {
    card: 'bg-[#0f121a] border-slate-800/80 hover:border-slate-700',
    badge: 'bg-slate-900 text-slate-400 border border-slate-800',
    bar: 'bg-gradient-to-r from-slate-400 to-cyan-500',
  },
];

export function Leaderboard({ language, teams }: { language: Language; teams: LeaderboardEntry[] }) {
  const maxPoints = Math.max(...teams.map((team) => team.points), 1000);

  return (
    <div className="space-y-4 mb-8">
      {teams.map((team, i) => {
        const style = RANK_STYLES[Math.min(i, RANK_STYLES.length - 1)];
        const percent = Math.min(100, Math.round((team.points / maxPoints) * 100));

        return (
          <div key={team.id} className={`relative p-5 rounded-2xl border transition-all ${style.card}`}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold text-base sm:text-lg px-2.5 py-1 rounded-lg ${style.badge}`}>
                  #{team.rank}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-white">{team.name}</h4>
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800">
                        <Trophy className="w-3 h-3 text-cyan-300" />
                        TOP SCORE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{team.subtitle}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-cyan-300 tabular-nums">
                  {team.points.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal ml-1">/ 1000 PTS</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {team.participantsCount} {language === 'pt' ? 'Participantes' : 'Participants'}
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mt-3 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${style.bar}`}
                style={{ width: `${Math.max(8, percent)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
