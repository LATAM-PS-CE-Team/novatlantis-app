const EXTERNAL_URL = 'https://geo-engine-app-345748407347.us-central1.run.app/';
const FEDERATED_SUBDOMAIN = 'geo';

export async function initDatabase() {}

export async function getCitizenView(_db, { lang = 'pt-BR' }) {
  return {
    appId: 'geo-engine-car',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Área', value: 'Meio Ambiente', status: 'ONLINE' },
      { label: 'Motor', value: 'Earth Engine', status: 'ACTIVE' },
      { label: 'Subdomínio', value: 'geo.gov.novatlantis.cloud', status: 'VERIFIED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'GeoEngine CAR — Cadastro Ambiental Rural',
        description: 'Análise geoespacial de propriedades rurais, reserva legal e cobertura vegetal por satélite.',
        type: 'cards',
        items: [
          {
            id: 'GEO-APP',
            title: 'Acessar GeoEngine CAR',
            subtitle: 'Monitoramento Ambiental por Satélite',
            badge: 'ONLINE',
            status: 'ONLINE',
            meta: 'https://geo.gov.novatlantis.cloud',
            externalUrl: EXTERNAL_URL,
            federatedUrl: 'https://geo.gov.novatlantis.cloud'
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
  const protocol = `GEO-CAR-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'GEO_ENGINE_CAR_FEDERATED_LAUNCH',
    delegated_agent: 'agent-geo-engine-car',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso ao GeoEngine CAR',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://geo.gov.novatlantis.cloud'
    },
    response:
      `**GeoEngine CAR — Cadastro Ambiental Rural:**\n` +
      `Validação geoespacial de propriedades rurais e cobertura vegetal por imagens de satélite.\n\n` +
      `• **Acesso:** https://geo.gov.novatlantis.cloud`
  };
}
