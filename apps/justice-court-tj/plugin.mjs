/**
 * Plugin Oficial de Acoplamento ao Portal Novatlantis
 * Caso de Uso CE: Tribunal de Justiça Digital & Juizado Especial IA (apps/justice-court-tj)
 *
 * Implementa as 3 interfaces padrão do @novatlantis/portal-sdk:
 *   1. initDatabase(db) -> Cria e popula de forma idempotente as tabelas do TJ no banco GDF/AlloyDB
 *   2. getViewData({ mode, lang, citizen, db }) -> Retorna KPIs, tabelas e ações para o Portal do Cidadão e Backstage
 *   3. executeAction({ actionId, payload, citizen, lang, db }) -> Executa peticionamento, certidão e homologação de sentença
 *   4. handleAgentTurn({ profile, message, lang, db, citizenPortalUrl, govBackstageUrl }) -> Atende no Concierge IA
 */

import crypto from 'node:crypto';

export function initDatabase(db) {
  if (!db) return;
  db.exec(`
    CREATE TABLE IF NOT EXISTS ops_tj_lawsuits (
      case_number TEXT PRIMARY KEY,
      plaintiff_nid TEXT NOT NULL,
      plaintiff_name TEXT NOT NULL,
      court_branch TEXT NOT NULL,
      subject_matter TEXT NOT NULL,
      claim_summary TEXT NOT NULL,
      ai_jurisprudence_analysis TEXT NOT NULL,
      ai_draft_sentence TEXT NOT NULL,
      assigned_judge_nid TEXT NOT NULL,
      assigned_judge_name TEXT NOT NULL,
      status TEXT NOT NULL,
      ed25519_Decision_hash TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ops_tj_certificates (
      cert_id TEXT PRIMARY KEY,
      citizen_nid TEXT NOT NULL,
      citizen_name TEXT NOT NULL,
      cert_type TEXT NOT NULL,
      status TEXT NOT NULL,
      ed25519_signature TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      valid_until TEXT NOT NULL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS cnt FROM ops_tj_lawsuits').get().cnt;
  if (count === 0) {
    const ins = db.prepare(`
      INSERT INTO ops_tj_lawsuits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    ins.run(
      '0004821-77.2026.8.26.0001',
      'NID-000-0000-0010-8',
      'Pedro Albuquerque Viana',
      '1ª Vara do Juizado Especial Cível & Digital — Colina da Justiça',
      'Direito do Consumidor & Contratos Digitais',
      'Ressarcimento automático por interrupção de serviço de fibra óptica residencial acima do SLA contratual.',
      'Precedente Vinculante Súmula TJ-NV nº 14: Interrupção > 4h sem redundância gera indenização tarifária automática de 150 créditos soberanos.',
      'JULGO PROCEDENTE o pedido para determinar o crédito imediato de 150 NVC via Smart Contract no Tesouro Soberano.',
      'NID-000-0000-0009-4',
      'Juíza Dra. Clara Sterling (Magistrada Titular)',
      'AGUARDANDO_HOMOLOGACAO_MAGISTRADO',
      null,
      '2026-10-01T10:20:00Z',
      '2026-10-01T10:25:00Z'
    );
    ins.run(
      '0009104-12.2026.8.26.0001',
      'NID-000-0000-0001-9',
      'Joao Thiago Poço (JT)',
      'Plenário Constitucional & Fazenda Pública — Tribunal de Justiça',
      'Homologação de Marco Regulatório de IA Agêntica em Serviços Estaduais',
      'Validação preventiva de conformidade constitucional e auditoria algorítmica do ecossistema de agentes públicos.',
      'Conformidade integral verificada com o Art. 12 da Constituição Digital de Novatlantis (Transparência Algorítmica e Assinatura Ed25519).',
      'HOMOLOGO a certificação constitucional do protocolo de Agentes Públicos Federados para operação plena.',
      'NID-000-0000-0009-4',
      'Juíza Dra. Clara Sterling (Magistrada Titular)',
      'SENTENCA_HOMOLOGADA',
      'ed25519:9f84b2c71a0e3d4f8812a6c90b1d4e7f2a3c5b6d',
      '2026-09-29T14:00:00Z',
      '2026-09-30T09:15:00Z'
    );
  }
}

export async function getViewData({ mode, lang = 'pt-BR', citizen, db }) {
  initDatabase(db);

  const allCases = db.prepare('SELECT * FROM ops_tj_lawsuits ORDER BY created_at DESC LIMIT 25').all();
  const citizenNid = citizen?.citizen_id || citizen?.nid || null;
  const citizenCases = citizenNid
    ? db.prepare('SELECT * FROM ops_tj_lawsuits WHERE plaintiff_nid = ? ORDER BY created_at DESC').all(citizenNid)
    : allCases.slice(0, 5);
  const citizenCerts = citizenNid
    ? db.prepare('SELECT * FROM ops_tj_certificates WHERE citizen_nid = ? ORDER BY issued_at DESC').all(citizenNid)
    : [];

  const pendingCount = allCases.filter((c) => c.status === 'AGUARDANDO_HOMOLOGACAO_MAGISTRADO').length;
  const sentencedCount = allCases.filter((c) => c.status === 'SENTENCA_HOMOLOGADA').length;

  if (mode === 'backstage') {
    return {
      title: 'Gabinete do Magistrado — Fila Processual & Minutas de Sentença por IA (TJ Digital)',
      subtitle:
        'A IA analisa a petição inicial, cruza com a jurisprudência dominante do Tribunal e elabora a minuta de sentença para homologação em 1 clique pelo Magistrado.',
      kpis: [
        {
          label: 'Processos na Fila do Gabinete',
          value: String(allCases.length),
          helper: 'Distribuídos eletronicamente via PJe / e-Proc Agêntico'
        },
        {
          label: 'Aguardando Homologação do Juiz',
          value: String(pendingCount),
          helper: 'Minutas prontas geradas pelo Agente Jurídico Gemini 2.5'
        },
        {
          label: 'Sentenças Assinadas (Ed25519)',
          value: String(sentencedCount),
          helper: 'Tempo médio de julgamento: 4 minutos'
        }
      ],
      actions: [
        {
          actionId: 'APPROVE_JUDICIAL_SENTENCE_DRAFT',
          label: 'Homologar Próxima Minuta de Sentença IA com Chave Ed25519',
          description: 'Assina digitalmente a minuta de sentença pendente mais antiga da fila do gabinete.'
        },
        {
          actionId: 'FILE_SMALL_CLAIMS_PETITION',
          label: 'Autuar Processo Piloto de Teste no Juizado Especial',
          description: 'Registra um novo processo eletrônico com análise automática de jurisprudência.'
        }
      ],
      records: allCases.map((c) => ({
        id: c.case_number,
        primary: `${c.case_number} • ${c.subject_matter}`,
        secondary: `Autor: ${c.plaintiff_name} (${c.plaintiff_nid}) | Vara: ${c.court_branch}`,
        detail: `Análise IA: ${c.ai_jurisprudence_analysis}\nMinuta de Decisão: ${c.ai_draft_sentence}`,
        status: c.status,
        badgeColor: c.status === 'SENTENCA_HOMOLOGADA' ? 'success' : 'warning'
      }))
    };
  }

  return {
    title: 'Tribunal de Justiça Digital & Juizado Especial IA',
    subtitle:
      'Consulte seus processos em tempo real, emita Certidão Negativa Judicial instantânea com assinatura Ed25519 ou protocole uma ação no Juizado Especial sem burocracia.',
    kpis: [
      {
        label: 'Meus Processos Vinculados ao NID',
        value: String(citizenCases.length),
        helper: citizenNid ? `Titular: ${citizenNid}` : 'Visão pública demonstrativa'
      },
      {
        label: 'Certidões Judiciais Emitidas',
        value: String(citizenCerts.length),
        helper: 'Validade nacional e verificação QR/Ed25519'
      },
      {
        label: 'SLA de Triagem e Conciliação IA',
        value: '< 60 seg',
        helper: '1ª Vara do Juizado Especial Digital'
      }
    ],
    actions: [
      {
        actionId: 'ISSUE_JUDICIAL_CLEARANCE_CERT',
        label: 'Emitir Certidão Negativa / Nada Consta Judicial (Ed25519)',
        description: 'Gera instantaneamente sua certidão oficial de distribuição cível e criminal assinada pelo TJ.'
      },
      {
        actionId: 'FILE_SMALL_CLAIMS_PETITION',
        label: 'Protocolar Nova Ação no Juizado Especial Digital (Petição IA)',
        description: 'A IA estrutura os fatos, vincula a súmula aplicável e envia para homologação do Magistrado.'
      }
    ],
    records: [
      ...citizenCases.map((c) => ({
        id: c.case_number,
        primary: `Processo ${c.case_number} — ${c.subject_matter}`,
        secondary: `${c.court_branch} • Relator(a): ${c.assigned_judge_name}`,
        detail: `Resumo: ${c.claim_summary} | Parecer IA: ${c.ai_jurisprudence_analysis}`,
        status: c.status,
        badgeColor: c.status === 'SENTENCA_HOMOLOGADA' ? 'success' : 'info'
      })),
      ...citizenCerts.map((cert) => ({
        id: cert.cert_id,
        primary: `Certidão Judicial ${cert.cert_id} (${cert.cert_type})`,
        secondary: `Titular: ${cert.citizen_name} (${cert.citizen_nid}) • Emitida em ${cert.issued_at}`,
        detail: `Assinatura Criptográfica: ${cert.ed25519_signature}`,
        status: cert.status,
        badgeColor: 'success'
      }))
    ]
  };
}

export async function executeAction({ actionId, payload = {}, citizen, lang = 'pt-BR', db }) {
  initDatabase(db);
  const now = new Date().toISOString();
  const actorNid = citizen?.citizen_id || citizen?.nid || payload.nid || 'NID-000-0000-0001-9';
  const actorName = citizen?.full_name || payload.citizen_name || 'Joao Thiago Poço (JT)';

  if (actionId === 'ISSUE_JUDICIAL_CLEARANCE_CERT') {
    const certId = `CERT-TJ-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    const sig = `ed25519:${crypto.createHash('sha256').update(`${certId}:${actorNid}:${now}`).digest('hex').slice(0, 40)}`;
    const validUntil = new Date(Date.now() + 90 * 86400_000).toISOString();

    db.prepare(`INSERT INTO ops_tj_certificates VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      certId,
      actorNid,
      actorName,
      'CERTIDÃO NEGATIVA DE DISTRIBUIÇÃO CÍVEL E CRIMINAL (NADA CONSTA)',
      'VÁLIDA • ASSINADA ED25519',
      sig,
      now,
      validUntil
    );

    return {
      actionId,
      protocol: certId,
      message: `Certidão Judicial ${certId} emitida com sucesso para ${actorName} (${actorNid}).`,
      certificate: {
        cert_id: certId,
        citizen_nid: actorNid,
        citizen_name: actorName,
        signature: sig,
        issued_at: now
      }
    };
  }

  if (actionId === 'FILE_SMALL_CLAIMS_PETITION') {
    const seq = Math.floor(1000000 + Math.random() * 8999999);
    const caseNumber = `${seq}-44.2026.8.26.0001`;
    const subject = payload.subject || 'Direito do Consumidor & Serviços Públicos Digitais';
    const description =
      payload.description ||
      'Pedido de tutela rápida e conciliação automatizada submetido via Portal do Cidadão / Concierge IA.';

    db.prepare(`INSERT INTO ops_tj_lawsuits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      caseNumber,
      actorNid,
      actorName,
      '1ª Vara do Juizado Especial Cível & Digital — Colina da Justiça',
      subject,
      description,
      'Admissibilidade positiva. Caso enquadrado no rito sumaríssimo digital com sugestão de acordo automático.',
      'DEFIRO a tutela preliminar e intimo a parte requerida para cumprimento imediato ou conciliação em 24h.',
      'NID-000-0000-0009-4',
      'Juíza Dra. Clara Sterling (Magistrada Titular)',
      'AGUARDANDO_HOMOLOGACAO_MAGISTRADO',
      null,
      now,
      now
    );

    return {
      actionId,
      protocol: caseNumber,
      message: `Processo nº ${caseNumber} autuado eletronicamente e enviado para a fila do Magistrado no Backstage.`,
      case_number: caseNumber
    };
  }

  if (actionId === 'APPROVE_JUDICIAL_SENTENCE_DRAFT') {
    const targetCase = payload.case_number
      ? db.prepare('SELECT * FROM ops_tj_lawsuits WHERE case_number = ?').get(payload.case_number)
      : db
          .prepare("SELECT * FROM ops_tj_lawsuits WHERE status = 'AGUARDANDO_HOMOLOGACAO_MAGISTRADO' ORDER BY created_at ASC LIMIT 1")
          .get();

    if (!targetCase) {
      return {
        actionId,
        protocol: 'N/A',
        message: 'Não há minutas pendentes de homologação na fila do Gabinete no momento.'
      };
    }

    const sig = `ed25519:${crypto.createHash('sha256').update(`${targetCase.case_number}:${actorNid}:${now}`).digest('hex').slice(0, 40)}`;
    db.prepare(`
      UPDATE ops_tj_lawsuits
      SET status = 'SENTENCA_HOMOLOGADA', ed25519_Decision_hash = ?, updated_at = ?
      WHERE case_number = ?
    `).run(sig, now, targetCase.case_number);

    return {
      actionId,
      protocol: targetCase.case_number,
      message: `Sentença do processo ${targetCase.case_number} homologada e assinada digitalmente (${sig}).`
    };
  }

  return {
    actionId,
    protocol: `TJ-${Date.now()}`,
    message: `Ação ${actionId} processada pelo módulo justice-court-tj.`
  };
}

export async function handleAgentTurn({
  profile,
  message,
  lang = 'pt-BR',
  db,
  citizenPortalUrl = 'https://novatlantis-citizen-portal-wpahcxvhuq-uc.a.run.app',
  govBackstageUrl = 'https://novatlantis-gov-backstage-wpahcxvhuq-uc.a.run.app'
}) {
  initDatabase(db);
  const isAuthenticated = Boolean(profile && profile.citizen_id);
  const delegatedAgent = 'agent-justice-court-tj-v1 (Tribunal de Justiça Digital & Juizado Especial IA)';

  const citations = [
    {
      id: 1,
      agency:
        lang === 'en-US'
          ? 'State Court of Justice & Digital Small Claims Court (TJ-NV)'
          : lang === 'es-419'
          ? 'Tribunal de Justicia Estatal y Juzgado Especial Digital (TJ-NV)'
          : 'Tribunal de Justiça Estadual & Juizado Especial Digital (TJ-NV)',
      title:
        lang === 'en-US'
          ? 'Electronic Case Processing Charter & AI Jurisprudence Precedents'
          : lang === 'es-419'
          ? 'Carta de Procesamiento Judicial Electrónico y Precedentes de IA'
          : 'Regimento de Processamento Eletrônico (e-Proc IA) & Súmulas Vinculantes',
      url: `${citizenPortalUrl}?tab=justice_court_tj`
    },
    {
      id: 2,
      agency: 'Gabinete da Magistratura (Government Backstage)',
      title: 'Fila de Admissibilidade e Minutas de Sentença Assistidas por IA',
      url: `${govBackstageUrl}`
    }
  ];

  const serviceRequestAction = {
    requires_auth: !isAuthenticated,
    service_id: 'OPEN_JUSTICE_COURT_TJ',
    service_title:
      lang === 'en-US'
        ? 'Issue Judicial Certificate or File Small Claims Action (TJ)'
        : lang === 'es-419'
        ? 'Emitir Certificado Judicial o Presentar Demanda en el Juzgado (TJ)'
        : 'Emitir Certidão Judicial ou Protocolar Ação no Juizado Especial (TJ)',
    service_description:
      lang === 'en-US'
        ? 'Checks court cases under your NID, issues an Ed25519 Judicial Clearance Certificate, or files a digital claim.'
        : lang === 'es-419'
        ? 'Consulta procesos bajo su NID, emite Certificado Judicial Ed25519 o registra una petición en el Juzgado Especial.'
        : 'Consulta processos vinculados ao seu NID, emite Certidão Negativa Judicial Ed25519 ou autua petição no Juizado Especial.',
    service_prompt:
      lang === 'en-US'
        ? `Execute at the Court of Justice: ${message}`
        : lang === 'es-419'
        ? `Ejecutar en el Tribunal de Justicia: ${message}`
        : `Executar no Tribunal de Justiça: ${message}`,
    target_portal: 'citizen-portal',
    target_tab: 'justice_court_tj'
  };

  if (!isAuthenticated) {
    const reply =
      lang === 'en-US'
        ? `⚖️ **Digital Court of Justice & AI Small Claims (Pluggable Module \`justice-court-tj\`) [1][2]:**\n\n` +
          `The **State Court of Justice** is natively coupled to the Novatlantis Portal API and offers:\n` +
          `• **Unified Case Lookup & AI Summary:** Instant translation of legal terms ("juridiquês") into plain citizen language.\n` +
          `• **Instant Judicial Clearance Certificate:** Signed with your sovereign Ed25519 key.\n` +
          `• **AI Small Claims Court (Juizado Especial):** Automated triage, precedent matching, and routing to the **Magistrate Backstage** [2].\n\n` +
          `Click the button below to sign in with your **NID** and execute this judicial service now.`
        : lang === 'es-419'
        ? `⚖️ **Tribunal de Justicia Digital y Juzgado Especial IA (Módulo Plugable \`justice-court-tj\`) [1][2]:**\n\n` +
          `El **Tribunal de Justicia** está acoplado nativamente a la API del Portal Novatlantis y ofrece:\n` +
          `• **Consulta Procesal Unificada y Resumen IA:** Traducción inmediata del lenguaje jurídico al lenguaje ciudadano.\n` +
          `• **Certificado Judicial Instantáneo (Nada Consta):** Firmado criptográficamente con Ed25519.\n` +
          `• **Juzgado Especial Digital:** Triaje automático por IA y envío directo al **Gabinete del Magistrado en el Backstage** [2].\n\n` +
          `Haga clic en el botón abajo para autenticar su **NID** y ejecutar este servicio judicial ahora.`
        : `⚖️ **Tribunal de Justiça Digital & Juizado Especial IA (Módulo Plugado \`justice-court-tj\`) [1][2]:**\n\n` +
          `O **Tribunal de Justiça Estadual** está acoplado de forma transparente à API do Portal Novatlantis e oferece:\n` +
          `• **Consulta Processual Unificada & Tradução do "Juridiquês":** Acompanhamento em tempo real dos seus processos com explicação simples por IA.\n` +
          `• **Emissão Instantânea de Certidão Negativa Judicial (Nada Consta):** Assinada com chave criptográfica Ed25519.\n` +
          `• **Peticionamento no Juizado Especial Digital:** A IA organiza os fatos, localiza a súmula aplicável e despacha para homologação do juiz no **Gabinete do Magistrado (Backstage)** [2].\n\n` +
          `Para **consultar seus processos, emitir certidão ou protocolar uma petição em seu nome**, clique no botão abaixo para autenticar seu NID.`;

    return {
      delegatedAgent,
      citations,
      serviceRequestAction,
      executedAction: null,
      reply,
      suggestedLinks: [{ title: 'Abrir Módulo do Tribunal de Justiça no Portal do Cidadão', url: `${citizenPortalUrl}?tab=justice_court_tj` }]
    };
  }

  const lower = String(message || '').toLowerCase();
  const wantsPetition =
    lower.includes('abrir') ||
    lower.includes('petição') ||
    lower.includes('peticao') ||
    lower.includes('protocolar') ||
    lower.includes('ação') ||
    lower.includes('acao') ||
    lower.includes('juizado') ||
    lower.includes('reclamação');

  if (wantsPetition) {
    const actionRes = await executeAction({
      actionId: 'FILE_SMALL_CLAIMS_PETITION',
      payload: {
        subject: 'Tutela Rápida — Juizado Especial Cível & Digital',
        description: message
      },
      citizen: profile,
      lang,
      db
    });

    const executedAction = {
      type: 'TJ_SMALL_CLAIMS_PETITION_FILED',
      protocol: actionRes.protocol,
      summary: `Processo Eletrônico ${actionRes.protocol} autuado no Tribunal de Justiça Digital e enviado ao Gabinete do Magistrado.`
    };

    const reply =
      `⚖️ **Petição Eletrônica Autuada no Tribunal de Justiça (\`${actionRes.protocol}\`) [1][2]:**\n\n` +
      `• **Autor(a):** ${profile.full_name} (\`${profile.citizen_id}\`)\n` +
      `• **Órgão Julgador:** 1ª Vara do Juizado Especial Cível & Digital — Colina da Justiça\n` +
      `• **Análise Preliminar por IA:** Petição recebida, enquadrada na Súmula TJ-NV nº 14 e minuta de decisão encaminhada para homologação da **Juíza Dra. Clara Sterling** no **Backstage da Magistratura** [2].`;

    return {
      delegatedAgent,
      citations,
      serviceRequestAction,
      executedAction,
      reply,
      suggestedLinks: [
        {
          title: 'Acompanhar Processo na Aba Tribunal de Justiça',
          url: `${citizenPortalUrl}?nid=${encodeURIComponent(profile.citizen_id)}&tab=justice_court_tj`
        }
      ]
    };
  }

  const certRes = await executeAction({
    actionId: 'ISSUE_JUDICIAL_CLEARANCE_CERT',
    payload: {},
    citizen: profile,
    lang,
    db
  });

  const citizenCases = db
    .prepare('SELECT case_number, subject_matter, status FROM ops_tj_lawsuits WHERE plaintiff_nid = ?')
    .all(profile.citizen_id);

  const casesSummary =
    citizenCases.length > 0
      ? citizenCases.map((c) => `\`${c.case_number}\` (${c.subject_matter} — *${c.status}*)`).join(' • ')
      : 'Nenhum processo litigioso pendente';

  const executedAction = {
    type: 'TJ_JUDICIAL_CERTIFICATE_AND_LOOKUP',
    protocol: certRes.protocol,
    summary: `Consulta processual concluída e Certidão Judicial ${certRes.protocol} emitida com assinatura Ed25519.`
  };

  const reply =
    `⚖️ **Consulta Processual & Certidão do Tribunal de Justiça (\`${certRes.protocol}\`) [1][2]:**\n\n` +
    `• **Jurisdicionado(a):** ${profile.full_name} (\`${profile.citizen_id}\`)\n` +
    `• **Processos Vinculados ao NID:** ${casesSummary}\n` +
    `• **Certidão Negativa / Nada Consta Emitida:** \`${certRes.protocol}\` (Assinatura \`${certRes.certificate.signature}\`)\n` +
    `• **Integração Portal:** Acesse a aba **Tribunal de Justiça Digital** no Portal do Cidadão para visualizar os autos completos ou peticionar no Juizado Especial.`;

  return {
    delegatedAgent,
    citations,
    serviceRequestAction,
    executedAction,
    reply,
    suggestedLinks: [
      {
        title: 'Ver Autos e Certidões no Portal do Cidadão',
        url: `${citizenPortalUrl}?nid=${encodeURIComponent(profile.citizen_id)}&tab=justice_court_tj`
      }
    ]
  };
}
