const EXTERNAL_URL = 'https://multaexec-ia-demo-633153854135.southamerica-east1.run.app/#/dashboard';
const FEDERATED_SUBDOMAIN = 'multaexec';

export async function initDatabase() {}

export async function getCitizenView(_db, { nid, lang = 'pt-BR' }) {
  return {
    appId: 'multaexec-mprs',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Nó Federado Argolis', value: 'mprs-cpsi (@jopoco)', status: 'ONLINE' },
      { label: 'Região Cloud Run', value: 'southamerica-east1 (SP)', status: 'ACTIVE' },
      { label: 'Domínio Soberano', value: 'multaexec.gov.novatlantis.cloud', status: 'VERIFIED' },
      { label: 'Custo de Computação', value: 'Descentralizado (CE Argolis)', status: 'OPTIMIZED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'MultaExec.IA — Execução de Pena de Multa (MPRS × Google Cloud)',
        description: `Demonstração oficial construída por João Thiago Poço (@jopoco) no projeto Argolis mprs-cpsi e federada ao Portal Novatlantis. Acesse diretamente pelo subdomínio oficial https://multaexec.gov.novatlantis.cloud ou pelo Cloud Run de origem.`,
        type: 'cards',
        items: [
          {
            id: 'CARD-MULTAEXEC-1',
            title: 'Abrir Plataforma MultaExec.IA (Dashboard Completo)',
            subtitle: 'Hospedado em southamerica-east1 (mprs-cpsi) • Faturamento isolado na conta do CE',
            badge: 'ACESSO DIRETO • CLOUD RUN FEDERADO',
            status: 'ONLINE',
            meta: EXTERNAL_URL,
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://multaexec.gov.novatlantis.cloud'
          }
        ]
      }
    ]
  };
}

export async function getBackstageView(db, { lang = 'pt-BR' }) {
  return getCitizenView(db, { nid: 'BACKSTAGE', lang });
}

export async function handleAgentIntent(_db, { message, nid, citizenName, lang = 'pt-BR' }) {
  const protocol = `MPRS-MULTA-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'MPRS_MULTAEXEC_FEDERATED_LAUNCH',
    delegated_agent: 'agent-multaexec-mprs-v1 (MultaExec.IA — Ministério Público MPRS)',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso Federado à plataforma MultaExec.IA (MPRS) liberado',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://multaexec.gov.novatlantis.cloud',
      details: {
        owner_ce: '@jopoco (João Thiago Poço)',
        gcp_project: 'mprs-cpsi (633153854135)',
        region: 'southamerica-east1',
        citizen: citizenName || nid || 'Cidadão / Promotor'
      }
    },
    response:
      `Localizei o módulo federado **MultaExec.IA — Execução de Pena de Multa (MPRS × Google Cloud)** (Protocolo \`${protocol}\`), mantido por **@jopoco** no projeto Argolis \`mprs-cpsi\`:\n\n` +
      `• **Objetivo:** Automação da execução de pena de multa criminal, cálculo atualizado, triagem patrimonial e geração assistida de peças com Vertex AI.\n` +
      `• **Acesso pelo Domínio Novatlantis:** https://multaexec.gov.novatlantis.cloud\n` +
      `• **Link Direto Cloud Run (Origem CE):** ${EXTERNAL_URL}`
  };
}
