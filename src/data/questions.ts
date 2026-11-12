import type { LocalizedString, Question } from '../types/survey';

/** Section titles, keyed by `Question.section`. */
export const SECTION_TITLES: Record<number, LocalizedString> = {
  1: { pt: 'Parte 1: Perfil Profissional', en: 'Part 1: Professional Profile' },
  2: { pt: 'Parte 2: Desafios e Colaboração', en: 'Part 2: Challenges and Collaboration' },
  3: { pt: 'Parte 3: Engenharia de Requisitos', en: 'Part 3: Requirements Engineering' },
  4: { pt: 'Parte 4: Modelagem do Domínio e DDD', en: 'Part 4: Domain Modeling and DDD' },
  5: { pt: 'Parte 5: Manutenção e Aplicação', en: 'Part 5: Maintenance and Application' },
  6: { pt: 'Parte 6: Fechamento & Síntese', en: 'Part 6: Conclusion & Synthesis' },
};

/** Survey content. Question 1 picks the team; questions 2–17 are scored. */
export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    section: 1,
    sectionStep: { pt: 'SEÇÃO 01 / STEP 1 • Seleção de Equipe', en: 'SECTION 01 / STEP 1 • Team Selection' },
    sectionDesc: {
      pt: 'Escolha a equipe que você representará nesta pesquisa. Cada pergunta respondida adicionará 6,25 pontos ao placar coletivo da sua equipe!',
      en: 'Select the team you represent in this research. Each answered question contributes 6.25 points to your collective squad leaderboard!',
    },
    category: { pt: 'SELEÇÃO DE EQUIPE (TEAM SELECTION)', en: 'TEAM SELECTION' },
    title: {
      pt: 'Qual é a sua área principal de atuação? (escolha seu time!)',
      en: 'What is your primary field of activity? (choose your team!)',
    },
    subtitle: {
      pt: 'Selecione a equipe que você representará. Seus pontos serão somados ao placar geral desta área.',
      en: 'Select the team you will represent. Your score will be added to this area in the live leaderboard.',
    },
    type: 'team_select',
    options: [
      {
        id: 'bioinformatics',
        code: 'TEAM_01',
        label: { pt: 'Bioinformática / ciência de dados', en: 'Bioinformatics / Data Science' },
        description: {
          pt: 'Pipelines NGS, alinhamento, chamadas de variantes e modelagem',
          en: 'NGS pipelines, alignment, variant calling, and modeling',
        },
      },
      {
        id: 'software_engineering',
        code: 'TEAM_02',
        label: { pt: 'Engenharia de software', en: 'Software Engineering' },
        description: {
          pt: 'Arquitetura de sistemas, nuvem, APIs, bancos e orquestradores',
          en: 'Systems architecture, cloud, APIs, databases, and orchestrators',
        },
      },
      {
        id: 'biological_sciences',
        code: 'TEAM_03',
        label: {
          pt: 'Ciências biológicas / pesquisa laboratorial',
          en: 'Biological Sciences / Wet Lab Research',
        },
        description: {
          pt: 'Bancada, ensaios experimentais, sequenciamento e interpretação',
          en: 'Benchwork, wet lab assays, sequencing, and biological interpretation',
        },
      },
      {
        id: 'clinical_genetics',
        code: 'TEAM_04',
        label: { pt: 'Genética clínica / medicina', en: 'Clinical Genetics / Medicine' },
        description: {
          pt: 'Diagnóstico genético, laudos médicos e aconselhamento',
          en: 'Genetic diagnosis, clinical reports, and medical counsel',
        },
      },
      {
        id: 'product_project',
        code: 'TEAM_05',
        label: { pt: 'Gestão de produto ou projetos', en: 'Product or Project Management' },
        description: {
          pt: 'Planejamento ágil, requisitos regulatórios e coordenação de entregas',
          en: 'Agile planning, regulatory requirements, and sprint delivery',
        },
      },
      {
        id: 'other',
        code: 'TEAM_06',
        label: { pt: 'Outra área', en: 'Other area' },
        description: {
          pt: 'Especifique sua especialidade de atuação no ecossistema',
          en: 'Specify your specialty within the bio-computing ecosystem',
        },
        hasTextInput: true,
      },
    ],
  },
  {
    id: 2,
    section: 1,
    sectionStep: {
      pt: 'SEÇÃO 01 / STEP 2 • Ecossistema Organizacional',
      en: 'SECTION 01 / STEP 2 • Organizational Ecosystem',
    },
    sectionDesc: {
      pt: 'Mapeamos o tipo de instituição para entender a escala de infraestrutura e governança adotada.',
      en: 'Mapping institution types to understand infrastructure and governance scale.',
    },
    category: { pt: 'ORGANIZAÇÃO', en: 'ORGANIZATION' },
    title: {
      pt: 'Em que tipo de organização você trabalha?',
      en: 'What type of organization do you work in?',
    },
    subtitle: {
      pt: 'Selecione uma opção que melhor descreva seu ambiente atual de trabalho.',
      en: 'Select the option that best describes your current work environment.',
    },
    type: 'single_choice',
    options: [
      {
        id: 'university',
        code: 'ORG_01',
        label: { pt: 'Universidade / instituto de pesquisa', en: 'University / Research Institute' },
      },
      {
        id: 'hospital',
        code: 'ORG_02',
        label: { pt: 'Hospital / laboratório clínico', en: 'Hospital / Clinical Laboratory' },
      },
      {
        id: 'tech_biotech',
        code: 'ORG_03',
        label: { pt: 'Empresa de tecnologia ou biotecnologia', en: 'Tech or Biotech Company' },
      },
      { id: 'startup', code: 'ORG_04', label: { pt: 'Startup', en: 'Startup' } },
      { id: 'other', code: 'ORG_05', label: { pt: 'Outra', en: 'Other' }, hasTextInput: true },
    ],
  },
  {
    id: 3,
    section: 1,
    sectionStep: { pt: 'SEÇÃO 01 / STEP 3 • Experiência', en: 'SECTION 01 / STEP 3 • Experience' },
    sectionDesc: {
      pt: 'Tempo de contato prático com softwares, pipelines ou dados de sequenciamento.',
      en: 'Years of hands-on experience with software, pipelines, or sequencing data.',
    },
    category: { pt: 'SENIORIDADE & TEMPO', en: 'SENIORITY & EXPERIENCE' },
    title: {
      pt: 'Há quanto tempo você trabalha com software ou análise genômica?',
      en: 'How long have you worked with software or genomic analysis?',
    },
    subtitle: {
      pt: 'Considere o período acumulado em projetos acadêmicos ou comerciais.',
      en: 'Consider the cumulative period across academic or commercial projects.',
    },
    type: 'single_choice',
    options: [
      {
        id: 'less_than_2',
        code: 'EXP_01',
        label: { pt: 'Menos de 2 anos', en: 'Less than 2 years' },
      },
      { id: '2_to_5', code: 'EXP_02', label: { pt: '2 a 5 anos', en: '2 to 5 years' } },
      { id: '6_to_10', code: 'EXP_03', label: { pt: '6 a 10 anos', en: '6 to 10 years' } },
      {
        id: 'more_than_10',
        code: 'EXP_04',
        label: { pt: 'Mais de 10 anos', en: 'More than 10 years' },
      },
    ],
  },
  {
    id: 4,
    section: 1,
    sectionStep: {
      pt: 'SEÇÃO 01 / STEP 4 • Finalidade de Aplicação',
      en: 'SECTION 01 / STEP 4 • Purpose of Use',
    },
    sectionDesc: {
      pt: 'Finalidade primária dos algoritmos e sistemas operados.',
      en: 'Primary domain purpose for operated algorithms and systems.',
    },
    category: { pt: 'FINALIDADE DO SOFTWARE', en: 'SOFTWARE PURPOSE' },
    title: {
      pt: 'Qual é o principal uso do software com o qual você trabalha?',
      en: 'What is the primary use of the software you work with?',
    },
    subtitle: {
      pt: 'Indique o destino operacional dominante das análises e código.',
      en: 'Select the primary operational focus of the analyses and codebase.',
    },
    type: 'single_choice',
    options: [
      {
        id: 'research',
        code: 'USE_01',
        label: { pt: 'Pesquisa acadêmica ou científica', en: 'Academic or scientific research' },
      },
      {
        id: 'clinical_diagnosis',
        code: 'USE_02',
        label: { pt: 'Diagnóstico clínico', en: 'Clinical diagnostics' },
      },
      {
        id: 'commercial_product',
        code: 'USE_03',
        label: { pt: 'Produto comercial', en: 'Commercial product' },
      },
      {
        id: 'mixed',
        code: 'USE_04',
        label: {
          pt: 'Misto (Pesquisa & Aplicação Clínica/Comercial)',
          en: 'Mixed (Research & Clinical/Commercial)',
        },
      },
    ],
  },
  {
    id: 5,
    section: 2,
    sectionStep: { pt: 'SEÇÃO 02 / STEP 5 • Matriz de Fricções', en: 'SECTION 02 / STEP 5 • Friction Matrix' },
    sectionDesc: {
      pt: 'Avalie as dimensões técnicas, humanas e regulatórias do ciclo de vida bioinformático.',
      en: 'Evaluate technical, human, and regulatory dimensions of the bio-pipeline lifecycle.',
    },
    category: {
      pt: 'GRAU DE DESAFIO (ESCALA 1 A 5)',
      en: 'CHALLENGE LEVEL (1 TO 5 SCALE)',
    },
    title: {
      pt: 'Em uma escala de 1 (nenhuma dificuldade) a 5 (muita dificuldade), quanto cada item é um desafio no seu dia a dia?',
      en: 'On a scale of 1 (no difficulty) to 5 (extreme difficulty), how much is each item a challenge in your daily work?',
    },
    subtitle: {
      pt: 'Pontue cada um dos 8 eixos de 1 a 5 de acordo com a sua vivência real.',
      en: 'Rate each of the 8 axes from 1 to 5 based on your actual experience.',
    },
    type: 'likert_grid',
    likertItems: [
      {
        id: 'item_communication',
        label: {
          pt: 'Comunicação entre cientistas e engenheiros',
          en: 'Communication between scientists and engineers',
        },
      },
      {
        id: 'item_requirements',
        label: {
          pt: 'Requisitos mal definidos ou que mudam com frequência',
          en: 'Poorly defined or frequently shifting requirements',
        },
      },
      {
        id: 'item_reproducibility',
        label: {
          pt: 'Reprodutibilidade e versionamento de pipelines',
          en: 'Pipeline reproducibility and versioning',
        },
      },
      {
        id: 'item_databases',
        label: {
          pt: 'Atualização de referências e bancos de anotação',
          en: 'Updating reference genomes and annotation databases',
        },
      },
      {
        id: 'item_compliance',
        label: {
          pt: 'Validação e conformidade regulatória (ex.: LGPD, normas de qualidade)',
          en: 'Regulatory validation and compliance (e.g., GDPR/LGPD, ISO quality)',
        },
      },
      {
        id: 'item_tech_debt',
        label: { pt: 'Manutenção e dívida técnica', en: 'Maintenance and technical debt' },
      },
      {
        id: 'item_cli',
        label: { pt: 'Uso de Linha de comando', en: 'Command-line interface (CLI) usage' },
      },
      {
        id: 'item_scalability',
        label: {
          pt: 'Escalabilidade e infraestrutura (HPC, nuvem)',
          en: 'Scalability and infrastructure (HPC, cloud clusters)',
        },
      },
    ],
  },
  {
    id: 6,
    section: 2,
    sectionStep: {
      pt: 'SEÇÃO 02 / STEP 6 • Alinhamento Semântico',
      en: 'SECTION 02 / STEP 6 • Semantic Alignment',
    },
    sectionDesc: {
      pt: 'Entendimento cruzado de terminologias biológicas vs. engenharia computacional.',
      en: 'Cross-functional comprehension of biological vs. software engineering terms.',
    },
    category: { pt: 'DISSONÂNCIA DE CONCEITOS', en: 'TERMINOLOGY GAP' },
    title: {
      pt: 'Com que frequência termos ou requisitos são entendidos de formas diferentes entre pessoas de áreas distintas no seu time?',
      en: 'How often are terms or requirements understood differently between members of distinct disciplines in your team?',
    },
    subtitle: {
      pt: 'Avalie a ocorrência de ambiguidades na comunicação interdepartamental.',
      en: 'Evaluate the frequency of ambiguities in cross-departmental dialogue.',
    },
    type: 'single_choice',
    options: [
      { id: 'never', code: 'FREQ_01', label: { pt: 'Nunca', en: 'Never' } },
      { id: 'rarely', code: 'FREQ_02', label: { pt: 'Raramente', en: 'Rarely' } },
      { id: 'sometimes', code: 'FREQ_03', label: { pt: 'Às vezes', en: 'Sometimes' } },
      { id: 'frequently', code: 'FREQ_04', label: { pt: 'Frequentemente', en: 'Frequently' } },
      { id: 'always', code: 'FREQ_05', label: { pt: 'Sempre', en: 'Always' } },
    ],
  },
  {
    id: 7,
    section: 2,
    sectionStep: { pt: 'SEÇÃO 02 / STEP 7 • Estudo de Caso Real', en: 'SECTION 02 / STEP 7 • Real-World Case' },
    sectionDesc: {
      pt: 'Compartilhamento de incidentes reais de desalinhamento de domínio.',
      en: 'Real incident sharing regarding domain misalignment.',
    },
    category: {
      pt: 'RELATO OPERACIONAL (OPCIONAL)',
      en: 'OPERATIONAL REPORT (OPTIONAL)',
    },
    title: {
      pt: 'Descreva brevemente uma situação em que isso aconteceu e como foi resolvida.',
      en: 'Briefly describe a situation where this occurred and how it was resolved.',
    },
    subtitle: {
      pt: 'Exemplo: divergência sobre conceito de cobertura, filtro de qualidade VCF ou nomenclatura de transcriptoma. (Opcional)',
      en: 'Example: disagreement over coverage threshold, VCF quality filters, or transcript nomenclature. (Optional)',
    },
    type: 'text_long',
    optional: true,
    placeholder: {
      pt: 'Ex: O biólogo pediu "todas as mutações patogênicas", mas para engenharia faltavam parâmetros exatos de threshold de profundidade e fonte de anotação (ClinVar vs gnomAD)...',
      en: 'e.g. The geneticist requested "all pathogenic variants", but engineering lacked exact depth thresholds and annotation source criteria...',
    },
  },
  {
    id: 8,
    section: 3,
    sectionStep: {
      pt: 'SEÇÃO 03 / STEP 8 • Requisitos Mensuráveis',
      en: 'SECTION 03 / STEP 8 • Measurable Quality',
    },
    sectionDesc: {
      pt: 'Definição quantitativa de SLOs e critérios de aceitação para análise genômica.',
      en: 'Quantitative SLO definition and acceptance criteria for genomic analysis.',
    },
    category: { pt: 'METROLOGIA DE QUALIDADE', en: 'QUALITY METRICS' },
    title: {
      pt: 'Os requisitos de qualidade (reprodutibilidade, acurácia, desempenho, rastreabilidade) são definidos de forma mensurável?',
      en: 'Are quality requirements (reproducibility, accuracy, performance, traceability) defined in a measurable way?',
    },
    subtitle: {
      pt: 'Ex.: métricas com thresholds definidos antes de rodar os pipelines de validação.',
      en: 'e.g., numeric thresholds defined prior to running pipeline validation benchmarks.',
    },
    type: 'single_choice',
    options: [
      { id: 'never', code: 'REQ_01', label: { pt: 'Nunca', en: 'Never' } },
      { id: 'rarely', code: 'REQ_02', label: { pt: 'Raramente', en: 'Rarely' } },
      { id: 'sometimes', code: 'REQ_03', label: { pt: 'Às vezes', en: 'Sometimes' } },
      { id: 'frequently', code: 'REQ_04', label: { pt: 'Frequentemente', en: 'Frequently' } },
      { id: 'always', code: 'REQ_05', label: { pt: 'Sempre', en: 'Always' } },
    ],
  },
  {
    id: 9,
    section: 3,
    sectionStep: {
      pt: 'SEÇÃO 03 / STEP 9 • Rastreio de Especificações',
      en: 'SECTION 03 / STEP 9 • Specification Tracking',
    },
    sectionDesc: {
      pt: 'Ferramental e canais utilizados para documentar o que deve ser desenvolvido.',
      en: 'Tools and workflows used to record and track engineering specifications.',
    },
    category: {
      pt: 'REGISTRO DE REQUISITOS (MÚLTIPLA SELEÇÃO)',
      en: 'REQUIREMENTS LOG (MULTI-SELECT)',
    },
    title: {
      pt: 'Como os requisitos costumam ser registrados no seu contexto?',
      en: 'How are requirements usually documented in your context?',
    },
    subtitle: {
      pt: 'Você pode marcar quantas opções se aplicarem ao fluxo da sua organização.',
      en: 'You can select all options that apply to your organization workflow.',
    },
    type: 'multi_choice',
    options: [
      {
        id: 'informal',
        code: 'REG_01',
        label: {
          pt: 'Conversas informais (Slack, WhatsApp, e-mail, reuniões orais)',
          en: 'Informal chats (Slack, WhatsApp, email, verbal syncs)',
        },
      },
      {
        id: 'backlog',
        code: 'REG_02',
        label: {
          pt: 'Tickets / backlog (Jira, GitHub Issues, Trello, Linear)',
          en: 'Tickets / backlog (Jira, GitHub Issues, Trello, Linear)',
        },
      },
      {
        id: 'formal_docs',
        code: 'REG_03',
        label: {
          pt: 'Documentos formais (Word, Notion, Confluence, PDFs)',
          en: 'Formal documents (Word, Notion, Confluence, PDFs)',
        },
      },
      {
        id: 'validation_protocols',
        code: 'REG_04',
        label: {
          pt: 'Protocolos de validação / Procedimentos Operacionais Padrão (POP/SOP)',
          en: 'Validation protocols / Standard Operating Procedures (SOPs)',
        },
      },
      {
        id: 'user_stories',
        code: 'REG_05',
        label: {
          pt: 'Histórias de usuário com critérios de aceitação (Gherkin/BDD)',
          en: 'User stories with formal acceptance criteria (Gherkin/BDD)',
        },
      },
      {
        id: 'no_structure',
        code: 'REG_06',
        label: { pt: 'Não há registro estruturado', en: 'No structured recording exists' },
      },
      { id: 'other', code: 'REG_07', label: { pt: 'Outro', en: 'Other' }, hasTextInput: true },
    ],
  },
  {
    id: 10,
    section: 3,
    sectionStep: {
      pt: 'SEÇÃO 03 / STEP 10 • Melhoria Contínua',
      en: 'SECTION 03 / STEP 10 • Continuous Improvement',
    },
    sectionDesc: {
      pt: 'Propostas práticas para elevar a precisão de requisitos no pipeline bioinformático.',
      en: 'Actionable suggestions to improve requirement fidelity in bio-pipelines.',
    },
    category: { pt: 'SUGESTÃO PRÁTICA', en: 'ACTIONABLE PRACTICE' },
    title: {
      pt: 'Qual prática você acha que mais melhoraria a definição de requisitos no seu time?',
      en: 'What practice do you think would most improve requirements definition in your team?',
    },
    subtitle: {
      pt: 'Resposta curta e objetiva sobre ferramentas, rituais ou modelagem.',
      en: 'Short, direct response highlighting tools, rituals, or modeling.',
    },
    type: 'text_short',
    placeholder: {
      pt: 'Ex: Sessões conjuntas de Event Storming entre bioinformatas e desenvolvedores; documentação viva de variantes...',
      en: 'e.g. Joint Event Storming sessions between bioinformaticians and engineers; living specification of variant filtering...',
    },
  },
  {
    id: 11,
    section: 4,
    sectionStep: {
      pt: 'SEÇÃO 04 / STEP 11 • Conceituação DDD',
      en: 'SECTION 04 / STEP 11 • Domain-Driven Design Concepts',
    },
    sectionDesc: {
      pt: 'Nível de intimidade conceitual com princípios de Domain-Driven Design (Evans, Vernon).',
      en: 'Level of conceptual familiarity with Domain-Driven Design principles.',
    },
    category: { pt: 'DOMAIN-DRIVEN DESIGN', en: 'DOMAIN-DRIVEN DESIGN' },
    title: {
      pt: 'Qual é o seu nível de familiaridade com Domain-Driven Design (DDD)?',
      en: 'What is your level of familiarity with Domain-Driven Design (DDD)?',
    },
    subtitle: {
      pt: 'Indique sua proximidade com os padrões estratégicos e táticos de DDD.',
      en: 'Select your level of exposure to strategic and tactical DDD patterns.',
    },
    type: 'single_choice',
    options: [
      {
        id: 'never_heard',
        code: 'DDD_01',
        label: { pt: 'Nunca ouvi falar', en: 'Never heard of it' },
      },
      {
        id: 'know_concept',
        code: 'DDD_02',
        label: { pt: 'Conheço o conceito', en: 'Familiar with the concept' },
      },
      { id: 'already_studied', code: 'DDD_03', label: { pt: 'Já estudei', en: 'Have studied it' } },
      {
        id: 'applied_practice',
        code: 'DDD_04',
        label: {
          pt: 'Já apliquei na prática em projetos reais',
          en: 'Have applied it in real-world production projects',
        },
      },
    ],
  },
  {
    id: 12,
    section: 4,
    sectionStep: {
      pt: 'SEÇÃO 04 / STEP 12 • Linguagem Ubíqua',
      en: 'SECTION 04 / STEP 12 • Ubiquitous Language',
    },
    sectionDesc: {
      pt: 'Presença de glossário e vocabulário unificado em código, laudos e bio-ensaios.',
      en: 'Existence of a unified glossary across code, clinical reports, and assays.',
    },
    category: { pt: 'LINGUAGEM UBÍQUA', en: 'UBIQUITOUS VOCABULARY' },
    title: {
      pt: 'Existe um vocabulário comum e documentado entre cientistas, clínicos e desenvolvedores no seu time?',
      en: 'Does a common and documented vocabulary exist between scientists, clinicians, and software developers in your team?',
    },
    subtitle: {
      pt: 'Avalie se a linguagem ubíqua está formalizada ou permanece tácita.',
      en: 'Assess whether the ubiquitous language is formalized or remains tacit.',
    },
    type: 'single_choice',
    options: [
      { id: 'no', code: 'VOCAB_01', label: { pt: 'Não', en: 'No' } },
      {
        id: 'informal',
        code: 'VOCAB_02',
        label: { pt: 'Informalmente (acordo verbal tácito)', en: 'Informally (verbal tacit agreement)' },
      },
      {
        id: 'partial',
        code: 'VOCAB_03',
        label: { pt: 'Parcialmente documentado', en: 'Partially documented' },
      },
      {
        id: 'yes_maintained',
        code: 'VOCAB_04',
        label: {
          pt: 'Sim, documentado e ativamente mantido no projeto',
          en: 'Yes, documented and actively maintained in the project',
        },
      },
    ],
  },
  {
    id: 13,
    section: 4,
    sectionStep: { pt: 'SEÇÃO 04 / STEP 13 • Bounded Contexts', en: 'SECTION 04 / STEP 13 • Bounded Contexts' },
    sectionDesc: {
      pt: 'Fronteiras explícitas e desacoplamento arquitetural entre subdomínios bioinformáticos.',
      en: 'Explicit boundaries and architectural decoupling across bioinformatics subdomains.',
    },
    category: { pt: 'BOUNDED CONTEXTS', en: 'BOUNDED CONTEXTS' },
    title: {
      pt: 'Em que medida você concorda com a afirmação:',
      en: 'To what extent do you agree with the statement:',
    },
    subtitle: {
      pt: '“Ter fronteiras claras entre partes do sistema (por exemplo, análise, anotação, interpretação e laudo) facilitaria o trabalho do meu time.”',
      en: '“Having clear boundaries between subsystems (e.g., primary analysis, annotation, interpretation, and clinical reporting) would facilitate my team\'s work.”',
    },
    type: 'single_choice',
    options: [
      {
        id: 'strongly_disagree',
        code: 'AGREE_01',
        label: { pt: 'Discordo totalmente', en: 'Strongly disagree' },
      },
      { id: 'disagree', code: 'AGREE_02', label: { pt: 'Discordo', en: 'Disagree' } },
      { id: 'neutral', code: 'AGREE_03', label: { pt: 'Neutro', en: 'Neutral' } },
      { id: 'agree', code: 'AGREE_04', label: { pt: 'Concordo', en: 'Agree' } },
      {
        id: 'strongly_agree',
        code: 'AGREE_05',
        label: { pt: 'Concordo totalmente', en: 'Strongly agree' },
      },
    ],
  },
  {
    id: 14,
    section: 5,
    sectionStep: {
      pt: 'SEÇÃO 05 / STEP 14 • Proveniência e Auditoria',
      en: 'SECTION 05 / STEP 14 • Provenance & Auditing',
    },
    sectionDesc: {
      pt: 'Garantia de linhagem e auditoria de versões de software, genoma de referência e bancos.',
      en: 'Lineage tracking and auditing for software containers, references, and databases.',
    },
    category: { pt: 'RASTREABILIDADE DE VERSÕES', en: 'VERSION TRACEABILITY' },
    title: {
      pt: 'Como o seu time registra as versões de pipeline, referência e bancos usados em cada resultado?',
      en: 'How does your team record the versions of pipelines, reference genomes, and annotation databases used for each run result?',
    },
    subtitle: {
      pt: 'Auditoria de dados para assegurar que um resultado de anos atrás possa ser reproduzido com fidelidade.',
      en: 'Data auditability ensuring past outputs can be faithfully reproduced.',
    },
    type: 'single_choice',
    options: [
      { id: 'no_record', code: 'TRACE_01', label: { pt: 'Não registra', en: 'Does not record' } },
      {
        id: 'manual',
        code: 'TRACE_02',
        label: {
          pt: 'Manualmente (planilhas, nomes de pastas, anotações de bancada)',
          en: 'Manually (spreadsheets, directory names, lab notes)',
        },
      },
      {
        id: 'partial_auto',
        code: 'TRACE_03',
        label: {
          pt: 'Parcialmente automatizado (logs de execução, commits Git nos scripts)',
          en: 'Partially automated (execution logs, Git commits in scripts)',
        },
      },
      {
        id: 'fully_auto',
        code: 'TRACE_04',
        label: {
          pt: 'Totalmente automatizado e rastreável (CWL/WDL/Nextflow com containers fixos e hash de arquivos)',
          en: 'Fully automated and traceable (CWL/WDL/Nextflow immutable containers & file hashes)',
        },
      },
    ],
  },
  {
    id: 15,
    section: 5,
    sectionStep: { pt: 'SEÇÃO 05 / STEP 15 • Ciclo de Feedback', en: 'SECTION 05 / STEP 15 • Feedback Loop' },
    sectionDesc: {
      pt: 'Velocidade e cadência com que usuários finais (biólogos, médicos, pesquisadores) alimentam o time de dev.',
      en: 'Cadence with which end-users feed insights back to developers.',
    },
    category: { pt: 'FEEDBACK DO USUÁRIO', en: 'USER FEEDBACK' },
    title: {
      pt: 'Com que frequência o feedback dos usuários finais chega ao time de desenvolvimento?',
      en: 'How frequently does end-user feedback reach the software development team?',
    },
    subtitle: {
      pt: 'Considere a cadência com que relatos de usabilidade e bugs chegam a quem codifica.',
      en: 'Reflect on how rapidly usability reports and edge-cases reach developers.',
    },
    type: 'single_choice',
    options: [
      { id: 'never', code: 'FEED_01', label: { pt: 'Nunca', en: 'Never' } },
      { id: 'rarely', code: 'FEED_02', label: { pt: 'Raramente', en: 'Rarely' } },
      { id: 'sometimes', code: 'FEED_03', label: { pt: 'Às vezes', en: 'Sometimes' } },
      { id: 'frequently', code: 'FEED_04', label: { pt: 'Frequentemente', en: 'Frequently' } },
      {
        id: 'continuous',
        code: 'FEED_05',
        label: {
          pt: 'De forma contínua (sprints regulares com feedback)',
          en: 'Continuously (regular sprints with user reviews)',
        },
      },
    ],
  },
  {
    id: 16,
    section: 6,
    sectionStep: {
      pt: 'SEÇÃO 06 / STEP 16 • Grande Obstáculo',
      en: 'SECTION 06 / STEP 16 • Primary Bottleneck',
    },
    sectionDesc: {
      pt: 'Reflexão aberta sobre a barreira central para excelência em bio-software.',
      en: 'Open synthesis on the core barrier to bio-software excellence.',
    },
    category: { pt: 'MAIOR OBSTÁCULO', en: 'PRIMARY OBSTACLE' },
    title: {
      pt: 'Qual é, na sua opinião, o maior obstáculo para desenvolver bom software genômico?',
      en: 'In your opinion, what is the biggest obstacle to developing high-quality genomic software?',
    },
    subtitle: {
      pt: 'Compartilhe livremente sua percepção sobre gargalos culturais, técnicos, acadêmicos ou de governança.',
      en: 'Freely share your perspective on cultural, technical, academic, or governance bottlenecks.',
    },
    type: 'text_long',
    placeholder: {
      pt: 'Escreva sua visão sincera sobre o maior obstáculo enfrentado...',
      en: 'Share your candid insight on the primary bottleneck encountered...',
    },
  },
  {
    id: 17,
    section: 6,
    sectionStep: {
      pt: 'SEÇÃO 06 / STEP 17 • Colaboração Científica',
      en: 'SECTION 06 / STEP 17 • Scientific Collaboration',
    },
    sectionDesc: {
      pt: 'Convite voluntário e estritamente opcional para aprofundamento acadêmico.',
      en: 'Voluntary, strictly optional invite for exploratory follow-up.',
    },
    category: { pt: 'ENTREVISTA VOLUNTÁRIA', en: 'VOLUNTARY INTERVIEW' },
    title: {
      pt: 'Estaria disponível para uma conversa mais aprofundada para ajudar com a pesquisa?',
      en: 'Would you be available for an in-depth conversation to assist with this research?',
    },
    subtitle: {
      pt: 'Sua participação continuará sob sigilo. Se concordar, informe seu e-mail de contato; se preferir total anonimato, selecione "Não".',
      en: 'Your contribution remains confidential. If willing, provide contact email; otherwise select "No" for 100% anonymity.',
    },
    type: 'contact_optin',
    options: [
      {
        id: 'no',
        code: 'OPT_NO',
        label: {
          pt: 'Não (Manter 100% anônimo sem contato)',
          en: 'No (Keep 100% anonymous with no follow-up)',
        },
      },
      {
        id: 'yes',
        code: 'OPT_YES',
        label: { pt: 'Sim, estou disponível para contribuir', en: 'Yes, I am available to contribute' },
        hasTextInput: true,
      },
    ],
  },
];
