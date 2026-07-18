import { fetchAquaOs, requestHeader } from './aquaOsRuntime.mjs';

function readAuthorization(request) {
  if (request?.headers?.get) return String(request.headers.get('authorization') || '').trim();
  return String(request?.headers?.authorization || request?.headers?.Authorization || '').trim();
}

function config(env = {}) {
  return { url: String(env.AQUA_OS_DATA_URL || '').trim().replace(/\/+$/, ''), productKey: String(env.AQUA_OS_PRODUCT_KEY || '').trim() };
}

export async function callAquaOsData(request, path, { env = process.env, method = 'GET', body } = {}) {
  const { url, productKey } = config(env);
  if (!url || !productKey) return { status: 503, data: null, errors: [{ code: 'AQUA_OS_DATA_NOT_CONFIGURED' }] };
  const authorization = readAuthorization(request);
  const traceId = requestHeader(request, 'x-trace-id').trim();
  try {
    const response = await fetchAquaOs(`${url}${path}`, {
      method,
      headers: { 'X-AQUA-Product-Key': productKey, ...(traceId ? { 'X-Trace-Id': traceId } : {}), ...(authorization ? { Authorization: authorization } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({ data: null, errors: [{ code: 'INVALID_DATA_PLATFORM_RESPONSE' }] }));
    return { status: response.status, data: payload?.data ?? null, errors: Array.isArray(payload?.errors) ? payload.errors : [] };
  } catch {
    return { status: 503, data: null, errors: [{ code: 'AQUA_OS_DATA_UNAVAILABLE' }] };
  }
}

export function dataError(result) { return String(result?.errors?.[0]?.code || 'AQUA_OS_DATA_ERROR'); }

export function canonicalToolAsRecord(tool) {
  return {
    id: String(tool?.id || ''),
    fields: {
      ID_Unico: String(tool?.legacyKey || tool?.id || ''),
      Número: String(tool?.number || ''), Nome: String(tool?.name || ''), Site: String(tool?.websiteUrl || ''),
      'Descrição PT': String(tool?.descriptionPt || ''), 'Description EN': String(tool?.descriptionEn || ''),
      Funções: String(tool?.functions || ''), Preço: String(tool?.pricingModel || ''),
      'Área/Categoria': Array.isArray(tool?.categories) ? tool.categories.map(String) : [], Logo: String(tool?.logoUrl || ''),
      Published: tool?.status === 'published', 'Operational Status': String(tool?.operationalStatus || 'unknown'),
    },
  };
}

export function legacySubmissionToCanonical(payload) {
  return {
    name: String(payload?.Nome || '').trim(), websiteUrl: String(payload?.Site || '').trim(),
    description: String(payload?.['Descrição'] || '').trim(), functions: String(payload?.['Funções'] || '').trim(),
    pricingModel: String(payload?.['Preço'] || '').trim(), categories: Array.isArray(payload?.['Área/Categoria']) ? payload['Área/Categoria'].map(String) : [],
  };
}
