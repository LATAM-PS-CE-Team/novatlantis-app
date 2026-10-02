const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'novatlantis-dev';
const PORTAL_URL = process.env.LANDING_PORTAL_URL || 'https://novatlantis-dev-landing-portal-uc.a.run.app';
const CITIZEN_PORTAL_URL = process.env.CITIZEN_PORTAL_URL || 'https://novatlantis-dev-citizen-portal-uc.a.run.app';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'novatlantis.app.json'), 'utf8'));

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Novatlantis-Citizen-NID');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/v1/manifest') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(manifest, null, 2));
    return;
  }

  if (req.url === '/api/health' || req.url === '/api/v1/justice-court-tj/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify(
        {
          status: 'ONLINE',
          republic: 'República Digital de Novatlantis',
          design_system: 'Sovereign Civic (Austere Institutional)',
          gcp_project_id: PROJECT_ID,
          service: 'justice-court-tj',
          pluggable_manifest: manifest.appId,
          owner_ce: manifest.owner,
          sector: manifest.sector,
          gdf_tables: ['ops_tj_lawsuits', 'ops_tj_certificates', 'justice_records'],
          timestamp: new Date().toISOString()
        },
        null,
        2
      )
    );
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${manifest.landingCatalog.title['pt-BR']} — Novatlantis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Public+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-[#f7f9fc] text-[#191c1e] font-['Inter'] antialiased">
  <div class="bg-[#0a2240] text-white py-1.5 px-6 text-xs flex justify-between items-center border-b border-slate-800">
    <span class="font-semibold uppercase tracking-wider">GOVERNO DA REPÚBLICA DIGITAL DE NOVATLANTIS — ${manifest.landingCatalog.badge}</span>
    <span class="font-mono text-[#57fbdb]">PLUGIN: ${manifest.appId} • PROJETO GCP: ${PROJECT_ID}</span>
  </div>
  <header class="bg-white border-b border-[#c6c6ce] px-6 py-4">
    <div class="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-4">
      <div>
        <span class="text-xs font-mono uppercase text-[#0061a5] font-bold">${manifest.landingCatalog.agency['pt-BR']}</span>
        <h1 class="text-xl font-bold text-slate-900 font-['Public_Sans']">${manifest.landingCatalog.title['pt-BR']}</h1>
        <p class="text-xs text-slate-500 mt-0.5">${manifest.landingCatalog.description['pt-BR']}</p>
      </div>
      <div class="flex gap-2">
        <a href="${CITIZEN_PORTAL_URL}?tab=${manifest.citizenPortalTab.tabId}" class="bg-[#0a2240] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded">Abrir no Portal do Cidadão</a>
        <a href="${PORTAL_URL}" class="border border-[#0a2240] text-[#0a2240] px-4 py-2 text-xs font-bold uppercase tracking-wider rounded">Concierge IA</a>
      </div>
    </div>
  </header>
  <main class="max-w-6xl mx-auto p-6 space-y-6">
    <div class="bg-white border border-[#c6c6ce] p-6 rounded-lg space-y-3">
      <h2 class="text-base font-bold text-slate-900">Módulo Plugado à API Federada do Portal Novatlantis (@novatlantis/portal-sdk)</h2>
      <p class="text-xs text-slate-600 leading-relaxed">Este serviço expõe o contrato declarativo <code>novatlantis.app.json</code> e acopla-se automaticamente à Vitrine da Home Page, ao Concierge IA Nacional, ao Portal do Cidadão (aba <code>${manifest.citizenPortalTab.tabId}</code>) e ao Gabinete do Magistrado no Government Backstage.</p>
      <div class="flex gap-3 pt-2">
        <a href="/api/v1/manifest" class="inline-block px-4 py-2 bg-[#0061a5] text-white text-xs font-mono uppercase font-bold rounded">GET /api/v1/manifest</a>
        <a href="/api/v1/justice-court-tj/status" class="inline-block px-4 py-2 bg-slate-800 text-white text-xs font-mono uppercase font-bold rounded">GET /api/v1/justice-court-tj/status</a>
      </div>
    </div>
  </main>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[NOVATLANTIS-JUSTICE-COURT-TJ] Online on port ${PORT} (Project: ${PROJECT_ID})`);
});
