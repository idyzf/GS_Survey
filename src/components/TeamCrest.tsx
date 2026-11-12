import { useId, type ReactNode } from 'react';
import type { TeamId } from '../types/survey';

interface CrestStyle {
  /** Main accent, also used by the welcome pop-up confetti. */
  accent: string;
  /** Second gradient stop for the shield outline. */
  accent2: string;
  glyph: ReactNode;
}

// Glyphs are drawn in a 120×140 box, centred around (60, 70).
export const CREST_STYLES: Record<TeamId, CrestStyle> = {
  // Double helix with base-pair rungs.
  bioinformatics: {
    accent: '#00e5ff',
    accent2: '#3b82f6',
    glyph: (
      <>
        <path d="M46 46 C46 62 74 62 74 70 C74 78 46 78 46 94" />
        <path d="M74 46 C74 62 46 62 46 70 C46 78 74 78 74 94" />
        <path d="M50 51 H70 M52 89 H68" opacity="0.6" />
      </>
    ),
  },
  // Code brackets.
  software_engineering: {
    accent: '#38bdf8',
    accent2: '#6366f1',
    glyph: (
      <>
        <path d="M47 56 L35 70 L47 84" />
        <path d="M73 56 L85 70 L73 84" />
        <path d="M65 50 L55 90" opacity="0.6" />
      </>
    ),
  },
  // Lab flask.
  biological_sciences: {
    accent: '#e879f9',
    accent2: '#a855f7',
    glyph: (
      <>
        <path d="M51 46 H69 M55 46 V62 L42 88 Q40 94 47 94 H73 Q80 94 78 88 L65 62 V46" />
        <path d="M46 81 H74" opacity="0.6" />
        <circle cx="57" cy="88" r="1.6" />
        <circle cx="64" cy="85" r="1.2" />
      </>
    ),
  },
  // Medical cross with a pulse line.
  clinical_genetics: {
    accent: '#34d399',
    accent2: '#06b6d4',
    glyph: (
      <>
        <path d="M54 46 H66 V62 H82 V78 H66 V94 H54 V78 H38 V62 H54 Z" />
        <path d="M43 70 H51 L55 64 L61 77 L65 70 H77" opacity="0.6" />
      </>
    ),
  },
  // Target with an arrow: goals and delivery.
  product_project: {
    accent: '#fbbf24',
    accent2: '#f97316',
    glyph: (
      <>
        <circle cx="58" cy="72" r="18" />
        <circle cx="58" cy="72" r="7" opacity="0.6" />
        <path d="M58 72 L80 50 M72 50 H80 V58" />
      </>
    ),
  },
  // Four-point spark: the multidisciplinary squad.
  other: {
    accent: '#a78bfa',
    accent2: '#ec4899',
    glyph: (
      <>
        <path d="M58 46 C60 62 64 66 80 70 C64 74 60 78 58 94 C56 78 52 74 36 70 C52 66 56 62 58 46 Z" />
        <path d="M78 48 V58 M73 53 H83" opacity="0.6" />
      </>
    ),
  },
};

const SHIELD = 'M60 6 L108 22 V66 C108 98 88 120 60 134 C32 120 12 98 12 66 V22 Z';
const INNER_SHIELD = 'M60 15 L99 28 V66 C99 93 82 112 60 124 C38 112 21 93 21 66 V28 Z';

/** Minimal shield-shaped crest for a team, in the site's neon palette. */
export function TeamCrest({ team, className = '' }: { team: TeamId; className?: string }) {
  const { accent, accent2, glyph } = CREST_STYLES[team];
  // Unique, CSS-safe id for the gradients (several crests can be on screen at once).
  const id = `crest-${team}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox="0 0 120 140" className={className} role="img" aria-label={`${team} crest`}>
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accent2} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={SHIELD} fill="#0f121a" />
      <path d={SHIELD} fill={`url(#${id}-glow)`} />
      <path d={SHIELD} fill="none" stroke={`url(#${id}-stroke)`} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={INNER_SHIELD} fill="none" stroke={accent} strokeOpacity="0.25" strokeWidth="1" strokeLinejoin="round" />
      <path d="M50 22 L60 18 L70 22" fill="none" stroke={accent} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />

      <g
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${accent}99)` }}
      >
        {glyph}
      </g>
    </svg>
  );
}
