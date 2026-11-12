# Genomics Software Survey

Survey anônima sobre desenvolvimento de software genômico, com pontuação por equipes,
hélice de DNA em 3D e placar ao vivo. React 19 + Vite + Tailwind 4 + Three.js, hospedado
no GitHub Pages, com backend em Google Apps Script + Google Sheets.

## Como funciona

```
GitHub Pages (site estático)  ──POST resposta──▶  Google Apps Script (web app)
                              ◀──GET placar────        │  1. valida e recalcula a pontuação
                                                       │  2. grava uma linha na aba "Respostas"
                                                       │  3. envia o e-mail para você (Gmail)
                                                       ▼  4. registra o envio na aba "E-mails"
                                                 Google Sheet
```

- A pontuação é **recalculada no servidor** (16 perguntas × 6,25 = 100 pts); o navegador não decide quantos pontos ganha.
- O placar soma as linhas da planilha: começa em zero e reflete só a participação real.
- Se o e-mail falhar (ex.: cota diária), a resposta continua salva na planilha e o log marca `failed`.
- O painel admin do site exige a chave `ADMIN_KEY`; sem ela, só o placar (agregado) é público.

## Rodando localmente

```bash
npm install
npm run dev            # http://localhost:5173
npm run lint           # checagem de tipos
npm run build          # gera dist/ (site)
npm run build:backend  # gera backend/dist/Code.js (Apps Script)
```

Sem `VITE_API_URL`, o site roda em **modo local**: respostas e placar ficam no
`localStorage` do navegador. Para apontar para o backend real, crie `.env.local` com
`VITE_API_URL=<url do web app>` (cuidado: as respostas de teste vão para a planilha real).

## Configurando o backend (uma vez)

1. Crie uma Google Sheet vazia (ex.: "Survey Genômica – Respostas").
2. Nela, abra **Extensões → Apps Script**.
3. Rode `npm run build:backend` e cole todo o conteúdo de `backend/dist/Code.js` no
   arquivo `Code.gs` do editor (substituindo o que houver). Salve.
4. Opcional: em **Configurações do projeto → Propriedades do script**, adicione
   `ADMIN_EMAIL` se o e-mail de notificação for diferente da conta dona do script.
5. No editor, selecione a função `setup` e clique em **Executar**. Autorize o acesso à
   planilha e ao envio de e-mail. Isso cria as abas `Respostas` e `E-mails`, gera a
   `ADMIN_KEY` e manda um e-mail de teste com a chave.
6. **Implantar → Nova implantação → Tipo: App da Web**, com
   *Executar como: **Eu*** e *Quem pode acessar: **Qualquer pessoa***. Copie a URL que termina em `/exec`.
7. No GitHub: **Settings → Secrets and variables → Actions → Variables → New variable**,
   nome `VITE_API_URL`, valor = a URL do passo 6.
8. Em **Settings → Pages**, a fonte deve ser **GitHub Actions**. Faça push na `main`
   (ou rode o workflow manualmente) para publicar.

**Atualizando o backend:** repita o passo 3 e use **Implantar → Gerenciar implantações →
Editar → Nova versão** (assim a URL não muda).

### Limites a conhecer

- Gmail pessoal envia até ~100 e-mails/dia via Apps Script; acima disso o log marca `failed`
  e a resposta continua na planilha.
- A URL do web app é pública (precisa ser, para o site enviar respostas). Há validação,
  limite de tamanho e proteção contra reenvio duplicado, mas não há como impedir totalmente
  envios forjados de quem inspecionar o site — a planilha permite auditar e remover linhas.
  Removendo uma linha, o placar se ajusta em até 30 s.

## Estrutura

```
src/
  pages/           uma tela por arquivo (Home, Intro, Survey, Results)
  components/      DnaCanvas, admin/, results/, survey/
  data/            conteúdo: perguntas (questions.ts) e equipes (teams.ts)
  lib/             pontuação, cliente da API, localStorage, CSV, e-mail de notificação
  types/           tipos compartilhados
backend/main.ts    web app do Apps Script (usa o mesmo src/lib que o site)
scripts/           build do backend
docs/design/       mockups de referência do layout
```
