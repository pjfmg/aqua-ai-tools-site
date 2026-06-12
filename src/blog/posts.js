export const posts = [
  {
    slug: 'checklist-privacidade-ia',
    title: 'Checklist de privacidade ao usar ferramentas de IA',
    date: '2026-03-07',
    readingTime: '4 min',
    excerpt:
      'Um guia rápido para reduzir riscos: dados sensíveis, permissões, retenção, partilha com terceiros e boas práticas.',
    content: [
      'Ferramentas de IA podem acelerar trabalho, mas também aumentam o risco de exposição de dados. Antes de adotar uma nova ferramenta, vale a pena fazer um “mini-audit” de privacidade.',
      '1) Define o que é “sensível” no teu contexto (clientes, contratos, credenciais, dados pessoais). Se não podes publicar esse conteúdo num site público, não o envies para um serviço sem garantias claras.',
      '2) Verifica onde os dados ficam: há logs? há retenção? existe opção de “não treinar com os meus dados”? e existe forma de apagar histórico/conta?',
      '3) Limita permissões: extensões de browser e apps “desktop” podem pedir acesso amplo. Dá apenas o mínimo necessário e revê permissões regularmente.',
      '4) Se precisares de usar dados reais, considera mascarar (remover nomes, emails, IDs) e trabalhar com exemplos representativos. Em muitos casos, o valor vem do padrão, não do conteúdo específico.',
      'Por fim: documenta a decisão (mesmo que simples). Ter uma checklist repetível evita surpresas e facilita quando a equipa cresce.',
    ],
    tags: ['Privacidade', 'Segurança', 'Boas práticas'],
    en: {
      title: 'Privacy checklist for using AI tools',
      excerpt:
        'A quick guide to reduce risk: sensitive data, permissions, retention, third-party sharing and good practices.',
      content: [
        'AI tools can speed up work, but they also increase the risk of exposing data. Before adopting a new tool, it is worth doing a small privacy audit.',
        '1) Define what counts as sensitive in your context: clients, contracts, credentials and personal data. If you would not publish it on a public website, do not send it to a service without clear guarantees.',
        '2) Check where data is stored: are there logs, retention rules, an option to opt out of training, and a way to delete history or the account?',
        '3) Limit permissions: browser extensions and desktop apps can request broad access. Grant only what is needed and review permissions regularly.',
        '4) If you need real data, consider masking names, emails and IDs, then work with representative examples. In many cases the value comes from the pattern, not the exact content.',
        'Finally, document the decision. A repeatable checklist avoids surprises and helps when the team grows.',
      ],
      tags: ['Privacy', 'Security', 'Best practices'],
    },
  },
  {
    slug: 'como-avaliar-ferramentas-ia',
    title: 'Como avaliar uma ferramenta de IA em 15 minutos',
    date: '2026-03-06',
    readingTime: '3 min',
    excerpt:
      'Um método prático para testar valor real: casos de uso, qualidade, custo, limites e integração no teu fluxo.',
    content: [
      'Experimentar ferramentas é fácil; decidir quais ficam é o difícil. Esta grelha rápida ajuda-te a testar sem perder uma tarde.',
      '1) Define 2–3 tarefas reais (ex.: resumir um PDF, gerar copy, criar uma tabela, escrever um email). Evita “demos” genéricas — escolhe exemplos que tu repetes todas as semanas.',
      '2) Mede resultado, não “wow”: qualidade, consistência, tempo poupado e quantas edições precisas para chegar ao final aceitável.',
      '3) Procura limites cedo: tamanhos máximos, créditos, rate limits, idiomas, e comportamento com conteúdos longos.',
      '4) Observa a integração: exporta para onde trabalhas (Docs/Notion/Sheets), tem API, e encaixa no teu processo (ou cria fricção)?',
      'No fim, decide por uma métrica simples: “Se eu usar isto 3x por semana, vale o custo e o risco?” Se a resposta for “talvez”, deixa na lista de espera e volta mais tarde.',
    ],
    tags: ['Avaliação', 'Produtividade', 'Diretório'],
    en: {
      title: 'How to evaluate an AI tool in 15 minutes',
      excerpt:
        'A practical method to test real value: use cases, quality, cost, limits and fit with your workflow.',
      content: [
        'Trying tools is easy; deciding which ones stay is harder. This quick framework helps you test without losing an afternoon.',
        '1) Define 2 or 3 real tasks, such as summarizing a PDF, writing copy, creating a table or drafting an email. Avoid generic demos and choose examples you repeat every week.',
        '2) Measure outcomes, not wow factor: quality, consistency, time saved and how many edits are needed to reach an acceptable result.',
        '3) Look for limits early: maximum sizes, credits, rate limits, languages and behavior with long content.',
        '4) Watch the integration: does it export to where you work, offer an API and fit your process, or does it create friction?',
        'At the end, decide with one simple question: if I use this three times a week, is it worth the cost and risk? If the answer is maybe, keep it on the waiting list and come back later.',
      ],
      tags: ['Evaluation', 'Productivity', 'Directory'],
    },
  },
  {
    slug: 'prompting-produtivo',
    title: 'Prompting produtivo: 5 templates que funcionam sempre',
    date: '2026-03-05',
    readingTime: '5 min',
    excerpt:
      'Estruturas de prompt reutilizáveis para obter respostas mais consistentes: contexto, objetivo, formato, exemplos e validação.',
    content: [
      'A diferença entre “uma resposta” e “uma resposta útil” quase sempre está na estrutura do pedido. Em vez de inventar prompts do zero, usa templates.',
      'Template 1 — “Contexto + objetivo + restrições”: explica para quem é, para quê, e o que não pode acontecer (tom, tamanho, termos proibidos, etc.).',
      'Template 2 — “Formato de saída”: pede explicitamente a estrutura (tabela, bullets, JSON, checklist). A maioria das falhas vem de o modelo adivinhar o formato.',
      'Template 3 — “Exemplo bom vs. mau”: dá um exemplo curto do que aceitas e do que não aceitas. Isto reduz muito ambiguidades.',
      'Template 4 — “Perguntas antes de responder”: quando a tarefa depende de detalhes, pede ao modelo que faça 3–5 perguntas primeiro.',
      'Template 5 — “Auto-verificação”: pede uma revisão final (“verifica inconsistências”, “lista suposições”, “aponta riscos”). Para trabalho sério, isto vale ouro.',
      'Guarda estes templates numa nota e ajusta com o teu vocabulário. Consistência gera consistência.',
    ],
    tags: ['Prompts', 'Produtividade', 'Guias'],
    en: {
      title: 'Productive prompting: 5 templates that keep working',
      excerpt:
        'Reusable prompt structures for more consistent answers: context, objective, format, examples and validation.',
      content: [
        'The difference between an answer and a useful answer is almost always the structure of the request. Instead of inventing prompts from scratch, use templates.',
        'Template 1 - Context + objective + constraints: explain who it is for, what it should achieve and what must not happen, such as tone, length or forbidden terms.',
        'Template 2 - Output format: explicitly ask for the structure, such as a table, bullets, JSON or checklist. Many failures come from the model guessing the format.',
        'Template 3 - Good example vs bad example: give a short example of what you accept and what you do not. This reduces ambiguity a lot.',
        'Template 4 - Questions before answering: when the task depends on details, ask the model to make 3 to 5 questions first.',
        'Template 5 - Self-check: ask for a final review, such as checking inconsistencies, listing assumptions or pointing out risks. For serious work, this is valuable.',
        'Keep these templates in a note and adapt them to your vocabulary. Consistency creates consistency.',
      ],
      tags: ['Prompts', 'Productivity', 'Guides'],
    },
  },
  {
    slug: 'comparar-chatbots-2026',
    title: 'Comparar chatbots em 2026: o que importa (mesmo)',
    date: '2026-03-04',
    readingTime: '4 min',
    excerpt:
      'Nem tudo é “qual responde melhor”. Compara latência, memória, ferramentas, custo, privacidade e integração no teu trabalho.',
    content: [
      'Escolher um chatbot não é só ver quem escreve melhor. O melhor para ti depende do teu fluxo: pesquisa, escrita, suporte, programação, ou operações.',
      'Critério 1 — Tempo e consistência: respostas rápidas e previsíveis valem mais do que um “pico” de qualidade que falha em casos comuns.',
      'Critério 2 — Ferramentas e integrações: pesquisa web, ficheiros, exportação, API, e compatibilidade com o teu stack.',
      'Critério 3 — Controlo: histórico, gestão de contas, logs, equipas, permissões e políticas de dados.',
      'Critério 4 — Custo total: não é só o preço. Conta também o tempo perdido com outputs que exigem muita correção.',
      'Dica prática: cria um “teste padrão” com 5 tarefas e corre exatamente o mesmo conjunto em 2–3 opções. Decide com base em resultados repetíveis.',
    ],
    tags: ['Chatbots', 'Comparação', 'Guias'],
    en: {
      title: 'Comparing chatbots in 2026: what really matters',
      excerpt:
        'It is not only about who answers better. Compare latency, memory, tools, cost, privacy and fit with your work.',
      content: [
        'Choosing a chatbot is not just about who writes better. The best option depends on your workflow: research, writing, support, coding or operations.',
        'Criterion 1 - Speed and consistency: fast, predictable answers are worth more than a quality spike that fails in common cases.',
        'Criterion 2 - Tools and integrations: web search, files, export, API and compatibility with your stack.',
        'Criterion 3 - Control: history, account management, logs, teams, permissions and data policies.',
        'Criterion 4 - Total cost: it is not only the price. Count the time lost fixing outputs that need too much correction.',
        'Practical tip: create a standard test with 5 tasks and run the exact same set in 2 or 3 options. Decide based on repeatable results.',
      ],
      tags: ['Chatbots', 'Comparison', 'Guides'],
    },
  },
  {
    slug: 'ia-para-pequenos-negocios',
    title: 'IA para pequenos negócios: 7 automações simples e úteis',
    date: '2026-03-03',
    readingTime: '6 min',
    excerpt:
      'Ideias práticas para ganhar tempo sem complicar: atendimento, conteúdos, propostas, CRM leve e rotinas internas.',
    content: [
      'A IA tem mais impacto quando automatiza tarefas repetitivas. Aqui vão 7 automações “low-tech” que funcionam em quase qualquer negócio.',
      '1) Respostas a emails frequentes: rascunhos com tom consistente e campos variáveis (nome, contexto, próximos passos).',
      '2) Resumos de reuniões: a partir de notas ou transcrições, gerar ações, responsáveis e prazos.',
      '3) Propostas e orçamentos: criar primeira versão a partir de um template e inputs (serviço, prazo, objetivos).',
      '4) Calendário de conteúdos: ideias + variações por canal (site, Instagram, newsletter) com reaproveitamento inteligente.',
      '5) Base de conhecimento interna: transformar FAQs e processos em checklists e SOPs curtos.',
      '6) Qualificação de leads: transformar mensagens em “intenção + urgência + próximos passos”.',
      '7) Auditoria de site: listas de melhorias (copy, SEO básico, clareza da oferta) a partir de uma URL.',
      'Começa com 1 automação, mede o tempo poupado por semana, e só depois adiciona a próxima.',
    ],
    tags: ['Automação', 'Negócios', 'Produtividade'],
    en: {
      title: 'AI for small businesses: 7 simple and useful automations',
      excerpt:
        'Practical ideas to save time without overcomplicating: support, content, proposals, lightweight CRM and internal routines.',
      content: [
        'AI has the biggest impact when it automates repeated tasks. Here are 7 low-tech automations that work in almost any business.',
        '1) Replies to frequent emails: drafts with consistent tone and variable fields such as name, context and next steps.',
        '2) Meeting summaries: from notes or transcripts, generate actions, owners and deadlines.',
        '3) Proposals and quotes: create a first version from a template and inputs such as service, timeline and goals.',
        '4) Content calendar: ideas plus channel variations for website, Instagram and newsletter with smart repurposing.',
        '5) Internal knowledge base: turn FAQs and processes into short checklists and SOPs.',
        '6) Lead qualification: transform messages into intent, urgency and next steps.',
        '7) Website audit: improvement lists for copy, basic SEO and offer clarity from a URL.',
        'Start with one automation, measure time saved per week and only then add the next one.',
      ],
      tags: ['Automation', 'Business', 'Productivity'],
    },
  },
  {
    slug: 'como-escolher-ferramenta-ia',
    title: 'Como escolher a ferramenta de IA certa (sem perder tempo)',
    date: '2026-03-02',
    readingTime: '4 min',
    excerpt:
      'Um processo simples para escolher rápido: define o trabalho, o formato, o orçamento e o risco antes de comparar opções.',
    content: [
      'A sensação de “há demasiadas ferramentas” é real. O segredo é inverter o processo: começa pelo trabalho, não pela lista.',
      'Passo 1 — Define o resultado final: o que precisa existir no fim (um texto, uma imagem, uma tabela, um relatório, um fluxo automatizado).',
      'Passo 2 — Define o contexto: idioma, tom, nível de detalhe, e se vais usar dados sensíveis. Isso elimina muitas opções logo à partida.',
      'Passo 3 — Decide o teu “limite de fricção”: se a ferramenta não encaixa no teu fluxo (exportar, partilhar, colaborar), não vai ser usada — por melhor que pareça.',
      'Passo 4 — Teste rápido com casos reais: 10–15 minutos com exemplos teus valem mais do que 1 hora a ver reviews.',
      'Se quiseres, no diretório do AQUA AI Tools podes filtrar por categoria e preço para reduzir o universo antes do teste.',
    ],
    tags: ['Escolha', 'Guias', 'AQUA'],
    en: {
      title: 'How to choose the right AI tool without wasting time',
      excerpt:
        'A simple process to choose faster: define the job, format, budget and risk before comparing options.',
      content: [
        'The feeling that there are too many tools is real. The trick is to reverse the process: start with the job, not with the list.',
        'Step 1 - Define the final outcome: what needs to exist at the end, such as text, an image, a table, a report or an automated flow.',
        'Step 2 - Define the context: language, tone, level of detail and whether you will use sensitive data. This removes many options immediately.',
        'Step 3 - Decide your friction limit: if the tool does not fit your workflow for exporting, sharing or collaborating, it will not be used, even if it looks impressive.',
        'Step 4 - Quick test with real cases: 10 to 15 minutes with your own examples are worth more than one hour watching reviews.',
        'In the AQUA AI Tools directory, you can filter by category and price to reduce the universe before testing.',
      ],
      tags: ['Choice', 'Guides', 'AQUA'],
    },
  },
  {
    slug: 'bem-vindo',
    title: 'Bem-vindo ao Blog',
    date: '2026-02-28',
    readingTime: '2 min',
    excerpt:
      'Vamos partilhar guias, comparações e boas práticas para escolher e aplicar ferramentas de IA no dia a dia.',
    content: [
      'Este é o espaço onde vamos publicar novidades do diretório, guias rápidos e recomendações práticas.',
      'Se tiveres um tema que queres ver aqui, usa a página “Sugestões”.',
    ],
    tags: ['AQUA', 'Diretório', 'Novidades'],
    en: {
      title: 'Welcome to the Blog',
      excerpt:
        'We will share guides, comparisons and good practices for choosing and applying AI tools in everyday work.',
      content: [
        'This is where we will publish directory updates, quick guides and practical recommendations.',
        'If there is a topic you want to see here, use the Suggestions page.',
      ],
      tags: ['AQUA', 'Directory', 'Updates'],
    },
  },
];

export function localizePost(post, lang = 'pt') {
  if (!post || lang !== 'en' || !post.en) return post;
  return {
    ...post,
    title: post.en.title || post.title,
    excerpt: post.en.excerpt || post.excerpt,
    content: post.en.content || post.content,
    tags: post.en.tags || post.tags,
  };
}

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null;
}
