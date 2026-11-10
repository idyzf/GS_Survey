import { TeamId, TeamLeaderboardEntry, SurveySubmissionPayload, EmailLogEntry } from '../types/survey';

export const INITIAL_BENCHMARK_TEAMS: Record<string, {
  id: TeamId;
  name: string;
  tag: string;
  subtitle: string;
  points: number;
  participantsCount: number;
  color: string;
  accentHex: string;
}> = {
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

const TEAMS_KEY = 'genomics_survey_teams';
const SUBS_KEY = 'genomics_survey_submissions';
const LOGS_KEY = 'genomics_survey_email_logs';

export function getLocalTeams(): Record<string, typeof INITIAL_BENCHMARK_TEAMS['bioinformatics']> {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return JSON.parse(JSON.stringify(INITIAL_BENCHMARK_TEAMS));
}

export function saveLocalTeams(teams: Record<string, any>) {
  try {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  } catch (e) {
    // ignore
  }
}

export function getLocalLeaderboard(): TeamLeaderboardEntry[] {
  const teams = getLocalTeams();
  const sorted = Object.values(teams).sort((a, b) => b.points - a.points);
  const highestPoints = sorted[0]?.points || 1;

  return sorted.map((t, idx) => ({
    id: t.id,
    name: t.name,
    tag: t.tag,
    subtitle: t.subtitle,
    points: t.points,
    participantsCount: t.participantsCount,
    rank: idx + 1,
    isTopScore: idx === 0,
    color: t.color,
    accentHex: t.accentHex,
    maxBenchmarkPoints: Math.max(highestPoints, 1100),
  }));
}

export function recordLocalSubmission(payload: SurveySubmissionPayload): {
  submissionId: string;
  totalPoints: number;
  answeredCount: number;
  timestamp: string;
  team: typeof INITIAL_BENCHMARK_TEAMS['bioinformatics'];
} {
  let answeredCount = 0;
  for (let qId = 2; qId <= 17; qId++) {
    const ans = payload.answers?.[qId];
    if (ans && !ans.isSkipped) {
      const val = ans.value;
      if (
        (typeof val === 'string' && val.trim().length > 0) ||
        (Array.isArray(val) && val.length > 0) ||
        (typeof val === 'object' && val !== null && Object.keys(val).length > 0) ||
        (ans.textDetail && ans.textDetail.trim().length > 0)
      ) {
        answeredCount++;
      }
    }
  }

  const totalPoints = answeredCount * 6.25;
  const submissionId =
    'GEN-' +
    Math.random().toString(36).substring(2, 10).toUpperCase() +
    '-' +
    Math.random().toString(16).substring(2, 8).toUpperCase();
  const timestamp = new Date().toISOString();

  const teams = getLocalTeams();
  const team = teams[payload.selectedTeam] || teams.bioinformatics;
  team.points = Math.round((team.points + totalPoints) * 100) / 100;
  team.participantsCount += 1;
  saveLocalTeams(teams);

  const emailContact = payload.answers?.[17]?.textDetail || '';

  // Save submission
  try {
    const rawSubs = localStorage.getItem(SUBS_KEY);
    const subs = rawSubs ? JSON.parse(rawSubs) : [];
    subs.unshift({
      id: submissionId,
      timestamp,
      selectedTeam: payload.selectedTeam,
      teamName: team.name,
      otherTeamText: payload.otherTeamText,
      totalPoints,
      answeredCount,
      skippedCount: 16 - answeredCount,
      language: payload.language || 'pt',
      emailContact,
      answers: payload.answers,
    });
    localStorage.setItem(SUBS_KEY, JSON.stringify(subs.slice(0, 50)));

    // Save simulated email log if contact provided
    if (emailContact) {
      const rawLogs = localStorage.getItem(LOGS_KEY);
      const logs: EmailLogEntry[] = rawLogs ? JSON.parse(rawLogs) : [];
      logs.unshift({
        id: 'EML-' + Math.random().toString(36).substring(2, 10),
        timestamp,
        to: 'ideli.zanesco@gmail.com',
        subject: `[Survey Genômica] Nova Resposta Concluída: +${totalPoints.toFixed(2)} pts para ${team.name}`,
        submissionId,
        team: team.name,
        points: totalPoints,
        htmlBody: `<p>Nova resposta registrada: +${totalPoints.toFixed(2)} pts para ${team.name}. Contato: ${emailContact}</p>`,
        status: 'simulated',
      });
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    }
  } catch (e) {
    // ignore
  }

  return {
    submissionId,
    totalPoints,
    answeredCount,
    timestamp,
    team,
  };
}

export function getLocalAdminData(): {
  submissions: any[];
  emailLogs: EmailLogEntry[];
} {
  let submissions: any[] = [];
  let emailLogs: EmailLogEntry[] = [];
  try {
    const rawSubs = localStorage.getItem(SUBS_KEY);
    if (rawSubs) submissions = JSON.parse(rawSubs);
    const rawLogs = localStorage.getItem(LOGS_KEY);
    if (rawLogs) emailLogs = JSON.parse(rawLogs);
  } catch (e) {
    // ignore
  }
  return { submissions, emailLogs };
}

export function resetLocalData() {
  try {
    localStorage.removeItem(TEAMS_KEY);
    localStorage.removeItem(SUBS_KEY);
    localStorage.removeItem(LOGS_KEY);
  } catch (e) {
    // ignore
  }
}
