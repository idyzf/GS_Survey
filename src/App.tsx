import { useState } from 'react';
import { AdminModal } from './components/admin/AdminModal';
import { submitSurvey } from './lib/api';
import { HomePage } from './pages/HomePage';
import { IntroPage } from './pages/IntroPage';
import { ResultsPage } from './pages/ResultsPage';
import { SurveyPage } from './pages/SurveyPage';
import type { Language, SubmissionRecord, SurveySubmissionPayload } from './types/survey';

type View = 'home' | 'intro' | 'survey' | 'results';

export default function App() {
  const [language, setLanguage] = useState<Language>('pt');
  const [view, setView] = useState<View>('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<SubmissionRecord | null>(null);

  const handleComplete = async (payload: SurveySubmissionPayload) => {
    setIsSubmitting(true);
    try {
      setLatestSubmission(await submitSurvey(payload));
      setView('results');
    } catch (err) {
      console.error('Submission failed', err);
      alert(
        language === 'pt'
          ? 'Não foi possível enviar suas respostas. Verifique sua conexão e tente novamente — nada foi perdido.'
          : 'Could not submit your answers. Check your connection and try again — nothing was lost.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAdmin = () => setIsAdminOpen(true);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      <main className="flex-1">
        {view === 'home' && (
          <HomePage
            language={language}
            onLanguageChange={setLanguage}
            onStartSurvey={() => setView('intro')}
            onViewLeaderboard={() => setView('results')}
            onOpenAdmin={openAdmin}
          />
        )}
        {view === 'intro' && (
          <IntroPage
            language={language}
            onLanguageChange={setLanguage}
            onContinue={() => setView('survey')}
            onBack={() => setView('home')}
          />
        )}
        {view === 'survey' && (
          <SurveyPage
            language={language}
            isSubmitting={isSubmitting}
            onComplete={handleComplete}
            onCancel={() => setView('home')}
          />
        )}
        {view === 'results' && (
          <ResultsPage
            language={language}
            latestSubmission={latestSubmission}
            onRetake={() => {
              setLatestSubmission(null);
              setView('intro');
            }}
          />
        )}
      </main>

      <AdminModal language={language} isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
