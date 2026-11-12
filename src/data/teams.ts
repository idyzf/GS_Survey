import type { TeamId } from '../types/survey';

export interface TeamConfig {
  /** Label used in the survey top bar. */
  shortName: string;
  tag: string;
  /** Name and subtitle shown on the leaderboard. */
  name: string;
  subtitle: string;
}

export const TEAMS: Record<TeamId, TeamConfig> = {
  bioinformatics: {
    shortName: 'Bioinformatics',
    tag: '#BIOINFORMATICS',
    name: 'Bioinformatics Team',
    subtitle: 'Programming and connecting biological insights',
  },
  software_engineering: {
    shortName: 'Software Engineering',
    tag: '#SOFTWARE_ENG',
    name: 'Software engineer Team',
    subtitle: 'Computer science experts',
  },
  biological_sciences: {
    shortName: 'Biological Sciences',
    tag: '#BIO_SCIENCES',
    name: 'Biological Sciences Team',
    subtitle: 'Life Science experts',
  },
  other: {
    shortName: 'Other Squad',
    tag: '#SPECIAL_SQUAD',
    name: 'Special Squad',
    subtitle: 'Thinking outside of the box',
  },
  clinical_genetics: {
    shortName: 'Clinical Genetics',
    tag: '#CLINICAL_GENETICS',
    name: 'Clinical Genetics & Diagnostics Team',
    subtitle: 'Clinical Precision experts',
  },
  product_project: {
    shortName: 'Product & Project',
    tag: '#PRODUCT_MGMT',
    name: 'Bio-Platform Product Management Team',
    subtitle: 'Cross-functional Bio-Squad Delivery & Roadmaps',
  },
};

export const TEAM_IDS = Object.keys(TEAMS) as TeamId[];
