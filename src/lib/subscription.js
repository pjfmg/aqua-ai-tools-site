export const SUBSCRIPTION_PLAN = {
  id: 'pro',
  name: 'Pro Member',
  priceLabel: '€19/mês',
};

export const STARTER_FEATURES = [
  'Explorar o diretório e pesquisar ferramentas',
  'Filtrar por categoria, preço e nome',
  'Ver destaques diários',
  'Submeter novas ferramentas',
];

export const PRO_FEATURES = [
  'Guardar favoritas',
  'Histórico de ferramentas visitadas',
  'Avaliação pessoal de ferramentas',
  'Acesso à página Reviews',
];

export function normalizeSubscription(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const plan = String(raw.plan || '').trim().toLowerCase();
  const status = String(raw.status || '').trim().toLowerCase();
  if (!plan || !status) return null;

  return {
    plan,
    status,
    customerId: String(raw.customerId || '').trim(),
    customerEmail: String(raw.customerEmail || '').trim().toLowerCase(),
    checkoutSessionId: String(raw.checkoutSessionId || '').trim(),
    currentPeriodEnd: String(raw.currentPeriodEnd || '').trim(),
    updatedAt: String(raw.updatedAt || '').trim(),
  };
}

export function hasProAccess(user) {
  const subscription = normalizeSubscription(user?.subscription);
  if (!subscription) return false;
  if (subscription.plan !== SUBSCRIPTION_PLAN.id) return false;
  return ['active', 'trialing'].includes(subscription.status);
}

export function getSubscriptionLabel(user) {
  return hasProAccess(user) ? 'Pro ativo' : 'Starter';
}
