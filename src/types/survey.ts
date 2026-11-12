export type Language = 'pt' | 'en';

export interface LocalizedString {
  pt: string;
  en: string;
}

export type TeamId =
  | 'bioinformatics'
  | 'software_engineering'
  | 'biological_sciences'
  | 'clinical_genetics'
  | 'product_project'
  | 'other';

export type QuestionType =
  | 'team_select'
  | 'single_choice'
  | 'multi_choice'
  | 'likert_grid'
  | 'text_short'
  | 'text_long'
  | 'contact_optin';

export interface QuestionOption {
  id: string;
  code: string;
  label: LocalizedString;
  description?: LocalizedString;
  hasTextInput?: boolean;
}

export interface LikertItem {
  id: string;
  label: LocalizedString;
}

export interface Question {
  id: number;
  section: number;
  sectionStep: LocalizedString;
  sectionDesc: LocalizedString;
  category: LocalizedString;
  title: LocalizedString;
  subtitle?: LocalizedString;
  type: QuestionType;
  optional?: boolean;
  placeholder?: LocalizedString;
  options?: QuestionOption[];
  likertItems?: LikertItem[];
}

/** Option id, list of option ids, or likert ratings keyed by item id. */
export type AnswerData = string | string[] | Record<string, number>;

export interface Answer {
  value: AnswerData | null;
  textDetail?: string;
  isSkipped: boolean;
}

export type Answers = Record<number, Answer>;

export interface SurveySubmissionPayload {
  selectedTeam: TeamId;
  otherTeamText?: string;
  answers: Answers;
  language: Language;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  selectedTeam: TeamId;
  teamName: string;
  otherTeamText?: string;
  answers: Answers;
  totalPoints: number;
  answeredCount: number;
  skippedCount: number;
  language: Language;
  emailContact?: string;
}

export interface TeamScore {
  points: number;
  participantsCount: number;
}

export type TeamScores = Record<TeamId, TeamScore>;

export interface LeaderboardEntry extends TeamScore {
  id: TeamId;
  name: string;
  subtitle: string;
  rank: number;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  submissionId: string;
  team: string;
  points: number;
  htmlBody: string;
}

export interface AdminData {
  submissions: SubmissionRecord[];
  emailLogs: EmailLogEntry[];
  adminEmail: string;
}
