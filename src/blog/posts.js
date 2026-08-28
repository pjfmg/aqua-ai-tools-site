const EDITORIAL_AUTHOR = {
  name: 'Equipa editorial AQUA',
  nameEn: 'AQUA editorial team',
  role: 'Pesquisa e avaliação de ferramentas de IA',
  roleEn: 'AI tools research and evaluation',
};

export const posts = [
  {
    slug: 'como-escrever-prompts-que-funcionam',
    title: 'Como escrever prompts que funcionam: um método em 5 blocos',
    date: '2026-08-20',
    updated: '2026-08-20',
    readingTime: '7 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um modelo simples para transformar pedidos vagos em instruções claras, verificáveis e fáceis de melhorar.',
    tags: ['Prompts', 'Produtividade', 'Método'],
    summary: [
      'Um bom prompt define resultado, contexto, materiais, limites e formato. Não precisa de ser longo; precisa de reduzir ambiguidades importantes.',
      'Trata o primeiro resultado como um rascunho observável: identifica a falha, corrige uma variável e guarda a versão que funcionou.',
    ],
    sections: [
      {
        title: '1. Começa pelo resultado observável',
        paragraphs: [
          'Evita começar com “ajuda-me com marketing” ou “faz um texto melhor”. Diz o que deve existir no fim: “escreve um email de 120 palavras que apresente a nova funcionalidade e termine com um convite para experimentar”. Um resultado com formato, público e ação é mais fácil de produzir e de avaliar.',
          'Acrescenta o critério mínimo de sucesso. Pode ser preservar três factos, usar português europeu, incluir fontes ou não ultrapassar uma página. Se não consegues descrever o que significa “bom”, a ferramenta também terá dificuldade em distinguir o essencial do decorativo.',
        ],
      },
      {
        title: '2. Usa cinco blocos reutilizáveis',
        paragraphs: [
          'Organiza o pedido em cinco blocos: objetivo, contexto, materiais, limites e formato de saída. O contexto explica para quem e porquê; os materiais são os dados que a resposta pode usar; os limites dizem o que evitar; o formato define a estrutura final.',
          'Não preenchas blocos sem utilidade. Para uma alteração curta, duas frases podem bastar. Para uma análise com risco de invenção, separa claramente os factos fornecidos das instruções e pede que lacunas sejam assinaladas em vez de preenchidas por suposição.',
        ],
        checklist: [
          'Objetivo: qual é a tarefa e a ação esperada?',
          'Contexto: quem vai usar o resultado e em que situação?',
          'Materiais: que informação pode sustentar a resposta?',
          'Limites: o que não deve ser inventado, exposto ou alterado?',
          'Formato: como deve ser entregue o resultado?',
        ],
      },
      {
        title: '3. Dá exemplos apenas quando esclarecem a regra',
        paragraphs: [
          'Um exemplo é útil quando tom, classificação ou estrutura seriam difíceis de explicar. Mostra uma entrada e uma saída curta e indica o que deve ser imitado. Sem essa indicação, a ferramenta pode copiar detalhes acidentais em vez do padrão pretendido.',
          'Evita acumular muitos exemplos contraditórios. Dois exemplos consistentes costumam ser melhores do que dez casos com estilos diferentes. Quando a precisão importa, inclui também um contraexemplo: uma resposta que parece aceitável, mas viola uma regra importante.',
        ],
      },
      {
        title: '4. Corrige uma variável de cada vez',
        paragraphs: [
          'Se o resultado falhar, não reescrevas tudo imediatamente. Classifica a falha: faltou contexto, o formato ficou errado, surgiram factos não suportados ou o tom não correspondeu? Altera o bloco responsável e repete o teste com o mesmo material.',
          'Guarda prompts que resolvem tarefas recorrentes juntamente com um exemplo aprovado e a data. Um pequeno catálogo reduz tentativas, facilita a colaboração e torna visível quando uma mudança da ferramenta exige rever o processo.',
        ],
      },
      {
        title: '5. Transforma o prompt num pequeno contrato de trabalho',
        paragraphs: [
          'Antes de reutilizar o pedido, entrega-o a outra pessoa sem explicações adicionais. Se ela não souber que materiais juntar, que campos substituir ou como reconhecer uma resposta aceitável, o prompt ainda depende de conhecimento escondido. Acrescenta instruções para preparar a entrada e um exemplo curto do resultado aprovado. Identifica variáveis com nomes claros, como público, produto e limite de palavras, em vez de deixar texto antigo que alguém pode esquecer de alterar.',
          'Define também o que deve acontecer quando a tarefa ultrapassa o âmbito. Pede perguntas de esclarecimento quando falta informação essencial, uma indicação explícita quando não há evidência e uma recusa quando os materiais incluem dados proibidos. Estas condições não garantem comportamento perfeito, mas tornam as falhas mais fáceis de detetar durante a revisão.',
          'Por fim, testa o prompt com um caso normal, um caso incompleto e um caso difícil. Regista taxa de aceitação, número de correções e tempo até à versão final. Se o desempenho variar demasiado, reduz a tarefa ou cria versões diferentes para situações diferentes. Um prompt fiável não é o que funcionou uma vez; é o que produz resultados previsíveis dentro de limites conhecidos.',
        ],
      },
    ],
    takeaway:
      'Se não consegues verificar o resultado, melhora primeiro o critério de sucesso — só depois acrescenta mais palavras ao prompt.',
    en: {
      title: 'How to write prompts that work: a five-block method',
      excerpt: 'A simple model for turning vague requests into clear, testable instructions that are easy to improve.',
      readingTime: '7 min',
      tags: ['Prompts', 'Productivity', 'Method'],
      summary: [
        'A useful prompt defines the outcome, context, materials, constraints, and format. It need not be long; it must reduce important ambiguity.',
        'Treat the first output as observable evidence: identify the failure, change one variable, and save the version that worked.',
      ],
      sections: [
        {
          title: '1. Start with an observable outcome',
          paragraphs: [
            'Avoid starting with “help me with marketing” or “make this better”. Describe what should exist at the end: “write a 120-word email that introduces the new feature and ends with an invitation to try it”. An outcome with a format, audience, and action is easier to produce and assess.',
            'Add the minimum success standard. It might be preserving three facts, using UK English, including sources, or staying within one page. If you cannot describe what “good” means, the tool will also struggle to distinguish the essential from the decorative.',
          ],
        },
        {
          title: '2. Use five reusable blocks',
          paragraphs: [
            'Structure the request as outcome, context, materials, constraints, and output format. Context explains who and why; materials define what may support the answer; constraints say what to avoid; format describes the final structure.',
            'Do not fill blocks that add no value. Two sentences may be enough for a small rewrite. For analysis where invention is risky, clearly separate supplied facts from instructions and ask for gaps to be flagged rather than guessed.',
          ],
          checklist: [
            'Outcome: what is the task and expected action?',
            'Context: who will use the result, and where?',
            'Materials: what information may support the answer?',
            'Constraints: what must not be invented, exposed, or changed?',
            'Format: how should the result be delivered?',
          ],
        },
        {
          title: '3. Add examples only when they clarify the rule',
          paragraphs: [
            'An example helps when tone, classification, or structure is difficult to explain. Show a short input and output and state what should be imitated. Otherwise, the tool may copy incidental details instead of the intended pattern.',
            'Avoid collecting contradictory examples. Two consistent examples are usually better than ten with different styles. When accuracy matters, include a counterexample: an answer that looks acceptable but breaks an important rule.',
          ],
        },
        {
          title: '4. Change one variable at a time',
          paragraphs: [
            'When the result fails, do not immediately rewrite everything. Classify the failure: missing context, wrong format, unsupported facts, or unsuitable tone. Change the responsible block and repeat the test with the same material.',
            'Save prompts for recurring tasks with an approved example and date. A small catalogue reduces retries, supports collaboration, and makes it visible when a tool change requires a process review.',
          ],
        },
        {
          title: '5. Turn the prompt into a small working contract',
          paragraphs: [
            'Before reuse, give the request to another person without extra explanation. If they do not know which materials to gather, which fields to replace, or how to recognise an acceptable answer, the prompt still relies on hidden knowledge. Add input preparation instructions and a short approved output. Label variables clearly, such as audience, product, and word limit, instead of leaving old copy that someone may forget to change.',
            'Define what should happen when the task exceeds its scope. Ask for clarifying questions when essential information is missing, an explicit warning when evidence is absent, and refusal when materials contain prohibited data. These conditions cannot guarantee perfect behaviour, but they make failures easier to detect during review.',
            'Finally, test the prompt with a normal case, an incomplete case, and a difficult case. Record acceptance rate, corrections, and time to the final version. If performance varies too much, narrow the task or create separate versions for different situations. A reliable prompt is not one that worked once; it produces predictable results within known boundaries.',
          ],
        },
      ],
      takeaway: 'If you cannot verify the output, improve the success criterion before adding more words to the prompt.',
    },
  },
  {
    slug: 'verificar-respostas-geradas-por-ia',
    title: 'Como verificar respostas geradas por IA antes de as publicar',
    date: '2026-08-19',
    updated: '2026-08-20',
    readingTime: '8 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um fluxo de revisão para encontrar afirmações sem suporte, fontes frágeis e omissões antes de uma resposta chegar ao público.',
    tags: ['Qualidade', 'Verificação', 'Segurança'],
    summary: [
      'Texto fluente não é evidência. Separa afirmações verificáveis de opinião e confirma primeiro as que podem alterar uma decisão.',
      'A revisão deve terminar com uma decisão explícita: publicar, corrigir, reduzir o âmbito ou não usar.',
    ],
    sections: [
      {
        title: '1. Divide o texto em afirmações',
        paragraphs: [
          'Sublinha números, datas, nomes, citações, relações de causa e efeito e frases como “é o melhor” ou “cumpre a legislação”. Cada uma é uma afirmação que pode precisar de prova. Um parágrafo elegante pode esconder várias afirmações independentes, algumas corretas e outras não.',
          'Classifica-as por impacto. Um erro de estilo é barato; um preço incorreto, uma regra legal inventada ou uma recomendação de saúde pode causar dano. Revê primeiro o que influencia dinheiro, segurança, direitos, reputação ou uma decisão difícil de reverter.',
        ],
      },
      {
        title: '2. Procura a fonte primária',
        paragraphs: [
          'Para funcionalidades e preços, consulta a página oficial do produto. Para investigação, abre o artigo original. Para regras e obrigações, procura a entidade competente. Uma lista de links gerada pela própria ferramenta não confirma que as páginas existem nem que sustentam a frase.',
          'Regista fonte, data de consulta e passagem relevante com palavras tuas. Se duas fontes credíveis discordarem, apresenta a incerteza. Não escolhas silenciosamente a versão que torna o texto mais convincente.',
        ],
        checklist: [
          'A fonte existe e é possível abri-la?',
          'A fonte diz realmente o que o texto afirma?',
          'A informação aplica-se ao país, plano e data em causa?',
          'Há uma fonte primária mais adequada?',
        ],
      },
      {
        title: '3. Testa também as omissões',
        paragraphs: [
          'Uma resposta pode estar factualmente correta e continuar enganadora por omitir limites. Numa comparação, procura planos excluídos, custos de implementação, condições promocionais e diferenças de privacidade. Numa recomendação, pergunta quem não deve seguir o conselho.',
          'Lê o texto como alguém que discorda da conclusão. Que evidência pediria? Que alternativa relevante ficou de fora? Esta segunda leitura encontra problemas que uma revisão concentrada apenas em gralhas não vê.',
        ],
      },
      {
        title: '4. Mantém uma fronteira humana clara',
        paragraphs: [
          'Define quem assina a revisão e quais conteúdos exigem especialista. A ferramenta pode ajudar a criar uma lista de afirmações, mas não deve certificar a própria resposta. Em áreas de alto risco, a revisão adequada depende de conhecimento profissional e contexto atual.',
          'No fim, escolhe uma de quatro ações: publicar com fontes, corrigir e rever novamente, reduzir o âmbito para o que está suportado ou rejeitar o texto. Guardar esta decisão torna a qualidade repetível e evita que a pressa substitua o critério.',
        ],
      },
      {
        title: '5. Cria um registo de verificação proporcional ao risco',
        paragraphs: [
          'Para conteúdo de baixo impacto, o registo pode ser uma lista curta com ligações e iniciais do revisor. Para uma comparação comercial, relatório ou instrução pública, guarda a versão revista, as fontes utilizadas, a data e as alterações materiais. O objetivo não é criar burocracia para cada frase; é conseguir explicar como as afirmações importantes foram aceites e atualizar o texto quando a realidade mudar.',
          'Define uma data de validade para informação volátil, como preços, disponibilidade, responsáveis ou funcionalidades. Um artigo correto hoje pode tornar-se enganador sem que uma única palavra tenha sido alterada. Alertas de revisão e uma indicação visível de atualização ajudam o leitor a perceber a idade da evidência.',
          'Quando encontrares um erro depois da publicação, corrige-o de forma transparente e procura ocorrências semelhantes noutros conteúdos. A melhor revisão não promete ausência total de falhas; reduz a probabilidade, limita o impacto e aprende com cada problema encontrado.',
        ],
      },
    ],
    takeaway: 'Uma afirmação importante sem fonte verificável deve ser removida, reformulada como incerteza ou confirmada antes da publicação.',
    en: {
      title: 'How to verify AI-generated answers before publishing',
      excerpt: 'A review workflow for finding unsupported claims, weak sources, and omissions before an answer reaches an audience.',
      readingTime: '8 min',
      tags: ['Quality', 'Verification', 'Safety'],
      summary: [
        'Fluent writing is not evidence. Separate testable claims from opinion and check first those that could change a decision.',
        'Review should end with an explicit choice: publish, correct, narrow the scope, or do not use.',
      ],
      sections: [
        {
          title: '1. Break the text into claims',
          paragraphs: [
            'Mark numbers, dates, names, quotations, causal relationships, and phrases such as “the best” or “complies with the law”. Each is a claim that may need evidence. An elegant paragraph can hide several independent claims, some correct and others not.',
            'Rank them by impact. A style error is cheap; an incorrect price, invented legal rule, or health recommendation may cause harm. Review first anything affecting money, safety, rights, reputation, or a decision that is difficult to reverse.',
          ],
        },
        {
          title: '2. Find the primary source',
          paragraphs: [
            'For features and prices, use the official product page. For research, open the original paper. For rules and obligations, find the responsible authority. A list of links generated by the tool does not prove that the pages exist or support the claim.',
            'Record the source, access date, and relevant point in your own words. When credible sources disagree, show the uncertainty instead of silently choosing the version that makes the text more persuasive.',
          ],
          checklist: [
            'Does the source exist and open?',
            'Does it actually support the claim?',
            'Does the information apply to the country, plan, and date?',
            'Is a better primary source available?',
          ],
        },
        {
          title: '3. Test omissions as well',
          paragraphs: [
            'An answer can be factually correct and still mislead by omitting limits. In a comparison, look for excluded plans, implementation costs, promotional conditions, and privacy differences. In a recommendation, ask who should not follow the advice.',
            'Read the text as someone who disagrees with its conclusion. What evidence would they request? Which relevant alternative is missing? This second reading finds issues that proofreading alone cannot.',
          ],
        },
        {
          title: '4. Keep a clear human boundary',
          paragraphs: [
            'Define who signs off the review and which content needs a specialist. A tool may help list claims, but it should not certify its own answer. In high-risk areas, suitable review depends on professional knowledge and current context.',
            'Finish with one of four actions: publish with sources, correct and review again, narrow the scope to supported material, or reject the text. Recording the decision makes quality repeatable and stops urgency from replacing judgement.',
          ],
        },
        {
          title: '5. Keep a verification record proportionate to risk',
          paragraphs: [
            'For low-impact content, the record may be a short link list and reviewer initials. For a commercial comparison, report, or public instruction, keep the reviewed version, sources, date, and material changes. The aim is not bureaucracy for every sentence; it is being able to explain why important claims were accepted and to update them when reality changes.',
            'Give volatile information such as prices, availability, named owners, and features an expiry date. An article that is correct today may become misleading without a single edit. Review reminders and a visible updated date help readers understand the age of the evidence.',
            'When an error is found after publication, correct it transparently and search for similar claims elsewhere. Good review does not promise that no failure will ever happen; it reduces probability, limits impact, and learns from every issue found.',
          ],
        },
      ],
      takeaway: 'An important claim without verifiable evidence should be removed, expressed as uncertainty, or confirmed before publication.',
    },
  },
  {
    slug: 'calcular-custo-real-ferramenta-ia',
    title: 'Como calcular o custo real de uma ferramenta de IA',
    date: '2026-08-18',
    updated: '2026-08-20',
    readingTime: '7 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Uma conta prática que junta subscrição, implementação, revisão e risco para evitar decisões baseadas apenas no preço mensal.',
    tags: ['Custos', 'ROI', 'Decisão'],
    summary: [
      'O preço anunciado é apenas uma parcela. Inclui configuração, formação, integrações, revisão humana, falhas e custo de saída.',
      'Compara cenários conservador, provável e otimista e decide um limite de investimento antes do piloto.',
    ],
    sections: [
      {
        title: '1. Conta custos fixos e variáveis',
        paragraphs: [
          'Começa por licenças, impostos, lugares mínimos e complementos obrigatórios. Depois acrescenta custos que crescem com o uso: créditos, chamadas de API, armazenamento, geração de imagens ou minutos processados. Usa a moeda final da fatura e não apenas o preço destacado na página.',
          'Regista limites do plano. Uma equipa pode descobrir que a subscrição barata exige um nível superior para partilha, segurança ou volume. Se o consumo é incerto, calcula três cenários em vez de escolher uma estimativa confortável.',
        ],
      },
      {
        title: '2. Converte tempo em custo',
        paragraphs: [
          'Mede horas de configuração, aprendizagem, criação de modelos, correção e suporte. Multiplica pelo custo aproximado do tempo das pessoas envolvidas. O objetivo não é produzir contabilidade perfeita, mas tornar visível trabalho que desaparece quando se compara apenas a mensalidade.',
          'Mede o processo completo. Poupar dez minutos a escrever e gastar quinze a validar não é uma poupança. Inclui também esperas, transferências manuais e retrabalho causado por formatos incompatíveis.',
        ],
        checklist: [
          'Quantas pessoas precisam de formação e suporte?',
          'Quanto tempo demora rever cada resultado?',
          'Que integrações têm configuração e manutenção?',
          'Quanto custa exportar ou migrar o trabalho?',
        ],
      },
      {
        title: '3. Estima benefício com uma base comparável',
        paragraphs: [
          'Escolhe uma unidade: tarefa concluída, hora poupada, contacto qualificado ou resultado aceite sem retrabalho. Mede primeiro uma pequena amostra sem a ferramenta e depois repete com ela. Não transformes uma promessa do fornecedor numa poupança observada.',
          'Usa uma conta simples: benefício mensal estimado menos custo mensal total. Para recuperar investimento inicial, divide configuração e formação pelo benefício líquido mensal. Se o benefício depende de qualidade não medida, classifica-o como hipótese.',
        ],
      },
      {
        title: '4. Define o ponto de paragem',
        paragraphs: [
          'Antes do piloto, decide o custo máximo, a utilização mínima e a melhoria necessária. Por exemplo: continuar apenas se vinte tarefas por semana pouparem pelo menos duas horas líquidas sem aumentar erros materiais. Esta regra protege a decisão contra o entusiasmo do lançamento.',
          'Revê a conta após duas a quatro semanas com utilização real. Cancelar uma ferramenta que não atingiu o limite é um resultado válido. Manter várias subscrições pouco usadas porque cada uma “pode dar jeito” é uma forma silenciosa de aumentar custo e complexidade.',
        ],
      },
      {
        title: '5. Compara a alternativa mais simples',
        paragraphs: [
          'A decisão não é apenas entre fornecedores de IA. Inclui o processo atual, uma pequena melhoria sem IA e a possibilidade de não executar a tarefa. Um modelo de documento, uma regra de triagem ou a eliminação de um relatório pouco usado pode resolver o problema com menos custo, dados e manutenção. Coloca estas opções na mesma tabela com a mesma unidade de benefício.',
          'Inclui também concentração e dependência. Se vários processos críticos usam a mesma plataforma, uma alteração de preço, limite ou disponibilidade afeta todos ao mesmo tempo. Estima o esforço para exportar materiais, substituir integrações e voltar temporariamente ao processo manual. Esse custo de continuidade merece peso mesmo quando ainda não apareceu numa fatura.',
          'Apresenta a decisão numa página: cenário escolhido, pressupostos, custos incluídos, benefícios observados, riscos e próxima revisão. Mostra intervalos em vez de falsa precisão. Uma estimativa honesta de 300 a 500 euros por mês é mais útil do que um valor exato construído sobre volumes que ninguém mediu.',
        ],
      },
    ],
    takeaway: 'Compra apenas quando o benefício observado ultrapassa subscrição, tempo de revisão e custo de mudança com margem suficiente.',
    en: {
      title: 'How to calculate the real cost of an AI tool',
      excerpt: 'A practical calculation combining subscription, implementation, review, and risk instead of relying on the monthly price.',
      readingTime: '7 min',
      tags: ['Costs', 'ROI', 'Decision'],
      summary: [
        'The advertised price is only one component. Include setup, training, integrations, human review, failure, and exit costs.',
        'Compare conservative, likely, and optimistic scenarios, and decide an investment limit before the pilot.',
      ],
      sections: [
        {
          title: '1. Count fixed and variable costs',
          paragraphs: [
            'Start with licences, taxes, minimum seats, and required add-ons. Then add costs that grow with use: credits, API calls, storage, image generations, or processed minutes. Use the currency on the final invoice, not only the highlighted website price.',
            'Record plan limits. A team may find that sharing, security, or volume requires a higher tier. When consumption is uncertain, calculate three scenarios rather than choosing a comfortable estimate.',
          ],
        },
        {
          title: '2. Turn time into cost',
          paragraphs: [
            'Measure setup, learning, template creation, correction, and support hours. Multiply them by the approximate cost of the people involved. The aim is not perfect accounting; it is to expose work that disappears when only subscriptions are compared.',
            'Measure the complete process. Saving ten minutes on writing and spending fifteen on verification is not a saving. Include waiting, manual transfers, and rework caused by incompatible formats.',
          ],
          checklist: [
            'How many people need training and support?',
            'How long does each output take to review?',
            'Which integrations need setup and maintenance?',
            'What will export or migration cost?',
          ],
        },
        {
          title: '3. Estimate benefit on a comparable basis',
          paragraphs: [
            'Choose one unit: completed task, hour saved, qualified lead, or result accepted without rework. Measure a small sample without the tool, then repeat with it. Do not turn a provider promise into an observed saving.',
            'Use a simple calculation: estimated monthly benefit minus total monthly cost. To estimate payback, divide setup and training by monthly net benefit. If the benefit depends on unmeasured quality, label it as a hypothesis.',
          ],
        },
        {
          title: '4. Define the stop point',
          paragraphs: [
            'Before the pilot, decide the maximum cost, minimum usage, and required improvement. For example, continue only if twenty tasks a week save at least two net hours without increasing material errors. This protects the decision from launch enthusiasm.',
            'Review the calculation after two to four weeks of real use. Cancelling a tool that missed the threshold is a valid result. Keeping several little-used subscriptions because each “might be useful” quietly increases cost and complexity.',
          ],
        },
        {
          title: '5. Compare the simplest alternative',
          paragraphs: [
            'The decision is not only between AI providers. Include the current process, a small improvement without AI, and the option not to perform the task. A document template, routing rule, or removal of a little-used report may solve the problem with less cost, data, and maintenance. Put these choices in the same table using the same benefit unit.',
            'Include concentration and dependency. If several critical processes use one platform, a price, limit, or availability change affects all of them. Estimate the work required to export materials, replace integrations, and return temporarily to the manual process. This continuity cost matters even before it appears on an invoice.',
            'Present the decision on one page: chosen scenario, assumptions, included costs, observed benefits, risks, and next review. Show ranges instead of false precision. An honest estimate of 300 to 500 euros a month is more useful than an exact figure built on volumes nobody measured.',
          ],
        },
      ],
      takeaway: 'Buy only when observed benefit exceeds subscription, review time, and switching cost by a sufficient margin.',
    },
  },
  {
    slug: 'automatizar-tarefas-com-ia-sem-perder-controlo',
    title: 'Como automatizar tarefas com IA sem perder o controlo',
    date: '2026-08-17',
    updated: '2026-08-20',
    readingTime: '8 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um guia para escolher tarefas, colocar aprovações humanas e lançar automações com limites, registos e recuperação.',
    tags: ['Automação', 'Workflows', 'Controlo'],
    summary: [
      'Começa por tarefas frequentes, reversíveis e fáceis de verificar. Automatizar um processo instável apenas acelera os seus erros.',
      'Mantém aprovação humana antes de ações externas e define limites de volume, permissões e custo.',
    ],
    sections: [
      {
        title: '1. Escolhe uma tarefa adequada',
        paragraphs: [
          'Boas primeiras candidatas têm entrada previsível, resultado observável e erro reversível: classificar pedidos, extrair campos, preparar rascunhos ou resumir informação para revisão. Evita começar por pagamentos, decisões laborais, eliminação de dados ou mensagens públicas automáticas.',
          'Desenha o processo atual antes de adicionar IA. Identifica entrada, regras, exceções, responsável e saída. Se ninguém consegue explicar como a tarefa funciona, a automação ficará dependente de suposições escondidas.',
        ],
      },
      {
        title: '2. Separa sugestão de ação',
        paragraphs: [
          'Na primeira versão, deixa a IA preparar uma sugestão e uma pessoa aprová-la. Esta fronteira permite observar erros sem os transformar imediatamente em emails enviados, registos alterados ou compromissos assumidos.',
          'Só remove a aprovação quando houver amostra suficiente, taxa de erro aceitável e recuperação clara. Algumas ações devem manter revisão humana permanentemente devido ao impacto, mesmo quando a ferramenta parece consistente.',
        ],
        checklist: [
          'A ação pode ser desfeita de forma simples?',
          'Existe um responsável por rever exceções?',
          'O sistema regista entrada, saída e decisão?',
          'Há limites de volume, custo e frequência?',
        ],
      },
      {
        title: '3. Dá o mínimo acesso necessário',
        paragraphs: [
          'Usa contas técnicas dedicadas e permissões limitadas a pastas, tabelas ou ações específicas. Uma automação que lê um formulário não precisa, por defeito, de acesso a toda a caixa de correio ou base de clientes.',
          'Separa ambientes de teste e produção. Trabalha com dados fictícios no início e guarda segredos fora dos prompts. Revoga integrações abandonadas e regista quem pode alterar instruções, modelos e destinos.',
        ],
      },
      {
        title: '4. Lança com travões e métricas',
        paragraphs: [
          'Começa com um limite diário baixo, um pequeno grupo e alertas para falhas. Mede taxa de resultados aceites, correções, tempo líquido poupado e incidentes. Uma automação rápida que cria mais revisão ou tickets de suporte não melhorou o processo.',
          'Define um interruptor de paragem e um procedimento manual de recuperação. Revê amostras mesmo depois do lançamento; fornecedores, dados e comportamento podem mudar. Controlo não é uma configuração inicial, mas uma rotina de operação.',
        ],
      },
      {
        title: '5. Trata exceções como parte do produto',
        paragraphs: [
          'Lista situações esperadas que não cabem no percurso normal: ficheiro vazio, idioma inesperado, cliente duplicado, resposta demasiado longa, serviço indisponível ou resultado sem confiança. Para cada uma, decide se o sistema deve repetir, enviar para revisão, usar uma regra tradicional ou parar. Sem esta tabela, a automação tende a improvisar exatamente quando há menos contexto.',
          'Mostra à pessoa que revê a entrada original, a sugestão, a regra aplicada e uma forma simples de corrigir. Guardar apenas a resposta final dificulta perceber se a falha veio dos dados, das instruções ou da integração. Categorias de erro consistentes transformam correções isoladas numa fonte de melhoria.',
          'Faz um exercício de falha antes de aumentar o volume: desliga uma integração, força um limite de custo e introduz um caso proibido. Confirma que alertas chegam à pessoa certa e que o trabalho consegue continuar manualmente. A automação está pronta para crescer quando a equipa sabe tanto como parar como iniciar.',
        ],
      },
    ],
    takeaway: 'Automatiza primeiro a preparação; só automatiza a ação quando consegues medir, limitar, auditar e reverter o resultado.',
    en: {
      title: 'How to automate tasks with AI without losing control',
      excerpt: 'A guide to choosing tasks, adding human approvals, and launching automation with limits, logs, and recovery.',
      readingTime: '8 min',
      tags: ['Automation', 'Workflows', 'Control'],
      summary: [
        'Start with frequent, reversible, and easily verified tasks. Automating an unstable process only accelerates its errors.',
        'Keep human approval before external actions and define limits for volume, permissions, and cost.',
        'Document the manual fallback before launch so an outage or unexpected result does not stop essential work.',
      ],
      sections: [
        {
          title: '1. Choose a suitable task',
          paragraphs: [
            'Good first candidates have predictable inputs, observable outputs, and reversible errors: classifying requests, extracting fields, preparing drafts, or summarising information for review. Avoid starting with payments, employment decisions, data deletion, or automatic public messages.',
            'Map the current process before adding AI. Identify the input, rules, exceptions, owner, and output. If nobody can explain how the task works, the automation will depend on hidden assumptions.',
          ],
        },
        {
          title: '2. Separate suggestion from action',
          paragraphs: [
            'In the first version, let AI prepare a suggestion for a person to approve. This boundary lets you observe mistakes before they become sent emails, altered records, or external commitments.',
            'Remove approval only after a sufficient sample, an acceptable error rate, and a clear recovery path. Some high-impact actions should always keep human review, even when the tool appears consistent.',
          ],
          checklist: [
            'Can the action be easily undone?',
            'Is someone responsible for reviewing exceptions?',
            'Does the system record input, output, and decision?',
            'Are volume, cost, and frequency limited?',
          ],
        },
        {
          title: '3. Grant the minimum necessary access',
          paragraphs: [
            'Use dedicated service accounts and permissions limited to specific folders, tables, or actions. An automation reading one form does not need default access to an entire mailbox or customer database.',
            'Separate test and production environments. Begin with fictional data, keep secrets out of prompts, revoke abandoned integrations, and record who may change instructions, models, and destinations.',
          ],
        },
        {
          title: '4. Launch with brakes and metrics',
          paragraphs: [
            'Start with a low daily limit, a small group, and failure alerts. Measure accepted outputs, corrections, net time saved, and incidents. A fast automation that creates extra review or support tickets has not improved the process.',
            'Define a stop switch and manual recovery procedure. Keep reviewing samples after launch because providers, data, and behaviour can change. Control is an operating routine, not a one-time setting.',
          ],
        },
        {
          title: '5. Treat exceptions as part of the product',
          paragraphs: [
            'List expected situations outside the normal path: empty file, unexpected language, duplicate customer, excessive response length, unavailable service, or low-confidence output. For each, decide whether the system should retry, send for review, use a conventional rule, or stop. Without this table, automation tends to improvise exactly when it has the least context.',
            'Show reviewers the original input, suggestion, applied rule, and a simple correction path. Keeping only the final answer makes it difficult to tell whether failure came from data, instructions, or integration. Consistent error categories turn isolated corrections into evidence for improvement.',
            'Run a failure exercise before increasing volume: disconnect an integration, force a cost limit, and enter a prohibited case. Confirm that alerts reach the right person and work can continue manually. Record recovery time and any data that must be reconciled afterwards. Repeat the exercise whenever a critical integration or owner changes. Automation is ready to grow when the team knows how to stop it as well as start it.',
          ],
        },
      ],
      takeaway: 'Automate preparation first; automate action only when you can measure, limit, audit, and reverse the outcome.',
    },
  },
  {
    slug: 'escolher-gerador-imagens-ia',
    title: 'Como escolher um gerador de imagens com IA',
    date: '2026-08-16',
    updated: '2026-08-20',
    readingTime: '7 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Critérios práticos para comparar qualidade, consistência, edição, direitos de uso e custo num teste com imagens reais.',
    tags: ['Imagem', 'Criatividade', 'Comparação'],
    summary: [
      'Não compares apenas a imagem mais bonita. Testa consistência, capacidade de edição, formatos, velocidade e trabalho até ao ficheiro final.',
      'Confirma termos de uso, privacidade dos materiais enviados e regras internas antes de usar imagens comercialmente.',
    ],
    sections: [
      {
        title: '1. Define o tipo de imagem e o destino',
        paragraphs: [
          'Uma ferramenta para conceitos visuais pode não servir para fotografia de produto, ilustração com personagem consistente ou edição localizada. Escreve três entregáveis reais com proporção, resolução, canal e prazo. “Imagem para campanha” é demasiado vago; “cabeçalho 16:9 com espaço legível para título” é testável.',
          'Decide também o que precisa de permanecer igual entre imagens: produto, pessoa, paleta, enquadramento ou estilo. A consistência costuma revelar diferenças que um único resultado de demonstração não mostra.',
        ],
      },
      {
        title: '2. Executa quatro testes comparáveis',
        paragraphs: [
          'Usa o mesmo briefing para gerar, repetir, editar e exportar. Primeiro avalia a composição inicial; depois pede uma variação coerente; em seguida altera apenas um elemento; por fim exporta no formato necessário. Regista tentativas e minutos até ao resultado aceite.',
          'Avalia anatomia e texto quando aparecem, mas também detalhes do teu caso: logótipo deformado, materiais incorretos, sombras inconsistentes ou fundos difíceis de recortar. Uma média genérica de qualidade não substitui estes critérios.',
        ],
        checklist: [
          'A composição respeita o briefing e a proporção?',
          'A identidade mantém-se entre variações?',
          'É possível alterar uma zona sem refazer tudo?',
          'A exportação tem resolução e transparência adequadas?',
        ],
      },
      {
        title: '3. Revê direitos e dados de entrada',
        paragraphs: [
          'Lê os termos aplicáveis ao plano e ao uso pretendido. Confirma utilização comercial, responsabilidade por materiais enviados, tratamento de imagens privadas e eventuais restrições. Guarda a data e a ligação para os termos consultados.',
          'Não envies fotografias de clientes, ativos ainda confidenciais ou referências sem autorização apenas para testar. Direitos de utilização e risco de semelhança exigem revisão humana, sobretudo em campanhas, embalagens e comunicação pública.',
        ],
      },
      {
        title: '4. Calcula custo por imagem aprovada',
        paragraphs: [
          'Divide subscrição e créditos pelo número de imagens que chegaram ao uso final, não pelo total gerado. Acrescenta tempo de seleção, correção, aumento de resolução, remoção de fundo e composição noutra aplicação.',
          'Escolhe a ferramenta que reduz o percurso completo para o teu tipo de trabalho. Um gerador visualmente impressionante pode perder para outro com edição mais previsível, exportação correta e menos tentativas.',
        ],
      },
      {
        title: '5. Constrói um teste cego e uma biblioteca de referência',
        paragraphs: [
          'Apresenta os resultados sem o nome da ferramenta a duas ou três pessoas que conhecem o objetivo. Pede-lhes que avaliem cumprimento do briefing, qualidade técnica, adequação à marca e esforço de correção. Um teste cego reduz o efeito da reputação do fornecedor e da imagem escolhida por quem já prefere uma opção.',
          'Guarda briefings, parâmetros, resultados aceites e razões de rejeição. Inclui casos difíceis, como mãos visíveis, texto, vários produtos ou uma alteração local. Esta biblioteca permite repetir a avaliação depois de uma atualização e formar colegas sem depender apenas de dicas informais.',
          'Antes de padronizar, cria uma lista de usos permitidos, usos que exigem aprovação e usos excluídos. Identifica também como assinalar conteúdo gerado quando o canal ou a política interna o pedir. A ferramenta passa então de experiência individual a capacidade criativa com critérios partilhados.',
        ],
      },
    ],
    takeaway: 'A melhor ferramenta de imagem é a que produz mais ficheiros aprovados com consistência, direitos claros e menos retrabalho.',
    en: {
      title: 'How to choose an AI image generator',
      excerpt: 'Practical criteria for comparing quality, consistency, editing, usage rights, and cost with real image tasks.',
      readingTime: '7 min',
      tags: ['Images', 'Creativity', 'Comparison'],
      summary: [
        'Do not compare only the prettiest image. Test consistency, editing, formats, speed, and work required to reach the final file.',
        'Confirm usage terms, privacy for uploaded materials, and internal rules before using images commercially.',
        'Measure success with approved deliverables rather than the number of attractive experiments generated.',
      ],
      sections: [
        {
          title: '1. Define the image type and destination',
          paragraphs: [
            'A tool for visual concepts may not suit product photography, consistent characters, or local editing. Write three real deliverables with aspect ratio, resolution, channel, and deadline. “Campaign image” is vague; “16:9 header with readable title space” is testable.',
            'Decide what must remain consistent across images: product, person, palette, framing, or style. Consistency usually exposes differences that a single demonstration cannot.',
          ],
        },
        {
          title: '2. Run four comparable tests',
          paragraphs: [
            'Use the same brief to generate, repeat, edit, and export. Assess the first composition, request a coherent variation, change one element, then export in the required format. Record attempts and minutes to an accepted result.',
            'Check anatomy and text when present, but also case-specific details: distorted logos, incorrect materials, inconsistent shadows, or backgrounds that are difficult to cut out. A generic quality score cannot replace these criteria.',
          ],
          checklist: [
            'Does the composition follow the brief and ratio?',
            'Does identity remain stable across variations?',
            'Can one area change without rebuilding everything?',
            'Does export provide suitable resolution and transparency?',
          ],
        },
        {
          title: '3. Review rights and input data',
          paragraphs: [
            'Read the terms applying to the plan and intended use. Confirm commercial use, responsibility for uploaded materials, handling of private images, and restrictions. Save the date and link for the terms reviewed.',
            'Do not upload client photographs, confidential assets, or unauthorised references just for a test. Usage rights and similarity risk need human review, especially in campaigns, packaging, and public communication.',
          ],
        },
        {
          title: '4. Calculate cost per approved image',
          paragraphs: [
            'Divide subscription and credits by images that reached final use, not total generations. Add selection, correction, upscaling, background removal, and composition time in other software.',
            'Choose the tool that shortens the complete path for your work. A visually impressive generator may lose to one with predictable editing, correct exports, and fewer attempts.',
          ],
        },
        {
          title: '5. Build a blind test and reference library',
          paragraphs: [
            'Show results without tool names to two or three people who understand the objective. Ask them to score brief compliance, technical quality, brand fit, and correction effort. A blind test reduces the influence of provider reputation and of the image selected by someone who already prefers one option.',
            'Save briefs, settings, accepted outputs, and rejection reasons. Include difficult cases such as visible hands, text, multiple products, or one local edit. This library allows the assessment to be repeated after an update and helps colleagues learn without relying on informal tips.',
            'Before standardising, create a list of permitted uses, uses requiring approval, and excluded uses. State how generated content should be labelled when a channel or internal policy requires it. Assign someone to review new model features and terms before enabling them for everyone. Recheck a sample of published work after major updates because consistency may change even when the interface looks familiar. The tool then moves from an individual experiment to a creative capability with shared criteria.',
          ],
        },
      ],
      takeaway: 'The best image tool produces more approved files with consistency, clear rights, and less rework.',
    },
  },
  {
    slug: 'adotar-ia-em-equipa-plano-30-dias',
    title: 'Como adotar IA numa equipa: um plano prático de 30 dias',
    date: '2026-08-15',
    updated: '2026-08-20',
    readingTime: '9 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um piloto de quatro semanas para escolher casos de uso, definir limites, formar pessoas e decidir com evidência.',
    tags: ['Equipas', 'Adoção', 'Plano'],
    summary: [
      'A adoção começa com duas ou três tarefas e regras claras, não com acesso geral a muitas ferramentas.',
      'Ao fim de 30 dias, decide por caso de uso com base em qualidade, tempo, risco e adesão — não apenas em entusiasmo.',
    ],
    sections: [
      {
        title: 'Dias 1–5: escolhe problemas e responsáveis',
        paragraphs: [
          'Recolhe tarefas repetitivas, demoradas ou propensas a filas de espera. Escolhe duas ou três com dados controláveis e resultado verificável. Nomeia uma pessoa responsável por cada caso e alguém que possa decidir sobre segurança, privacidade ou compras quando surgir uma dúvida.',
          'Regista a linha de base: tempo atual, volume, erros e satisfação. Sem este ponto de partida, uma demonstração rápida pode parecer melhoria mesmo quando apenas transfere trabalho para a revisão.',
        ],
      },
      {
        title: 'Dias 6–10: define regras e ferramentas',
        paragraphs: [
          'Aprova uma shortlist pequena e descreve que dados podem ser usados, que integrações são permitidas e quais resultados exigem revisão. Inclui uma forma simples de comunicar incidentes e dúvidas sem penalizar quem os identifica.',
          'Configura contas, retenção e permissões antes da formação. Evita que cada pessoa experimente planos e definições diferentes, porque resultados inconsistentes tornam o piloto difícil de avaliar.',
        ],
        checklist: [
          'Tarefas autorizadas e tarefas excluídas',
          'Classes de dados permitidas',
          'Responsável por revisão e incidentes',
          'Métrica e condição de paragem',
        ],
      },
      {
        title: 'Dias 11–20: forma com trabalho real',
        paragraphs: [
          'Faz uma sessão curta com exemplos da própria equipa: como preparar a entrada, pedir o formato, verificar o resultado e registar uma falha. Entrega modelos iniciais, mas permite que sejam melhorados quando a evidência justificar.',
          'Durante o piloto, recolhe amostras aceites e rejeitadas. Uma biblioteca só com sucessos esconde limites; exemplos de falha ensinam quando parar, pedir ajuda ou executar a tarefa manualmente.',
        ],
      },
      {
        title: 'Dias 21–30: mede e decide por caso de uso',
        paragraphs: [
          'Compara tempo líquido, qualidade, correções, incidentes e utilização com a linha de base. Fala também com quem deixou de usar a ferramenta: abandono pode revelar fricção, falta de confiança ou uma tarefa mal escolhida.',
          'Decide continuar, ajustar ou terminar cada caso separadamente. Para o que avança, define proprietário, orçamento, revisão periódica e processo de saída. Publica internamente uma página curta com decisões e limites atuais.',
        ],
      },
      {
        title: 'Depois do dia 30: cria uma rotina leve de governação',
        paragraphs: [
          'Reúne mensalmente responsáveis pelos casos durante trinta minutos. Revê métricas, incidentes, alterações dos fornecedores, novas necessidades e ferramentas sem utilização. Esta cadência é suficiente para uma equipa pequena quando as decisões e os proprietários estão documentados. Questões de alto impacto devem seguir imediatamente para as funções competentes, sem esperar pela reunião.',
          'Mantém um inventário com ferramenta, finalidade, dados permitidos, integrações, custo, responsável e data de revisão. O inventário não precisa de software complexo; uma tabela controlada é melhor do que informação espalhada por contas pessoais. Quando alguém sai da equipa, transfere propriedade e revoga acessos.',
          'Para expandir, exige o mesmo mini-caso de negócio usado no piloto: problema, linha de base, dados, risco, métrica e saída. Partilha aprendizagens entre equipas, mas não assumes que um caso aprovado num contexto é seguro noutro. A governação funciona quando acelera boas experiências e interrompe cedo as que não conseguem demonstrar valor controlado.',
        ],
      },
    ],
    takeaway: 'Expande apenas os casos que melhoraram uma métrica real sem ultrapassar os limites de qualidade, dados e controlo.',
    en: {
      title: 'How to adopt AI in a team: a practical 30-day plan',
      excerpt: 'A four-week pilot for choosing use cases, setting boundaries, training people, and deciding with evidence.',
      readingTime: '9 min',
      tags: ['Teams', 'Adoption', 'Plan'],
      summary: [
        'Adoption starts with two or three tasks and clear rules, not broad access to many tools.',
        'After 30 days, decide by use case using quality, time, risk, and adoption evidence rather than enthusiasm alone.',
        'Give every approved use case an owner, review date, budget, documented data boundary, and practical exit path.',
      ],
      sections: [
        {
          title: 'Days 1–5: choose problems and owners',
          paragraphs: [
            'Collect tasks that are repetitive, slow, or prone to queues. Choose two or three with controllable data and verifiable outputs. Name an owner for each case and someone able to decide security, privacy, or purchasing questions.',
            'Record the baseline: current time, volume, errors, and satisfaction. Without it, a quick demonstration may look like an improvement while merely moving work into review.',
          ],
        },
        {
          title: 'Days 6–10: define rules and tools',
          paragraphs: [
            'Approve a small shortlist and describe what data may be used, which integrations are allowed, and which outputs require review. Include a simple way to report incidents and uncertainty without penalising the person who raises them.',
            'Configure accounts, retention, and permissions before training. Avoid different plans and settings for every person because inconsistent results make the pilot difficult to assess.',
          ],
          checklist: [
            'Authorised and excluded tasks',
            'Allowed data classes',
            'Review and incident owner',
            'Metric and stop condition',
          ],
        },
        {
          title: 'Days 11–20: train with real work',
          paragraphs: [
            'Run a short session using team examples: prepare input, request a format, verify the output, and record a failure. Provide starter templates, but let evidence improve them.',
            'Collect accepted and rejected samples during the pilot. A library containing only successes hides limits; failure examples teach people when to stop, ask for help, or complete the task manually.',
          ],
        },
        {
          title: 'Days 21–30: measure and decide by use case',
          paragraphs: [
            'Compare net time, quality, corrections, incidents, and usage with the baseline. Speak with people who stopped using the tool: abandonment may reveal friction, low trust, or a poorly chosen task.',
            'Continue, adjust, or end each case separately. For those moving forward, define an owner, budget, periodic review, and exit process. Publish a short internal page with current decisions and boundaries.',
          ],
        },
        {
          title: 'After day 30: create a lightweight governance routine',
          paragraphs: [
            'Bring use-case owners together for thirty minutes each month. Review metrics, incidents, provider changes, new needs, and unused tools. This cadence is enough for a small team when decisions and owners are documented. High-impact issues should go immediately to the responsible functions rather than waiting for the meeting.',
            'Keep an inventory with tool, purpose, allowed data, integrations, cost, owner, and review date. It needs no complex software; a controlled table is better than information scattered across personal accounts. Transfer ownership and revoke access when someone leaves the team.',
            'To expand, require the same mini business case used in the pilot: problem, baseline, data, risk, metric, and exit. Share lessons across teams, but do not assume a use case approved in one context is safe in another. Schedule a quarterly removal review for duplicate tools, inactive accounts, and cases whose benefit has disappeared. Publish the current approved list where everyone can find it. Governance works when it accelerates sound experiments and stops early those that cannot demonstrate controlled value.',
          ],
        },
      ],
      takeaway: 'Expand only the use cases that improve a real metric without exceeding quality, data, and control boundaries.',
    },
  },
  {
    slug: 'checklist-privacidade-ia',
    title: 'Checklist de privacidade para avaliar uma ferramenta de IA',
    date: '2026-03-07',
    updated: '2026-08-13',
    readingTime: '8 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um processo prático para classificar dados, rever retenção e permissões e decidir o que pode — ou não — entrar numa ferramenta de IA.',
    tags: ['Privacidade', 'Segurança', 'Checklist'],
    summary: [
      'Não introduzas dados numa ferramenta apenas porque o resultado parece útil. Primeiro classifica a informação, confirma como é tratada e reduz o que envias.',
      'Esta checklist não substitui aconselhamento jurídico. Serve para uma primeira triagem operacional e para documentar uma decisão repetível.',
    ],
    sections: [
      {
        title: '1. Começa pelos dados, não pela ferramenta',
        paragraphs: [
          'O risco muda mais com o conteúdo introduzido do que com o nome da aplicação. Um pedido para resumir uma notícia pública tem um perfil muito diferente de um pedido com contratos, dados de clientes ou código privado. Antes de abrir uma conta, escreve duas ou três tarefas reais e identifica os dados necessários para cada uma.',
          'Usa quatro classes simples: público, interno, confidencial e restrito. Conteúdo público pode ser usado com os cuidados normais. Informação interna exige regras claras. Dados confidenciais ou restritos — credenciais, informação de saúde, dados financeiros, segredos comerciais ou dados pessoais sensíveis — não devem entrar num serviço sem validação formal da organização.',
        ],
        checklist: [
          'Consigo executar a tarefa com dados fictícios ou anonimizados?',
          'O pedido contém nomes, emails, identificadores, contratos ou informação de clientes?',
          'Há credenciais, tokens, chaves de API ou documentos que nunca deveriam sair do sistema de origem?',
        ],
      },
      {
        title: '2. Confirma o ciclo de vida da informação',
        paragraphs: [
          'Procura respostas concretas para cinco perguntas: onde os dados são processados, durante quanto tempo ficam guardados, quem lhes pode aceder, se podem ser usados para treino e como são eliminados. Uma frase vaga como “levamos a privacidade a sério” não responde a nenhuma delas.',
          'Guarda a ligação para a política consultada e a data da revisão. As condições podem mudar. Se o fornecedor oferece uma definição para impedir o uso dos dados em treino, regista onde ela está e se se aplica à conta inteira, apenas a novas conversas ou só a determinados planos.',
        ],
        checklist: [
          'Existe uma política de retenção com períodos definidos?',
          'É possível apagar conversas, ficheiros e a própria conta?',
          'O fornecedor identifica subprocessadores e regiões de armazenamento?',
          'A opção de não usar dados para treino está disponível no plano escolhido?',
        ],
      },
      {
        title: '3. Revê permissões e integrações',
        paragraphs: [
          'Uma extensão que lê todas as páginas do browser ou uma integração com email pode expor muito mais informação do que o texto que colas manualmente. Compara a permissão pedida com a tarefa. Para resumir um documento, acesso permanente à caixa de correio inteira é difícil de justificar.',
          'Prefere autorizações limitadas, contas de teste e pastas dedicadas. Depois do teste, revoga acessos que deixaram de ser necessários. Numa equipa, define quem pode ligar novas integrações e evita que cada pessoa tome decisões isoladas sobre dados partilhados.',
        ],
        checklist: [
          'A integração pede apenas os recursos necessários?',
          'Posso limitar o acesso a uma pasta, projeto ou conjunto de ficheiros?',
          'Se eu remover a integração, sei que dados permanecem no fornecedor?',
        ],
      },
      {
        title: '4. Faz um teste de saída antes do teste de qualidade',
        paragraphs: [
          'Mesmo com bons controlos de entrada, uma resposta pode repetir dados pessoais, inferir informação incorreta ou produzir texto que alguém partilha sem revisão. Cria um teste deliberado: inclui dados fictícios reconhecíveis, pede uma reformulação e verifica se o resultado preserva detalhes que deveriam ter sido removidos.',
          'Define também a regra humana: quem revê a resposta e em que situações é proibido copiá-la diretamente para um cliente, publicação ou decisão. Privacidade e qualidade encontram-se aqui — uma resposta convincente mas incorreta pode causar tanto dano como uma exposição de dados.',
        ],
      },
      {
        title: '5. Regista a decisão numa ficha curta',
        paragraphs: [
          'Uma decisão útil cabe numa página: tarefa aprovada, classe de dados permitida, conta ou plano testado, definições ativadas, integrações autorizadas, responsável e data da próxima revisão. Acrescenta uma decisão explícita — aprovado, aprovado com limites ou não aprovado.',
          'Revê a ficha quando o fornecedor altera políticas, adiciona integrações, muda o plano contratado ou quando a equipa começa a usar a ferramenta para uma tarefa diferente. A checklist deixa então de ser um exercício pontual e passa a ser um controlo simples que acompanha o uso real.',
        ],
      },
    ],
    takeaway:
      'Regra prática: se não consegues explicar onde os dados ficam, quem lhes acede e como são apagados, ainda não tens informação suficiente para usar dados reais.',
    en: {
      title: 'Privacy checklist for evaluating an AI tool',
      excerpt:
        'A practical process to classify data, review retention and permissions, and decide what may — or may not — enter an AI tool.',
      readingTime: '8 min',
      tags: ['Privacy', 'Security', 'Checklist'],
      summary: [
        'Do not enter data into a tool simply because its output looks useful. Classify the information first, confirm how it is handled, and minimise what you send.',
        'This checklist is not legal advice. It is an operational first pass designed to make decisions consistent and reviewable.',
      ],
      sections: [
        {
          title: '1. Start with the data, not the tool',
          paragraphs: [
            'Risk changes more with the information you provide than with the name of the application. Summarising a public article is very different from processing contracts, customer records, or private source code. Before creating an account, write down two or three real tasks and identify the data each one needs.',
            'Use four simple classes: public, internal, confidential, and restricted. Public material can be used with ordinary care. Internal information needs clear rules. Confidential or restricted data — credentials, health information, financial records, trade secrets, or sensitive personal data — should not enter a service without formal organisational approval.',
          ],
          checklist: [
            'Can the task be completed with fictional or anonymised data?',
            'Does the prompt contain names, email addresses, identifiers, contracts, or customer information?',
            'Are there credentials, API keys, tokens, or documents that should never leave their source system?',
          ],
        },
        {
          title: '2. Confirm the information lifecycle',
          paragraphs: [
            'Find concrete answers to five questions: where data is processed, how long it is retained, who can access it, whether it may be used for training, and how it is deleted. A vague statement such as “we take privacy seriously” does not answer any of them.',
            'Save the policy link and the review date because terms can change. If the provider offers a control that prevents training on your data, record where it is, and whether it applies to the whole account, only new conversations, or particular plans.',
          ],
          checklist: [
            'Is there a retention policy with defined periods?',
            'Can conversations, files, and the account itself be deleted?',
            'Does the provider identify subprocessors and storage regions?',
            'Is a training opt-out available on the chosen plan?',
          ],
        },
        {
          title: '3. Review permissions and integrations',
          paragraphs: [
            'A browser extension that reads every page or an email integration may expose far more information than text pasted manually. Compare every requested permission with the task. Permanent access to an entire mailbox is difficult to justify when the goal is to summarise one document.',
            'Prefer limited authorisations, test accounts, and dedicated folders. Revoke access after the test when it is no longer needed. For teams, define who may connect new integrations so that decisions about shared data are not made in isolation.',
          ],
          checklist: [
            'Does the integration request only the resources it needs?',
            'Can access be limited to one folder, project, or file set?',
            'If the integration is removed, do I know what data remains with the provider?',
          ],
        },
        {
          title: '4. Test the output before testing quality',
          paragraphs: [
            'Even with good input controls, an answer can repeat personal data, infer incorrect details, or produce text that someone shares without review. Create a deliberate test with recognisable fictional data, ask for a rewrite, and check whether the result preserves details that should have been removed.',
            'Define the human rule as well: who reviews the answer, and when it must never be copied directly into a customer message, publication, or decision. Privacy and quality meet here — a convincing but incorrect response may be as harmful as a data exposure.',
          ],
        },
        {
          title: '5. Record the decision in a short assessment',
          paragraphs: [
            'A useful record fits on one page: approved task, allowed data class, tested account or plan, enabled settings, authorised integrations, owner, and next review date. End with an explicit decision — approved, approved with limits, or not approved.',
            'Review the record when the provider changes policies, adds integrations, changes the contracted plan, or when the team starts using the tool for a different job. The checklist then becomes a lightweight control that follows real use instead of a one-off exercise.',
          ],
        },
      ],
      takeaway:
        'Practical rule: if you cannot explain where the data stays, who can access it, and how it is deleted, you do not yet have enough information to use real data.',
    },
  },
  {
    slug: 'como-avaliar-ferramentas-ia',
    title: 'Como avaliar uma ferramenta de IA em 15 minutos',
    date: '2026-03-06',
    updated: '2026-08-13',
    readingTime: '9 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um teste repetível com três tarefas reais, uma grelha de 10 pontos e critérios de paragem para separar uma boa demonstração de valor útil.',
    tags: ['Avaliação', 'Produtividade', 'Método AQUA'],
    summary: [
      'O objetivo não é descobrir a “melhor IA”. É decidir se uma ferramenta melhora uma tarefa concreta o suficiente para justificar custo, risco e mudança de processo.',
      'Usa sempre as mesmas tarefas e a mesma grelha quando comparares alternativas. Sem um teste repetível, a novidade tende a ganhar à consistência.',
    ],
    sections: [
      {
        title: 'Antes do cronómetro: prepara três casos reais',
        paragraphs: [
          'Escolhe uma tarefa simples, uma tarefa frequente e uma tarefa difícil. Por exemplo: resumir um documento curto, transformar notas numa proposta e analisar um ficheiro com instruções ambíguas. Remove dados sensíveis, mas mantém a estrutura e as dificuldades que existem no trabalho real.',
          'Escreve o resultado mínimo aceitável antes de testar. Pode ser “um resumo com cinco pontos e referências às páginas”, “uma proposta que respeita este tom” ou “uma tabela sem inventar valores”. Esta frase impede que mudes o critério só porque a resposta parece impressionante.',
        ],
      },
      {
        title: 'Minutos 0–3: mede a entrada em funcionamento',
        paragraphs: [
          'Começa do zero. Mede quanto tempo demora criar a conta, encontrar a função certa e produzir a primeira resposta. Não ignores passos que só acontecem no início: permissões pouco claras, verificação de email, limites escondidos ou uma interface que exige configuração extensa são parte do custo de adoção.',
          'Atribui 0 pontos se não conseguires começar, 1 ponto se precisares de ajuda ou tentativa e erro e 2 pontos se o percurso for claro. Regista uma frase de evidência; “demorei quatro minutos a encontrar a importação de PDF” é mais útil do que “a interface parece confusa”.',
        ],
      },
      {
        title: 'Minutos 3–9: executa as três tarefas sem mudar as regras',
        paragraphs: [
          'Usa o mesmo pedido inicial em todas as ferramentas. Podes fazer uma correção curta, mas regista-a. Se uma alternativa precisa de cinco rondas para chegar ao nível que outra alcança em duas, essa diferença deve aparecer na decisão.',
          'Para cada tarefa, marca três coisas: o resultado cumpre o mínimo aceitável, contém factos não suportados e precisa de quanto trabalho humano. Não confundas texto fluente com exatidão. Quando houver fontes, confirma pelo menos duas referências; quando houver cálculos, verifica uma amostra manualmente.',
        ],
        checklist: [
          '0 pontos: resultado inutilizável ou erro material que não foi sinalizado.',
          '1 ponto: resultado aproveitável depois de correções relevantes.',
          '2 pontos: resultado correto e utilizável com revisão ligeira.',
        ],
      },
      {
        title: 'Minutos 9–12: procura limites antes que te surpreendam',
        paragraphs: [
          'Testa deliberadamente um limite importante: um ficheiro maior, texto em português, exportação, colaboração ou uma pergunta cuja resposta não está nos dados. Uma ferramenta deve conseguir dizer “não sei” quando falta evidência. Respostas inventadas sem aviso justificam parar o teste em tarefas que exigem rigor.',
          'Confirma também preço e quota no ecrã oficial do plano. Não uses apenas uma tabela comparativa de terceiros. Regista o plano observado e a data, porque créditos, limites e funcionalidades mudam.',
        ],
      },
      {
        title: 'Minutos 12–15: aplica a grelha de 10 pontos',
        paragraphs: [
          'Pontua de 0 a 2 em cinco dimensões: arranque, qualidade, consistência, integração e controlo. Integração mede se o resultado entra no teu fluxo sem copiar e corrigir demasiado. Controlo inclui privacidade, permissões, exportação e capacidade de apagar dados.',
          'Uma regra útil: 8–10 pontos justifica um piloto limitado; 5–7 pede um segundo teste ou comparação; 0–4 significa parar. Além da pontuação, define critérios de exclusão. Uma falha de segurança, ausência de exportação obrigatória ou erro factual grave pode reprovar a ferramenta mesmo com uma boa soma.',
        ],
        checklist: [
          'Arranque: consigo chegar ao primeiro resultado sem obstáculos desnecessários?',
          'Qualidade: o resultado cumpre o mínimo definido?',
          'Consistência: repete o nível de qualidade nas três tarefas?',
          'Integração: reduz trabalho no processo completo, não apenas num passo?',
          'Controlo: compreendo dados, permissões, custos e saída da plataforma?',
        ],
      },
      {
        title: 'Exemplo de decisão',
        paragraphs: [
          'Imagina uma ferramenta que obtém 2 em arranque, 2 em qualidade, 1 em consistência, 1 em integração e 1 em controlo: total de 7. O resultado não é “comprar”. É realizar um piloto com tarefas não sensíveis, confirmar a exportação e repetir o caso que falhou. A grelha transforma entusiasmo numa próxima ação verificável.',
          'Guarda a folha de teste e repete-a quando o produto, o preço ou o processo mudar. Uma ferramenta que perdeu em março pode melhorar; uma vencedora pode deixar de servir. A avaliação é uma fotografia datada, não um selo permanente.',
        ],
      },
    ],
    takeaway:
      'Decide com evidência: três tarefas reais, cinco critérios de 0–2 e pelo menos um critério de exclusão definido antes do teste.',
    en: {
      title: 'How to evaluate an AI tool in 15 minutes',
      excerpt:
        'A repeatable test with three real tasks, a ten-point scorecard, and stop criteria that separate a polished demo from useful value.',
      readingTime: '9 min',
      tags: ['Evaluation', 'Productivity', 'AQUA method'],
      summary: [
        'The goal is not to discover the “best AI”. It is to decide whether a tool improves a specific job enough to justify its cost, risk, and process change.',
        'Use the same tasks and scorecard whenever you compare alternatives. Without a repeatable test, novelty tends to beat consistency.',
      ],
      sections: [
        {
          title: 'Before the timer: prepare three real cases',
          paragraphs: [
            'Choose one simple task, one frequent task, and one difficult task. For example: summarise a short document, turn notes into a proposal, and analyse a file with ambiguous instructions. Remove sensitive data while preserving the structure and difficulties of the real work.',
            'Write the minimum acceptable outcome before testing. It might be “a five-point summary with page references”, “a proposal that follows this tone”, or “a table that does not invent values”. This sentence stops you from changing the standard just because an answer looks impressive.',
          ],
        },
        {
          title: 'Minutes 0–3: measure time to first value',
          paragraphs: [
            'Start from zero. Measure how long it takes to create the account, find the right feature, and produce the first answer. Do not ignore one-time steps: unclear permissions, email verification, hidden limits, or an interface that needs extensive configuration are part of adoption cost.',
            'Give 0 points if you cannot start, 1 if help or trial and error is required, and 2 if the path is clear. Record one sentence of evidence. “It took four minutes to find PDF import” is more useful than “the interface feels confusing”.',
          ],
        },
        {
          title: 'Minutes 3–9: run the three tasks without changing the rules',
          paragraphs: [
            'Use the same initial request in every tool. You may make one short correction, but record it. If one alternative takes five rounds to reach the level another reaches in two, the decision should reflect that difference.',
            'For each task, note whether the result meets the minimum, contains unsupported claims, and how much human work it requires. Do not confuse fluent writing with accuracy. Where sources exist, verify at least two references; for calculations, check a sample manually.',
          ],
          checklist: [
            '0 points: unusable result or an unsignalled material error.',
            '1 point: usable after meaningful corrections.',
            '2 points: correct and usable after a light review.',
          ],
        },
        {
          title: 'Minutes 9–12: look for limits before they surprise you',
          paragraphs: [
            'Deliberately test one important limit: a larger file, Portuguese text, export, collaboration, or a question that the supplied data cannot answer. A tool should be able to say “I do not know” when evidence is missing. Confident inventions are a stop signal for work that requires accuracy.',
            'Confirm price and quota on the official plan screen rather than relying only on a third-party comparison. Record the plan and date because credits, limits, and features change.',
          ],
        },
        {
          title: 'Minutes 12–15: apply the ten-point scorecard',
          paragraphs: [
            'Score five dimensions from 0 to 2: start-up, quality, consistency, integration, and control. Integration measures whether the output enters the full workflow without excessive copying or correction. Control covers privacy, permissions, export, and the ability to remove data.',
            'A useful rule is: 8–10 supports a limited pilot; 5–7 needs another test or comparison; 0–4 means stop. Add exclusion criteria as well. A security concern, a missing mandatory export, or a serious factual error may reject the tool even when the total score looks good.',
          ],
          checklist: [
            'Start-up: can I reach the first result without unnecessary obstacles?',
            'Quality: does the result meet the minimum defined in advance?',
            'Consistency: does it repeat that quality across all three tasks?',
            'Integration: does it reduce work in the complete process, not just one step?',
            'Control: do I understand data, permissions, cost, and how to leave?',
          ],
        },
        {
          title: 'Worked decision example',
          paragraphs: [
            'Imagine a tool scoring 2 for start-up, 2 for quality, 1 for consistency, 1 for integration, and 1 for control: a total of 7. The outcome is not “buy”. It is to run a pilot with non-sensitive tasks, confirm export, and repeat the case that failed. The score turns enthusiasm into a verifiable next action.',
            'Keep the test sheet and repeat it when the product, price, or process changes. A tool that lost in March may improve; a winner may stop fitting the work. An evaluation is dated evidence, not a permanent badge.',
          ],
        },
      ],
      takeaway:
        'Decide with evidence: three real tasks, five criteria scored from 0–2, and at least one exclusion criterion defined before the test.',
    },
  },
  {
    slug: 'como-escolher-ferramenta-ia',
    title: 'Como escolher a ferramenta de IA certa sem perder tempo',
    date: '2026-03-02',
    updated: '2026-08-13',
    readingTime: '8 min',
    author: EDITORIAL_AUTHOR,
    excerpt:
      'Um processo de decisão em seis passos para transformar uma lista interminável numa shortlist comparável e ligada ao trabalho real.',
    tags: ['Escolha', 'Guias', 'Shortlist'],
    summary: [
      'Começa pelo resultado e pelas restrições. Uma categoria como “produtividade” é demasiado ampla para produzir uma shortlist útil.',
      'Compara poucas opções através do mesmo teste e documenta por que razão cada uma avançou ou foi excluída.',
    ],
    sections: [
      {
        title: '1. Escreve o trabalho numa frase',
        paragraphs: [
          'Substitui “preciso de uma ferramenta de IA” por uma frase observável: “quero transformar a gravação de uma reunião em decisões e tarefas no prazo de dez minutos” ou “quero criar uma primeira versão de descrições de produto em português europeu”. O verbo, o input, o output e o tempo tornam a necessidade pesquisável.',
          'Se a frase contém vários resultados — pesquisar, escrever, aprovar e publicar — divide o processo. Uma ferramenta pode ser excelente num passo e fraca no conjunto. Esta separação também evita comprar uma plataforma complexa para resolver uma tarefa pequena.',
        ],
      },
      {
        title: '2. Define os requisitos que realmente eliminam opções',
        paragraphs: [
          'Cria três grupos: obrigatório, desejável e irrelevante. Idioma, formato de exportação, colaboração, API, localização dos dados e orçamento podem ser obrigatórios. Um editor visual bonito pode ser desejável. Funcionalidades que não fazem parte do trabalho devem ficar fora da decisão.',
          'Mantém os obrigatórios entre três e cinco. Uma lista de vinte requisitos trata tudo como igualmente importante e torna a comparação lenta. Para cada obrigatório, escreve uma prova: “exporta DOCX com estilos preservados” é testável; “boa exportação” não é.',
        ],
        checklist: [
          'Qual é o formato de entrada e qual é o formato final?',
          'Que idioma, volume e frequência têm de funcionar?',
          'Que dados são proibidos ou exigem controlos adicionais?',
          'Qual é o custo máximo mensal, incluindo tempo de revisão?',
        ],
      },
      {
        title: '3. Faz uma shortlist de três, não de trinta',
        paragraphs: [
          'Usa o diretório para descobrir candidatos, mas confirma funcionalidades e preços no website oficial. Escolhe até três opções que cumpram os requisitos obrigatórios em teoria. Uma shortlist maior raramente melhora a decisão; normalmente dilui o tempo disponível para testar cada alternativa.',
          'Regista a fonte e a data para cada requisito. Se a informação não estiver clara, marca “por confirmar” em vez de assumir. A ausência de informação também é um sinal: pode antecipar fricção durante compra, suporte ou auditoria.',
        ],
      },
      {
        title: '4. Compara o custo total, não apenas a subscrição',
        paragraphs: [
          'O custo real inclui configuração, aprendizagem, correção de resultados, integrações e saída da plataforma. Uma opção gratuita que exige vinte minutos de revisão por tarefa pode ser mais cara do que uma subscrição que produz resultados consistentes.',
          'Faz uma conta simples: tarefas por mês × minutos poupados × custo aproximado do tempo. Depois subtrai subscrição e tempo de revisão. Não precisas de precisão financeira; precisas de uma ordem de grandeza que impeça a decisão de depender apenas do preço anunciado.',
        ],
      },
      {
        title: '5. Executa o mesmo teste nas três opções',
        paragraphs: [
          'Prepara três casos reais e o resultado mínimo aceitável. Usa os mesmos inputs, instruções e tempo máximo. Regista correções, erros factuais, qualidade do output e dificuldade de integração. A comparação deve mostrar o trabalho necessário até ao resultado final, não apenas a primeira resposta.',
          'Se um requisito obrigatório falhar, exclui a opção e escreve o motivo. Não compenses uma falha crítica com uma média alta noutros critérios. Uma ferramenta sem o formato obrigatório ou sem controlos de dados adequados não fica aceitável por ter uma interface melhor.',
        ],
      },
      {
        title: '6. Decide um piloto com prazo e condição de saída',
        paragraphs: [
          'Escolher não significa adotar para sempre. Define um piloto de duas a quatro semanas, com responsável, tarefas permitidas e uma métrica: tempo poupado, taxa de resultados aceites ou número de correções. Limita os dados e as integrações durante esta fase.',
          'No final, decide continuar, ajustar ou abandonar. Documenta como exportar trabalho e apagar dados antes de depender da plataforma. Uma boa escolha inclui uma saída viável — especialmente quando ficheiros, automações ou conhecimento da equipa começam a acumular-se.',
        ],
      },
    ],
    takeaway:
      'A shortlist certa não contém mais ferramentas; contém menos opções, requisitos verificáveis e um teste igual para todas.',
    en: {
      title: 'How to choose the right AI tool without wasting time',
      excerpt:
        'A six-step decision process that turns an endless list into a comparable shortlist tied to real work.',
      readingTime: '8 min',
      tags: ['Selection', 'Guides', 'Shortlist'],
      summary: [
        'Start with the outcome and constraints. A category such as “productivity” is too broad to produce a useful shortlist.',
        'Compare a small number of options with the same test and record why each one advanced or was excluded.',
      ],
      sections: [
        {
          title: '1. Describe the job in one sentence',
          paragraphs: [
            'Replace “I need an AI tool” with an observable sentence: “I want to turn a meeting recording into decisions and tasks within ten minutes” or “I want a first draft of product descriptions in European Portuguese”. The verb, input, output, and time make the need searchable.',
            'If the sentence contains several outcomes — research, writing, approval, and publishing — split the process. A tool may be excellent at one step and weak across the whole workflow. Separation also prevents buying a complex platform for a small task.',
          ],
        },
        {
          title: '2. Define requirements that actually eliminate options',
          paragraphs: [
            'Create three groups: mandatory, desirable, and irrelevant. Language, export format, collaboration, API, data location, and budget may be mandatory. A polished visual editor may be desirable. Features that are not part of the job should stay out of the decision.',
            'Keep mandatory requirements between three and five. A list of twenty treats everything as equally important and slows the comparison. Write a proof for each one: “exports DOCX with styles preserved” is testable; “good export” is not.',
          ],
          checklist: [
            'What is the input format and what must the final format be?',
            'Which language, volume, and frequency have to work?',
            'Which data is prohibited or needs additional controls?',
            'What is the maximum monthly cost, including review time?',
          ],
        },
        {
          title: '3. Build a shortlist of three, not thirty',
          paragraphs: [
            'Use the directory to discover candidates, then confirm features and pricing on the official website. Choose no more than three options that appear to meet mandatory requirements. A larger shortlist rarely improves the decision; it usually dilutes the time available to test each alternative.',
            'Record the source and date for every requirement. If information is unclear, mark it “to confirm” instead of assuming. Missing information is itself a signal because it may predict friction during purchasing, support, or an audit.',
          ],
        },
        {
          title: '4. Compare total cost, not just the subscription',
          paragraphs: [
            'Real cost includes setup, learning, correcting outputs, integrations, and leaving the platform. A free option that needs twenty minutes of review for each task may cost more than a subscription that produces consistent results.',
            'Use a simple estimate: tasks per month × minutes saved × approximate time cost. Then subtract the subscription and review time. You do not need financial precision; you need an order of magnitude that keeps the decision from depending only on the advertised price.',
          ],
        },
        {
          title: '5. Run the same test across all three options',
          paragraphs: [
            'Prepare three real cases and the minimum acceptable result. Use the same inputs, instructions, and time limit. Record corrections, factual errors, output quality, and integration difficulty. The comparison should show the work required to reach the final outcome, not only the first answer.',
            'If a mandatory requirement fails, exclude the option and write down why. Do not compensate for a critical failure with a high average elsewhere. A tool without the required format or suitable data controls does not become acceptable because its interface looks better.',
          ],
        },
        {
          title: '6. Decide on a time-boxed pilot and an exit condition',
          paragraphs: [
            'Choosing does not mean adopting forever. Define a two-to-four-week pilot with an owner, allowed tasks, and one metric: time saved, accepted-output rate, or number of corrections. Keep data and integrations limited during this phase.',
            'At the end, decide whether to continue, adjust, or stop. Document how to export work and delete data before becoming dependent on the platform. A good choice includes a viable exit, especially when files, automations, and team knowledge begin to accumulate.',
          ],
        },
      ],
      takeaway:
        'The right shortlist does not contain more tools. It contains fewer options, verifiable requirements, and the same test for every candidate.',
    },
  },
];

export function localizePost(post, lang = 'pt') {
  if (!post || lang !== 'en' || !post.en) return post;
  return {
    ...post,
    title: post.en.title || post.title,
    excerpt: post.en.excerpt || post.excerpt,
    readingTime: post.en.readingTime || post.readingTime,
    tags: post.en.tags || post.tags,
    summary: post.en.summary || post.summary,
    sections: post.en.sections || post.sections,
    takeaway: post.en.takeaway || post.takeaway,
    author: {
      ...post.author,
      name: post.author?.nameEn || post.author?.name,
      role: post.author?.roleEn || post.author?.role,
    },
  };
}

export function getPostBySlug(slug) {
  return posts.find((post) => post.slug === slug) || null;
}
