/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Language, SurveySubmissionPayload, TeamId } from './types/survey';
import { HomeHero } from './components/HomeHero';
import { IntroModal } from './components/IntroModal';
import { SurveyWizard } from './components/SurveyWizard';
import { ResultsPage } from './components/ResultsPage';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('pt');
  const [currentView, setCurrentView] = useState<'home' | 'intro' | 'survey' | 'results'>('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestSubmission, setLatestSubmission] = useState<{
    id: string;
    selectedTeam: TeamId;
    teamName: string;
    totalPoints: number;
    answeredCount: number;
    timestamp: string;
    answers: Record<number, any>;
  } | null>(null);

  // Handle survey submission to backend
  const handleCompleteSurvey = async (payload: SurveySubmissionPayload) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setLatestSubmission({
          id: data.submissionId,
          selectedTeam: payload.selectedTeam,
          teamName: data.team?.name || payload.selectedTeam,
          totalPoints: data.totalPoints,
          answeredCount: data.answeredCount,
          timestamp: data.timestamp,
          answers: payload.answers,
        });
        setCurrentView('results');
      } else {
        const err = await response.json();
        alert(`Erro ao registrar pesquisa: ${err.error || 'Falha no servidor'}`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Erro de conexão ao enviar a pesquisa. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950">
      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeHero
            language={language}
            onLanguageChange={setLanguage}
            onStartSurvey={() => setCurrentView('intro')}
            onViewLeaderboard={() => setCurrentView('results')}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}

        {currentView === 'intro' && (
          <IntroModal
            language={language}
            onLanguageChange={setLanguage}
            onAcceptAndContinue={() => setCurrentView('survey')}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'survey' && (
          <SurveyWizard
            language={language}
            onComplete={handleCompleteSurvey}
            onCancel={() => setCurrentView('home')}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'results' && (
          <ResultsPage
            language={language}
            latestSubmission={latestSubmission}
            onRetake={() => {
              setLatestSubmission(null);
              setCurrentView('intro');
            }}
            onOpenAdmin={() => setIsAdminOpen(true)}
          />
        )}
      </main>

      {/* Admin Portal Modal */}
      <AdminModal
        language={language}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
