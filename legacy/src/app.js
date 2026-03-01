// ------ CONFIGURAÇÕES ------
// Nota: nunca coloques chaves/segredos no frontend. O proxy (/airtable) deve tratar da autenticação.
const defaultProxyUrl =
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `http://localhost:3001/airtable?pageSize=100`
    : `/airtable?pageSize=100`;
const urlBase = window.AIRTABLE_PROXY_URL || defaultProxyUrl;

window.allTools = [];

// Scroll infinito — mostra só os primeiros e vai carregando mais ao descer
let visibleCount = 50;
let lastFiltered = []; // última lista filtrada/ordenada (para o scroll)

// ------ FETCH AIRTABLE ------
async function fetchTools(offsetToken = null) {
  if (!offsetToken) window.allTools = [];
  let url = urlBase;
  if (offsetToken) {
    url += url.includes('?') ? `&offset=${offsetToken}` : `?offset=${offsetToken}`;
  }
  try {
    const res = await fetch(url);
    let json;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    // (Se vier via proxy em 'contents', faz parse extra)
    if (json && json.contents) {
      json = JSON.parse(json.contents);
    }

    if (json && json.records) {
      // Converter os campos para o formato esperado (igual ao mock)
      const convertidos = json.records.map(rec => {
        return {
          ...rec.fields,
          "Área/Categoria": Array.isArray(rec.fields["Área/Categoria"])
            ? rec.fields["Área/Categoria"]
            : (rec.fields["Área/Categoria"] ? [rec.fields["Área/Categoria"]] : []),
          "Funções": rec.fields["Funções"] && typeof rec.fields["Funções"] === "object"
            ? rec.fields["Funções"]
            : { value: rec.fields["Funções"] || "" }
        };
      });
      window.allTools = window.allTools.concat(convertidos);

      if (json.offset) {
        await fetchTools(json.offset);
      } else {
        preencherSelects();
        // Inicial: mostrar tudo
        visibleCount = 50;
        lastFiltered = [...window.allTools];
        renderToolsInfinite(lastFiltered, true);
        ativarFiltros();
      }
    } else {
      await carregarMockLocal();
    }
  } catch (e) {
    await carregarMockLocal(e);
  }
}

// ------ RENDERIZAÇÃO DOS CARDS SCROLL INFINITO ------
function renderToolsInfinite(tools, reset = false) {
  const container = document.getElementById('tools-container');
  if (reset) container.innerHTML = "";

  let cards = container.querySelectorAll('.card').length;
  let toShow = tools.slice(cards, visibleCount);

  if (cards === 0 && toShow.length === 0) {
    container.innerHTML = '<p class="no-results">Nenhuma ferramenta encontrada.</p>';
    return;
  }

  const frag = document.createDocumentFragment();
  toShow.forEach(tool => frag.appendChild(criarCard(tool)));
  container.appendChild(frag);

  // Mensagem fim da lista
  if (visibleCount >= tools.length && tools.length > 0) {
    container.innerHTML += `<div style="text-align:center;color:#888;padding:16px 0;">Fim da lista.</div>`;
  }
}

function criarCard(tool) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  const logoUrl = obterLogo(tool);
  img.src = logoUrl;
  img.alt = `Logo de ${tool["Nome"] || "ferramenta"}`;
  img.onerror = () => {
    img.onerror = null;
    img.src = 'assets/img/placeholder.png';
  };
  card.appendChild(img);

  const h3 = document.createElement('h3');
  h3.textContent = tool["Nome"] || "";
  card.appendChild(h3);

  if (typeof tool["Número"] !== "undefined" && tool["Número"] !== "") {
    card.appendChild(criarLinha('Número', String(tool["Número"])));
  }

  const area = tool["Área/Categoria"];
  if (area && (Array.isArray(area) ? area.length : String(area).trim() !== "")) {
    card.appendChild(criarLinha('Área', Array.isArray(area) ? area.join(", ") : String(area)));
  }

  const funcoes = obterFuncoes(tool);
  if (funcoes) card.appendChild(criarLinha('Funções', funcoes));

  if (tool["Preço"]) card.appendChild(criarLinha('Preço', String(tool["Preço"])));
  if (tool["Visitado"]) card.appendChild(criarLinha('Visitado', String(tool["Visitado"])));
  if (tool["Favorito"]) card.appendChild(criarLinha('Favorito', String(tool["Favorito"])));

  const site = normalizarUrl(tool["Site"]);
  if (site) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = site;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Visitar site';
    p.appendChild(a);
    card.appendChild(p);
  }

  return card;
}

function criarLinha(rotulo, valor) {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = `${rotulo}:`;
  p.appendChild(strong);
  p.appendChild(document.createTextNode(` ${valor}`));
  return p;
}

function obterFuncoes(tool) {
  if (!tool["Funções"]) return "";
  if (typeof tool["Funções"] === "string") return tool["Funções"];
  if (typeof tool["Funções"]?.value === "string") return tool["Funções"].value;
  try {
    return JSON.stringify(tool["Funções"]);
  } catch {
    return "";
  }
}

function obterLogo(tool) {
  const logo = tool["Logo"];
  if (typeof logo === "string" && /^https?:\/\//i.test(logo)) return logo;
  return 'assets/img/placeholder.png';
}

function normalizarUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url, window.location.href);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    return "";
  } catch {
    return "";
  }
}

// ------ FILTROS & SELECTS ------
function preencherSelects() {
  preencherSelect('filter-area', 'Área/Categoria');
  preencherSelect('filter-funcao', 'Funções', true);
  preencherSelect('filter-preco', 'Preço');
}
function preencherSelect(id, campo, isFuncoes = false) {
  const select = document.getElementById(id);
  let valores = window.allTools
    .map(t => {
      if (isFuncoes) return t["Funções"]?.value || "";
      const val = t[campo];
      return Array.isArray(val) ? val.join(", ") : val;
    })
    .filter(v => v && v.trim() !== "");
  valores = [...new Set(valores)].sort();
  select.innerHTML = `<option value="">Todas</option>`;
  valores.forEach(v => {
    select.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

// ------ FILTRAR TOOLS ------
function filtrarTools() {
  const filters = {
    nome: document.getElementById('filter-nome').value.trim().toLowerCase(),
    numero: document.getElementById('filter-numero').value.trim(),
    area: document.getElementById('filter-area').value,
    funcao: document.getElementById('filter-funcao').value,
    preco: document.getElementById('filter-preco').value,
    visitado: document.getElementById('filter-visitado').value,
    favorito: document.getElementById('filter-favorito').value
  };

  let filtrados = window.allTools.filter(tool => {
    if (filters.nome && !(tool["Nome"] || '').toLowerCase().includes(filters.nome)) return false;
    if (filters.numero && String(tool["Número"] || '').trim() !== filters.numero) return false;
    if (filters.area && (tool["Área/Categoria"] || []).join(", ") !== filters.area) return false;
    if (filters.funcao && (tool["Funções"]?.value || "") !== filters.funcao) return false;
    if (filters.preco && (tool["Preço"] || "") !== filters.preco) return false;
    if (filters.visitado && (tool["Visitado"] || "") !== filters.visitado) return false;
    if (filters.favorito && (tool["Favorito"] || "") !== filters.favorito) return false;
    return true;
  });

  // Ao filtrar, reinicia o scroll infinito
  visibleCount = 50;
  lastFiltered = filtrados;
  renderToolsInfinite(lastFiltered, true);
}

// ------ ATIVAR FILTROS ------
function ativarFiltros() {
  document.getElementById('filter-nome').addEventListener('input', filtrarTools);
  document.getElementById('filter-numero').addEventListener('input', filtrarTools);
  document.getElementById('filter-area').addEventListener('change', filtrarTools);
  document.getElementById('filter-funcao').addEventListener('change', filtrarTools);
  document.getElementById('filter-preco').addEventListener('change', filtrarTools);
  document.getElementById('filter-visitado').addEventListener('change', filtrarTools);
  document.getElementById('filter-favorito').addEventListener('change', filtrarTools);

  document.getElementById('sort-az').addEventListener('click', () => {
    lastFiltered = [...lastFiltered].sort((a, b) => (a["Nome"] || '').localeCompare(b["Nome"] || ''));
    visibleCount = 50;
    renderToolsInfinite(lastFiltered, true);
  });
  document.getElementById('sort-za').addEventListener('click', () => {
    lastFiltered = [...lastFiltered].sort((a, b) => (b["Nome"] || '').localeCompare(a["Nome"] || ''));
    visibleCount = 50;
    renderToolsInfinite(lastFiltered, true);
  });
  document.getElementById('reset-filters').addEventListener('click', () => {
    document.getElementById('filter-nome').value = '';
    document.getElementById('filter-numero').value = '';
    document.getElementById('filter-area').value = '';
    document.getElementById('filter-funcao').value = '';
    document.getElementById('filter-preco').value = '';
    document.getElementById('filter-visitado').value = '';
    document.getElementById('filter-favorito').value = '';
    // Reset filtros e lista
    visibleCount = 50;
    lastFiltered = [...window.allTools];
    renderToolsInfinite(lastFiltered, true);
  });
}

// ------ SCROLL INFINITO ------
window.addEventListener('scroll', () => {
  // Só faz scroll infinito se houver mais a mostrar
  const container = document.getElementById('tools-container');
  const total = lastFiltered.length;
  const current = container.querySelectorAll('.card').length;
  if (
    (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 200) &&
    current < total
  ) {
    // Aumenta o limite e mostra mais
    visibleCount += 50;
    renderToolsInfinite(lastFiltered, false);
  }
});

// ------ INICIALIZAÇÃO ------
window.addEventListener('DOMContentLoaded', () => {
  fetchTools();
});

async function carregarMockLocal(err = null) {
  try {
    const res = await fetch('data/tools.json', { cache: 'no-store' });
    const mock = await res.json();
    window.allTools = (Array.isArray(mock) ? mock : []).map(m => ({
      "Número": m.numero ?? "",
      "Logo": m.logo ? normalizarUrl(m.logo) : "",
      "Nome": m.nome ?? "",
      "Funções": m.funcoes ? { value: String(m.funcoes) } : { value: "" },
      "Área/Categoria": m.area ? [String(m.area)] : [],
      "Preço": m.preco ?? "",
      "Site": m.site ?? "",
      "Visitado": "",
      "Favorito": ""
    }));
    preencherSelects();
    visibleCount = 50;
    lastFiltered = [...window.allTools];
    renderToolsInfinite(lastFiltered, true);
    ativarFiltros();

    if (err) {
      const container = document.getElementById('tools-container');
      const aviso = document.createElement('p');
      aviso.className = 'error';
      aviso.textContent = `Aviso: a fonte principal falhou (${err.message}). A mostrar dados locais (mock).`;
      container.prepend(aviso);
    }
  } catch (e) {
    document.getElementById('tools-container').innerHTML =
      `<p class="error">Erro ao carregar dados (proxy e mock): ${err ? err.message : ""} ${e.message}</p>`;
  }
}
