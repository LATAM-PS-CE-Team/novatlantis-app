const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 8080;
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'novatlantis.app.json'), 'utf8'));
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.url === '/api/v1/manifest') return res.end(JSON.stringify(manifest, null, 2));
  res.end(JSON.stringify({ status: 'ONLINE', service: manifest.appId, manifest }, null, 2));
}).listen(PORT, '0.0.0.0', () => console.log('[NOVATLANTIS-PLUGIN]', manifest.appId, 'listening on', PORT));
