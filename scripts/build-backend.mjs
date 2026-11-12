// Bundles backend/main.ts (plus the shared src/lib code) into one file for Google Apps Script.
// Output: backend/dist/Code.js — paste it into the Apps Script editor (or push it with clasp).
import { build } from 'esbuild';

// setup comes first so it is the default selection in the Apps Script editor's Run menu.
const GLOBALS = ['setup', 'doGet', 'doPost'];

await build({
  entryPoints: ['backend/main.ts'],
  outfile: 'backend/dist/Code.js',
  bundle: true,
  format: 'iife',
  globalName: 'Backend',
  target: 'es2019',
  charset: 'utf8',
  legalComments: 'none',
  // Apps Script only sees top-level function declarations, so expose the entry points.
  footer: { js: GLOBALS.map((fn) => `function ${fn}(e) { return Backend.${fn}(e); }`).join('\n') },
});

console.log('Built backend/dist/Code.js');
