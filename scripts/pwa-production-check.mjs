import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

function parseArguments(argv) {
  const options = { baseUrl: '', timeoutMs: 10_000 };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === '--base-url' && value) {
      options.baseUrl = value;
      index += 1;
    } else if (argument === '--timeout-ms' && value) {
      options.timeoutMs = Number(value);
      index += 1;
    } else {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }
  return options;
}

function normalizeBaseUrl(value) {
  const url = new URL(String(value || ''));
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error('PWA verification requires HTTPS, except on localhost.');
  }
  return url.toString().replace(/\/+$/, '');
}

function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function request(url, timeoutMs) {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
  return {
    ok: response.ok,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    bytes: Buffer.from(await response.arrayBuffer()),
  };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const checks = [];

  const expectedAssets = [
    ['/icons/icon-192.png', 'public/icons/icon-192.png'],
    ['/icons/icon-512.png', 'public/icons/icon-512.png'],
    ['/aqua-brand/app-icon.png', 'public/aqua-brand/app-icon.png'],
    ['/aqua-brand/lockup-white.svg', 'public/aqua-brand/lockup-white.svg'],
  ];

  for (const [route, localPath] of expectedAssets) {
    const [remote, local] = await Promise.all([
      request(`${baseUrl}${route}`, options.timeoutMs),
      fs.readFile(path.resolve(localPath)),
    ]);
    checks.push({
      name: route,
      ok: remote.ok && digest(remote.bytes) === digest(local),
      status: remote.status,
      hashMatches: digest(remote.bytes) === digest(local),
    });
  }

  const manifestResponse = await request(`${baseUrl}/manifest.webmanifest`, options.timeoutMs);
  let manifest = null;
  try { manifest = JSON.parse(manifestResponse.bytes.toString('utf8')); } catch {}
  checks.push({
    name: '/manifest.webmanifest',
    ok: manifestResponse.ok
      && manifest?.name === 'AQUA AI Tools'
      && manifest?.display === 'standalone'
      && Array.isArray(manifest?.icons)
      && manifest.icons.some((icon) => icon.sizes === '512x512'),
    status: manifestResponse.status,
  });

  for (const [route, marker, expectedContentType] of [
    ['/sw.js', "const OFFLINE_URL = '/offline.html'", /(?:text|application)\/javascript/i],
    ['/offline.html', 'ONDA + AQUA + AI TOOLS', /text\/html/i],
  ]) {
    const response = await request(`${baseUrl}${route}`, options.timeoutMs);
    const markerPresent = response.bytes.toString('utf8').includes(marker);
    const contentTypeMatches = expectedContentType.test(response.contentType);
    checks.push({
      name: route,
      ok: response.ok && markerPresent && contentTypeMatches,
      status: response.status,
      contentType: response.contentType,
      markerPresent,
    });
  }

  const result = {
    schemaVersion: 1,
    target: baseUrl,
    checkedAt: new Date().toISOString(),
    ok: checks.every((check) => check.ok),
    checks,
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }, null, 2));
  process.exitCode = 1;
});
