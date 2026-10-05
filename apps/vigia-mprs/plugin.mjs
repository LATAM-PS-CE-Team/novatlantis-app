const EXTERNAL_URL = 'https://vigia-ia-demo-633153854135.southamerica-east1.run.app/#/visao-geral';
const FEDERATED_SUBDOMAIN = 'vigia';

export async function initDatabase() {}

export async function getCitizenView(_db, { nid, lang = 'pt-BR' }) {
  return {
    appId: 'vigia-mprs',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Nó Federado Argolis', value: 'mprs-cpsi (@jopoco)', status: 'ONLINE' },
      { label: 'Desafio CPSI 01/2026', value: 'Desafio 41 • Jurimetria', status: 'ACTIVE' },
      { label: 'Domínio Soberano', value: 'vigia.gov.novatlantis.cloud', status: 'VERIFIED' },
      { label: 'Custo de Computação', value: 'Descentralizado (CE Argolis)', status: 'OPTIMIZED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'Vigia.ia — Inteligência de Tutela Coletiva · MPRS (MVP Demo)',
        description: `Plataforma de jurimetria extrajudicial construída por João Thiago Poço (@jopoco) no projeto Argolis mprs-cpsi e acoplada ao Portal Novatlantis.`,
        type: 'cards',
        items: [
          {
            id: 'CARD-VIGIA-1',
            title: 'Abrir Plataforma Vigia.ia (Visão Geral & Jurimetria)',
            subtitle: 'Hospedado em southamerica-east1 (mprs-cpsi) • Faturamento isolado na conta do CE',
            badge: 'ACESSO DIRETO • CLOUD RUN FEDERADO',
            status: 'ONLINE',
            meta: EXTERNAL_URL,
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://vigia.gov.novatlantis.cloud'
          }
        ]
      }
    ]
  };
}

export async function getBackstageView(db, { lang = 'pt-BR' }) {
  return getCitizenView(db, { nid: 'BACKSTAGE', lang });
}

export async function handleAgentIntent(_db, { nid, citizenName }) {
  const protocol = `MPRS-VIGIA-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'MPRS_VIGIA_FEDERATED_LAUNCH',
    delegated_agent: 'agent-vigia-mprs-v1 (Vigia.ia — Inteligência de Tutela Coletiva MPRS)',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso Federado ao Observatório Vigia.ia (MPRS) liberado',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://vigia.gov.novatlantis.cloud',
      details: {
        owner_ce: '@jopoco (João Thiago Poço)',
        gcp_project: 'mprs-cpsi (633153854135)',
        region: 'southamerica-east1',
        citizen: citizenName || nid || 'Cidadão / Promotor'
      }
    },
    response:
      `Localizei o módulo federado **Vigia.ia — Inteligência de Tutela Coletiva & Jurimetria Extrajudicial (MPRS)** (Protocolo \`${protocol}\`), mantido por **@jopoco** no projeto Argolis \`mprs-cpsi\`:\n\n` +
      `• **Objetivo:** Jurimetria extrajudicial do Desafio 41 do CPSI 01/2026 com Google Cloud.\n` +
      `• **Acesso pelo Domínio Novatlantis:** https://vigia.gov.novatlantis.cloud\n` +
      `• **Link Direto Cloud Run (Origem CE):** ${EXTERNAL_URL}`
  };
}
