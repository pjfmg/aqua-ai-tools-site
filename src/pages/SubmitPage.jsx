import React, { useMemo, useState } from 'react';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import { useTools } from '../hooks/useTools.js';
import { normalizeArea, normalizeWebsiteUrl } from '../lib/tools.js';
import { useLanguage } from '../i18n.jsx';

export default function SubmitPage() {
  const { isEn } = useLanguage();
  const { tools } = useTools();

  const areaOptions = useMemo(() => {
    const set = new Set();
    for (const t of tools) for (const a of normalizeArea(t['Área/Categoria'])) set.add(a);
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt'));
  }, [tools]);

  const [nome, setNome] = useState('');
  const [site, setSite] = useState('');
  const [descricao, setDescricao] = useState('');
  const [funcoes, setFuncoes] = useState('');
  const [preco, setPreco] = useState('');
  const [area, setArea] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const siteNormalized = normalizeWebsiteUrl(site);

  async function onSubmit(e) {
    e.preventDefault();
    setSuccess('');
    setError('');

    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      setError(isEn ? 'Enter the tool name.' : 'Indica o nome da ferramenta.');
      return;
    }
    if (!siteNormalized) {
      setError(isEn ? 'Enter a valid website (for example: https://example.com).' : 'Indica um site válido (ex: https://exemplo.com).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        Nome: nomeTrim,
        Site: siteNormalized,
        'Descrição': descricao.trim(),
        'Funções': funcoes.trim(),
        'Preço': preco,
        'Área/Categoria': area ? [area] : [],
      };

      const res = await fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `Falha ao submeter (${res.status})`);

      setSuccess(isEn ? 'Submitted successfully. Thank you. We will review it before adding it to the database.' : 'Submetido com sucesso! Obrigado — vamos rever e adicionar à base de dados.');
      setNome('');
      setSite('');
      setDescricao('');
      setFuncoes('');
      setPreco('');
      setArea('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Hero
        title={isEn ? 'Submit' : 'Submeter'}
        subtitle={isEn ? 'Suggest a tool to add to the directory.' : 'Sugere uma ferramenta para adicionar ao diretório.'}
        badge={isEn ? 'Manual review' : 'Revisão manual'}
      />

      <Section
        title={isEn ? 'Form' : 'Formulário'}
        subtitle={isEn ? 'Fill in the essentials. We handle the rest.' : 'Preenche o essencial. Nós tratamos do resto.'}
      >
        <div className="panel">
          <form className="form" onSubmit={onSubmit}>
            <div className="form__grid">
              <div className="field field--span2">
                <label className="field__label" htmlFor="submit-nome">
                  {isEn ? 'Name *' : 'Nome *'}
                </label>
                <input
                  id="submit-nome"
                  className="input"
                  placeholder={isEn ? 'Example: Notion AI' : 'Ex: Notion AI'}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="field field--span2">
                <label className="field__label" htmlFor="submit-site">
                  {isEn ? 'Website *' : 'Site *'}
                </label>
                <input
                  id="submit-site"
                  className="input"
                  placeholder="https://..."
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  disabled={submitting}
                />
                {site && !siteNormalized ? (
                  <div className="hint">{isEn ? 'Tip: use a full URL (https://...).' : 'Sugestão: usa um URL completo (https://...).'}</div>
                ) : null}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="submit-area">
                  {isEn ? 'Category' : 'Categoria'}
                </label>
                <select
                  id="submit-area"
                  className="select"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">{isEn ? '(optional)' : '(opcional)'}</option>
                  {areaOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="submit-preco">
                  {isEn ? 'Price' : 'Preço'}
                </label>
                <select
                  id="submit-preco"
                  className="select"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  disabled={submitting}
                >
                  <option value="">{isEn ? '(optional)' : '(opcional)'}</option>
                  <option value="Gratuito">Gratuito</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Pago">Pago</option>
                </select>
              </div>

              <div className="field field--span2">
                <label className="field__label" htmlFor="submit-funcoes">
                  {isEn ? 'Features' : 'Funções'}
                </label>
                <textarea
                  id="submit-funcoes"
                  className="textarea"
                  rows={3}
                  placeholder={isEn ? 'Main features, use cases, etc.' : 'Principais funcionalidades, casos de uso, etc.'}
                  value={funcoes}
                  onChange={(e) => setFuncoes(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="field field--span2">
                <label className="field__label" htmlFor="submit-descricao">
                  {isEn ? 'Description' : 'Descrição'}
                </label>
                <textarea
                  id="submit-descricao"
                  className="textarea"
                  rows={4}
                  placeholder={isEn ? 'A short, objective description.' : 'Uma descrição curta e objetiva.'}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            {error ? <p className="error">{error}</p> : null}
            {success ? <p className="success">{success}</p> : null}

            <div className="form__actions">
              <button className="btn btn--primary" type="submit" disabled={submitting}>
                {submitting ? (isEn ? 'Submitting…' : 'A submeter…') : (isEn ? 'Submit' : 'Submeter')}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                disabled={submitting}
                onClick={() => {
                  setNome('');
                  setSite('');
                  setDescricao('');
                  setFuncoes('');
                  setPreco('');
                  setArea('');
                  setError('');
                  setSuccess('');
                }}
              >
                {isEn ? 'Clear' : 'Limpar'}
              </button>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
