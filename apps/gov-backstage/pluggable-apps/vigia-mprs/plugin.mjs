const EXTERNAL_URL = 'https://vigia-ia-demo-633153854135.southamerica-east1.run.app/#/visao-geral';
const FEDERATED_SUBDOMAIN = 'vigia';

export async function initDatabase() {}

export async function getCitizenView(_db, { lang = 'pt-BR' }) {
  return {
    appId: 'vigia-mprs',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Órgão', value: 'MPRS', status: 'ONLINE' },
      { label: 'Escopo', value: 'Tutela Coletiva', status: 'ACTIVE' },
      { label: 'Subdomínio', value: 'vigia.gov.novatlantis.cloud', status: 'VERIFIED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'Vigia.ia — Tutela Coletiva e Jurimetria (MPRS)',
        description: 'Painel de jurimetria extrajudicial e acompanhamento de inquéritos civis.',
        type: 'cards',
        items: [
          {
            id: 'VIGIA-APP',
            title: 'Acessar Vigia.ia',
            subtitle: 'Ministério Público Estadual (MPRS)',
            badge: 'ONLINE',
            status: 'ONLINE',
            meta: 'https://vigia.gov.novatlantis.cloud',
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://vigia.gov.novatlantis.cloud'
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
  const protocol = `MPRS-VIGIA-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'MPRS_VIGIA_FEDERATED_LAUNCH',
    delegated_agent: 'agent-vigia-mprs',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso ao Vigia.ia (MPRS)',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://vigia.gov.novatlantis.cloud'
    },
    response:
      `**Vigia.ia — Tutela Coletiva e Jurimetria (MPRS):**\n` +
      `Painel de análise de inquéritos civis e detecção de demandas coletivas.\n\n` +
      `• **Acesso:** https://vigia.gov.novatlantis.cloud`
  };
}
