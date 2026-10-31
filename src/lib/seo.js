import { posts } from '../blog/posts.js';

export const SITE_ORIGIN = 'https://aqua-aitools.com';
export const SOCIAL_IMAGE_PATH = '/assets/app/splash.png';

const ROUTES = {
  '/': {
    pt: ['Diretório de ferramentas de IA', 'Descobre e compara ferramentas de IA por categoria, caso de uso e indústria no AQUA AI Tools.'],
    en: ['AI tools directory', 'Discover and compare AI tools by category, use case and industry with AQUA AI Tools.'],
  },
  '/ferramentas': {
    pt: ['Explorar ferramentas de IA', 'Pesquisa e filtra o catálogo AQUA AI Tools para encontrares a ferramenta certa.'],
    en: ['Explore AI tools', 'Search and filter the AQUA AI Tools catalogue to find the right tool.'],
  },
  '/destaques': {
    pt: ['Ferramentas de IA em destaque', 'Explora uma seleção de ferramentas de IA em destaque no catálogo AQUA.'],
    en: ['Featured AI tools', 'Explore a selection of featured AI tools in the AQUA catalogue.'],
  },
  '/surpreende-me': {
    pt: ['Surpreende-me com uma ferramenta de IA', 'Recebe uma sugestão do catálogo e descobre uma ferramenta de IA diferente.'],
    en: ['Surprise me with an AI tool', 'Get a catalogue suggestion and discover a different AI tool.'],
  },
  '/submeter': {
    pt: ['Submeter uma ferramenta de IA', 'Sugere uma ferramenta de IA para revisão editorial e possível inclusão no catálogo.'],
    en: ['Submit an AI tool', 'Suggest an AI tool for editorial review and possible inclusion in the catalogue.'],
  },
  '/sugestoes': {
    pt: ['Sugestões para o AQUA AI Tools', 'Partilha uma correção ou sugestão para melhorar o catálogo AQUA AI Tools.'],
    en: ['Suggestions for AQUA AI Tools', 'Share a correction or suggestion to improve the AQUA AI Tools catalogue.'],
  },
  '/blog': {
    pt: ['Blog sobre ferramentas de IA', 'Guias práticos para escolher, avaliar e utilizar ferramentas de inteligência artificial.'],
    en: ['AI tools blog', 'Practical guides for choosing, evaluating and using artificial intelligence tools.'],
  },
  '/pro': {
    pt: ['AQUA AI Tools Pro', 'Cria shortlists, guarda descobertas e avalia ferramentas de IA com o AQUA AI Tools Pro.'],
    en: ['AQUA AI Tools Pro', 'Build shortlists, save discoveries and evaluate AI tools with AQUA AI Tools Pro.'],
  },
  '/sobre': {
    pt: ['Sobre e metodologia', 'Conhece a missão, a origem dos dados e os princípios editoriais do AQUA AI Tools.'],
    en: ['About and methodology', 'Learn about the mission, data sources and editorial principles behind AQUA AI Tools.'],
  },
  '/contacto': {
    pt: ['Contacto', 'Contacta a equipa do AQUA AI Tools.'],
    en: ['Contact', 'Contact the AQUA AI Tools team.'],
  },
  '/consultoria': {
    pt: ['Consultoria de IA', 'Serviços AQUA para avaliar ferramentas, processos e oportunidades de inteligência artificial.'],
    en: ['AI consulting', 'AQUA services for evaluating AI tools, workflows and opportunities.'],
  },
  '/privacidade': {
    pt: ['Política de privacidade', 'Consulta a política de privacidade do AQUA AI Tools.'],
    en: ['Privacy policy', 'Read the AQUA AI Tools privacy policy.'],
  },
  '/termos': {
    pt: ['Termos de utilização', 'Consulta os termos de utilização do AQUA AI Tools.'],
    en: ['Terms of use', 'Read the AQUA AI Tools terms of use.'],
  },
  '/signup': {
    pt: ['Criar conta', 'Cria uma conta AQUA AI Tools.'],
    en: ['Create account', 'Create an AQUA AI Tools account.'],
  },
  '/signin': {
    pt: ['Entrar', 'Inicia sessão na tua conta AQUA AI Tools.'],
    en: ['Sign in', 'Sign in to your AQUA AI Tools account.'],
  },
  '/conta': {
    pt: ['Conta', 'Gere a tua conta AQUA AI Tools.'],
    en: ['Account', 'Manage your AQUA AI Tools account.'],
  },
  '/visitadas': {
    pt: ['Ferramentas visitadas', 'Consulta o teu histórico de ferramentas visitadas.'],
    en: ['Visited tools', 'Review your history of visited tools.'],
  },
  '/favoritas': {
    pt: ['Ferramentas favoritas', 'Consulta a tua lista pessoal de ferramentas favoritas.'],
    en: ['Favorite tools', 'Review your personal list of favorite tools.'],
  },
  '/reviews': {
    pt: ['As minhas avaliações', 'Consulta as tuas avaliações de ferramentas.'],
    en: ['My reviews', 'Review your personal tool ratings.'],
  },
  '/definicoes': {
    pt: ['Definições', 'Gere as preferências do AQUA AI Tools.'],
    en: ['Settings', 'Manage your AQUA AI Tools preferences.'],
  },
};

const EN_TO_PT = new Map([
  ['/en', '/'],
  ['/en/tools', '/ferramentas'],
  ['/en/featured', '/destaques'],
  ['/en/surprise-me', '/surpreende-me'],
  ['/en/submit', '/submeter'],
  ['/en/suggestions', '/sugestoes'],
  ['/en/blog', '/blog'],
  ['/en/pro', '/pro'],
  ['/en/about', '/sobre'],
  ['/en/contact', '/contacto'],
  ['/en/consulting', '/consultoria'],
  ['/en/privacy', '/privacidade'],
  ['/en/terms', '/termos'],
  ['/en/signup', '/signup'],
  ['/en/signin', '/signin'],
  ['/en/account', '/conta'],
  ['/en/visited', '/visitadas'],
  ['/en/favorites', '/favoritas'],
  ['/en/reviews', '/reviews'],
  ['/en/settings', '/definicoes'],
]);

const PRIVATE_PATHS = new Set([
  '/signup', '/signin', '/conta', '/visitadas', '/favoritas', '/reviews', '/definicoes',
  '/en/signup', '/en/signin', '/en/account', '/en/visited', '/en/favorites', '/en/reviews', '/en/settings',
]);

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function postMeta(pathname, isEn) {
  const match = pathname.match(/^\/(?:en\/)?blog\/([^/]+)$/);
  if (!match) return null;
  const post = posts.find((item) => item.slug === match[1]);
  if (!post) return null;
  const localized = isEn ? post.en : post;
  return {
    title: localized?.title || post.title,
    description: localized?.excerpt || post.excerpt,
    published: post.date,
    modified: post.updated || post.date,
    author: isEn ? (post.author?.nameEn || post.author?.name) : post.author?.name,
  };
}

export function getRouteSeo(pathname) {
  const canonicalPath = normalizePath(pathname);
  const isEn = canonicalPath === '/en' || canonicalPath.startsWith('/en/');
  const mappedPath = EN_TO_PT.get(canonicalPath) || canonicalPath;
  const post = postMeta(canonicalPath, isEn);
  const isToolDetail = /^\/(?:en\/tools|ferramentas)\/[^/]+$/.test(canonicalPath);
  const route = ROUTES[mappedPath];
  const localized = route?.[isEn ? 'en' : 'pt'];
  const isPrivate = PRIVATE_PATHS.has(canonicalPath);
  const fallback = isEn
    ? ['Page not found', 'The requested page could not be found.']
    : ['Página não encontrada', 'Não foi possível encontrar a página pedida.'];
  const toolDetailFallback = isEn
    ? ['AI tool details', 'Review the available catalogue information for this AI tool.']
    : ['Detalhes da ferramenta de IA', 'Consulta a informação disponível no catálogo para esta ferramenta de IA.'];
  const title = post?.title || localized?.[0] || (isToolDetail ? toolDetailFallback[0] : fallback[0]);
  const description = post?.description || localized?.[1] || (isToolDetail ? toolDetailFallback[1] : fallback[1]);

  return {
    title: `${title} | AQUA AI Tools`,
    description,
    canonicalPath,
    canonicalUrl: `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`,
    lang: isEn ? 'en' : 'pt',
    robots: isPrivate || isToolDetail || (!route && !post) ? 'noindex, follow' : 'index, follow',
    contentType: post ? 'article' : 'website',
    published: post?.published,
    modified: post?.modified,
    author: post?.author,
  };
}
