const EXTERNAL_URL = 'https://multaexec-ia-demo-633153854135.southamerica-east1.run.app/#/dashboard';
const FEDERATED_SUBDOMAIN = 'multaexec';

export async function initDatabase() {}

export async function getCitizenView(_db, { lang = 'pt-BR' }) {
  return {
    appId: 'multaexec-mprs',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Órgão', value: 'MPRS', status: 'ONLINE' },
      { label: 'Região', value: 'southamerica-east1', status: 'ACTIVE' },
      { label: 'Subdomínio', value: 'multaexec.gov.novatlantis.cloud', status: 'VERIFIED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'MultaExec.IA — Execução de Pena de Multa (MPRS)',
        description: 'Sistema de cálculo, consulta patrimonial e automação de peças para execução de pena de multa.',
        type: 'cards',
        items: [
          {
            id: 'MULTAEXEC-APP',
            title: 'Acessar MultaExec.IA',
            subtitle: 'Ministério Público Estadual (MPRS)',
            badge: 'ONLINE',
            status: 'ONLINE',
            meta: 'https://multaexec.gov.novatlantis.cloud',
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://multaexec.gov.novatlantis.cloud'
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
  const protocol = `MPRS-MULTA-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'MPRS_MULTAEXEC_FEDERATED_LAUNCH',
    delegated_agent: 'agent-multaexec-mprs',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso ao MultaExec.IA (MPRS)',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://multaexec.gov.novatlantis.cloud'
    },
    response:
      `**MultaExec.IA — Execução de Pena de Multa (MPRS):**\n` +
      `Plataforma para cálculo de multas criminais, triagem patrimonial e geração de petições.\n\n` +
      `• **Acesso:** https://multaexec.gov.novatlantis.cloud`
  };
}
