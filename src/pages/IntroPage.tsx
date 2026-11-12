import { ArrowRight, Clock, Mail, Shield, Sparkles } from 'lucide-react';
import { translator } from '../lib/i18n';
import type { Language } from '../types/survey';

interface IntroPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onContinue: () => void;
  onBack: () => void;
}

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'pt', label: 'Português (BR)' },
  { id: 'en', label: 'English (US)' },
];

export function IntroPage({ language, onLanguageChange, onContinue, onBack }: IntroPageProps) {
  const t = translator(language);

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-[#07090e]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-purple-900/15 via-cyan-900/15 to-blue-900/15 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-5xl flex justify-end mb-3 sm:mb-4">
        <div className="flex items-center p-1 bg-black/60 border border-slate-800 rounded-full backdrop-blur-md text-xs font-medium">
          {LANGUAGES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onLanguageChange(id)}
              className={`px-3 py-1.5 rounded-full transition-all ${
                language === id ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-5xl glow-card-border px-4 py-5 sm:px-12 sm:py-8 text-center z-10">
        <div className="flex justify-start mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>8 - 10 min</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4 sm:mb-6">
          <span>{t('Engenharia de Software ', 'Genomic Software ')}</span>
          <span className="italic text-cyan-400 font-serif">{t('Genômico ', 'Engineering ')}</span>
          <span>{t('& Bioinformática', '& Bioinformatics')}</span>
        </h2>

        <div className="bg-[#0b0e14] border border-slate-800/80 rounded-xl p-4 sm:p-8 text-left max-w-4xl mx-auto shadow-inner">
          <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-base sm:text-lg mb-3">
            <Shield className="w-5 h-5 shrink-0 text-cyan-400" />
            <span>{t('Premissas da Coleta de Dados', 'Data Collection Premises')}</span>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t(
              'Tempo estimado: 8 a 10 minutos. As respostas são anônimas e usadas apenas em uma pesquisa acadêmica exploratória. Não há respostas certas ou erradas: o que importa é a sua experiência operacional no ecossistema científico.',
              'Estimated duration: 8 to 10 minutes. Responses are 100% anonymous and used strictly for exploratory academic research. There are no right or wrong answers: what matters is your operational experience in the scientific ecosystem.'
            )}
          </p>
          <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'Dinâmica por Equipes: Ao iniciar, você escolherá uma equipe. Cada pergunta respondida soma 6,25 pontos para o placar coletivo da sua squad (até 100 pontos no total). É possível pular perguntas, acumulando 0 pontos por aquela questão.',
                'Team Gamification: On question 1, you will choose a team. Each completed answer awards 6.25 points to your squad collective leaderboard (up to 100 pts total). You may skip any question, receiving 0 points for that item.'
              )}
            </span>
          </div>
          <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
            <Mail className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'Contato opcional: ao final da survey, quem tiver interesse em contribuir mais com o estudo pode informar um e-mail de contato. Não é obrigatório, se preferir não informar, sua participação continua totalmente anônima.',
                'Optional contact: at the end of the survey, if you would like to contribute further to the study, you can leave a contact email. It is not required, if you prefer not to, your participation remains fully anonymous.'
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-5 sm:mt-6">
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 px-4">
            {t('← Voltar ao Início', '← Back to Home')}
          </button>
          <button
            onClick={onContinue}
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-sm sm:text-base font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-indigo-300 rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{t('Concordar e continuar', 'Agree and continue')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
