import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCallback, useState } from 'react';
import { QuestionInput, TeamSelect } from '../components/survey/QuestionInput';
import { ProgressRail, SectionPanel } from '../components/survey/SurveySidebar';
import { TeamWelcomeModal } from '../components/survey/TeamWelcomeModal';
import { SURVEY_QUESTIONS } from '../data/questions';
import { TEAMS } from '../data/teams';
import { translator } from '../lib/i18n';
import { countAnswered, POINTS_PER_QUESTION } from '../lib/scoring';
import type { Answer, Answers, Language, SurveySubmissionPayload, TeamId } from '../types/survey';

interface SurveyPageProps {
  language: Language;
  isSubmitting: boolean;
  onComplete: (payload: SurveySubmissionPayload) => void;
  onCancel: () => void;
}

export function SurveyPage({ language, isSubmitting, onComplete, onCancel }: SurveyPageProps) {
  const t = translator(language);
  const [index, setIndex] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamId | null>(null);
  const [otherTeamText, setOtherTeamText] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [clientId] = useState(() => crypto.randomUUID());
  // Team confirmed by leaving question 1; drives the pop-up and the crest in the side card.
  const [confirmedTeam, setConfirmedTeam] = useState<TeamId | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const question = SURVEY_QUESTIONS[index];
  const isTeamQuestion = question.type === 'team_select';
  const isLast = index === SURVEY_QUESTIONS.length - 1;
  const points = countAnswered(answers) * POINTS_PER_QUESTION;

  const updateAnswer = (update: (prev?: Answer) => Answer) =>
    setAnswers((prev) => ({ ...prev, [question.id]: update(prev[question.id]) }));

  const goTo = (next: number) => {
    setIndex(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!selectedTeam) {
      alert(t('Por favor, selecione sua equipe para iniciar a survey!', 'Please select your team before proceeding!'));
      return;
    }
    if (isTeamQuestion && selectedTeam !== confirmedTeam) {
      setConfirmedTeam(selectedTeam);
      setShowWelcome(true);
    }
    if (isLast) onComplete({ selectedTeam, otherTeamText, answers, language, clientId });
    else goTo(index + 1);
  };

  const handleSkip = () => {
    updateAnswer(() => ({ value: null, isSkipped: true }));
    setShowSkipConfirm(false);
    handleNext();
  };

  const closeWelcome = useCallback(() => setShowWelcome(false), []);

  const handlePrev = () => (index > 0 ? goTo(index - 1) : onCancel());

  const answerKind = question.optional
    ? t('Opcional', 'Optional')
    : question.type === 'multi_choice'
      ? t('Múltipla Seleção', 'Multiple Selection')
      : t('Resposta Única', 'Single Choice');

  const nextLabel = isSubmitting
    ? t('Enviando...', 'Submitting...')
    : isLast
      ? t('Concluir e Ver Placar →', 'Finish & View Leaderboard →')
      : t('Próxima Pergunta', 'Next Question');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#07090e] pb-16">
      {/* Breadcrumb bar */}
      <div className="border-b border-slate-800/80 bg-[#0a0d14] py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-semibold tracking-wide">
              {String(question.id).padStart(2, '0')} BIO-PIPELINE TELEMETRY SURVEY
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 truncate">
              Q{question.id}: {question.category[language]}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            {selectedTeam && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                Squad: {TEAMS[selectedTeam].shortName}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-400">+{points.toFixed(2)} / 100 PTS</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <SectionPanel
            question={question}
            language={language}
            points={points}
            team={isTeamQuestion ? null : confirmedTeam}
          />
          <ProgressRail questionId={question.id} language={language} />

          {/* Question */}
          <div className="lg:col-span-8 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 flex flex-col shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider px-3 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 uppercase">
                {question.category[language]}
              </span>
              <span className="text-xs font-mono text-slate-400">{answerKind}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">{question.title[language]}</h2>
            {question.subtitle && (
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">{question.subtitle[language]}</p>
            )}

            <div className="mt-2 mb-8 flex-1">
              {isTeamQuestion ? (
                <TeamSelect
                  question={question}
                  language={language}
                  selectedTeam={selectedTeam}
                  otherTeamText={otherTeamText}
                  onSelect={setSelectedTeam}
                  onOtherTextChange={setOtherTeamText}
                />
              ) : (
                <QuestionInput
                  question={question}
                  language={language}
                  answer={answers[question.id]}
                  onChange={updateAnswer}
                />
              )}
            </div>

            {showSkipConfirm && (
              <div className="mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-1">
                      {t('Tem certeza de que deseja pular esta pergunta?', 'Are you sure you want to skip this question?')}
                    </span>
                    <span className="text-amber-300/80 leading-relaxed block mb-3">
                      {t(
                        'Você receberá 0 pontos por esta pergunta e sua equipe deixará de somar +6,25 pontos.',
                        'You will receive 0 points for this question and your team will not gain +6.25 pts.'
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSkip}
                        className="px-3 py-1.5 rounded bg-amber-600 text-slate-950 font-semibold hover:bg-amber-500 transition-colors"
                      >
                        {t('Pular mesmo assim (0 pts)', 'Skip anyway (0 pts)')}
                      </button>
                      <button onClick={() => setShowSkipConfirm(false)} className="text-xs text-slate-400 hover:text-white">
                        {t('Cancelar e responder', 'Cancel and answer')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{index === 0 ? t('Voltar ao Início', 'Back to Home') : t('< Voltar / Anterior', '< Back / Previous')}</span>
              </button>

              <div className="flex items-center gap-3">
                {!isTeamQuestion && !showSkipConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowSkipConfirm(true)}
                    className="text-xs text-slate-400 hover:text-amber-400 px-3 py-2 rounded transition-colors"
                  >
                    {t('Pular pergunta (0 pts)', 'Skip question (0 pts)')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{nextLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWelcome && confirmedTeam && (
        <TeamWelcomeModal team={confirmedTeam} language={language} onClose={closeWelcome} />
      )}
    </div>
  );
}
