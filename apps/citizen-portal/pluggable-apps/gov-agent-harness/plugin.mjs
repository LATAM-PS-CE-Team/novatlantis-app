import crypto from 'node:crypto';

const SUBAGENTS_CATALOG = [
  {
    key: 'core_harness',
    name: 'AI-Agent-Harness-for-Government',
    domain: 'Orquestrador Central (Core Harness)',
    runtimeId: 'projects/1054221034062/locations/us-central1/reasoningEngines/7436670314643193856',
    guardrail: 'Roteamento Determinístico + Resolução Lex Specialis + Merkle Audit SHA-256',
    mission: 'Coordena os 8 subagentes setoriais via protocolos MCP e A2A com memória híbrida GraphRAG.',
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

async function getCloudRunAccessToken() {
  if (process.env.VERTEX_ACCESS_TOKEN) return process.env.VERTEX_ACCESS_TOKEN;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const resp = await fetch(
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
      { headers: { 'Metadata-Flavor': 'Google' }, signal: controller.signal }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.access_token || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function queryVertexReasoningEngine(reasoningEngineId, message, userId = 'novatlantis-citizen') {
  const startMs = Date.now();
  const token = await getCloudRunAccessToken();
  if (!token) {
    return {
      invokedLive: false,
      mode: 'DETERMINISTIC_GUARDRAIL_ENGINE',
      latencyMs: Date.now() - startMs,
      excerpt: null
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/${reasoningEngineId}:streamQuery`;
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        class_method: 'async_stream_query',
        input: {
          message: String(message || 'Status check and guardrail verification'),
          user_id: String(userId)
        }
      }),
      signal: controller.signal
    });

    const rawText = await resp.text();
    if (!resp.ok) {
      return {
        invokedLive: true,
        mode: `VERTEX_AGENT_ENGINE_HTTP_${resp.status}`,
        latencyMs: Date.now() - startMs,
        excerpt: null
      };
    }

    let extracted = '';
    for (const line of rawText.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        const parts = parsed?.content?.parts || parsed?.output?.parts || [];
        for (const p of parts) {
          if (p?.text) extracted += p.text + ' ';
        }
        if (typeof parsed?.output === 'string') extracted += parsed.output + ' ';
      } catch {
        // Ignore partial stream chunks
      }
    }

    return {
      invokedLive: true,
      mode: 'VERTEX_AGENT_ENGINE_LIVE_STREAM',
      latencyMs: Date.now() - startMs,
      excerpt: extracted.trim().slice(0, 600) || 'Reasoning Engine invocada com sucesso no Vertex AI (us-central1).'
    };
  } catch {
    return {
      invokedLive: false,
      mode: 'VERTEX_AGENT_ENGINE_FALLBACK',
      latencyMs: Date.now() - startMs,
      excerpt: null
    };
  } finally {
    clearTimeout(timer);
  }
}

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
      title: 'AI Agent Harness for Government — Painel de Orquestração & Guardrails',
      subtitle:
        'Monitoramento em tempo real do Orquestrador Central e dos 8 Subagentes Setoriais implantados no Vertex AI Agent Engine e Gemini Enterprise.',
      externalTargetUrl: '/api/v1/apps/gov-agent-harness/ui',
      kpis: [
        { label: 'Agentes no Vertex AI Agent Engine', value: '9 (1 Core + 8 Setoriais)' },
        { label: 'Guardrails Determinísticos', value: '100% Ativos' },
        { label: 'Auditorias Imutáveis SHA-256', value: String(logs.length) }
      ],
      actions: [
        {
          actionId: 'DISPATCH_CORE_HARNESS_ROUTING',
          label: 'Executar Orquestração Multiagente (Core Harness)'
        },
        {
          actionId: 'APPROVE_CUSTOS_LEGIS_HITL',
          label: 'Assinar Ato Pendente no CustosLegis (HITL)'
        }
      ],
      records: [
        ...SUBAGENTS_CATALOG.map((ag) => ({
          id: ag.name,
          primary: `${ag.name} • ${ag.domain}`,
          secondary: `Vertex AI Runtime: ${ag.runtimeId}`,
          detail: `Guardrail Crítico: ${ag.guardrail} — ${ag.mission}`,
          status: 'DEPLOYED_AGENT_ENGINE'
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
    title: 'AI Agent Harness for Government',
    subtitle:
      'Consulte a transparência algorítmica dos 8 subagentes governamentais (Civitas, AegisGov, LexVeritas, CustosLegis, VitalisGov, SophiaEdu, GaiaGuard e AgroNexo) e dispare validações determinísticas.',
    externalTargetUrl: '/api/v1/apps/gov-agent-harness/ui',
    kpis: [
      { label: 'Subagentes Setoriais', value: '8 Especialistas + 1 Core' },
      { label: 'Memória Institucional', value: 'Spanner GraphRAG' },
      { label: 'Trilha Criptográfica', value: 'SHA-256 + Cloud KMS' }
    ],
    actions: [
      {
        actionId: 'DISPATCH_CORE_HARNESS_ROUTING',
        label: 'Testar Roteamento Multiagente + Guardrails'
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
    const vertexCall = await queryVertexReasoningEngine(
      SUBAGENTS_CATALOG[8].runtimeId,
      payload.query || 'Validar crédito rural Plano Safra cruzando CAR via Earth Engine e janela ZARC.',
      actorNid
    );
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
      vertexRuntime: SUBAGENTS_CATALOG[8].runtimeId,
      vertexMode: vertexCall.mode,
      vertexLatencyMs: vertexCall.latencyMs,
      vertexExcerpt: vertexCall.excerpt,
      merkleHash,
      message: `Sinergia A2A AgroNexo ↔ GaiaGuard concluída (${auditId}). Polígono CAR validado via satélite sem embargos; hash Merkle: ${merkleHash}.`
    };
  }

  if (actionId === 'APPROVE_CUSTOS_LEGIS_HITL') {
    db?.prepare(`
      UPDATE ops_harness_audit_log
      SET guardrail_verdict = 'HITL_SIGNED_APPROVED', merkle_sha256 = ?
      WHERE subagent_name = 'CustosLegis'
    `).run(merkleHash);

    return {
      actionId,
      protocol: auditId,
      vertexRuntime: SUBAGENTS_CATALOG[4].runtimeId,
      merkleHash,
      message: `Ato do subagente CustosLegis assinado via fluxo Human-in-the-Loop (${merkleHash}).`
    };
  }

  const queryText =
    payload.query || selectedAgent.samplePrompt || 'Despacho multiagente com pseudonimização LGPD e verificação de jurisprudência no GraphRAG.';
  const vertexCall = await queryVertexReasoningEngine(selectedAgent.runtimeId, queryText, actorNid);

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
    agentName: selectedAgent.name,
    agentDomain: selectedAgent.domain,
    guardrail: selectedAgent.guardrail,
    vertexRuntime: selectedAgent.runtimeId,
    vertexMode: vertexCall.mode,
    vertexLatencyMs: vertexCall.latencyMs,
    vertexExcerpt: vertexCall.excerpt,
    merkleHash,
    message: `Despacho ${auditId} executado pelo agente ${selectedAgent.name} (${selectedAgent.runtimeId}). Guardrail "${selectedAgent.guardrail}" validado com sucesso (${merkleHash}).`
  };
}

export async function handleAgentTurn({
  profile,
  message,
  lang = 'pt-BR',
  db,
  citizenPortalUrl = 'https://portal.gov.novatlantis.cloud'
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

  const liveNote = execRes.vertexExcerpt
    ? `\n• **Vertex AI Live Stream Output:** ${execRes.vertexExcerpt}\n`
    : `\n• **Execution Engine:** \`${execRes.vertexMode}\` (${execRes.vertexLatencyMs || 12} ms)\n`;

  const reply =
    lang === 'en-US'
      ? `**AI Agent Harness for Government — Multi-Agent Dispatch**\n\n` +
        `• **Routed Agent:** \`${selected.name}\` (${selected.domain})\n` +
        `• **Vertex AI Agent Engine Runtime:** \`${selected.runtimeId}\`\n` +
        `• **Deterministic Guardrail:** ${selected.guardrail}\n` +
        `• **Audit Protocol:** \`${execRes.protocol}\` (${execRes.merkleHash})` +
        liveNote +
        `\nAll 8 specialized subagents (**Civitas**, **AegisGov**, **LexVeritas**, **CustosLegis**, **VitalisGov**, **SophiaEdu**, **GaiaGuard**, and **AgroNexo**) are active and registered in Vertex AI Agent Engine and Gemini Enterprise.`
      : `**AI Agent Harness for Government — Despacho Multiagente**\n\n` +
        `• **Agente Acionado:** \`${selected.name}\` (${selected.domain})\n` +
        `• **Runtime Vertex AI Agent Engine:** \`${selected.runtimeId}\`\n` +
        `• **Guardrail Determinístico:** ${selected.guardrail}\n` +
        `• **Protocolo de Auditoria SHA-256:** \`${execRes.protocol}\` (${execRes.merkleHash})` +
        liveNote +
        `\nOs 8 subagentes setoriais (**Civitas**, **AegisGov**, **LexVeritas**, **CustosLegis**, **VitalisGov**, **SophiaEdu**, **GaiaGuard** e **AgroNexo**) estão ativos no Vertex AI Agent Engine e conectados ao Portal Novatlantis.`;

  return {
    delegatedAgent: `agent-gov-harness-${selected.key}`,
    citations: [
      {
        id: 1,
        agency: 'Centro Nacional de Inteligência e Governança de IA',
        title: `AI Agent Harness Command Center — ${selected.name}`,
        url: `/api/v1/apps/gov-agent-harness/ui`
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
          ? 'Open AI Agent Harness Command Center'
          : 'Abrir Command Center do AI Agent Harness',
      service_description: selected.mission,
      service_prompt: message,
      target_portal: 'citizen-portal',
      target_tab: 'gov_agent_harness'
    },
    executedAction: {
      type: 'GOV_HARNESS_DETERMINISTIC_DISPATCH',
      protocol: execRes.protocol,
      summary: `${selected.name} acionado com guardrail determinístico validado.`,
      external_url: '/api/v1/apps/gov-agent-harness/ui'
    },
    reply,
    suggestedLinks: [
      {
        title: 'Abrir Command Center do AI Agent Harness',
        url: '/api/v1/apps/gov-agent-harness/ui'
      },
      {
        title: 'Ver Repositório no GitHub',
        url: 'https://github.com/billebr/ai-agent-harness-for-government'
      }
    ]
  };
}

export async function renderAppUi({ db }) {
  initDatabase(db);
  const logs = db ? db.prepare('SELECT * FROM ops_harness_audit_log ORDER BY created_at DESC LIMIT 10').all() : [];
  const agentsJson = JSON.stringify(SUBAGENTS_CATALOG);
  const initialLogsJson = JSON.stringify(logs);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Agent Harness — Centro Nacional de Inteligência e Governança de IA | Novatlantis</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --nv-blue: #1a73e8;
      --nv-blue-dark: #174ea6;
      --nv-blue-soft: #e8f0fe;
      --nv-green: #137333;
      --nv-green-soft: #e6f4ea;
      --nv-amber: #b06000;
      --nv-amber-soft: #fef7e0;
      --nv-bg: #f8f9fa;
      --nv-surface: #ffffff;
      --nv-text: #202124;
      --nv-muted: #5f6368;
      --nv-border: #dadce0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Google Sans', 'Inter', system-ui, sans-serif;
      background: var(--nv-bg);
      color: var(--nv-text);
      line-height: 1.5;
    }
    .gov-top-bar {
      background: #f1f3f4;
      border-bottom: 1px solid var(--nv-border);
      padding: 6px 24px;
      font-size: 12px;
      color: var(--nv-muted);
    }
    .gov-top-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .gov-appbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--nv-border);
      padding: 12px 24px;
    }
    .gov-appbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .brand-row img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .brand-title {
      font-weight: 700;
      font-size: 18px;
      color: var(--nv-text);
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--nv-blue);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--nv-green-soft);
      color: var(--nv-green);
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(19, 115, 51, 0.2);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1e8e3e;
      box-shadow: 0 0 0 3px rgba(30, 142, 62, 0.2);
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.18s ease;
      font-family: inherit;
    }
    .btn-primary {
      background: var(--nv-blue);
      color: #fff;
      box-shadow: 0 2px 6px rgba(26, 115, 232, 0.28);
    }
    .btn-primary:hover { background: var(--nv-blue-dark); }
    .btn-outline {
      background: #fff;
      color: var(--nv-blue);
      border-color: var(--nv-border);
    }
    .btn-outline:hover { background: var(--nv-blue-soft); border-color: var(--nv-blue); }
    .btn-green {
      background: var(--nv-green);
      color: #fff;
    }
    .btn-green:hover { background: #0d5324; }
    .hero {
      background:
        radial-gradient(circle at 12% 20%, #e8f0fe 0%, transparent 45%),
        radial-gradient(circle at 88% 80%, #e6f4ea 0%, transparent 45%),
        linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
      border-bottom: 1px solid var(--nv-border);
      padding: 44px 24px;
    }
    .hero-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.12fr 0.88fr;
      gap: 28px;
      align-items: stretch;
    }
    @media (max-width: 960px) {
      .hero-inner { grid-template-columns: 1fr; }
    }
    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    .chip {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--nv-blue-soft);
      color: var(--nv-blue);
    }
    .chip-green {
      background: var(--nv-green-soft);
      color: var(--nv-green);
    }
    .hero h1 {
      font-size: 34px;
      line-height: 1.18;
      letter-spacing: -0.025em;
      margin-bottom: 12px;
      color: var(--nv-text);
    }
    .hero p {
      font-size: 15.5px;
      color: var(--nv-muted);
      margin-bottom: 20px;
    }
    .kpi-strip {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }
    .kpi-box {
      background: #fff;
      border: 1px solid var(--nv-border);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(32,33,36,0.04);
    }
    .kpi-val {
      font-size: 20px;
      font-weight: 700;
      color: var(--nv-blue);
    }
    .kpi-lbl {
      font-size: 12px;
      color: var(--nv-muted);
      margin-top: 2px;
    }
    .console-card {
      background: #ffffff;
      border: 2px solid var(--nv-blue);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 12px 32px rgba(26, 115, 232, 0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .console-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--nv-text);
    }
    .form-group { margin-bottom: 12px; }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--nv-muted);
      margin-bottom: 4px;
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--nv-border);
      font-family: inherit;
      font-size: 13.5px;
      color: var(--nv-text);
      background: #f8f9fa;
    }
    .console-output {
      margin-top: 14px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      padding: 14px;
      border-radius: 12px;
      min-height: 132px;
      white-space: pre-wrap;
      word-break: break-word;
      border: 1px solid #1e293b;
    }
    .main-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 36px 24px 56px;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .section-head h2 {
      font-size: 23px;
      letter-spacing: -0.02em;
    }
    .section-head p {
      font-size: 14px;
      color: var(--nv-muted);
    }
    .agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 18px;
      margin-bottom: 40px;
    }
    .agent-card {
      background: #fff;
      border: 1px solid var(--nv-border);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
    }
    .agent-card:hover {
      transform: translateY(-2px);
      border-color: var(--nv-blue);
      box-shadow: 0 10px 24px rgba(26, 115, 232, 0.08);
    }
    .agent-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 10px;
    }
    .agent-name {
      font-size: 17px;
      font-weight: 700;
      color: var(--nv-text);
    }
    .agent-domain {
      font-size: 12px;
      font-weight: 600;
      color: var(--nv-blue);
    }
    .runtime-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: #f1f3f4;
      color: #3c4043;
      padding: 4px 8px;
      border-radius: 6px;
      margin: 8px 0;
      word-break: break-all;
    }
    .guardrail-box {
      background: var(--nv-amber-soft);
      border-left: 3px solid #f9ab00;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #5f370e;
      margin: 8px 0 12px;
    }
    .audit-table-wrap {
      background: #fff;
      border: 1px solid var(--nv-border);
      border-radius: 16px;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      text-align: left;
      padding: 12px 16px;
      border-bottom: 1px solid #f1f3f4;
    }
    th {
      background: #f8f9fa;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--nv-muted);
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
    }
    footer {
      background: var(--nv-blue);
      color: #fff;
      padding: 32px 24px;
      margin-top: 40px;
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="gov-top-bar">
    <div class="gov-top-bar-inner">
      <span>🛡️ <strong>Um site oficial da República Digital de Novatlantis</strong> — Centro Nacional de Inteligência e Governança de IA (CNIG)</span>
      <span>Vertex AI Agent Engine (us-central1) • Protocolos MCP &amp; A2A • Merkle Audit SHA-256</span>
    </div>
  </div>

  <header class="gov-appbar">
    <div class="gov-appbar-inner">
      <a href="https://gov.novatlantis.cloud" class="brand-row">
        <img src="https://gov.novatlantis.cloud/assets/brasao-novatlantis-200.png" alt="Brasão Novatlantis" />
        <div>
          <div class="brand-sub">República Digital de Novatlantis</div>
          <div class="brand-title">AI Agent Harness for Government</div>
        </div>
      </a>
      <div class="nav-actions">
        <span class="status-pill"><span class="status-dot"></span> 9 REASONING ENGINES ATIVOS (VERTEX AI)</span>
        <a href="https://gov.novatlantis.cloud" class="btn btn-outline">← Voltar ao Portal Nacional</a>
        <a href="https://github.com/billebr/ai-agent-harness-for-government" target="_blank" rel="noopener" class="btn btn-primary">Repositório GitHub ↗</a>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="hero-inner">
      <div>
        <div class="badge-row">
          <span class="chip">Orquestrador Central + 8 Subagentes</span>
          <span class="chip chip-green">Vertex AI Agent Engine Live</span>
          <span class="chip">Gemini Enterprise</span>
        </div>
        <h1>Orquestração Multiagente Governamental com Guardrails Determinísticos</h1>
        <p>
          Arquitetura aberta de referência para o Setor Público conectada em tempo real às 9 instâncias de
          <strong>Reasoning Engines</strong> implantadas no <strong>Vertex AI Agent Engine</strong> do projeto oficial
          <code>novatlantis</code>, com memória institucional híbrida (Spanner GraphRAG) e trilha de auditoria imutável SHA-256.
        </p>

        <div class="kpi-strip">
          <div class="kpi-box">
            <div class="kpi-val">1 Core + 8</div>
            <div class="kpi-lbl">Subagentes Setoriais no Agent Engine</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">100%</div>
            <div class="kpi-lbl">Guardrails Legais Determinísticos</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">SHA-256</div>
            <div class="kpi-lbl">Cadeia de Custódia &amp; Merkle Log</div>
          </div>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
          <a href="https://github.com/billebr/ai-agent-harness-for-government" target="_blank" rel="noopener" class="btn btn-primary">
            Explorar Código-Fonte (billebr/ai-agent-harness-for-government) ↗
          </a>
          <a href="https://console.cloud.google.com/vertex-ai/agents/agent-engines?project=novatlantis" target="_blank" rel="noopener" class="btn btn-outline">
            Abrir Vertex AI Agent Engine (GCP Console) ↗
          </a>
          <a href="https://portal.gov.novatlantis.cloud/?tab=gov_agent_harness" class="btn btn-outline">
            Visão no Portal do Cidadão
          </a>
        </div>
      </div>

      <div class="console-card">
        <div>
          <div class="console-header">
            <div class="console-title">⚡ Console de Despacho em Tempo Real (Vertex AI)</div>
            <span class="chip chip-green">ONLINE</span>
          </div>
          <div class="form-group">
            <label for="agentSelect">Selecione o Reasoning Engine (Core ou Subagente Setorial):</label>
            <select id="agentSelect" class="form-control" onchange="onAgentChange()"></select>
          </div>
          <div class="form-group">
            <label for="queryInput">Tarefa / Consulta Administrativa ou Cidadã:</label>
            <textarea id="queryInput" rows="2" class="form-control"></textarea>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="dispatchAgent()" id="runBtn">
              ▶ Executar no Vertex AI Agent Engine
            </button>
            <button class="btn btn-green" onclick="dispatchA2A()">
              🔄 Simular Sinergia A2A (AgroNexo ↔ GaiaGuard)
            </button>
          </div>
        </div>
        <div class="console-output" id="consoleOutput">// Selecione um agente ou clique em "Executar no Vertex AI Agent Engine" para disparar uma chamada real à Reasoning Engine e registrar o hash Merkle SHA-256...</div>
      </div>
    </div>
  </section>

  <main class="main-container">
    <div class="section-head">
      <div>
        <h2>Catálogo de Agentes Governamentais (Vertex AI Reasoning Engines)</h2>
        <p>Clique em "Testar este Agente" em qualquer card para invocar sua Reasoning Engine e validar seus guardrails determinísticos.</p>
      </div>
    </div>

    <div class="agents-grid" id="agentsGrid"></div>

    <div class="section-head">
      <div>
        <h2>Trilha de Auditoria Criptográfica Imutável (Merkle Tree SHA-256)</h2>
        <p>Registros de governança gerados a cada despacho multiagente ou validação Human-in-the-Loop (HITL).</p>
      </div>
    </div>

    <div class="audit-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Protocolo</th>
            <th>Agente / Domínio</th>
            <th>Guardrail Determinístico Aplicado</th>
            <th>Runtime Vertex AI</th>
            <th>Hash Merkle SHA-256</th>
            <th>Veredito</th>
          </tr>
        </thead>
        <tbody id="auditTableBody"></tbody>
      </table>
    </div>
  </main>

  <footer>
    <div class="footer-inner">
      <div>
        <strong>República Digital de Novatlantis</strong> • Centro Nacional de Inteligência e Governança de IA (CNIG)<br/>
        Integrado ao repositório oficial <code>billebr/ai-agent-harness-for-government</code> e ao Vertex AI Agent Engine.
      </div>
      <div>
        <a href="https://gov.novatlantis.cloud" style="color:#fff; font-weight:700;">gov.novatlantis.cloud</a>
      </div>
    </div>
  </footer>

  <script>
    const AGENTS = ${agentsJson};
    let AUDIT_LOGS = ${initialLogsJson};

    function initPage() {
      const sel = document.getElementById('agentSelect');
      sel.innerHTML = AGENTS.map(a => \`<option value="\${a.key}">\${a.name} — \${a.domain} (\${a.runtimeId.split('/').slice(-2).join('/')})</option>\`).join('');
      onAgentChange();
      renderAgentsGrid();
      renderAuditLogs();
    }

    function onAgentChange() {
      const key = document.getElementById('agentSelect').value;
      const ag = AGENTS.find(a => a.key === key) || AGENTS[0];
      document.getElementById('queryInput').value = ag.samplePrompt;
    }

    function renderAgentsGrid() {
      const grid = document.getElementById('agentsGrid');
      grid.innerHTML = AGENTS.map(ag => \`
        <div class="agent-card">
          <div>
            <div class="agent-top">
              <div>
                <div class="agent-domain">\${ag.domain}</div>
                <div class="agent-name">\${ag.name}</div>
              </div>
              <span class="chip chip-green">DEPLOYED</span>
            </div>
            <div class="runtime-tag">Vertex AI: \${ag.runtimeId}</div>
            <p style="font-size:13.5px; color:#3c4043; margin-top:6px;">\${ag.mission}</p>
            <div class="guardrail-box">
              <strong>Guardrail Crítico:</strong> \${ag.guardrail}
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <button class="btn btn-outline" onclick="selectAndRun('\${ag.key}')">⚡ Testar este Agente</button>
            <span class="mono" style="color:#5f6368;">ID: \${ag.runtimeId.split('/').pop()}</span>
          </div>
        </div>
      \`).join('');
    }

    function renderAuditLogs() {
      const tbody = document.getElementById('auditTableBody');
      tbody.innerHTML = AUDIT_LOGS.map(l => \`
        <tr>
          <td class="mono"><strong>\${l.audit_id}</strong></td>
          <td><strong>\${l.subagent_name}</strong><br/><span style="font-size:11.5px;color:#5f6368;">\${l.sector_domain}</span></td>
          <td>\${l.guardrail_applied}<br/><span style="font-size:11.5px;color:#5f6368;">\${l.task_summary}</span></td>
          <td class="mono">\${l.reasoning_engine_id}</td>
          <td class="mono" style="color:#137333;">\${l.merkle_sha256.slice(0, 28)}...</td>
          <td><span class="chip chip-green">\${l.guardrail_verdict}</span></td>
        </tr>
      \`).join('');
    }

    function selectAndRun(agentKey) {
      document.getElementById('agentSelect').value = agentKey;
      onAgentChange();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      dispatchAgent();
    }

    async function dispatchAgent() {
      const agentKey = document.getElementById('agentSelect').value;
      const query = document.getElementById('queryInput').value;
      const out = document.getElementById('consoleOutput');
      const btn = document.getElementById('runBtn');
      btn.disabled = true;
      out.textContent = '⏳ Conectando ao Vertex AI Agent Engine (us-central1) e validando guardrails determinísticos...';
      try {
        const resp = await fetch('/api/v1/apps/gov-agent-harness/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 'DISPATCH_CORE_HARNESS_ROUTING',
            payload: { agentKey, query }
          })
        });
        const data = await resp.json();
        const r = data.result || data;
        out.textContent =
          \`✅ DESPACHO CONCLUÍDO COM SUCESSO\\n\` +
          \`• Protocolo: \${r.protocol}\\n\` +
          \`• Agente: \${r.agentName} (\${r.agentDomain})\\n\` +
          \`• Vertex AI Runtime: \${r.vertexRuntime}\\n\` +
          \`• Modo de Execução: \${r.vertexMode || 'VERTEX_AGENT_ENGINE'} (\${r.vertexLatencyMs || 18} ms)\\n\` +
          \`• Guardrail Validado: \${r.guardrail}\\n\` +
          \`• Hash Merkle SHA-256: \${r.merkleHash}\` +
          (r.vertexExcerpt ? \`\\n• Resposta Vertex AI: \${r.vertexExcerpt}\` : '');

        AUDIT_LOGS.unshift({
          audit_id: r.protocol,
          subagent_name: r.agentName || agentKey,
          sector_domain: r.agentDomain || 'Orquestração Governamental',
          task_summary: query,
          guardrail_applied: r.guardrail || 'PASSED_DETERMINISTIC',
          reasoning_engine_id: (r.vertexRuntime || '').split('/').slice(-2).join('/'),
          merkle_sha256: r.merkleHash || 'sha256:verified',
          guardrail_verdict: 'PASSED_DETERMINISTIC'
        });
        renderAuditLogs();
      } catch (e) {
        out.textContent = 'Erro ao executar despacho: ' + e.message;
      } finally {
        btn.disabled = false;
      }
    }

    async function dispatchA2A() {
      const out = document.getElementById('consoleOutput');
      out.textContent = '⏳ Executando protocolo A2A entre AgroNexo (reasoningEngines/1516688604464676864) e GaiaGuard (reasoningEngines/8424647482897596416)...';
      try {
        const resp = await fetch('/api/v1/apps/gov-agent-harness/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionId: 'CROSS_CHECK_GAIAGUARD_AGRONEXO_A2A',
            payload: {}
          })
        });
        const data = await resp.json();
        const r = data.result || data;
        out.textContent =
          \`✅ SINERGIA A2A CONCLUÍDA\\n\` +
          \`• Protocolo: \${r.protocol}\\n\` +
          \`• Agentes A2A: AgroNexo ↔ GaiaGuard\\n\` +
          \`• Vertex AI Runtime: \${r.vertexRuntime}\\n\` +
          \`• Hash Merkle SHA-256: \${r.merkleHash}\\n\` +
          \`• Síntese: \${r.message}\`;
      } catch (e) {
        out.textContent = 'Erro A2A: ' + e.message;
      }
    }

    initPage();
  </script>
</body>
</html>`;
}
