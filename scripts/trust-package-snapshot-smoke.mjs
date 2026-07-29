import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(
  new URL('../vendor/aqua-os/trust-platform/package-release.json', import.meta.url),
  'utf8',
));
const product = JSON.parse(await readFile(
  new URL('../package.json', import.meta.url),
  'utf8',
));
const snapshotDirectories = {
  '@aqua-os/consent-policy': 'consent-policy',
  '@aqua-os/advertising-authorization': 'advertising-authorization',
  '@aqua-os/trust-decision-audit': 'trust-decision-audit',
};

assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.distribution.exactConsumerVersions, true);
for (const releasePackage of manifest.packages) {
  const directory = snapshotDirectories[releasePackage.name];
  assert.ok(directory, `Unknown Trust package ${releasePackage.name}`);
  const snapshot = JSON.parse(await readFile(
    new URL(`../vendor/aqua-os/${directory}/package.json`, import.meta.url),
    'utf8',
  ));
  assert.equal(snapshot.name, releasePackage.name);
  assert.equal(snapshot.version, releasePackage.version);
  if (manifest.status === 'prepared') {
    assert.equal(
      product.dependencies[releasePackage.name],
      `file:vendor/aqua-os/${directory}`,
      `${releasePackage.name} must use the prepared snapshot`,
    );
  } else {
    assert.equal(
      product.dependencies[releasePackage.name],
      releasePackage.version,
      `${releasePackage.name} must use an exact published version`,
    );
  }
}

console.log('Trust package snapshot smoke tests passed');
