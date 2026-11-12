import { Database, ExternalLink, FileSpreadsheet, KeyRound, Mail, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_ADMIN_EMAIL } from '../../config';
import { fetchAdminData, hasBackend, UnauthorizedError } from '../../lib/api';
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
const KEY_STORAGE = 'genomics_survey_admin_key';

const storedKey = () => {
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
};

export function AdminModal({ language, isOpen, onClose }: AdminModalProps) {
  const t = translator(language);
  const [tab, setTab] = useState<Tab>('submissions');
  const [data, setData] = useState<AdminData>(EMPTY);
  const [adminKey, setAdminKey] = useState(storedKey);
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const locked = hasBackend && !adminKey;

  const load = useCallback(async () => {
    if (hasBackend && !adminKey) return;
    try {
      setData(await fetchAdminData(adminKey));
      setError(null);
      try {
        sessionStorage.setItem(KEY_STORAGE, adminKey);
      } catch {
        // ignore
      }
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setAdminKey('');
        setError(t('Chave de acesso inválida.', 'Invalid access key.'));
      } else {
        setError(t('Não foi possível carregar os dados.', 'Could not load data.'));
      }
    }
  }, [adminKey]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  if (!isOpen) return null;

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
      label: t('Configurações', 'Settings'),
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
            {!locked && (
              <button
                onClick={() =>
                  downloadFile('genomics_survey_submissions.csv', submissionsToCsv(data.submissions), 'text/csv;charset=utf-8')
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{t('Exportar CSV', 'Export CSV')}</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {locked ? (
          <form
            className="flex-1 flex items-center justify-center p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setAdminKey(keyInput.trim());
              setKeyInput('');
            }}
          >
            <div className="w-full max-w-sm p-6 rounded-xl bg-[#0f121a] border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>{t('Acesso restrito', 'Restricted access')}</span>
              </div>
              <p className="text-slate-400 mb-4 leading-relaxed">
                {t(
                  'Informe a chave de administrador (ADMIN_KEY) enviada no e-mail de configuração do backend.',
                  'Enter the admin key (ADMIN_KEY) sent in the backend setup email.'
                )}
              </p>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 mb-3 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              />
              {error && <p className="text-rose-400 mb-3">{error}</p>}
              <button
                type="submit"
                disabled={!keyInput.trim()}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold disabled:opacity-50"
              >
                {t('Entrar', 'Unlock')}
              </button>
            </div>
          </form>
        ) : (
          <>
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

            {error && (
              <div className="mx-6 mt-3 p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
                {error}
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
                        'E-mail que recebe os relatórios completos a cada submissão (propriedade ADMIN_EMAIL do Apps Script):',
                        'Email that receives full reports on every survey completion (ADMIN_EMAIL Apps Script property):'
                      )}
                    </p>
                    <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-cyan-300 font-bold">
                      {data.adminEmail}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-[#0f121a] border border-slate-800">
                    <h4 className="text-sm font-bold text-white mb-2">{t('Planilha de Respostas', 'Responses Spreadsheet')}</h4>
                    {data.spreadsheetUrl ? (
                      <>
                        <p className="text-slate-400 mb-4 leading-relaxed">
                          {t(
                            'Todas as respostas e e-mails enviados ficam registrados na Google Sheet do backend.',
                            'Every response and sent email is recorded in the backend Google Sheet.'
                          )}
                        </p>
                        <a
                          href={data.spreadsheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/80 transition-colors font-mono font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t('Abrir planilha', 'Open spreadsheet')}</span>
                        </a>
                      </>
                    ) : (
                      <p className="text-slate-400 leading-relaxed">
                        {t(
                          'Modo local: nenhum backend configurado (VITE_API_URL). As respostas ficam apenas neste navegador.',
                          'Local mode: no backend configured (VITE_API_URL). Responses stay in this browser only.'
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
