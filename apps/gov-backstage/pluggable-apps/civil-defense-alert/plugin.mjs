const EXTERNAL_URL = 'https://civil-defense-alert-862675300045.us-central1.run.app/';
const FEDERATED_SUBDOMAIN = 'defesacivil';

export async function initDatabase() {}

export async function getCitizenView(_db, { lang = 'pt-BR' }) {
  return {
    appId: 'civil-defense-alert',
    mode: 'citizen',
    lang,
    externalTargetUrl: EXTERNAL_URL,
    federatedSubdomain: FEDERATED_SUBDOMAIN,
    kpis: [
      { label: 'Estações Online', value: '42 / 42', status: 'ONLINE' },
      { label: 'Bacias em Atenção', value: '1 (Vale das Águas)', status: 'WARNING' },
      { label: 'Abrigos Prontos', value: '18 Unidades', status: 'VERIFIED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'Defesa Civil & Alerta Climático Nacional',
        description:
          'Telemetria hidrológica em tempo real, alertas preventivos via Cell Broadcast 5G e mapa de ocupação de abrigos municipais.',
        type: 'cards',
        items: [
          {
            id: 'DEF-ALERT-01',
            title: 'Vale das Águas — Rio Atlântico Sul (Alerta Laranja)',
            subtitle: 'Nível atual: 4,82m (Cota de atenção: 4,50m) • Abrigo: Ginásio Municipal Vale das Águas',
            badge: 'ORANGE_WARNING',
            status: 'ORANGE_WARNING',
            meta: EXTERNAL_URL,
            externalUrl: EXTERNAL_URL,
            federatedUrl: EXTERNAL_URL
          },
          {
            id: 'DEF-ALERT-02',
            title: 'Serra Norte — Encosta Setor 4 (Vigilância Amarela)',
            subtitle: 'Acumulado 24h: 88mm • Equipes geotécnicas em vistoria preventiva',
            badge: 'YELLOW_WATCH',
            status: 'YELLOW_WATCH',
            meta: EXTERNAL_URL,
            externalUrl: EXTERNAL_URL,
            federatedUrl: EXTERNAL_URL
          }
        ]
      }
    ]
  };
}

export async function getBackstageView(db, { lang = 'pt-BR' }) {
  return getCitizenView(db, { lang });
}

export async function handleAgentIntent(_db, { lang = 'pt-BR' } = {}) {
  const protocol = `DEF-2026-${Date.now().toString().slice(-5)}`;
  const reply =
    lang === 'en-US'
      ? `**National Civil Defense — Active Situation Report (\`${protocol}\`)**\n` +
        `• **Vale das Águas (South Atlantic River):** Orange Warning (4.82m vs 4.50m threshold). Preventive shelter open at Municipal Gymnasium (68% occupancy).\n` +
        `• **Serra Norte (Sector 4 Slope):** Yellow Watch (88mm rainfall in 24h).\n\n` +
        `• **Live Telemetry Dashboard:** ${EXTERNAL_URL}`
      : `**Defesa Civil Nacional — Boletim Hidrológico Ativo (\`${protocol}\`)**\n` +
        `• **Vale das Águas (Rio Atlântico Sul):** Alerta Laranja (4,82m vs cota de 4,50m). Abrigo preventivo aberto no Ginásio Municipal (68% de ocupação).\n` +
        `• **Serra Norte (Encosta Setor 4):** Vigilância Amarela (88mm em 24h).\n\n` +
        `• **Painel de Telemetria ao Vivo:** ${EXTERNAL_URL}`;

  return {
    intent: 'CIVIL_DEFENSE_CLIMATE_ALERT',
    delegated_agent: 'agent-civil-defense-alert',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Boletim hidrológico e mapa de abrigos da Defesa Civil',
      external_url: EXTERNAL_URL,
      federated_domain: EXTERNAL_URL
    },
    response: reply
  };
}
