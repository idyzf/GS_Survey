import { Check } from 'lucide-react';
import { translator } from '../../lib/i18n';
import { isAnswered } from '../../lib/scoring';
import type { Answer, AnswerData, Language, Question, TeamId } from '../../types/survey';
import { DetailInput, OptionCard, SelectedBadge } from './OptionCard';

const LIKERT_SCORES = [1, 2, 3, 4, 5];

export function toAnswer(value: AnswerData | null, textDetail?: string): Answer {
  const answer = { value, textDetail, isSkipped: false };
  return { ...answer, isSkipped: !isAnswered(answer) };
}

interface TeamSelectProps {
  question: Question;
  language: Language;
  selectedTeam: TeamId | null;
  otherTeamText: string;
  onSelect: (team: TeamId) => void;
  onOtherTextChange: (text: string) => void;
}

/** Question 1: picks the team that receives the points. */
export function TeamSelect({ question, language, selectedTeam, otherTeamText, onSelect, onOtherTextChange }: TeamSelectProps) {
  const t = translator(language);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((opt) => {
        const selected = selectedTeam === opt.id;
        return (
          <OptionCard key={opt.id} selected={selected} onSelect={() => onSelect(opt.id as TeamId)}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {opt.code}
              </span>
              {selected && <SelectedBadge label={t('SELECIONADO', 'SELECTED')} />}
            </div>
            <h4 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
              {opt.label[language]}
            </h4>
            {opt.description && <p className="text-xs text-slate-400 leading-relaxed">{opt.description[language]}</p>}
            {opt.hasTextInput && selected && (
              <DetailInput
                label={t('Especifique sua área:', 'Specify your area:')}
                value={otherTeamText}
                onChange={onOtherTextChange}
                placeholder={t('Ex: Biofísica Computacional, Imunoinformática...', 'e.g., Computational Biophysics...')}
              />
            )}
          </OptionCard>
        );
      })}
    </div>
  );
}

interface QuestionInputProps {
  question: Question;
  language: Language;
  answer?: Answer;
  onChange: (update: (prev?: Answer) => Answer) => void;
}

/** Renders the input for every scored question type. */
export function QuestionInput({ question, language, answer, onChange }: QuestionInputProps) {
  const t = translator(language);

  switch (question.type) {
    case 'single_choice':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((opt) => {
            const selected = answer?.value === opt.id;
            return (
              <OptionCard
                key={opt.id}
                selected={selected}
                onSelect={() => onChange((prev) => toAnswer(opt.id, prev?.value === opt.id ? prev.textDetail : undefined))}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-slate-500">{opt.code}</span>
                  {selected && <SelectedBadge label={t('SELECIONADO', 'SELECTED')} />}
                </div>
                <div className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors">
                  {opt.label[language]}
                </div>
                {opt.hasTextInput && selected && (
                  <DetailInput
                    value={answer?.textDetail ?? ''}
                    onChange={(text) => onChange(() => toAnswer(opt.id, text))}
                    placeholder={t('Detalhe sua opção...', 'Detail your option...')}
                  />
                )}
              </OptionCard>
            );
          })}
        </div>
      );

    case 'multi_choice': {
      const selectedIds = (answer?.value as string[] | null) ?? [];
      const toggle = (id: string) =>
        onChange((prev) => {
          const list = (prev?.value as string[] | null) ?? [];
          return toAnswer(list.includes(id) ? list.filter((x) => x !== id) : [...list, id], prev?.textDetail);
        });
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {question.options?.map((opt) => {
            const selected = selectedIds.includes(opt.id);
            return (
              <OptionCard key={opt.id} compact selected={selected} onSelect={() => toggle(opt.id)}>
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-all ${
                      selected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-3" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white leading-snug block">
                      {opt.label[language]}
                    </span>
                    {opt.hasTextInput && selected && (
                      <DetailInput
                        compact
                        value={answer?.textDetail ?? ''}
                        onChange={(text) => onChange((prev) => toAnswer(prev?.value ?? null, text))}
                        placeholder={t('Descreva...', 'Describe...')}
                      />
                    )}
                  </div>
                </div>
              </OptionCard>
            );
          })}
        </div>
      );
    }

    case 'likert_grid': {
      const ratings = (answer?.value as Record<string, number> | null) ?? {};
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
            <span>{t('Eixo de Desafio', 'Challenge Axis')}</span>
            <div className="flex items-center gap-6 pr-2">
              <span className="text-emerald-400 font-semibold">1 (Nenhuma)</span>
              <span>3 (Média)</span>
              <span className="text-rose-400 font-semibold">5 (Muita)</span>
            </div>
          </div>
          {question.likertItems?.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-[#0a0d14] border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700"
            >
              <span className="text-xs text-slate-200 font-medium sm:max-w-[55%]">{item.label[language]}</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {LIKERT_SCORES.map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() =>
                      onChange((prev) => toAnswer({ ...(prev?.value as Record<string, number> | null), [item.id]: score }))
                    }
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                      ratings[item.id] === score
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'text_short':
    case 'text_long': {
      const text = (answer?.value as string | null) ?? '';
      return (
        <div className="space-y-3">
          <textarea
            rows={question.type === 'text_long' ? 5 : 3}
            value={text}
            onChange={(e) => onChange(() => toAnswer(e.target.value))}
            placeholder={question.placeholder?.[language] ?? ''}
            className="w-full p-4 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 resize-y transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              {t('Qualquer detalhe prático enriquece a pesquisa acadêmica.', 'Any practical details enrich the academic research.')}
            </span>
            <span>
              {text.length} {t('caracteres', 'chars')}
            </span>
          </div>
        </div>
      );
    }

    case 'contact_optin':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options?.map((opt) => (
              <OptionCard
                key={opt.id}
                selected={answer?.value === opt.id}
                onSelect={() => onChange((prev) => toAnswer(opt.id, opt.id === 'yes' ? prev?.textDetail : ''))}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-500">{opt.code}</span>
                  {answer?.value === opt.id && <SelectedBadge plain label={t('ESCOLHIDO', 'CHOSEN')} />}
                </div>
                <div className="text-sm font-semibold text-white">{opt.label[language]}</div>
              </OptionCard>
            ))}
          </div>
          {answer?.value === 'yes' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl mt-4">
              <label className="block text-xs font-mono text-slate-300 mb-2">
                {t('Seu e-mail de contato acadêmico / profissional:', 'Your academic or professional contact email:')}
              </label>
              <input
                type="email"
                value={answer.textDetail ?? ''}
                onChange={(e) => onChange(() => toAnswer('yes', e.target.value))}
                placeholder="exemplo@instituto.edu.br"
                className="w-full px-3 py-2 text-sm bg-black/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                {t(
                  'Seu e-mail será usado apenas para agendamento voluntário e jamais será compartilhado publicamente.',
                  'Your email will be used solely for scheduling follow-up and will never be shared.'
                )}
              </p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
