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
      { label: 'Nó Federado Argolis', value: 'Conta @ernani (136.81.200.203)', status: 'ONLINE' },
      { label: 'Auditoria Normativa', value: 'Blockchain + IA', status: 'IMMUTABLE' },
      { label: 'Domínio Soberano', value: 'detran.gov.novatlantis.cloud', status: 'VERIFIED' },
      { label: 'Custo de Computação', value: 'Descentralizado (CE Argolis)', status: 'OPTIMIZED' }
    ],
    sections: [
      {
        id: 'federated_launch',
        title: 'Normas.gov & PN44 DETRAN — Legislação Validada e Registrada em Blockchain',
        description: `Demonstração construída por @ernani onde toda a legislação e portarias do DETRAN são validadas e registradas em Blockchain.`,
        type: 'cards',
        items: [
          {
            id: 'CARD-DETRAN-1',
            title: 'Abrir Plataforma PN44 DETRAN (Legislação em Blockchain)',
            subtitle: 'Hospedado em 136.81.200.203 • Faturamento isolado na conta do CE',
            badge: 'ACESSO DIRETO • BLOCKCHAIN FEDERADO',
            status: 'ONLINE',
            meta: EXTERNAL_URL,
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

export async function handleAgentIntent(_db, { nid, citizenName }) {
  const protocol = `DETRAN-CHAIN-${Date.now().toString().slice(-6)}`;
  return {
    intent: 'DETRAN_BLOCKCHAIN_FEDERATED_LAUNCH',
    delegated_agent: 'agent-detran-blockchain-v1 (Normas.gov & PN44 DETRAN Blockchain)',
    source_document: EXTERNAL_URL,
    executed_action: {
      type: 'FEDERATED_REDIRECT_READY',
      protocol,
      summary: 'Acesso Federado ao portal PN44 DETRAN Blockchain liberado',
      external_url: EXTERNAL_URL,
      federated_domain: 'https://detran.gov.novatlantis.cloud',
      details: {
        owner_ce: '@ernani',
        endpoint: EXTERNAL_URL,
        citizen: citizenName || nid || 'Cidadão / Auditor'
      }
    },
    response:
      `Localizei o módulo federado **Normas.gov & PN44 DETRAN — Legislação Validada em Blockchain** (Protocolo \`${protocol}\`), mantido por **@ernani**:\n\n` +
      `• **Objetivo:** Consolidação normativa onde toda a legislação é validada e registrada de forma imutável em Blockchain.\n` +
      `• **Acesso pelo Domínio Novatlantis:** https://detran.gov.novatlantis.cloud\n` +
      `• **Link Direto (Origem CE):** ${EXTERNAL_URL}`
  };
}
