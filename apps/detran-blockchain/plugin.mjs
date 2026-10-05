const EXTERNAL_URL = 'https://material.136.81.200.203.nip.io/pn44detran';
const FEDERATED_SUBDOMAIN = 'detran';

export async function initDatabase() {}

export async function getCitizenView(_db, { lang = 'pt-BR' }) {
  return {
    appId: 'detran-blockchain',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Órgão', value: 'DETRAN', status: 'ONLINE' },
      { label: 'Validação', value: 'Blockchain', status: 'IMMUTABLE' },
      { label: 'Subdomínio', value: 'detran.gov.novatlantis.cloud', status: 'VERIFIED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'PN44 DETRAN — Legislação em Blockchain',
        description: 'Consulta pública de portarias e normas de trânsito com validação criptográfica em Blockchain.',
        type: 'cards',
        items: [
          {
            id: 'DETRAN-APP',
            title: 'Acessar PN44 DETRAN',
            subtitle: 'Base Normativa Verificada',
            badge: 'ONLINE',
            status: 'ONLINE',
            meta: 'https://detran.gov.novatlantis.cloud',
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://detran.gov.novatlantis.cloud'
          }
        ]
      }
    ]
  };
}

export async function getBackstageView(db, { lang = 'pt-BR' }) {
  return getCitizenView(db, { lang });
}

export async function handleAgentIntent() {
  const protocol = `DETRAN-CHAIN-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'DETRAN_BLOCKCHAIN_FEDERATED_LAUNCH',
    delegated_agent: 'agent-detran-blockchain',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso ao PN44 DETRAN',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://detran.gov.novatlantis.cloud'
    },
    response:
      `**PN44 DETRAN — Legislação em Blockchain:**\n` +
      `Consulta de portarias e resoluções de trânsito com registro imutável em Blockchain.\n\n` +
      `• **Acesso:** https://detran.gov.novatlantis.cloud`
  };
}
