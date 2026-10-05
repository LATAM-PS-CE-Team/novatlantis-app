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
      { label: 'Nó Federado Argolis', value: 'Conta @vidotto (345748407347)', status: 'ONLINE' },
      { label: 'Motor Geoespacial', value: 'Earth Engine + Vertex AI', status: 'ACTIVE' },
      { label: 'Domínio Soberano', value: 'geo.gov.novatlantis.cloud', status: 'VERIFIED' },
      { label: 'Custo de Computação', value: 'Descentralizado (CE Argolis)', status: 'OPTIMIZED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'GeoEngine CAR — Inteligência Geoespacial & Cadastro Ambiental Rural',
        description: `Demonstração construída por @vidotto e federada ao Portal Novatlantis.`,
        type: 'cards',
        items: [
          {
            id: 'CARD-GEO-1',
            title: 'Abrir Plataforma GeoEngine CAR (Análise Satelital)',
            subtitle: 'Hospedado em us-central1 (345748407347) • Faturamento isolado na conta do CE',
            badge: 'ACESSO DIRETO • CLOUD RUN FEDERADO',
            status: 'ONLINE',
            meta: EXTERNAL_URL,
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

export async function handleAgentIntent(_db, { nid, citizenName }) {
  const protocol = `GEO-CAR-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'GEO_ENGINE_CAR_FEDERATED_LAUNCH',
    delegated_agent: 'agent-geo-engine-car-v1 (GeoEngine CAR — Inteligência Geoespacial)',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso Federado ao GeoEngine CAR liberado',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://geo.gov.novatlantis.cloud',
      details: {
        owner_ce: '@vidotto',
        gcp_project_number: '345748407347',
        region: 'us-central1',
        citizen: citizenName || nid || 'Analista Ambiental'
      }
    },
    response:
      `Localizei o módulo federado **GeoEngine CAR — Inteligência Geoespacial & Cadastro Ambiental Rural** (Protocolo \`${protocol}\`), mantido por **@vidotto**:\n\n` +
      `• **Objetivo:** Validação automatizada de Cadastro Ambiental Rural (CAR) e cobertura vegetal por satélite.\n` +
      `• **Acesso pelo Domínio Novatlantis:** https://geo.gov.novatlantis.cloud\n` +
      `• **Link Direto Cloud Run (Origem CE):** ${EXTERNAL_URL}`
  };
}
