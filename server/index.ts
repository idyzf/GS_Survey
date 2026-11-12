import 'dotenv/config';
import express from 'express';
import path from 'path';
import { DEFAULT_ADMIN_EMAIL } from '../src/config';
import { buildNotificationEmail } from '../src/lib/notification';
import { applySubmission, buildLeaderboard, createSubmission } from '../src/lib/scoring';
import { TEAMS } from '../src/data/teams';
import type { AdminData, SurveySubmissionPayload } from '../src/types/survey';
import { appendEmailLog, readDb, readEmailLogs, resetDb, saveDb } from './store';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/survey/leaderboard', (_req, res) => {
  res.json({ teams: buildLeaderboard(readDb().teams) });
});

app.post('/api/survey/submit', (req, res) => {
  const payload = req.body as SurveySubmissionPayload;
  if (!payload?.selectedTeam || !(payload.selectedTeam in TEAMS)) {
    res.status(400).json({ error: `Unknown team: ${payload?.selectedTeam}` });
    return;
  }

  const db = readDb();
  const submission = createSubmission(payload);
  db.submissions.unshift(submission);
  applySubmission(db.teams, submission);
  saveDb(db);
  appendEmailLog(buildNotificationEmail(submission, ADMIN_EMAIL));

  res.json({ submission });
});

app.get('/api/admin', (_req, res) => {
  const data: AdminData = {
    submissions: readDb().submissions,
    emailLogs: readEmailLogs(),
    adminEmail: ADMIN_EMAIL,
  };
  res.json(data);
});

app.post('/api/admin/reset', (_req, res) => {
  resetDb();
  res.json({ success: true });
});

async function start() {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
  });

  if (isProd) {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  } else {
    // Vite serves the React app with hot reload over this same HTTP server.
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
    app.use(vite.middlewares);
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
