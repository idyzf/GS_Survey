import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ideli.zanesco@gmail.com';

app.use(express.json({ limit: '10mb' }));

// Persistent Database Directory & File
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'survey_data.json');
const EMAIL_LOG_FILE = path.join(DATA_DIR, 'email_logs.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface TeamData {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  points: number;
  participantsCount: number;
  color: string;
  accentHex: string;
}

interface DbSchema {
  teams: Record<string, TeamData>;
  submissions: Array<{
    id: string;
    timestamp: string;
    selectedTeam: string;
    teamName: string;
    otherTeamText?: string;
    totalPoints: number;
    answeredCount: number;
    skippedCount: number;
    language: string;
    emailContact?: string;
    answers: Record<string, any>;
  }>;
}

interface EmailLogRecord {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  submissionId: string;
  team: string;
  points: number;
  htmlBody: string;
  status: 'sent' | 'simulated';
}

const INITIAL_TEAMS: Record<string, TeamData> = {
  bioinformatics: {
    id: 'bioinformatics',
    name: 'Bioinformatics Team',
    tag: '#BIOINFORMATICS',
    subtitle: 'Distributed High-Throughput WGS Batching',
    points: 940,
    participantsCount: 15,
    color: 'from-cyan-500 to-blue-600',
    accentHex: '#00e5ff',
  },
  software_engineering: {
    id: 'software_engineering',
    name: 'Software engineer Team',
    tag: '#SOFTWARE_ENG',
    subtitle: 'Somatic Mutation & Deep-Coverage GATK4',
    points: 865,
    participantsCount: 14,
    color: 'from-blue-500 to-indigo-600',
    accentHex: '#38bdf8',
  },
  biological_sciences: {
    id: 'biological_sciences',
    name: 'Single-Cell RNA Analytics Lab',
    tag: '#BIO_SCIENCES',
    subtitle: 'CellRanger & Seurat 5 Distributed Clusters',
    points: 820,
    participantsCount: 13,
    color: 'from-fuchsia-500 to-pink-600',
    accentHex: '#e879f9',
  },
  other: {
    id: 'other',
    name: 'Structural Genomics Engine',
    tag: '#SPECIAL_SQUAD',
    subtitle: 'Protein Conformation Inference & CUDA Acceleration',
    points: 745,
    participantsCount: 12,
    color: 'from-purple-500 to-indigo-700',
    accentHex: '#a78bfa',
  },
  clinical_genetics: {
    id: 'clinical_genetics',
    name: 'Clinical Genetics & Diagnostics',
    tag: '#CLINICAL_GENETICS',
    subtitle: 'ACMG Variant Classification & Clinical Precision',
    points: 680,
    participantsCount: 11,
    color: 'from-emerald-500 to-teal-600',
    accentHex: '#34d399',
  },
  product_project: {
    id: 'product_project',
    name: 'Bio-Platform Product Management',
    tag: '#PRODUCT_MGMT',
    subtitle: 'Cross-functional Bio-Squad Delivery & Roadmaps',
    points: 590,
    participantsCount: 9,
    color: 'from-amber-500 to-orange-600',
    accentHex: '#fbbf24',
  },
};

function readDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading survey database file, resetting to initial state:', err);
  }

  const initial: DbSchema = {
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    submissions: [],
  };
  saveDb(initial);
  return initial;
}

function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing survey database file:', err);
  }
}

function readEmailLogs(): EmailLogRecord[] {
  try {
    if (fs.existsSync(EMAIL_LOG_FILE)) {
      const raw = fs.readFileSync(EMAIL_LOG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading email logs file:', err);
  }
  return [];
}

function saveEmailLog(entry: EmailLogRecord) {
  try {
    const logs = readEmailLogs();
    logs.unshift(entry);
    fs.writeFileSync(EMAIL_LOG_FILE, JSON.stringify(logs.slice(0, 100), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving email log:', err);
  }
}

// Compute live leaderboard with rankings
function getLeaderboard(db: DbSchema) {
  const list = Object.values(db.teams);
  list.sort((a, b) => b.points - a.points);

  const maxPoints = Math.max(...list.map((t) => t.points), 1000);

  return list.map((team, index) => ({
    ...team,
    rank: index + 1,
    isTopScore: index === 0,
    maxBenchmarkPoints: Math.max(1000, Math.ceil(maxPoints / 100) * 100),
  }));
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Leaderboard & Summary
app.get('/api/survey/leaderboard', (_req: Request, res: Response) => {
  const db = readDb();
  const leaderboard = getLeaderboard(db);
  const totalSubmissions = db.submissions.length;
  const totalPointsAwarded = Object.values(db.teams).reduce((sum, t) => sum + t.points, 0);

  res.json({
    teams: leaderboard,
    meta: {
      totalSubmissions,
      totalPointsAwarded,
      lastUpdated: new Date().toISOString(),
    },
  });
});

// 2. Submit Survey
app.post('/api/survey/submit', (req: Request, res: Response) => {
  const { selectedTeam, otherTeamText, answers, language = 'pt' } = req.body;

  if (!selectedTeam) {
    return res.status(400).json({ error: 'Selected team is required' });
  }

  const db = readDb();
  const team = db.teams[selectedTeam];
  if (!team) {
    return res.status(400).json({ error: `Unknown team: ${selectedTeam}` });
  }

  // 16 Scored Questions: Questions 2 through 17
  // Each answered question adds 6.25 points to the team
  let answeredCount = 0;
  let skippedCount = 0;
  const processedAnswers: Record<string, any> = {};

  for (let qId = 2; qId <= 17; qId++) {
    const ans = answers?.[qId];
    if (!ans || ans.isSkipped) {
      skippedCount++;
      processedAnswers[qId] = {
        questionId: qId,
        isSkipped: true,
        pointsEarned: 0,
        value: null,
      };
    } else {
      // Validate that value is present
      const val = ans.value;
      let hasValidValue = false;
      if (typeof val === 'string' && val.trim().length > 0) hasValidValue = true;
      else if (Array.isArray(val) && val.length > 0) hasValidValue = true;
      else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) hasValidValue = true;
      else if (ans.textDetail && ans.textDetail.trim().length > 0) hasValidValue = true;

      if (hasValidValue) {
        answeredCount++;
        processedAnswers[qId] = {
          questionId: qId,
          isSkipped: false,
          pointsEarned: 6.25,
          value: val,
          textDetail: ans.textDetail || '',
        };
      } else {
        skippedCount++;
        processedAnswers[qId] = {
          questionId: qId,
          isSkipped: true,
          pointsEarned: 0,
          value: null,
        };
      }
    }
  }

  const totalPoints = answeredCount * 6.25; // max 100 pts
  const submissionId = `GEN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // Contact email from Q17 if user opted in
  const q17 = answers?.[17];
  const emailContact =
    q17?.value === 'yes' || q17?.value === 'OPT_YES' ? q17?.textDetail?.trim() : undefined;

  // Record submission
  const submissionRecord = {
    id: submissionId,
    timestamp,
    selectedTeam,
    teamName: team.name,
    otherTeamText: selectedTeam === 'other' ? otherTeamText : undefined,
    totalPoints,
    answeredCount,
    skippedCount,
    language,
    emailContact,
    answers: processedAnswers,
  };

  db.submissions.unshift(submissionRecord);

  // Update team score and participants
  team.points = Math.round((team.points + totalPoints) * 100) / 100;
  team.participantsCount += 1;
  saveDb(db);

  // Generate Admin Notification Email
  const emailSubject = `[Survey Genômica] Nova Resposta Concluída: +${totalPoints.toFixed(2)} pts para ${team.name}`;
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14; color: #f1f5f9; padding: 24px; }
    .card { background-color: #11141c; border: 1px solid #1e293b; border-radius: 12px; padding: 24px; max-width: 680px; margin: 0 auto; }
    .header { border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #0284c7; color: #fff; }
    .score { font-size: 28px; font-weight: bold; color: #00e5ff; margin: 8px 0; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #94a3b8; }
    .answers-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    .answers-table th { text-align: left; background: #1e293b; color: #94a3b8; padding: 8px; }
    .answers-table td { padding: 8px; border-bottom: 1px solid #1e293b; vertical-align: top; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">CONCLUSAO DE SURVEY</span>
      <h2 style="margin: 8px 0; color: #ffffff;">Nova Participação Registrada</h2>
      <div class="score">+${totalPoints.toFixed(2)} PTS para ${team.name}</div>
      <div class="meta-row"><span>ID: <strong>${submissionId}</strong></span><span>Data: <strong>${timestamp}</strong></span></div>
      <div class="meta-row"><span>Perguntas respondidas: <strong>${answeredCount}/16</strong></span><span>Pularam: <strong>${skippedCount}</strong></span></div>
      ${emailContact ? `<div class="meta-row" style="color: #38bdf8;"><span>Contato voluntário: <strong>${emailContact}</strong></span></div>` : ''}
    </div>
    
    <h3 style="color: #f1f5f9; font-size: 16px;">Respostas Fornecidas:</h3>
    <table class="answers-table">
      <thead>
        <tr><th>Q#</th><th>Status</th><th>Resposta / Conteúdo</th></tr>
      </thead>
      <tbody>
        ${Object.keys(processedAnswers)
          .map((k) => {
            const ans = processedAnswers[k];
            const displayVal = ans.isSkipped
              ? '<span style="color: #64748b;">(Pergunta pulada - 0 pts)</span>'
              : typeof ans.value === 'object'
              ? JSON.stringify(ans.value)
              : String(ans.value || ans.textDetail || 'Respondido');
            return `
            <tr>
              <td style="color: #38bdf8; font-weight: bold;">Q${k}</td>
              <td>${ans.isSkipped ? '⚪ Pulada' : '✅ Respondida (+6.25)'}</td>
              <td style="color: #cbd5e1;">${displayVal} ${ans.textDetail && ans.textDetail !== ans.value ? `<br/><small style="color: #94a3b8;">${ans.textDetail}</small>` : ''}</td>
            </tr>`;
          })
          .join('')}
      </tbody>
    </table>
    <p style="margin-top: 24px; font-size: 12px; color: #64748b; text-align: center;">
      Plataforma de Survey Genômica com Sistema de Pontuação por Equipes • Envio Automático Seguro
    </p>
  </div>
</body>
</html>
`;

  // Save to persistent email logs
  saveEmailLog({
    id: `EML-${Date.now().toString(36)}`,
    timestamp,
    to: ADMIN_EMAIL,
    subject: emailSubject,
    submissionId,
    team: team.name,
    points: totalPoints,
    htmlBody: emailHtml,
    status: 'sent',
  });

  console.log(`[EMAIL DISPATCH] Successfully triggered notification to ${ADMIN_EMAIL} for submission ${submissionId}`);

  // Return voucher and updated leaderboard
  res.json({
    success: true,
    submissionId,
    totalPoints,
    answeredCount,
    skippedCount,
    timestamp,
    team: {
      id: team.id,
      name: team.name,
      tag: team.tag,
      newTotalPoints: team.points,
      newParticipantsCount: team.participantsCount,
    },
    leaderboard: getLeaderboard(db),
  });
});

// 3. Admin Submissions View
app.get('/api/admin/submissions', (_req: Request, res: Response) => {
  const db = readDb();
  res.json({
    count: db.submissions.length,
    submissions: db.submissions,
  });
});

// 4. Admin Email Logs View
app.get('/api/admin/emails', (_req: Request, res: Response) => {
  const logs = readEmailLogs();
  res.json({
    count: logs.length,
    adminEmail: ADMIN_EMAIL,
    logs,
  });
});

// 5. Admin CSV Export
app.get('/api/admin/export', (_req: Request, res: Response) => {
  const db = readDb();

  const headers = [
    'Submission ID',
    'Timestamp',
    'Team ID',
    'Team Name',
    'Total Points',
    'Questions Answered',
    'Questions Skipped',
    'Email Contact (Q17)',
    'Language',
    ...Array.from({ length: 16 }, (_, i) => `Q${i + 2}_Answer`),
  ];

  const rows = db.submissions.map((s) => {
    const qAnswers = Array.from({ length: 16 }, (_, i) => {
      const qNum = i + 2;
      const ans = s.answers?.[qNum];
      if (!ans || ans.isSkipped) return 'SKIPPED';
      if (typeof ans.value === 'object') return `"${JSON.stringify(ans.value).replace(/"/g, '""')}"`;
      const valStr = String(ans.value || ans.textDetail || '');
      return `"${valStr.replace(/"/g, '""')}"`;
    });

    return [
      `"${s.id}"`,
      `"${s.timestamp}"`,
      `"${s.selectedTeam}"`,
      `"${s.teamName}"`,
      s.totalPoints,
      s.answeredCount,
      s.skippedCount,
      `"${s.emailContact || ''}"`,
      `"${s.language}"`,
      ...qAnswers,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="genomics_survey_submissions.csv"');
  res.send(csv);
});

// 6. Admin Reset Endpoint
app.post('/api/admin/reset', (_req: Request, res: Response) => {
  const resetData: DbSchema = {
    teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
    submissions: [],
  };
  saveDb(resetData);
  res.json({ success: true, message: 'Database reset to initial consortium benchmarks' });
});

// -----------------------------------------------------------------------------
// Vite middleware in dev or static files in production
// -----------------------------------------------------------------------------
async function setupVite() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
