# Genomics Software Survey

Survey anônima sobre desenvolvimento de software genômico, com pontuação por equipes,
hélice de DNA em 3D e placar ao vivo. React 19 + Vite + Tailwind 4 + Three.js.

## Rodando

```bash
npm install
npm run dev        # Express + Vite em http://localhost:3000 (com a API)
npm run build      # gera dist/ (site estático)
npm run lint       # checagem de tipos
```

Copie `.env.example` para `.env` para mudar `PORT` ou `ADMIN_EMAIL`.

## Estrutura

```
src/
  pages/           uma tela por arquivo (Home, Intro, Survey, Results)
  components/      DnaCanvas, admin/, results/, survey/
  data/            conteúdo: perguntas (questions.ts) e equipes (teams.ts)
  lib/             regras de pontuação, cliente da API, localStorage, CSV, e-mail
  types/           tipos compartilhados
server/            API Express + persistência em data/*.json
docs/design/       mockups de referência do layout
```

`src/lib/scoring.ts` é usado pelo navegador e pelo servidor, então a regra de
pontos (16 perguntas × 6,25 = 100 pts) fica num só lugar.

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` faz o build e publica `dist/` a cada push
na `main`. Em **Settings → Pages**, a fonte deve ser **GitHub Actions**.

No GitHub Pages não existe a API: respostas e placar ficam no `localStorage` de cada
navegador. Para um placar compartilhado entre participantes, rode o servidor
(`npm start` após `npm run build`).
