import React from 'react';
import { Language } from '../types/survey';
import { Dna, Trophy, BarChart2, ShieldCheck, Settings } from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentView: 'home' | 'intro' | 'survey' | 'results';
  onNavigate: (view: 'home' | 'survey' | 'results') => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  currentView,
  onNavigate,
  onOpenAdmin,
}) => {
  return (
    <header className="relative z-30 border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Single text element wordmark with icon */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-sm shadow-cyan-500/20">
            <Dna className="w-5 h-5 text-slate-950 animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              GENOME<span className="text-cyan-400">.DEV</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'home' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            {language === 'pt' ? 'Início' : 'Home'}
          </button>
          <button
            onClick={() => onNavigate('survey')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'survey' || currentView === 'intro' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            {language === 'pt' ? 'Responder Pesquisa' : 'Take Survey'}
          </button>
          <button
            onClick={() => onNavigate('results')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white ${
              currentView === 'results' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{language === 'pt' ? 'Placar ao Vivo' : 'Live Leaderboard'}</span>
          </button>
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-400 hover:text-cyan-300 transition-colors px-2 py-1 rounded bg-slate-900/60 border border-slate-800"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'Painel Admin' : 'Admin Portal'}</span>
          </button>
        </nav>

        {/* Zone 3: Language Selector Segmented Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-medium">
            <button
              onClick={() => onLanguageChange('pt')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                language === 'pt'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${language === 'pt' ? 'bg-white' : 'bg-slate-500'}`} />
              <span>Português</span>
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                language === 'en'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${language === 'en' ? 'bg-white' : 'bg-slate-500'}`} />
              <span>English</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
