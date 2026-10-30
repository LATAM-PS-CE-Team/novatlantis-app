export function initDatabase(db) {
  // Inicialize tabelas locais do módulo aqui
}

export async function getViewData({ mode, citizen }) {
  return {
    title: 'Registro Vehicular',
    subtitle: 'REPUVE',
    kpis: [
      { label: 'Status', value: 'ONLINE' },
      { label: 'Perfil', value: mode.toUpperCase(), helper: citizen?.citizen_id || 'Visitante' }
    ],
    actions: [
      {
        actionId: 'EXECUTE_DEFAULT_ACTION',
        label: 'Solicitar Atendimento',
        description: 'Gera protocolo de atendimento.'
      }
    ],
    records: []
  };
}

export async function executeAction({ actionId, citizen }) {
  const protocol = 'REPUVE-' + Date.now();
  return {
    actionId,
    protocol,
    message: `Protocolo ${protocol} registrado para ${citizen?.full_name || 'Cidadão'}.`
  };
}

export async function handleAgentTurn({ profile, message, citizenPortalUrl }) {
  const isAuthenticated = Boolean(profile?.citizen_id);
  const protocol = 'REPUVE-' + Date.now();
  return {
    delegatedAgent: 'agent-repuve-v1 (Registro Vehicular)',
    citations: [{ id: 1, agency: 'REPUVE', title: 'Registro Vehicular', url: `${citizenPortalUrl}?tab=repuve` }],
    serviceRequestAction: {
      requires_auth: !isAuthenticated,
      service_id: 'OPEN_REPUVE',
      service_title: 'Registro Vehicular',
      service_description: 'REPUVE',
      service_prompt: message,
      target_portal: 'citizen-portal',
      target_tab: 'repuve'
    },
    executedAction: isAuthenticated
      ? { type: 'REPUVE_EXECUTED', protocol, summary: `Atendimento ${protocol} concluído.` }
      : null,
    reply: isAuthenticated
      ? `✅ **Registro Vehicular (${protocol}):** Solicitação processada para ${profile.full_name} (${profile.citizen_id}).`
      : `🏛️ **Registro Vehicular:** Entre com seu NID para solicitar este serviço.`,
    suggestedLinks: [{ title: 'Abrir no Portal do Cidadão', url: `${citizenPortalUrl}?tab=repuve` }]
  };
}
