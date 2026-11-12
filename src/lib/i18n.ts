import type { Language } from '../types/survey';

/** Returns `t(pt, en)`, which picks the string for the active language. */
export const translator = (language: Language) => (pt: string, en: string) =>
  language === 'pt' ? pt : en;
