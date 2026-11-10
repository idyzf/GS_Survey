import React from 'react';
import { Language } from '../types/survey';
import { ThreeDnaCanvas } from './ThreeDnaCanvas';
import { ArrowRight, Play, Shield, Clock, HelpCircle, Trophy, Sparkles } from 'lucide-react';

interface HomeHeroProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartSurvey: () => void;
  onViewLeaderboard: () => void;
  onOpenAdmin?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  language,
  onLanguageChange,
  onStartSurvey,
  onViewLeaderboard,
  onOpenAdmin,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#07090e]">
      {/* Interactive 3D Background - Right aligned as in the mockup */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 h-full opacity-85 pointer-events-auto">
        <ThreeDnaCanvas variant="hero" interactive={true} />
        {/* Soft radial atmospheric glow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#07090e]/60 to-[#07090e] pointer-events-none" />
      </div>

      {/* Top language toggle row matching mockup */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 flex justify-end">
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-light text-slate-300">
            {language === 'pt' ? 'Escolha seu idioma de preferência' : 'Choose preferred language'}
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-black/60 border border-slate-800 rounded-xl backdrop-blur-md">
            <button
              onClick={() => onLanguageChange('en')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'en'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${language === 'en' ? 'bg-white' : 'bg-slate-600'}`} />
              <span>English</span>
            </button>
            <button
              onClick={() => onLanguageChange('pt')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                language === 'pt'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${language === 'pt' ? 'bg-white' : 'bg-slate-600'}`} />
              <span>Português</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Content matching screenshot layout */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-24 flex-1 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            <span>Genomics Software</span>
            <br />
            <span className="italic font-normal text-cyan-400">Development</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent font-medium">
              Survey
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
            {language === 'pt'
              ? 'Acelerando descobertas disruptivas em pipelines de bioinformática, genômica em nuvem e arquiteturas de medicina de precisão.'
              : 'Accelerating disruptive discoveries in bioinformatics pipelines, cloud genomics, and precision medicine architectures.'}
          </p>

          {/* Gamification Callout */}
          <div className="mt-5 flex items-center gap-2 text-xs font-mono text-cyan-300/90 bg-cyan-950/40 border border-cyan-800/50 rounded-lg px-3 py-2 max-w-md">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {language === 'pt'
                ? 'Gamificado: Escolha seu time e acumule até 100 pontos para o placar!'
                : 'Gamified: Select your squad and contribute up to 100 pts to the leaderboard!'}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartSurvey}
              className="group relative inline-flex items-center gap-3 px-7 py-4 text-base font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              <span>{language === 'pt' ? 'Iniciar Pesquisa' : 'Start Survey'}</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onViewLeaderboard}
              className="inline-flex items-center gap-2 px-5 py-4 text-sm font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl hover:text-white transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{language === 'pt' ? 'Ver Placar das Equipes' : 'View Teams Leaderboard'}</span>
            </button>
          </div>

          {/* Badges strip matching bottom of screenshot */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-medium text-slate-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'pt' ? '100% Anônimo' : '100% Anonymous'}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'pt' ? '~8-10 min Tempo médio' : '~8-10 min Average time'}</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-medium text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
              <span>{language === 'pt' ? '17 Questões Multi-Choice' : '17 Multi-Choice Questions'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip matching the screenshot bottom */}
      <footer className="relative z-10 border-t border-slate-900/90 bg-[#05070a]/90 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span>🎓</span>
              <span>EXPLORATORY ACADEMIC BIO-SOFTWARE RESEARCH</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span>🔒</span>
              <span>ANONYMOUS E2EE INGESTION (SHA-256)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 text-center md:text-right">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-cyan-400 transition-colors text-slate-500 cursor-pointer"
              >
                {language === 'pt' ? 'Painel Admin' : 'Admin Portal'}
              </button>
            )}
            <span>© 2026 GENOME.DEV Bio-Computational Research Consortium.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
