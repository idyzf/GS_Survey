import React from 'react';
import { Language } from '../types/survey';
import { Shield, Clock, ArrowRight, Dna, Sparkles } from 'lucide-react';

interface IntroModalProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAcceptAndContinue: () => void;
  onBackToHome: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({
  language,
  onLanguageChange,
  onAcceptAndContinue,
  onBackToHome,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 bg-[#07090e]">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-purple-900/15 via-cyan-900/15 to-blue-900/15 blur-3xl rounded-full" />
      </div>

      {/* Top right language switch matching mockup */}
      <div className="w-full max-w-4xl flex justify-end mb-6">
        <div className="flex items-center p-1 bg-black/60 border border-slate-800 rounded-full backdrop-blur-md text-xs font-medium">
          <button
            onClick={() => onLanguageChange('pt')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              language === 'pt'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Português (BR)
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              language === 'en'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English (US)
          </button>
        </div>
      </div>

      {/* Main Container Card matching introduc_ao_e8ce97e9.png with dual glowing border */}
      <div className="relative w-full max-w-4xl glow-card-border p-8 sm:p-12 text-center z-10">
        {/* Top left badge */}
        <div className="flex justify-start mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>8 - 10 min</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
          <span>{language === 'pt' ? 'Engenharia de Software ' : 'Genomic Software '}</span>
          <span className="italic text-cyan-400 font-serif">
            {language === 'pt' ? 'Genômico ' : 'Engineering '}
          </span>
          <span>{language === 'pt' ? '& Bioinformática' : '& Bioinformatics'}</span>
        </h2>

        {/* Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          {language === 'pt'
            ? 'Investigando arquiteturas de pipeline, reprodutibilidade de dados NGS e desafios computacionais em escala molecular.'
            : 'Investigating pipeline architectures, NGS data reproducibility, and molecular-scale computational bottlenecks.'}
        </p>

        {/* Premissas Box matching screenshot */}
        <div className="bg-[#0b0e14] border border-slate-800/80 rounded-xl p-6 sm:p-8 text-left mb-6 max-w-2xl mx-auto shadow-inner">
          <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-sm sm:text-base mb-3">
            <Shield className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              {language === 'pt' ? 'Premissas da Coleta de Dados' : 'Data Collection Premises'}
            </span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'pt'
              ? 'Tempo estimado: 8 a 10 minutos. As respostas são anônimas e usadas apenas em uma pesquisa acadêmica exploratória. Não há respostas certas ou erradas: o que importa é a sua experiência operacional no ecossistema científico.'
              : 'Estimated duration: 8 to 10 minutes. Responses are 100% anonymous and used strictly for exploratory academic research. There are no right or wrong answers: what matters is your operational experience in the scientific ecosystem.'}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-start gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              {language === 'pt'
                ? 'Dinâmica por Equipes: Ao iniciar, você escolherá uma equipe. Cada pergunta respondida soma 6,25 pontos para o placar coletivo da sua squad (até 100 pontos no total). É possível pular perguntas, acumulando 0 pontos por aquela questão.'
                : 'Team Gamification: On question 1, you will choose a team. Each completed answer awards 6.25 points to your squad collective leaderboard (up to 100 pts total). You may skip any question, receiving 0 points for that item.'}
            </span>
          </div>
        </div>

        {/* CTA Button matching screenshot */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 px-4"
          >
            {language === 'pt' ? '← Voltar ao Início' : '← Back to Home'}
          </button>

          <button
            onClick={onAcceptAndContinue}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-300 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{language === 'pt' ? 'Concordar e continuar' : 'Agree and continue'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
