const test = require('node:test');
const assert = require('node:assert/strict');
const { safePathname, createServer } = require('../server');

test('safePathname retourne index pour /', () => {
  assert.equal(safePathname('/'), '/index.html');
});

test('safePathname normalise un chemin malveillant', () => {
  assert.equal(safePathname('/../secret.txt'), '/secret.txt');
});

test('GET / retourne index.html', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  const res = await fetch(`http://127.0.0.1:${port}/`);
  const text = await res.text();

  assert.equal(res.status, 200);
  assert.match(text, /Player Tracker sécurisé/);

  await new Promise(resolve => server.close(resolve));
});

test('GET /api sans clé retourne 500 explicite', async () => {
  const oldKey = process.env.API_FOOTBALL_KEY;
  delete process.env.API_FOOTBALL_KEY;

  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  const res = await fetch(`http://127.0.0.1:${port}/api/countries`);
  const json = await res.json();

  assert.equal(res.status, 500);
  assert.match(json.error, /API_FOOTBALL_KEY/);

  await new Promise(resolve => server.close(resolve));

  if (oldKey) process.env.API_FOOTBALL_KEY = oldKey;
});
