import React, { useState } from 'react';
import {
  Language,
  TeamId,
  Question,
  AnswerValue,
  SurveySubmissionPayload,
} from '../types/survey';
import { SURVEY_QUESTIONS, TEAMS } from '../data/surveyQuestions';
import { ThreeDnaCanvas } from './ThreeDnaCanvas';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dna,
  Cpu,
  Layers,
  Database,
  Users,
  Award,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SurveyWizardProps {
  language: Language;
  onComplete: (payload: SurveySubmissionPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  language,
  onComplete,
  onCancel,
  isSubmitting = false,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamId | null>(null);
  const [otherTeamText, setOtherTeamText] = useState('');
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const currentQ: Question = SURVEY_QUESTIONS[currentIdx];
  const totalQuestions = SURVEY_QUESTIONS.length;
  const currentAnswer = answers[currentQ.id];

  // Calculate accumulated potential points
  // 16 scored questions (Q2-Q17), each 6.25 pts
  const scoredAnsweredCount = Object.keys(answers).filter((k) => {
    const qId = Number(k);
    if (qId === 1) return false;
    const a = answers[qId];
    return a && !a.isSkipped && a.pointsEarned > 0;
  }).length;
  const currentAccumulatedPoints = scoredAnsweredCount * 6.25;

  // Question 1: Team Selection
  const handleSelectTeam = (teamId: TeamId, customName?: string) => {
    setSelectedTeam(teamId);
    if (customName !== undefined) {
      setOtherTeamText(customName);
    }
    setAnswers((prev) => ({
      ...prev,
      1: {
        questionId: 1,
        type: 'team_select',
        value: teamId,
        textDetail: customName || (teamId === 'other' ? otherTeamText : ''),
        isSkipped: false,
        pointsEarned: 0, // Q1 sets team, not scored
      },
    }));
  };

  // Single choice answer
  const handleSelectSingleChoice = (optionId: string, textDetail?: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: 'single_choice',
        value: optionId,
        textDetail: textDetail ?? prev[currentQ.id]?.textDetail,
        isSkipped: false,
        pointsEarned: 6.25,
      },
    }));
  };

  // Multi choice answer
  const handleToggleMultiChoice = (optionId: string) => {
    const prevVal = (currentAnswer?.value as string[]) || [];
    const exists = prevVal.includes(optionId);
    const newVal = exists ? prevVal.filter((id) => id !== optionId) : [...prevVal, optionId];

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: 'multi_choice',
        value: newVal,
        textDetail: prev[currentQ.id]?.textDetail,
        isSkipped: newVal.length === 0,
        pointsEarned: newVal.length > 0 ? 6.25 : 0,
      },
    }));
  };

  // Likert grid rating
  const handleSetLikertScore = (itemId: string, score: number) => {
    const prevMap = (currentAnswer?.value as Record<string, number>) || {};
    const newMap = { ...prevMap, [itemId]: score };

    const totalLikertItems = currentQ.likertItems?.length || 8;
    const answeredLikertCount = Object.keys(newMap).length;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: 'likert_grid',
        value: newMap,
        isSkipped: answeredLikertCount === 0,
        // Award points if at least half of items rated
        pointsEarned: answeredLikertCount >= Math.ceil(totalLikertItems / 2) ? 6.25 : 0,
      },
    }));
  };

  // Text inputs
  const handleTextChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: currentQ.type,
        value: val,
        textDetail: val,
        isSkipped: val.trim().length === 0,
        pointsEarned: val.trim().length > 0 ? 6.25 : 0,
      },
    }));
  };

  // Contact opt-in (Q17)
  const handleContactOptIn = (choice: 'no' | 'yes', emailVal?: string) => {
    const email = emailVal ?? (currentAnswer?.textDetail || '');
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: 'contact_optin',
        value: choice,
        textDetail: choice === 'yes' ? email : '',
        isSkipped: false,
        pointsEarned: 6.25,
      },
    }));
  };

  // Skip question (User receives 0 pts for this question as requested)
  const handleSkipQuestion = () => {
    if (currentQ.isTeamSelection) {
      alert(
        language === 'pt'
          ? 'Por favor, selecione sua equipe para que possamos atribuir os pontos ao placar correto!'
          : 'Please choose your squad so we can route accumulated points to the correct team!'
      );
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        questionId: currentQ.id,
        type: currentQ.type,
        value: null,
        textDetail: '',
        isSkipped: true,
        pointsEarned: 0,
      },
    }));
    setShowSkipConfirm(false);
    handleNext();
  };

  // Navigation: Next
  const handleNext = () => {
    if (currentQ.isTeamSelection && !selectedTeam) {
      alert(
        language === 'pt'
          ? 'Por favor, selecione sua equipe para iniciar a survey!'
          : 'Please select your team before proceeding!'
      );
      return;
    }

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Submit survey
      if (!selectedTeam) return;
      onComplete({
        selectedTeam,
        otherTeamText,
        answers,
        language,
      });
    }
  };

  // Navigation: Back
  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const activeTeamInfo = selectedTeam ? TEAMS[selectedTeam] : null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#07090e] pb-16">
      {/* Top Breadcrumb Telemetry Bar matching screenshot */}
      <div className="border-b border-slate-800/80 bg-[#0a0d14] py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-semibold tracking-wide">
              {String(currentQ.questionNumber).padStart(2, '0')} BIO-PIPELINE TELEMETRY SURVEY
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 truncate">
              Q{currentQ.questionNumber}: {currentQ.category[language]}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            {activeTeamInfo && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                Squad: {activeTeamInfo.shortName}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-400">
              +{currentAccumulatedPoints.toFixed(2)} / 100 PTS
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: 3D Molecular Chamber & Section Telemetry                     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-5 flex flex-col shadow-xl">
            {/* Codon badge matching screenshot */}
            <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                CODON_SEQ // RUN_88
              </span>
              <span className="text-slate-500 font-mono">SEC_0{currentQ.section}</span>
            </div>

            {/* 3D Interactive DNA Viewport matching screenshot visual */}
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black/50 border border-slate-800 mb-4">
              <ThreeDnaCanvas variant="card" interactive={true} />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-slate-800 text-[10px] font-mono text-slate-400">
                3D HELIX MODEL
              </div>
            </div>

            {/* Section Tag */}
            <div className="text-[11px] font-mono text-slate-400 mb-1 tracking-wider uppercase">
              {currentQ.sectionStep[language]}
            </div>

            {/* Section Title */}
            <h3 className="text-base font-semibold text-white mb-2 leading-snug">
              {currentQ.sectionTitle[language]}
            </h3>

            {/* Section Context Description */}
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {currentQ.sectionDesc[language]}
            </p>

            {/* Live Gamification Squad Status */}
            <div className="mt-auto pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{language === 'pt' ? 'Pontos da Survey:' : 'Survey Points:'}</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {currentAccumulatedPoints.toFixed(2)} pts
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(currentAccumulatedPoints / 100) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {currentQ.isScored
                    ? language === 'pt'
                      ? 'Esta pergunta vale +6,25 pts para sua equipe!'
                      : 'This question awards +6.25 pts to your squad!'
                    : language === 'pt'
                    ? 'Escolha sua equipe para pontuar'
                    : 'Choose your squad to start scoring'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER COLUMN: Vertical Step Rail matching screenshot                      */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center py-4 bg-[#0a0d14]/60 border border-slate-800/60 rounded-2xl">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 mb-1">
              PROGRESS
            </span>
            <span className="text-base font-mono font-bold text-white mb-6">
              {String(currentQ.questionNumber).padStart(2, '0')}{' '}
              <span className="text-xs text-slate-500">/17</span>
            </span>

            {/* Timeline Line */}
            <div className="relative flex flex-col items-center gap-3">
              {[1, 5, 10, 15, 17].map((num) => {
                const isActive = currentQ.questionNumber === num;
                const isPassed = currentQ.questionNumber > num;
                return (
                  <div key={num} className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isActive
                          ? 'border-2 border-cyan-400 bg-cyan-950 text-cyan-300 shadow-lg shadow-cyan-400/30 ring-2 ring-cyan-500/20'
                          : isPassed
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-900/80 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {num}
                    </div>
                    {num < 17 && <div className="w-0.5 h-6 bg-slate-800 my-1" />}
                  </div>
                );
              })}
            </div>

            <span className="mt-8 text-[11px] font-mono text-cyan-400 font-semibold">
              {progressPercent}%
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {language === 'pt' ? 'CONCLUÍDO' : 'COMPLETED'}
            </span>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Question Form & Option Cards matching screenshot            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 bg-[#0f121a] border border-slate-800/90 rounded-2xl p-6 sm:p-8 flex flex-col shadow-2xl">
            {/* Category Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider px-3 py-1 rounded bg-slate-900 border border-slate-800 text-cyan-300 uppercase">
                {currentQ.category[language]}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentQ.optional
                  ? language === 'pt'
                    ? 'Opcional'
                    : 'Optional'
                  : currentQ.type === 'multi_choice'
                  ? language === 'pt'
                    ? 'Múltipla Seleção'
                    : 'Multiple Selection'
                  : language === 'pt'
                  ? 'Resposta Única'
                  : 'Single Choice'}
              </span>
            </div>

            {/* Question Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              {currentQ.title[language]}
            </h2>

            {/* Question Subtitle / Guidance */}
            {currentQ.subtitle && (
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {currentQ.subtitle[language]}
              </p>
            )}

            {/* ===================================================================== */}
            {/* QUESTION INPUT RENDERING                                              */}
            {/* ===================================================================== */}
            <div className="mt-2 mb-8 flex-1">
              {/* 1. TEAM SELECTION (Q1) */}
              {currentQ.type === 'team_select' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options?.map((opt) => {
                    const isSelected = selectedTeam === opt.id;
                    const teamMeta = TEAMS[opt.id as TeamId];

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectTeam(opt.id as TeamId)}
                        className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'glow-card-active bg-[#121824] border-cyan-400/80 shadow-lg shadow-cyan-500/20'
                            : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {opt.code}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                              <Check className="w-3 h-3" />
                              {language === 'pt' ? 'SELECIONADO' : 'SELECTED'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
                          {opt.label[language]}
                        </h4>

                        {opt.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {opt.description[language]}
                          </p>
                        )}

                        {opt.hasTextInput && isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                            <label className="block text-[11px] font-mono text-slate-400 mb-1">
                              {language === 'pt' ? 'Especifique sua área:' : 'Specify your area:'}
                            </label>
                            <input
                              type="text"
                              value={otherTeamText}
                              onChange={(e) => {
                                setOtherTeamText(e.target.value);
                                handleSelectTeam('other', e.target.value);
                              }}
                              placeholder={
                                language === 'pt'
                                  ? 'Ex: Biofísica Computacional, Imunoinformática...'
                                  : 'e.g., Computational Biophysics...'
                              }
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 2. SINGLE CHOICE (e.g. Q2, Q3, Q4, Q6, Q8, Q11, Q12, Q13, Q14, Q15) */}
              {currentQ.type === 'single_choice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.options?.map((opt) => {
                    const isSelected = currentAnswer?.value === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectSingleChoice(opt.id)}
                        className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'glow-card-active bg-[#121824] border-cyan-400 shadow-md shadow-cyan-500/20'
                            : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono text-slate-500">
                            {opt.code}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                              <Check className="w-3 h-3" />
                              {language === 'pt' ? 'SELECIONADO' : 'SELECTED'}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors">
                          {opt.label[language]}
                        </div>

                        {opt.hasTextInput && isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={currentAnswer?.textDetail || ''}
                              onChange={(e) => handleSelectSingleChoice(opt.id, e.target.value)}
                              placeholder={language === 'pt' ? 'Detalhe sua opção...' : 'Detail your option...'}
                              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. MULTI CHOICE (Q9) */}
              {currentQ.type === 'multi_choice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentQ.options?.map((opt) => {
                    const selectedList = (currentAnswer?.value as string[]) || [];
                    const isSelected = selectedList.includes(opt.id);

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleToggleMultiChoice(opt.id)}
                        className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'glow-card-active bg-[#121824] border-cyan-400'
                            : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                                : 'bg-slate-900 border-slate-700 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-3" />
                          </div>

                          <div className="flex-1">
                            <span className="text-xs font-medium text-slate-200 group-hover:text-white leading-snug block">
                              {opt.label[language]}
                            </span>

                            {opt.hasTextInput && isSelected && (
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={currentAnswer?.textDetail || ''}
                                  onChange={(e) => {
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [currentQ.id]: {
                                        ...prev[currentQ.id],
                                        textDetail: e.target.value,
                                      },
                                    }));
                                  }}
                                  placeholder={language === 'pt' ? 'Descreva...' : 'Describe...'}
                                  className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-cyan-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 4. LIKERT GRID (Q5) */}
              {currentQ.type === 'likert_grid' && currentQ.likertItems && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                    <span>{language === 'pt' ? 'Eixo de Desafio' : 'Challenge Axis'}</span>
                    <div className="flex items-center gap-6 pr-2">
                      <span className="text-emerald-400 font-semibold">1 (Nenhuma)</span>
                      <span>3 (Média)</span>
                      <span className="text-rose-400 font-semibold">5 (Muita)</span>
                    </div>
                  </div>

                  {currentQ.likertItems.map((item) => {
                    const ratings = (currentAnswer?.value as Record<string, number>) || {};
                    const selectedScore = ratings[item.id];

                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700"
                      >
                        <span className="text-xs text-slate-200 font-medium sm:max-w-[55%]">
                          {item.label[language]}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5].map((score) => {
                            const isChosen = selectedScore === score;
                            return (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleSetLikertScore(item.id, score)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                                  isChosen
                                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                {score}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. TEXT SHORT / LONG (Q7, Q10, Q16) */}
              {(currentQ.type === 'text_short' || currentQ.type === 'text_long') && (
                <div className="space-y-3">
                  <textarea
                    rows={currentQ.type === 'text_long' ? 5 : 3}
                    value={(currentAnswer?.value as string) || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={currentQ.placeholder?.[language] || ''}
                    className="w-full p-4 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-y transition-colors leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>
                      {language === 'pt'
                        ? 'Qualquer detalhe prático enriquece a pesquisa acadêmica.'
                        : 'Any practical details enrich the academic research.'}
                    </span>
                    <span>
                      {((currentAnswer?.value as string) || '').length}{' '}
                      {language === 'pt' ? 'caracteres' : 'chars'}
                    </span>
                  </div>
                </div>
              )}

              {/* 6. CONTACT OPT-IN (Q17) */}
              {currentQ.type === 'contact_optin' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQ.options?.map((opt) => {
                      const isSelected = currentAnswer?.value === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleContactOptIn(opt.id as 'no' | 'yes')}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'glow-card-active bg-[#121824] border-cyan-400'
                              : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-slate-500">{opt.code}</span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300">
                                <Check className="w-3 h-3" />
                                {language === 'pt' ? 'ESCOLHIDO' : 'CHOSEN'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-white">{opt.label[language]}</div>
                        </div>
                      );
                    })}
                  </div>

                  {currentAnswer?.value === 'yes' && (
                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl mt-4">
                      <label className="block text-xs font-mono text-slate-300 mb-2">
                        {language === 'pt'
                          ? 'Seu e-mail de contato acadêmico / profissional:'
                          : 'Your academic or professional contact email:'}
                      </label>
                      <input
                        type="email"
                        value={currentAnswer?.textDetail || ''}
                        onChange={(e) => handleContactOptIn('yes', e.target.value)}
                        placeholder="exemplo@instituto.edu.br"
                        className="w-full px-3 py-2 text-sm bg-black/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[11px] text-slate-400 mt-2">
                        {language === 'pt'
                          ? 'Seu e-mail será usado apenas para agendamento voluntário e jamais será compartilhado publicamente.'
                          : 'Your email will be used solely for scheduling follow-up and will never be shared.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Skip Confirmation Dialog */}
            {showSkipConfirm && (
              <div className="mb-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-1">
                      {language === 'pt'
                        ? 'Tem certeza de que deseja pular esta pergunta?'
                        : 'Are you sure you want to skip this question?'}
                    </span>
                    <span className="text-amber-300/80 leading-relaxed block mb-3">
                      {language === 'pt'
                        ? 'Você receberá 0 pontos por esta pergunta e sua equipe deixará de somar +6,25 pontos.'
                        : 'You will receive 0 points for this question and your team will not gain +6.25 pts.'}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSkipQuestion}
                        className="px-3 py-1.5 rounded bg-amber-600 text-slate-950 font-semibold hover:bg-amber-500 transition-colors"
                      >
                        {language === 'pt' ? 'Pular mesmo assim (0 pts)' : 'Skip anyway (0 pts)'}
                      </button>
                      <button
                        onClick={() => setShowSkipConfirm(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        {language === 'pt' ? 'Cancelar e responder' : 'Cancel and answer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* BOTTOM ACTION BAR matching screenshot                                 */}
            {/* ===================================================================== */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {currentIdx === 0
                    ? language === 'pt'
                      ? 'Voltar ao Início'
                      : 'Back to Home'
                    : language === 'pt'
                    ? '< Voltar / Anterior'
                    : '< Back / Previous'}
                </span>
              </button>

              <div className="flex items-center gap-3">
                {/* Skip button (only on scored questions) */}
                {currentQ.isScored && !showSkipConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowSkipConfirm(true)}
                    className="text-xs text-slate-400 hover:text-amber-400 px-3 py-2 rounded transition-colors"
                  >
                    {language === 'pt' ? 'Pular pergunta (0 pts)' : 'Skip question (0 pts)'}
                  </button>
                )}

                {/* Primary Next / Submit Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isSubmitting
                      ? language === 'pt'
                        ? 'Enviando...'
                        : 'Submitting...'
                      : currentIdx === totalQuestions - 1
                      ? language === 'pt'
                        ? 'Concluir e Ver Placar →'
                        : 'Finish & View Leaderboard →'
                      : language === 'pt'
                      ? 'Próxima Pergunta'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
