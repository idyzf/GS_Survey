import type { TeamId } from '../types/survey';

export interface TeamConfig {
  /** Label used in the survey top bar. */
  shortName: string;
  tag: string;
  /** Name and subtitle shown on the leaderboard. */
  name: string;
  subtitle: string;
  /** Benchmark score the leaderboard starts from (and returns to on reset). */
  seedPoints: number;
  seedParticipants: number;
}

export const TEAMS: Record<TeamId, TeamConfig> = {
  bioinformatics: {
    shortName: 'Bioinformatics',
    tag: '#BIOINFORMATICS',
    name: 'Bioinformatics Team',
    subtitle: 'Programming and connecting biological insights',
    seedPoints: 940,
    seedParticipants: 15,
  },
  software_engineering: {
    shortName: 'Software Engineering',
    tag: '#SOFTWARE_ENG',
    name: 'Software engineer Team',
    subtitle: 'Computer science experts',
    seedPoints: 865,
    seedParticipants: 14,
  },
  biological_sciences: {
    shortName: 'Biological Sciences',
    tag: '#BIO_SCIENCES',
    name: 'Biological Sciences Team',
    subtitle: 'Life Science experts',
    seedPoints: 820,
    seedParticipants: 13,
  },
  other: {
    shortName: 'Other Squad',
    tag: '#SPECIAL_SQUAD',
    name: 'Special Squad',
    subtitle: 'Thinking outside of the box',
    seedPoints: 745,
    seedParticipants: 12,
  },
  clinical_genetics: {
    shortName: 'Clinical Genetics',
    tag: '#CLINICAL_GENETICS',
    name: 'Clinical Genetics & Diagnostics Team',
    subtitle: 'Clinical Precision experts',
    seedPoints: 680,
    seedParticipants: 11,
  },
  product_project: {
    shortName: 'Product & Project',
    tag: '#PRODUCT_MGMT',
    name: 'Bio-Platform Product Management Team',
    subtitle: 'Cross-functional Bio-Squad Delivery & Roadmaps',
    seedPoints: 590,
    seedParticipants: 9,
  },
};

export const TEAM_IDS = Object.keys(TEAMS) as TeamId[];
