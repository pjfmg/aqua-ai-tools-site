import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('AppErrorBoundary caught:', error);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <div className="page">
        <div className="page__body">
          <h2 style={{ marginTop: 0 }}>Ocorreu um erro</h2>
          <p style={{ marginTop: 8, color: 'rgba(15, 23, 42, 0.75)' }}>
            A página não conseguiu carregar. Atualiza a página e, se continuar, envia-nos esta mensagem.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              borderRadius: 14,
              padding: 14,
              overflow: 'auto',
              maxWidth: 900,
            }}
          >
            {String(error?.message || error)}
          </pre>
          <button className="btn btn--primary" type="button" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}

