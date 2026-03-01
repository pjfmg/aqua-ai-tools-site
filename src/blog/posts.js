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
  },
];

export function getPostBySlug(slug) {
  return posts.find((p) => p.slug === slug) || null;
}
