const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'novatlantis';
const PORTAL_URL = process.env.LANDING_PORTAL_URL || 'https://gov.novatlantis.cloud';
const CITIZEN_PORTAL_URL = process.env.CITIZEN_PORTAL_URL || 'https://portal.gov.novatlantis.cloud';

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
          service: 'justice-court-tj',
          gcp_project_id: PROJECT_ID,
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
  <title>Tribunal de Justiça — Novatlantis</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-[#f8f9fa] text-[#202124] font-['Inter'] antialiased">
  <div class="h-1 w-full" style="background: linear-gradient(90deg, #4285F4 0%, #4285F4 25%, #EA4335 25%, #EA4335 50%, #FBBC05 50%, #FBBC05 75%, #34A853 75%, #34A853 100%);"></div>
  <div class="bg-[#f1f3f4] border-b border-[#dadce0] text-[#5f6368] py-1.5 px-6 text-xs flex justify-between items-center">
    <span class="font-medium text-[#202124]">Governo de Novatlantis • Poder Judiciário</span>
    <span class="font-mono text-[#5f6368]">tj.gov.novatlantis.cloud</span>
  </div>
  <header class="bg-white border-b border-[#dadce0] px-6 py-5">
    <div class="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 class="text-xl font-bold text-[#202124] font-['Plus_Jakarta_Sans']">${manifest.landingCatalog.title['pt-BR']}</h1>
        <p class="text-sm text-[#5f6368] mt-0.5">${manifest.landingCatalog.description['pt-BR']}</p>
      </div>
      <div class="flex gap-2">
        <a href="${CITIZEN_PORTAL_URL}?tab=${manifest.citizenPortalTab.tabId}" class="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2 text-xs font-semibold rounded-full transition">Acessar no Portal do Cidadão</a>
        <a href="${PORTAL_URL}" class="border border-[#dadce0] hover:bg-[#f1f3f4] text-[#202124] px-4 py-2 text-xs font-semibold rounded-full transition">Início</a>
      </div>
    </div>
  </header>
  <main class="max-w-5xl mx-auto p-6">
    <div class="bg-white border border-[#dadce0] p-6 rounded-xl space-y-3 shadow-sm">
      <h2 class="text-base font-semibold text-[#202124]">Consulta Processual e Certidões</h2>
      <p class="text-sm text-[#5f6368]">Serviço integrado ao Portal do Cidadão e ao painel da magistratura no Backstage.</p>
      <div class="flex gap-3 pt-2">
        <a href="/api/v1/manifest" class="px-3 py-1.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#1a73e8] text-xs font-mono rounded-lg border border-[#dadce0]">GET /api/v1/manifest</a>
        <a href="/api/health" class="px-3 py-1.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] text-[#1a73e8] text-xs font-mono rounded-lg border border-[#dadce0]">GET /api/health</a>
      </div>
    </div>
  </main>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[justice-court-tj] Listening on port ${PORT}`);
});
