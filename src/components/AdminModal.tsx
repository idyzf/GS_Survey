import React, { useEffect, useState } from 'react';
import { Language, SubmissionRecord, EmailLogEntry } from '../types/survey';
import {
  X,
  Database,
  Mail,
  Download,
  RotateCcw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  language,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'emails' | 'settings'>('submissions');
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>('ideli.zanesco@gmail.com');
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubmissionRecord | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailLogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, emailRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/emails'),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(subData.submissions || []);
      }
      if (emailRes.ok) {
        const emailData = await emailRes.json();
        setEmailLogs(emailData.logs || []);
        if (emailData.adminEmail) setAdminEmail(emailData.adminEmail);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    window.open('/api/admin/export', '_blank');
  };

  const handleResetBenchmarks = async () => {
    if (
      !confirm(
        language === 'pt'
          ? 'Tem certeza de que deseja resetar os dados para as pontuações de referência iniciais do consórcio?'
          : 'Are you sure you want to reset data to initial consortium benchmarks?'
      )
    ) {
      return;
    }

    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        setActionMessage(language === 'pt' ? 'Banco de dados restaurado!' : 'Database reset successfully!');
        fetchData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.teamName.toLowerCase().includes(q) ||
      (s.emailContact && s.emailContact.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0f17] border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f121a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{language === 'pt' ? 'Painel Administrativo da Pesquisa' : 'Survey Admin Portal'}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                  GENOME.DEV
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'pt'
                  ? `Destinatário de Notificação: ${adminEmail}`
                  : `Notification Recipient: ${adminEmail}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Exportar CSV' : 'Export CSV'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/80 bg-[#090b10] text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('submissions');
              setSelectedSub(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'submissions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {language === 'pt' ? 'Submissões Salvas' : 'Stored Submissions'} ({submissions.length})
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('emails');
              setSelectedEmail(null);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'emails'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>
              {language === 'pt' ? 'Logs de E-mail Automático' : 'Auto Email Logs'} ({emailLogs.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{language === 'pt' ? 'Configurações & Reset' : 'Settings & Reset'}</span>
          </button>
        </div>

        {actionMessage && (
          <div className="mx-6 mt-3 p-2.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono">
            {actionMessage}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {/* Search filter */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'pt' ? 'Buscar por ID, equipe ou e-mail...' : 'Search by ID, team, or email...'}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  {language === 'pt' ? 'Recarregar' : 'Reload'}
                </button>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-mono">
                  {language === 'pt'
                    ? 'Nenhuma participação registrada ainda. Complete a survey para registrar a primeira!'
                    : 'No survey submissions recorded yet. Complete the survey to record the first!'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedSub?.id === sub.id
                          ? 'bg-[#141b29] border-cyan-400 shadow-md'
                          : 'bg-[#0f121a] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          {sub.id}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          +{sub.totalPoints.toFixed(2)} PTS
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white mb-1">
                        {sub.teamName}
                      </h4>

                      <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-3 gap-y-1 mb-2">
                        <span>Respondidas: {sub.answeredCount}/16</span>
                        <span>Puladas: {sub.skippedCount}</span>
                        <span>Data: {new Date(sub.timestamp).toLocaleString()}</span>
                      </div>

                      {sub.emailContact && (
                        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/60 truncate">
                          Contato voluntário: {sub.emailContact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submissions Detail Modal / Inspector */}
              {selectedSub && (
                <div className="mt-6 p-5 rounded-xl bg-[#090b10] border border-cyan-500/40">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>Detalhes da Submissão: {selectedSub.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedSub.teamName}
                      </span>
                    </h4>
                    <button
                      onClick={() => setSelectedSub(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Fechar detalhes
                    </button>
                  </div>

                  <div className="space-y-2 text-xs font-mono max-h-60 overflow-y-auto">
                    {Object.entries(selectedSub.answers || {}).map(([qNum, ans]: any) => (
                      <div
                        key={qNum}
                        className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <span className="text-cyan-400 font-bold shrink-0">Q{qNum}:</span>
                        <div className="flex-1 text-slate-300">
                          {ans.isSkipped ? (
                            <span className="text-slate-400 italic">(Pergunta pulada - 0 pts)</span>
                          ) : typeof ans.value === 'object' ? (
                            <pre className="text-[11px] whitespace-pre-wrap">{JSON.stringify(ans.value, null, 2)}</pre>
                          ) : (
                            <span>{String(ans.value || ans.textDetail || 'Respondido')}</span>
                          )}
                          {ans.textDetail && ans.textDetail !== ans.value && (
                            <div className="text-[11px] text-slate-400 mt-1">Detalhe: {ans.textDetail}</div>
                          )}
                        </div>
                        <span className="shrink-0 text-slate-400">
                          {ans.isSkipped ? '0 pts' : '+6.25 pts'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL LOGS */}
          {activeTab === 'emails' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200">
                <span className="font-semibold block mb-1">
                  {language === 'pt' ? 'Sistema de Notificação Automática por E-mail' : 'Automated Email Notification System'}
                </span>
                <span>
                  {language === 'pt'
                    ? `Cada conclusão da survey aciona o envio de relatório seguro com as respostas individuais, equipe e pontuação adicionada para ${adminEmail}.`
                    : `Each survey completion triggers a secure notification dispatch with all participant answers, team, and score to ${adminEmail}.`}
                </span>
              </div>

              {emailLogs.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs font-mono">
                  {language === 'pt'
                    ? 'Nenhum e-mail registrado ainda. Complete uma survey para disparar a notificação.'
                    : 'No emails recorded yet. Complete a survey to trigger notification dispatch.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedEmail(selectedEmail?.id === log.id ? null : log)}
                      className="p-4 rounded-xl bg-[#0f121a] border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-mono font-bold text-white">
                            {log.subject}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                        <span>Para: <strong className="text-slate-300">{log.to}</strong></span>
                        <span>Equipe: <strong className="text-cyan-300">{log.team}</strong></span>
                        <span>Pontos: <strong className="text-emerald-400">+{log.points.toFixed(2)} PTS</strong></span>
                        <span className="text-cyan-400 underline ml-auto text-[11px]">
                          {selectedEmail?.id === log.id ? 'Ocultar Conteúdo' : 'Ver HTML do E-mail'}
                        </span>
                      </div>

                      {/* Expanded Email HTML preview */}
                      {selectedEmail?.id === log.id && (
                        <div className="mt-4 p-4 rounded-xl bg-black/60 border border-slate-800 text-xs">
                          <div className="text-slate-400 mb-2 font-mono text-[11px]">PREVIEW DO E-MAIL:</div>
                          <div
                            dangerouslySetInnerHTML={{ __html: log.htmlBody }}
                            className="bg-[#0b0e14] p-4 rounded-lg overflow-x-auto text-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & RESET */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl text-xs">
              <div className="p-5 rounded-xl bg-[#0f121a] border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">
                  {language === 'pt' ? 'Endereço Administrativo de Notificação' : 'Notification Admin Address'}
                </h4>
                <p className="text-slate-400 mb-3 leading-relaxed">
                  {language === 'pt'
                    ? 'E-mail que recebe os relatórios completos a cada submissão (definido no backend em ADMIN_EMAIL):'
                    : 'Email that receives full reports on every survey completion (configured via ADMIN_EMAIL):'}
                </p>
                <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-cyan-300 font-bold">
                  {adminEmail}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0f121a] border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">
                  {language === 'pt' ? 'Restaurar Dados Iniciais de Benchmark' : 'Reset to Initial Benchmarks'}
                </h4>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  {language === 'pt'
                    ? 'Restaura o placar para as pontuações de referência do consórcio apresentadas no layout inicial.'
                    : 'Resets the leaderboard to the initial consortium benchmark scores displayed in the layout design.'}
                </p>
                <button
                  onClick={handleResetBenchmarks}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900/80 transition-colors font-mono font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'pt' ? 'Restaurar Benchmarks Iniciais' : 'Reset Database'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
