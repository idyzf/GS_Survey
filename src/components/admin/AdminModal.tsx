import { Database, FileSpreadsheet, Mail, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_ADMIN_EMAIL } from '../../config';
import { fetchAdminData, resetData } from '../../lib/api';
import { downloadFile, submissionsToCsv } from '../../lib/download';
import { translator } from '../../lib/i18n';
import type { AdminData, Language } from '../../types/survey';
import { EmailLogsTab } from './EmailLogsTab';
import { SubmissionsTab } from './SubmissionsTab';

type Tab = 'submissions' | 'emails' | 'settings';

interface AdminModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY: AdminData = { submissions: [], emailLogs: [], adminEmail: DEFAULT_ADMIN_EMAIL };

export function AdminModal({ language, isOpen, onClose }: AdminModalProps) {
  const t = translator(language);
  const [tab, setTab] = useState<Tab>('submissions');
  const [data, setData] = useState<AdminData>(EMPTY);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => setData(await fetchAdminData()), []);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

  const handleReset = async () => {
    const ok = confirm(
      t(
        'Tem certeza de que deseja resetar os dados para as pontuações de referência iniciais do consórcio?',
        'Are you sure you want to reset data to initial consortium benchmarks?'
      )
    );
    if (!ok) return;
    const onServer = await resetData();
    setMessage(
      onServer
        ? t('Banco de dados restaurado!', 'Database reset successfully!')
        : t('Banco de dados restaurado localmente!', 'Database reset locally successfully!')
    );
    load();
    setTimeout(() => setMessage(null), 3000);
  };

  const tabs: { id: Tab; label: string; icon?: typeof Database; active: string }[] = [
    {
      id: 'submissions',
      label: `${t('Submissões Salvas', 'Stored Submissions')} (${data.submissions.length})`,
      icon: Database,
      active: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'emails',
      label: `${t('Logs de E-mail Automático', 'Auto Email Logs')} (${data.emailLogs.length})`,
      icon: Mail,
      active: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    },
    {
      id: 'settings',
      label: t('Configurações & Reset', 'Settings & Reset'),
      active: 'bg-slate-800 text-slate-200 border border-slate-700',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0f17] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f121a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t('Painel Administrativo da Pesquisa', 'Survey Admin Portal')}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  GENOME.DEV
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t('Destinatário de Notificação', 'Notification Recipient')}: {data.adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadFile('genomics_survey_submissions.csv', submissionsToCsv(data.submissions), 'text/csv;charset=utf-8')
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('Exportar CSV', 'Export CSV')}</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/80 bg-[#090b10] text-xs font-mono">
          {tabs.map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                tab === id ? `${active} font-semibold` : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {message && (
          <div className="mx-6 mt-3 p-2.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
            {message}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'submissions' && <SubmissionsTab language={language} submissions={data.submissions} onReload={load} />}
          {tab === 'emails' && <EmailLogsTab language={language} emailLogs={data.emailLogs} adminEmail={data.adminEmail} />}
          {tab === 'settings' && (
            <div className="space-y-6 max-w-2xl text-xs">
              <div className="p-5 rounded-xl bg-[#0f121a] border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">
                  {t('Endereço Administrativo de Notificação', 'Notification Admin Address')}
                </h4>
                <p className="text-slate-400 mb-3 leading-relaxed">
                  {t(
                    'E-mail que recebe os relatórios completos a cada submissão (definido no backend em ADMIN_EMAIL):',
                    'Email that receives full reports on every survey completion (configured via ADMIN_EMAIL):'
                  )}
                </p>
                <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-cyan-300 font-bold">
                  {data.adminEmail}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0f121a] border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">
                  {t('Restaurar Dados Iniciais de Benchmark', 'Reset to Initial Benchmarks')}
                </h4>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  {t(
                    'Restaura o placar para as pontuações de referência do consórcio apresentadas no layout inicial.',
                    'Resets the leaderboard to the initial consortium benchmark scores displayed in the layout design.'
                  )}
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/80 transition-colors font-mono font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Restaurar Benchmarks Iniciais', 'Reset Database')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
