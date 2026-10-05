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
      '1ª Vara do Juizado Especial Cível',
      'Direito do Consumidor',
      'Ressarcimento por interrupção de serviço residencial acima do prazo contratual.',
      'Súmula TJ nº 14: Interrupção superior a 4h gera abatimento proporcional na fatura.',
      'Julgo procedente o pedido para determinar o crédito de 150 NVC.',
      'NID-000-0000-0009-4',
      'Dra. Clara Sterling',
      'AGUARDANDO_DECISAO',
      null,
      '2026-10-01T10:20:00Z',
      '2026-10-01T10:25:00Z'
    );
    ins.run(
      '0009104-12.2026.8.26.0001',
      'NID-000-0000-0001-9',
      'Joao Thiago Poço (JT)',
      'Vara da Fazenda Pública',
      'Regulamentação de Serviços Públicos Digitais',
      'Validação de conformidade de serviços eletrônicos estaduais.',
      'Requisitos técnicos e legais atendidos conforme Art. 12.',
      'Homologo o parecer técnico de conformidade.',
      'NID-000-0000-0009-4',
      'Dra. Clara Sterling',
      'JULGADO',
      'ed25519:9f84b2c71a0e3d4f8812a6c90b1d4e7f2a3c5b6d',
      '2026-09-29T14:00:00Z',
      '2026-09-30T09:15:00Z'
    );
  }
}

export async function getViewData({ mode, citizen, db }) {
  initDatabase(db);

  const allCases = db.prepare('SELECT * FROM ops_tj_lawsuits ORDER BY created_at DESC LIMIT 25').all();
  const citizenNid = citizen?.citizen_id || citizen?.nid || null;
  const citizenCases = citizenNid
    ? db.prepare('SELECT * FROM ops_tj_lawsuits WHERE plaintiff_nid = ? ORDER BY created_at DESC').all(citizenNid)
    : allCases.slice(0, 5);
  const citizenCerts = citizenNid
    ? db.prepare('SELECT * FROM ops_tj_certificates WHERE citizen_nid = ? ORDER BY issued_at DESC').all(citizenNid)
    : [];

  const pendingCount = allCases.filter((c) => c.status !== 'JULGADO' && c.status !== 'SENTENCA_HOMOLOGADA').length;
  const sentencedCount = allCases.length - pendingCount;

  if (mode === 'backstage') {
    return {
      title: 'Tribunal de Justiça — Fila do Gabinete',
      subtitle: 'Processos distribuídos e minutas pendentes de assinatura.',
      kpis: [
        { label: 'Total na Fila', value: String(allCases.length) },
        { label: 'Pendentes de Decisão', value: String(pendingCount) },
        { label: 'Julgados', value: String(sentencedCount) }
      ],
      actions: [
        {
          actionId: 'APPROVE_JUDICIAL_SENTENCE_DRAFT',
          label: 'Assinar próxima decisão pendente'
        },
        {
          actionId: 'FILE_SMALL_CLAIMS_PETITION',
          label: 'Registrar processo de teste'
        }
      ],
      records: allCases.map((c) => ({
        id: c.case_number,
        primary: `${c.case_number} • ${c.subject_matter}`,
        secondary: `Parte: ${c.plaintiff_name} (${c.plaintiff_nid}) • ${c.court_branch}`,
        detail: `${c.ai_jurisprudence_analysis} — Minuta: ${c.ai_draft_sentence}`,
        status: c.status
      }))
    };
  }

  return {
    title: 'Tribunal de Justiça',
    subtitle: 'Consulte processos vinculados ao seu NID, emita certidão negativa ou registre uma petição.',
    kpis: [
      { label: 'Meus Processos', value: String(citizenCases.length) },
      { label: 'Certidões Emitidas', value: String(citizenCerts.length) },
      { label: 'Atendimento', value: 'Juizado Cível' }
    ],
    actions: [
      {
        actionId: 'ISSUE_JUDICIAL_CLEARANCE_CERT',
        label: 'Emitir Certidão Negativa'
      },
      {
        actionId: 'FILE_SMALL_CLAIMS_PETITION',
        label: 'Nova Petição no Juizado'
      }
    ],
    records: [
      ...citizenCases.map((c) => ({
        id: c.case_number,
        primary: `Processo ${c.case_number} — ${c.subject_matter}`,
        secondary: `${c.court_branch} • Relatoria: ${c.assigned_judge_name}`,
        detail: c.claim_summary,
        status: c.status
      })),
      ...citizenCerts.map((cert) => ({
        id: cert.cert_id,
        primary: `Certidão ${cert.cert_id} (${cert.cert_type})`,
        secondary: `Titular: ${cert.citizen_name} • Emitida em ${cert.issued_at}`,
        detail: `Código: ${cert.ed25519_signature}`,
        status: cert.status
      }))
    ]
  };
}

export async function executeAction({ actionId, payload = {}, citizen, db }) {
  initDatabase(db);
  const now = new Date().toISOString();
  const actorNid = citizen?.citizen_id || citizen?.nid || payload.nid || 'NID-000-0000-0001-9';
  const actorName = citizen?.full_name || payload.citizen_name || 'Joao Thiago Poço (JT)';

  if (actionId === 'ISSUE_JUDICIAL_CLEARANCE_CERT') {
    const certId = `CERT-TJ-2026-${Math.floor(10000 + Math.random() * 89999)}`;
    const sig = `ed25519:${crypto.createHash('sha256').update(`${certId}:${actorNid}:${now}`).digest('hex').slice(0, 24)}`;
    const validUntil = new Date(Date.now() + 90 * 86400_000).toISOString();

    db.prepare(`INSERT INTO ops_tj_certificates VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      certId,
      actorNid,
      actorName,
      'Certidão Negativa Cível e Criminal',
      'VÁLIDA',
      sig,
      now,
      validUntil
    );

    return {
      actionId,
      protocol: certId,
      message: `Certidão ${certId} emitida para ${actorName}.`,
      certificate: { cert_id: certId, citizen_nid: actorNid, citizen_name: actorName, signature: sig, issued_at: now }
    };
  }

  if (actionId === 'FILE_SMALL_CLAIMS_PETITION') {
    const seq = Math.floor(1000000 + Math.random() * 8999999);
    const caseNumber = `${seq}-44.2026.8.26.0001`;
    const subject = payload.subject || 'Direito do Consumidor';
    const description = payload.description || 'Pedido registrado pelo Portal do Cidadão.';

    db.prepare(`INSERT INTO ops_tj_lawsuits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      caseNumber,
      actorNid,
      actorName,
      '1ª Vara do Juizado Especial Cível',
      subject,
      description,
      'Enquadramento preliminar no rito sumaríssimo.',
      'Intime-se a parte requerida para manifestação em 24h.',
      'NID-000-0000-0009-4',
      'Dra. Clara Sterling',
      'AGUARDANDO_DECISAO',
      null,
      now,
      now
    );

    return {
      actionId,
      protocol: caseNumber,
      message: `Processo nº ${caseNumber} protocolado.`,
      case_number: caseNumber
    };
  }

  if (actionId === 'APPROVE_JUDICIAL_SENTENCE_DRAFT') {
    const targetCase = payload.case_number
      ? db.prepare('SELECT * FROM ops_tj_lawsuits WHERE case_number = ?').get(payload.case_number)
      : db
          .prepare("SELECT * FROM ops_tj_lawsuits WHERE status NOT IN ('JULGADO', 'SENTENCA_HOMOLOGADA') ORDER BY created_at ASC LIMIT 1")
          .get();

    if (!targetCase) {
      return {
        actionId,
        protocol: 'N/A',
        message: 'Não há processos pendentes de assinatura na fila.'
      };
    }

    const sig = `ed25519:${crypto.createHash('sha256').update(`${targetCase.case_number}:${actorNid}:${now}`).digest('hex').slice(0, 24)}`;
    db.prepare(`
      UPDATE ops_tj_lawsuits
      SET status = 'JULGADO', ed25519_Decision_hash = ?, updated_at = ?
      WHERE case_number = ?
    `).run(sig, now, targetCase.case_number);

    return {
      actionId,
      protocol: targetCase.case_number,
      message: `Decisão do processo ${targetCase.case_number} assinada.`
    };
  }

  return {
    actionId,
    protocol: `TJ-${Date.now()}`,
    message: `Solicitação processada.`
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
  const isAuthenticated = Boolean(profile && profile.citizen_id);
  const delegatedAgent = 'agent-justice-court-tj';

  const citations = [
    {
      id: 1,
      agency: 'Tribunal de Justiça',
      title: 'Consulta Processual e Juizado Especial',
      url: `${citizenPortalUrl}?tab=justice_court_tj`
    }
  ];

  const serviceRequestAction = {
    requires_auth: !isAuthenticated,
    service_id: 'OPEN_JUSTICE_COURT_TJ',
    service_title:
      lang === 'en-US'
        ? 'Check Court Cases or Issue Certificate'
        : lang === 'es-419'
        ? 'Consultar Procesos o Emitir Certificado'
        : 'Consultar Processos ou Emitir Certidão',
    service_description:
      lang === 'en-US'
        ? 'View active cases, issue a clearance certificate, or file a claim.'
        : lang === 'es-419'
        ? 'Consulte procesos activos, emita certificado judicial o registre una petición.'
        : 'Consulte processos ativos, emita certidão negativa ou registre uma petição.',
    service_prompt: `Consultar processos no Tribunal de Justiça: ${message}`,
    target_portal: 'citizen-portal',
    target_tab: 'justice_court_tj'
  };

  if (!isAuthenticated) {
    const reply =
      lang === 'en-US'
        ? `Through the **Court of Justice**, you can check active cases, issue a judicial clearance certificate, or file a small claims petition online.\n\nSign in with your NID below to run this service.`
        : lang === 'es-419'
        ? `A través del **Tribunal de Justicia**, puede consultar procesos activos, emitir un certificado de antecedentes o presentar una petición en el Juzgado Especial.\n\nInicie sesión con su NID abajo para continuar.`
        : `Pelo **Tribunal de Justiça**, você pode consultar processos em andamento, emitir certidão negativa (nada consta) ou registrar um pedido no Juizado Especial.\n\nEntre com seu NID abaixo para executar o serviço.`;

    return {
      delegatedAgent,
      citations,
      serviceRequestAction,
      executedAction: null,
      reply,
      suggestedLinks: [{ title: 'Abrir Tribunal de Justiça', url: `${citizenPortalUrl}?tab=justice_court_tj` }]
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
      payload: { subject: 'Juizado Especial Cível', description: message },
      citizen: profile,
      lang,
      db
    });

    return {
      delegatedAgent,
      citations,
      serviceRequestAction,
      executedAction: {
        type: 'TJ_SMALL_CLAIMS_PETITION_FILED',
        protocol: actionRes.protocol,
        summary: `Processo ${actionRes.protocol} protocolado no Juizado Especial.`
      },
      reply: `Petição registrada sob o nº **${actionRes.protocol}** em nome de **${profile.full_name}** e encaminhada à 1ª Vara do Juizado Especial Cível.`,
      suggestedLinks: [
        {
          title: 'Acompanhar no Portal do Cidadão',
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
      ? citizenCases.map((c) => `\`${c.case_number}\` (${c.subject_matter} — ${c.status})`).join(', ')
      : 'Nenhum processo pendente';

  return {
    delegatedAgent,
    citations,
    serviceRequestAction,
    executedAction: {
      type: 'TJ_JUDICIAL_CERTIFICATE_AND_LOOKUP',
      protocol: certRes.protocol,
      summary: `Certidão Judicial ${certRes.protocol} emitida.`
    },
    reply: `**Consulta concluída para ${profile.full_name}:**\n• **Processos:** ${casesSummary}\n• **Certidão Negativa emitida:** \`${certRes.protocol}\``,
    suggestedLinks: [
      {
        title: 'Ver no Portal do Cidadão',
        url: `${citizenPortalUrl}?nid=${encodeURIComponent(profile.citizen_id)}&tab=justice_court_tj`
      }
    ]
  };
}
