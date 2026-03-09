const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://v3.football.api-sports.io';

function safePathname(urlPath) {
  if (urlPath === '/') return '/index.html';
  return path.normalize(urlPath).replace(/^\.+/, '');
}

function readJsonBody(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function proxyApi(req, res) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return readJsonBody(res, 500, { error: 'Clé API_FOOTBALL_KEY manquante côté serveur.' });
  }

  const upstreamUrl = `${API_BASE}${req.url.replace(/^\/api/, '')}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'x-apisports-key': apiKey
      }
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!upstream.ok) {
      return readJsonBody(res, upstream.status, {
        error: data?.message || `Erreur upstream (${upstream.status})`
      });
    }

    if (data?.errors && Object.keys(data.errors).length) {
      const firstError = Object.values(data.errors)[0];
      return readJsonBody(res, 400, { error: String(firstError) });
    }

    return readJsonBody(res, 200, data);
  } catch (error) {
    return readJsonBody(res, 502, { error: `Proxy indisponible: ${error.message}` });
  }
}

function serveStatic(req, res) {
  const filePath = path.join(__dirname, safePathname(req.url.split('?')[0]));

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = ext === '.html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

function createServer() {
  return http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
      proxyApi(req, res);
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res);
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => {
    console.log(`Serveur prêt: http://localhost:${port}`);
  });
}

module.exports = { createServer, safePathname };
