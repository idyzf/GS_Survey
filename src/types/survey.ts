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

export interface TeamInfo {
  id: TeamId;
  name: LocalizedString;
  shortName: string;
  tag: string;
  subtitle: LocalizedString;
  color: string;
  accentHex: string;
  glowClass: string;
}

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
  questionNumber: number; // 1 to 17
  section: number; // 1 to 6
  sectionTitle: LocalizedString;
  sectionStep: LocalizedString;
  sectionDesc: LocalizedString;
  category: LocalizedString;
  title: LocalizedString;
  subtitle?: LocalizedString;
  type: QuestionType;
  isTeamSelection?: boolean;
  isScored: boolean; // true for questions 2 to 17 (each worth 6.25 pts)
  pointsWorth: number; // 6.25
  options?: QuestionOption[];
  likertItems?: LikertItem[];
  likertScale?: {
    minLabel: LocalizedString;
    maxLabel: LocalizedString;
    min: number;
    max: number;
  };
  placeholder?: LocalizedString;
  optional?: boolean;
}

export interface AnswerValue {
  questionId: number;
  type: QuestionType;
  value?: string | string[] | Record<string, number> | null;
  textDetail?: string;
  isSkipped: boolean;
  pointsEarned: number; // 6.25 or 0
}

export interface SurveySubmissionPayload {
  selectedTeam: TeamId;
  otherTeamText?: string;
  answers: Record<number, AnswerValue>;
  language: Language;
}

export interface SubmissionRecord {
  id: string;
  timestamp: string;
  selectedTeam: TeamId;
  teamName: string;
  otherTeamText?: string;
  answers: Record<number, AnswerValue>;
  totalPoints: number; // up to 100 pts
  answeredCount: number; // up to 16
  skippedCount: number;
  language: Language;
  emailContact?: string;
  emailSentStatus: 'sent' | 'logged' | 'pending';
}

export interface TeamLeaderboardEntry {
  id: TeamId;
  name: string;
  tag: string;
  subtitle: string;
  points: number;
  participantsCount: number;
  rank: number;
  isTopScore?: boolean;
  color: string;
  accentHex: string;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  subject: string;
  submissionId: string;
  team: string;
  points: number;
  preview?: string;
  htmlBody: string;
  status: 'sent' | 'simulated';
}
