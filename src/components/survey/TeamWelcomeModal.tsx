import confetti from 'canvas-confetti';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { TEAMS } from '../../data/teams';
import { translator } from '../../lib/i18n';
import type { Language, TeamId } from '../../types/survey';
import { CREST_STYLES, TeamCrest } from '../TeamCrest';

interface TeamWelcomeModalProps {
  team: TeamId;
  language: Language;
  onClose: () => void;
}

/** "Congratulations, your team is now…" pop-up shown after question 1. */
export function TeamWelcomeModal({ team, language, onClose }: TeamWelcomeModalProps) {
  const t = translator(language);
  const { accent, accent2 } = CREST_STYLES[team];

  useEffect(() => {
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.45 }, colors: [accent, accent2, '#ffffff'], zIndex: 60 });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [accent, accent2, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-welcome-title"
    >
      <div className="relative w-full max-w-md glow-card-border p-8 text-center">
        <div
          className="absolute inset-x-0 top-0 h-40 rounded-t-2xl pointer-events-none opacity-30 blur-2xl"
          style={{ background: `radial-gradient(circle at 50% 0%, ${accent}, transparent 70%)` }}
        />

        <div className="relative inline-flex items-center gap-1.5 px-3 py-1 mb-5 rounded bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" />
          {t('SQUAD CONFIRMADO', 'SQUAD CONFIRMED')}
        </div>

        <TeamCrest team={team} className="relative w-36 mx-auto mb-5 animate-crest-float" />

        <p id="team-welcome-title" className="text-sm text-slate-400 mb-1">
          {t('Parabéns, agora seu time é:', 'Congratulations, your team is now:')}
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">{TEAMS[team].name}</h3>
        <span className="inline-block text-xs font-mono font-bold mb-5" style={{ color: accent }}>
          {TEAMS[team].tag}
        </span>

        <p className="text-xs text-slate-400 leading-relaxed mb-7 max-w-xs mx-auto">
          {t(
            'Cada pergunta respondida a partir de agora soma +6,25 pontos para o placar da sua equipe.',
            'From now on, every answered question adds +6.25 points to your team’s leaderboard.'
          )}
        </p>

        <button
          onClick={onClose}
          autoFocus
          className="group inline-flex items-center gap-2.5 px-7 py-3 text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-300 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{t('Continuar', 'Continue')}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
