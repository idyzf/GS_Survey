import { useState } from 'react';
import { translator } from '../../lib/i18n';
import type { EmailLogEntry, Language } from '../../types/survey';

interface EmailLogsTabProps {
  language: Language;
  emailLogs: EmailLogEntry[];
  adminEmail: string;
}

export function EmailLogsTab({ language, emailLogs, adminEmail }: EmailLogsTabProps) {
  const t = translator(language);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200">
        <span className="font-semibold block mb-1">
          {t('Sistema de Notificação Automática por E-mail', 'Automated Email Notification System')}
        </span>
        <span>
          {t(
            `Cada conclusão da survey aciona o envio de relatório seguro com as respostas individuais, equipe e pontuação adicionada para ${adminEmail}.`,
            `Each survey completion triggers a secure notification dispatch with all participant answers, team, and score to ${adminEmail}.`
          )}
        </span>
      </div>

      {emailLogs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs font-mono">
          {t(
            'Nenhum e-mail registrado ainda. Complete uma survey para disparar a notificação.',
            'No emails recorded yet. Complete a survey to trigger notification dispatch.'
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {emailLogs.map((log) => {
            const isOpen = openId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setOpenId(isOpen ? null : log.id)}
                className="p-4 rounded-xl bg-[#0f121a] border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${log.status === 'failed' ? 'bg-rose-400' : 'bg-emerald-400'}`}
                      title={log.status === 'failed' ? t('Falha no envio', 'Send failed') : undefined}
                    />
                    <span className="text-xs font-mono font-bold text-white">{log.subject}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span>
                    Para: <strong className="text-slate-300">{log.to}</strong>
                  </span>
                  <span>
                    Equipe: <strong className="text-cyan-300">{log.team}</strong>
                  </span>
                  <span>
                    Pontos: <strong className="text-emerald-400">+{log.points.toFixed(2)} PTS</strong>
                  </span>
                  <span className="text-cyan-400 underline ml-auto text-[11px]">
                    {isOpen ? 'Ocultar Conteúdo' : 'Ver HTML do E-mail'}
                  </span>
                </div>

                {isOpen && (
                  <div className="mt-4 p-4 rounded-xl bg-black/60 border border-slate-800 text-xs">
                    <div className="text-slate-400 mb-2 font-mono text-[11px]">PREVIEW DO E-MAIL:</div>
                    <div
                      dangerouslySetInnerHTML={{ __html: log.htmlBody }}
                      className="bg-[#0b0e14] p-4 rounded-lg overflow-x-auto text-slate-200"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
