import { deploymentConfigurationStatus } from '../operations.mjs';

const status = deploymentConfigurationStatus(process.env);
const result = {
  event: 'release.configuration.checked',
  ok: status.ok,
  missing: status.missing,
  invalid: status.invalid,
};

console.log(JSON.stringify(result, null, 2));
if (!status.ok) process.exitCode = 1;
