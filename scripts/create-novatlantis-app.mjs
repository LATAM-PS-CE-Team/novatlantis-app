#!/usr/bin/env node
/**
 * Gerador de Módulos Setoriais — Governo de Novatlantis
 * Uso:
 *   npm run create:app -- --id=sefaz-tributos --title="Administração Tributária" --agency="Secretaria da Fazenda" --owner="SEFAZ"
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const eqIdx = raw.indexOf('=');
    if (eqIdx > 0) {
      args[raw.slice(2, eqIdx)] = raw.slice(eqIdx + 1);
    } else {
      args[raw.slice(2)] = 'true';
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const appId = (args.id || '').trim().toLowerCase();

if (!appId || !/^[a-z0-9-]+$/.test(appId)) {
  console.error('Erro: informe um --id=<slug-do-app> válido (ex.: --id=justice-court-tj ou --id=sefaz-estadual).');
  process.exit(1);
}

const titlePt = args.title || `Módulo Setorial ${appId}`;
const agencyPt = args.agency || 'Secretaria de Estado';
const owner = args.owner || 'Novatlantis';
const sector = args.sector || 'PUBLIC_SECTOR_USE_CASE';
const tabId = appId.replace(/-/g, '_');

const targetDir = path.join(ROOT_DIR, 'apps', appId);
if (fs.existsSync(targetDir)) {
  console.error(`Erro: o diretório apps/${appId} já existe.`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

const manifest = {
  $schema: '../../packages/portal-sdk/schema/novatlantis-app.schema.json',
  appId,
  version: '1.0.0',
  owner,
  sector,
  serviceUrlEnvVar: `${tabId.toUpperCase()}_URL`,
  defaultPort: 8090,
  landingCatalog: {
    enabled: true,
    icon: 'AccountBalance',
    badge: appId.toUpperCase(),
    title: {
      'pt-BR': titlePt,
      'es-419': titlePt,
      'en-US': titlePt
    },
    agency: {
      'pt-BR': agencyPt,
      'es-419': agencyPt,
      'en-US': agencyPt
    },
    description: {
      'pt-BR': `Serviço digital integrado (${agencyPt}).`,
      'es-419': `Servicio digital integrado (${agencyPt}).`,
      'en-US': `Integrated digital service (${agencyPt}).`
    },
    questionPrompt: {
      'pt-BR': `Como utilizar o serviço ${titlePt}?`,
      'es-419': `¿Cómo utilizar el servicio ${titlePt}?`,
      'en-US': `How do I use the ${titlePt} service?`
    },
    servicePrompt: {
      'pt-BR': `Solicitar atendimento em ${titlePt}`,
      'es-419': `Solicitar atención en ${titlePt}`,
      'en-US': `Request service at ${titlePt}`
    }
  },
  agentIntegration: {
    agentId: `agent-${appId}-v1 (${titlePt})`,
    triggerKeywords: appId.split('-').filter((w) => w.length >= 2),
    executeEndpoint: '/api/v1/agent/execute',
    requiresAuthForTransaction: true
  },
  citizenPortalTab: {
    enabled: true,
    tabId,
    title: {
      'pt-BR': titlePt,
      'es-419': titlePt,
      'en-US': titlePt
    },
    subtitle: {
      'pt-BR': agencyPt,
      'es-419': agencyPt,
      'en-US': agencyPt
    },
    uiEntryPath: '/embed/citizen',
    apiBasePath: `/api/v1/apps/${appId}`
  },
  backstageModule: {
    enabled: true,
    moduleId: `${tabId}_backstage`,
    allowedRoles: ['PRIME_MINISTER_ROOT', 'SECRETARY_GENERAL'],
    title: {
      'pt-BR': titlePt,
      'es-419': titlePt,
      'en-US': titlePt
    },
    subtitle: {
      'pt-BR': `Gestão operacional (${agencyPt})`,
      'es-419': `Gestión operativa (${agencyPt})`,
      'en-US': `Operational management (${agencyPt})`
    },
    uiEntryPath: '/embed/backstage'
  }
};

fs.writeFileSync(path.join(targetDir, 'novatlantis.app.json'), JSON.stringify(manifest, null, 2) + '\n');

fs.writeFileSync(
  path.join(targetDir, 'plugin.mjs'),
  `export function initDatabase(db) {
  // Inicialize tabelas locais do módulo aqui
}

export async function getViewData({ mode, citizen }) {
  return {
    title: '${titlePt.replace(/'/g, "\\'")}',
    subtitle: '${agencyPt.replace(/'/g, "\\'")}',
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
  const protocol = '${appId.toUpperCase()}-' + Date.now();
  return {
    actionId,
    protocol,
    message: \`Protocolo \${protocol} registrado para \${citizen?.full_name || 'Cidadão'}.\`
  };
}

export async function handleAgentTurn({ profile, message, citizenPortalUrl }) {
  const isAuthenticated = Boolean(profile?.citizen_id);
  const protocol = '${appId.toUpperCase()}-' + Date.now();
  return {
    delegatedAgent: 'agent-${appId}-v1 (${titlePt.replace(/'/g, "\\'")})',
    citations: [{ id: 1, agency: '${agencyPt.replace(/'/g, "\\'")}', title: '${titlePt.replace(/'/g, "\\'")}', url: \`\${citizenPortalUrl}?tab=${tabId}\` }],
    serviceRequestAction: {
      requires_auth: !isAuthenticated,
      service_id: 'OPEN_${tabId.toUpperCase()}',
      service_title: '${titlePt.replace(/'/g, "\\'")}',
      service_description: '${agencyPt.replace(/'/g, "\\'")}',
      service_prompt: message,
      target_portal: 'citizen-portal',
      target_tab: '${tabId}'
    },
    executedAction: isAuthenticated
      ? { type: '${tabId.toUpperCase()}_EXECUTED', protocol, summary: \`Atendimento \${protocol} concluído.\` }
      : null,
    reply: isAuthenticated
      ? \`✅ **${titlePt.replace(/'/g, "\\'")} (\`\${protocol}\`):** Solicitação processada para \${profile.full_name} (\`\${profile.citizen_id}\`).\`
      : \`🏛️ **${titlePt.replace(/'/g, "\\'")}:** Entre com seu NID para solicitar este serviço.\`,
    suggestedLinks: [{ title: 'Abrir no Portal do Cidadão', url: \`\${citizenPortalUrl}?tab=${tabId}\` }]
  };
}
`
);

fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify(
    {
      name: `@novatlantis/${appId}`,
      version: '1.0.0',
      private: true,
      scripts: {
        start: 'node server.js',
        build: `echo 'Build ${appId} OK'`,
        test: `node -e "const fs=require('fs'); const m=JSON.parse(fs.readFileSync('novatlantis.app.json','utf8')); if(!m.appId) process.exit(1);"`
      }
    },
    null,
    2
  ) + '\n'
);

fs.writeFileSync(
  path.join(targetDir, 'Dockerfile'),
  `FROM node:22-slim\nWORKDIR /app\nCOPY . .\nENV PORT=8080\nEXPOSE 8080\nCMD ["node", "server.js"]\n`
);

fs.writeFileSync(
  path.join(targetDir, 'server.js'),
  `const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'novatlantis.app.json'), 'utf8'));
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.url === '/api/v1/manifest') return res.end(JSON.stringify(manifest, null, 2));
  res.end(JSON.stringify({ status: 'ONLINE', service: manifest.appId, manifest }, null, 2));
}).listen(PORT, '0.0.0.0', () => console.log('[NOVATLANTIS-PLUGIN]', manifest.appId, 'listening on', PORT));
`
);

console.log(`[OK] Novo módulo criado em apps/${appId}/`);
