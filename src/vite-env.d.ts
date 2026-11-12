/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app URL (…/exec). Unset = localStorage-only mode. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
