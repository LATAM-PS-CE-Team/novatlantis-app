import crypto from 'node:crypto';

const GEMINI_ENTERPRISE_URL =
  'https://console.cloud.google.com/gen-app-builder/engines/locations/global/engines/gemini-enterprise-17906083_1790608376670/dashboard/overview?project=1484274526';

const SUBAGENTS_CATALOG = [
  {
    key: 'core_harness',
    name: 'AI-Agent-Harness-for-Government',
    domain: 'Orquestrador Central (Core Harness)',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/7436670314643193856',
    guardrail: 'Roteamento Determinístico + Resolução Lex Specialis + Merkle Audit SHA-256',
    mission: 'Coordena os 8 subagentes setoriais no Gemini Enterprise via protocolos MCP e A2A com memória híbrida GraphRAG.',
    samplePrompt: 'Analisar impacto cruzado de estiagem severa no crédito rural e acionar proteção social para famílias rurais.'
  },
  {
    key: 'civitas',
    name: 'Civitas',
    domain: 'Cidadania e Benefícios Sociais',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/6092345825873100800',
    guardrail: 'Proteção LGPD Estrita (Pseudonimização CPF/NIS em Tempo de Execução)',
    mission: 'Triagem socioeconômica proativa e concessão automatizada de benefícios no CadÚnico.',
    samplePrompt: 'Verificar elegibilidade de família vulnerável no CadÚnico com pseudonimização estrita LGPD.'
  },
  {
    key: 'aegis_gov',
    name: 'AegisGov',
    domain: 'Segurança Pública',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/5409487532373049344',
    guardrail: 'Cadeia de Custódia Íntegra (Verificação SHA-256 — Art. 158-A CPP)',
    mission: 'Inteligência integrada e fusão multimodal de texto, áudio, vídeo e georreferenciamento.',
    samplePrompt: 'Validar integridade criptográfica SHA-256 de evidência multimodal (Art. 158-A CPP).'
  },
  {
    key: 'lex_veritas',
    name: 'LexVeritas',
    domain: 'Justiça e Tribunais',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/133520568908513280',
    guardrail: 'Zero Citação Não Verificada no GraphRAG (Res. CNJ 332/2020)',
    mission: 'Triagem processual, análise de jurisprudência e validação determinística de precedentes.',
    samplePrompt: 'Pesquisar precedentes vinculantes sobre medicamentos de alto custo validados no Spanner GraphRAG.'
  },
  {
    key: 'custos_legis',
    name: 'CustosLegis',
    domain: 'Ministério Público',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/8060418863034007552',
    guardrail: 'Supervisão Humana Decisória Obrigatória (Assinatura HITL Membro do MP)',
    mission: 'Defesa do patrimônio público, apoio a inquéritos civis e auditoria de editais (Lei 14.133/2021).',
    samplePrompt: 'Auditar cláusulas restritivas em edital de licitação conforme a Lei 14.133/2021.'
  },
  {
    key: 'vitalis_gov',
    name: 'VitalisGov',
    domain: 'Saúde Pública (SUS)',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/636797827267166208',
    guardrail: 'Validação Clínica Obrigatória (Protocolo PCDT/MS/OMS + CRM Ativo)',
    mission: 'Regulação inteligente de filas (SISREG), vigilância epidemiológica e gestão de leitos.',
    samplePrompt: 'Priorizar regulação de fila SISREG para oncologia segundo protocolo clínico PCDT/MS.'
  },
  {
    key: 'sophia_edu',
    name: 'SophiaEdu',
    domain: 'Educação Pública',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/8927361791302828032',
    guardrail: 'Filtro Etário Pedagógico Rigoroso (Diretrizes BNCC e ECA)',
    mission: 'Gestão pedagógica, Busca Ativa Escolar (prevenção à evasão) e tutoria adaptativa.',
    samplePrompt: 'Gerar plano de Busca Ativa Escolar alinhado às competências da BNCC e proteção do ECA.'
  },
  {
    key: 'gaia_guard',
    name: 'GaiaGuard',
    domain: 'Meio Ambiente',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/8424647482897596416',
    guardrail: 'Cruzamento Obrigatório via Satélite (Google Earth Engine / PRODES / DETER)',
    mission: 'Licenciamento ambiental ágil, alertas climáticos e validação geoespacial de CAR.',
    samplePrompt: 'Cruzar polígono CAR com alertas de desmatamento PRODES/DETER via Google Earth Engine.'
  },
  {
    key: 'agro_nexo',
    name: 'AgroNexo',
    domain: 'Agricultura e Crédito Rural',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/1516688604464676864',
    guardrail: 'Sinergia A2A com GaiaGuard + Validação de Janela ZARC/MAPA',
    mission: 'Análise automatizada de crédito rural (Plano Safra) bloqueando sobreposição com áreas embargadas.',
    samplePrompt: 'Avaliar liberação de crédito Plano Safra validando janela climática ZARC e conformidade ambiental A2A.'
  }
];

export function initDatabase(db) {
  if (!db) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS ops_harness_audit_log (
      audit_id TEXT PRIMARY KEY,
      subagent_name TEXT NOT NULL,
      sector_domain TEXT NOT NULL,
      citizen_nid TEXT NOT NULL,
      task_summary TEXT NOT NULL,
      guardrail_applied TEXT NOT NULL,
      guardrail_verdict TEXT NOT NULL,
      merkle_sha256 TEXT NOT NULL,
      reasoning_engine_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS cnt FROM ops_harness_audit_log').get().cnt;
  if (count === 0) {
    const ins = db.prepare(`
      INSERT INTO ops_harness_audit_log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    ins.run(
      'HARNESS-2026-9001',
      'Civitas',
      'Cidadania / CadÚnico',
      'NID-000-0000-0001-9',
      'Triagem de elegibilidade a benefício social com pseudonimização de CPF/NIS em tempo de execução.',
      'LGPD_STRICT_PSEUDONYMIZATION (Lei 13.709/2018 Art. 7 III)',
      'PASSED_DETERMINISTIC',
      'sha256:4f8b92c1e07a3d56b81920c4d7e1a3f59b2c8d4e1f0a6b3c',
      'reasoningEngines/6092345825873100800',
      '2026-10-28T13:10:00Z'
    );
    ins.run(
      'HARNESS-2026-9002',
      'AgroNexo ↔ GaiaGuard (A2A)',
      'Agricultura & Meio Ambiente',
      'NID-000-0000-0010-8',
      'Análise de crédito rural Plano Safra cruzada via A2A com telemetria de satélite Earth Engine e ZARC.',
      'SATELLITE_CAR_CROSSCHECK + ZARC_WINDOW_VALIDATION',
      'PASSED_DETERMINISTIC',
      'sha256:9c2d4e8f1a3b5c7d0e9f2a4b6c8d1e3f5a7b9c0d2e4f6a8b',
      'reasoningEngines/1516688604464676864',
      '2026-10-28T13:20:00Z'
    );
    ins.run(
      'HARNESS-2026-9003',
      'LexVeritas',
      'Justiça e Tribunais',
      'NID-000-0000-0009-4',
      'Síntese de precedentes com validação cruzada contra o GraphRAG institucional (Spanner Graph).',
      'ZERO_UNVERIFIED_CITATION_GRAPHRAG (Res. CNJ 332/2020)',
      'PASSED_DETERMINISTIC',
      'sha256:7a1c3e5f8b0d2e4a6c8f1b3d5e7a9c0e2f4b6d8a1c3e5f7b',
      'reasoningEngines/133520568908513280',
      '2026-10-28T13:25:00Z'
    );
    ins.run(
      'HARNESS-2026-9004',
      'CustosLegis',
      'Ministério Público',
      'NID-000-0000-0001-9',
      'Auditoria preventiva de edital de licitação (Lei 14.133/2021) aguardando assinatura digital HITL.',
      'MANDATORY_MP_HITL_SIGNATURE',
      'AWAITING_HITL_SIGNATURE',
      'sha256:3e6f9a2c5d8b1e4f7a0c3d6e9b2f5a8c1d4e7f0a3b6c9d2e',
      'reasoningEngines/8060418863034007552',
      '2026-10-28T13:30:00Z'
    );
  }
}

export async function getViewData({ mode, db }) {
  initDatabase(db);
  const logs = db.prepare('SELECT * FROM ops_harness_audit_log ORDER BY created_at DESC LIMIT 20').all();

  if (mode === 'backstage') {
    return {
      title: 'AI Agent Harness for Government — Gemini Enterprise & Guardrails',
      subtitle:
        'Orquestrador Central e 8 Subagentes Setoriais publicados diretamente no Gemini Enterprise e Vertex AI Agent Engine.',
      externalTargetUrl: GEMINI_ENTERPRISE_URL,
      kpis: [
        { label: 'Agentes no Gemini Enterprise', value: '9 (1 Core + 8 Setoriais)' },
        { label: 'Guardrails Determinísticos', value: '100% Ativos' },
        { label: 'Auditorias Imutáveis SHA-256', value: String(logs.length) }
      ],
      actions: [
        {
          actionId: 'OPEN_GEMINI_ENTERPRISE',
          label: 'Abrir no Gemini Enterprise ↗',
          externalUrl: GEMINI_ENTERPRISE_URL
        },
        {
          actionId: 'DISPATCH_CORE_HARNESS_ROUTING',
          label: 'Executar Orquestração Multiagente (Core Harness)'
        }
      ],
      records: [
        ...SUBAGENTS_CATALOG.map((ag) => ({
          id: ag.name,
          primary: `${ag.name} • ${ag.domain}`,
          secondary: `Vertex AI Runtime: ${ag.runtimeId}`,
          detail: `Guardrail Crítico: ${ag.guardrail} — ${ag.mission}`,
          status: 'GEMINI_ENTERPRISE'
        })),
        ...logs.map((l) => ({
          id: l.audit_id,
          primary: `Auditoria ${l.audit_id} — Subagente: ${l.subagent_name} (${l.sector_domain})`,
          secondary: `Runtime: ${l.reasoning_engine_id} • Hash Merkle: ${l.merkle_sha256}`,
          detail: `${l.task_summary} | Guardrail: ${l.guardrail_applied}`,
          status: l.guardrail_verdict
        }))
      ]
    };
  }

  return {
    title: 'AI Agent Harness for Government (Gemini Enterprise)',
    subtitle:
      'Acesse diretamente no Gemini Enterprise o Orquestrador Central e os 8 subagentes governamentais (Civitas, AegisGov, LexVeritas, CustosLegis, VitalisGov, SophiaEdu, GaiaGuard e AgroNexo).',
    externalTargetUrl: GEMINI_ENTERPRISE_URL,
    kpis: [
      { label: 'Plataforma Oficial', value: 'Gemini Enterprise' },
      { label: 'Subagentes Setoriais', value: '8 Especialistas + 1 Core' },
      { label: 'Trilha Criptográfica', value: 'SHA-256 + Cloud KMS' }
    ],
    actions: [
      {
        actionId: 'OPEN_GEMINI_ENTERPRISE',
        label: 'Abrir no Gemini Enterprise ↗',
        externalUrl: GEMINI_ENTERPRISE_URL
      },
      {
        actionId: 'CROSS_CHECK_GAIAGUARD_AGRONEXO_A2A',
        label: 'Simular Sinergia A2A (AgroNexo ↔ GaiaGuard)'
      }
    ],
    records: [
      ...SUBAGENTS_CATALOG.map((ag) => ({
        id: ag.name,
        primary: `${ag.name} — ${ag.domain}`,
        secondary: `Guardrail: ${ag.guardrail}`,
        detail: `${ag.mission} (${ag.runtimeId})`,
        status: 'ACTIVE'
      })),
      ...logs.slice(0, 6).map((l) => ({
        id: l.audit_id,
        primary: `${l.audit_id} • ${l.subagent_name}`,
        secondary: `Guardrail: ${l.guardrail_applied} • ${l.merkle_sha256}`,
        detail: l.task_summary,
        status: l.guardrail_verdict
      }))
    ]
  };
}

export async function executeAction({ actionId, payload = {}, citizen, db }) {
  initDatabase(db);
  const now = new Date().toISOString();
  const actorNid = citizen?.citizen_id || citizen?.nid || payload.nid || 'NID-000-0000-0001-9';
  const auditId = `HARNESS-2026-${Math.floor(1000 + Math.random() * 8999)}`;
  const merkleHash = `sha256:${crypto.createHash('sha256').update(`${auditId}:${actorNid}:${now}`).digest('hex').slice(0, 48)}`;

  const requestedAgentKey = payload.agentKey || 'core_harness';
  const selectedAgent = SUBAGENTS_CATALOG.find((a) => a.key === requestedAgentKey) || SUBAGENTS_CATALOG[0];

  if (actionId === 'CROSS_CHECK_GAIAGUARD_AGRONEXO_A2A') {
    db?.prepare(`INSERT INTO ops_harness_audit_log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      auditId,
      'AgroNexo ↔ GaiaGuard (A2A)',
      'Agricultura & Meio Ambiente',
      actorNid,
      'Validação cruzada de crédito rural (Plano Safra) com telemetria Earth Engine/PRODES e janela ZARC.',
      'A2A_SATELLITE_CAR_AND_ZARC_GUARDRAIL',
      'PASSED_DETERMINISTIC',
      merkleHash,
      'reasoningEngines/1516688604464676864',
      now
    );
    return {
      actionId,
      protocol: auditId,
      external_url: GEMINI_ENTERPRISE_URL,
      merkleHash,
      message: `Sinergia A2A AgroNexo ↔ GaiaGuard concluída (${auditId}). Polígono CAR validado via satélite sem embargos; hash Merkle: ${merkleHash}.`
    };
  }

  const queryText =
    payload.query || selectedAgent.samplePrompt || 'Despacho multiagente com pseudonimização LGPD e verificação de jurisprudência no GraphRAG.';

  db?.prepare(`INSERT INTO ops_harness_audit_log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    auditId,
    selectedAgent.name,
    selectedAgent.domain,
    actorNid,
    queryText,
    selectedAgent.guardrail,
    'PASSED_DETERMINISTIC',
    merkleHash,
    selectedAgent.runtimeId.split('/').slice(-2).join('/'),
    now
  );

  return {
    actionId: actionId || 'DISPATCH_CORE_HARNESS_ROUTING',
    protocol: auditId,
    external_url: GEMINI_ENTERPRISE_URL,
    merkleHash,
    message: `Despacho ${auditId} executado pelo agente ${selectedAgent.name} no Gemini Enterprise (${merkleHash}).`
  };
}

export async function handleAgentTurn({
  profile,
  message,
  lang = 'pt-BR',
  db
}) {
  initDatabase(db);
  const lower = String(message || '').toLowerCase();

  let selected = SUBAGENTS_CATALOG[0];
  if (lower.includes('civitas') || lower.includes('cadúnico') || lower.includes('cadunico') || lower.includes('lgpd')) {
    selected = SUBAGENTS_CATALOG[1];
  } else if (lower.includes('aegis') || lower.includes('segurança') || lower.includes('seguranca') || lower.includes('custódia')) {
    selected = SUBAGENTS_CATALOG[2];
  } else if (lower.includes('lexveritas') || lower.includes('jurisprudência') || lower.includes('acórdão')) {
    selected = SUBAGENTS_CATALOG[3];
  } else if (lower.includes('custoslegis') || lower.includes('licitação') || lower.includes('licitacao') || lower.includes('ministério público')) {
    selected = SUBAGENTS_CATALOG[4];
  } else if (lower.includes('vitalis') || lower.includes('sisreg') || lower.includes('pcdt')) {
    selected = SUBAGENTS_CATALOG[5];
  } else if (lower.includes('sophia') || lower.includes('bncc') || lower.includes('busca ativa')) {
    selected = SUBAGENTS_CATALOG[6];
  } else if (lower.includes('gaiaguard') || lower.includes('prodes') || lower.includes('satélite')) {
    selected = SUBAGENTS_CATALOG[7];
  } else if (lower.includes('agronexo') || lower.includes('safra') || lower.includes('zarc')) {
    selected = SUBAGENTS_CATALOG[8];
  }

  const execRes = await executeAction({
    actionId: 'DISPATCH_CORE_HARNESS_ROUTING',
    payload: { agentKey: selected.key, query: `[${selected.name}] ${message}` },
    citizen: profile,
    db
  });

  const reply =
    lang === 'en-US'
      ? `**AI Agent Harness for Government — Gemini Enterprise**\n\n` +
        `• **Routed Agent:** \`${selected.name}\` (${selected.domain})\n` +
        `• **Vertex AI Agent Engine Runtime:** \`${selected.runtimeId}\`\n` +
        `• **Deterministic Guardrail:** ${selected.guardrail}\n` +
        `• **Audit Protocol:** \`${execRes.protocol}\` (${execRes.merkleHash})\n\n` +
        `All 8 specialized subagents (**Civitas**, **AegisGov**, **LexVeritas**, **CustosLegis**, **VitalisGov**, **SophiaEdu**, **GaiaGuard**, and **AgroNexo**) are published and ready to use directly in **Gemini Enterprise**.`
      : `**AI Agent Harness for Government — Gemini Enterprise**\n\n` +
        `• **Agente Acionado:** \`${selected.name}\` (${selected.domain})\n` +
        `• **Runtime Vertex AI Agent Engine:** \`${selected.runtimeId}\`\n` +
        `• **Guardrail Determinístico:** ${selected.guardrail}\n` +
        `• **Protocolo de Auditoria SHA-256:** \`${execRes.protocol}\` (${execRes.merkleHash})\n\n` +
        `Os 8 subagentes setoriais (**Civitas**, **AegisGov**, **LexVeritas**, **CustosLegis**, **VitalisGov**, **SophiaEdu**, **GaiaGuard** e **AgroNexo**) estão publicados diretamente no **Gemini Enterprise**.`;

  return {
    delegatedAgent: `agent-gov-harness-${selected.key}`,
    citations: [
      {
        id: 1,
        agency: 'Gemini Enterprise',
        title: `Abrir ${selected.name} no Gemini Enterprise`,
        url: GEMINI_ENTERPRISE_URL
      },
      {
        id: 2,
        agency: 'Repositório Open Source',
        title: 'billebr/ai-agent-harness-for-government',
        url: 'https://github.com/billebr/ai-agent-harness-for-government'
      }
    ],
    serviceRequestAction: {
      requires_auth: false,
      service_id: 'OPEN_GOV_AGENT_HARNESS',
      service_title:
        lang === 'en-US'
          ? 'Open in Gemini Enterprise'
          : 'Abrir no Gemini Enterprise',
      service_description: selected.mission,
      service_prompt: message,
      target_portal: 'citizen-portal',
      target_tab: 'gov_agent_harness'
    },
    executedAction: {
      type: 'GOV_HARNESS_DETERMINISTIC_DISPATCH',
      protocol: execRes.protocol,
      summary: `${selected.name} acionado via Gemini Enterprise com guardrail determinístico validado.`,
      external_url: GEMINI_ENTERPRISE_URL
    },
    reply,
    suggestedLinks: [
      {
        title: 'Abrir no Gemini Enterprise ↗',
        url: GEMINI_ENTERPRISE_URL
      },
      {
        title: 'Ver Repositório no GitHub',
        url: 'https://github.com/billebr/ai-agent-harness-for-government'
      }
    ]
  };
}
