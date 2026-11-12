import { Zap } from 'lucide-react';
import { SECTION_TITLES, SURVEY_QUESTIONS } from '../../data/questions';
import { translator } from '../../lib/i18n';
import { TEAMS } from '../../data/teams';
import type { Language, Question, TeamId } from '../../types/survey';
import { DnaCanvas } from '../DnaCanvas';
import { CREST_STYLES, TeamCrest } from '../TeamCrest';

const RAIL_STEPS = [1, 5, 10, 15, 17];
const TOTAL = SURVEY_QUESTIONS.length;

interface SectionPanelProps {
  question: Question;
  language: Language;
  points: number;
  /** Confirmed team: its crest replaces the DNA helix. */
  team: TeamId | null;
}

/** Left column: 3D helix, section context and running score. */
export function SectionPanel({ question, language, points, team }: SectionPanelProps) {
  const t = translator(language);
  const isScored = question.type !== 'team_select';

  return (
    <div className="lg:col-span-3 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-5 flex flex-col shadow-xl">
      <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-400">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          CODON_SEQ // RUN_88
        </span>
        <span className="text-slate-500 font-mono">SEC_0{question.section}</span>
      </div>

      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black/50 border border-slate-800 mb-4">
        {team ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 45%, ${CREST_STYLES[team].accent}26, transparent 65%)` }}
          >
            <TeamCrest team={team} className="h-36 animate-crest-float" />
          </div>
        ) : (
          <DnaCanvas variant="card" />
        )}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-slate-800 text-[10px] font-mono text-slate-400">
          {team ? TEAMS[team].tag : '3D HELIX MODEL'}
        </div>
      </div>

      <div className="text-[11px] font-mono text-slate-400 mb-1 tracking-wider uppercase">{question.sectionStep[language]}</div>
      <h3 className="text-base font-semibold text-white mb-2 leading-snug">{SECTION_TITLES[question.section][language]}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{question.sectionDesc[language]}</p>

      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>{t('Pontos da Survey:', 'Survey Points:')}</span>
          <span className="font-mono text-cyan-300 font-bold">{points.toFixed(2)} pts</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${points}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isScored
              ? t('Esta pergunta vale +6,25 pts para sua equipe!', 'This question awards +6.25 pts to your squad!')
              : t('Escolha sua equipe para pontuar', 'Choose your squad to start scoring')}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Narrow vertical progress rail, visible on large screens. */
export function ProgressRail({ questionId, language }: { questionId: number; language: Language }) {
  return (
    <div className="hidden lg:flex lg:col-span-1 flex-col items-center py-4 bg-[#0a0d14]/60 border border-slate-800/60 rounded-2xl">
      <span className="text-[10px] font-mono tracking-widest text-slate-500 mb-1">PROGRESS</span>
      <span className="text-base font-mono font-bold text-white mb-6">
        {String(questionId).padStart(2, '0')} <span className="text-xs text-slate-500">/{TOTAL}</span>
      </span>

      <div className="relative flex flex-col items-center gap-3">
        {RAIL_STEPS.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                questionId === step
                  ? 'border-2 border-cyan-400 bg-cyan-950 text-cyan-300 shadow-lg shadow-cyan-400/30 ring-2 ring-cyan-500/20'
                  : questionId > step
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-900/80 text-slate-600 border border-slate-800'
              }`}
            >
              {step}
            </div>
            {step < TOTAL && <div className="w-0.5 h-6 bg-slate-800 my-1" />}
          </div>
        ))}
      </div>

      <span className="mt-8 text-[11px] font-mono text-cyan-400 font-semibold">
        {Math.round((questionId / TOTAL) * 100)}%
      </span>
      <span className="text-[9px] font-mono text-slate-400">{language === 'pt' ? 'CONCLUÍDO' : 'COMPLETED'}</span>
    </div>
  );
}
