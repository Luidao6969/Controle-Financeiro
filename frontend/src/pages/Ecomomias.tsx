import React, { useState } from 'react';

interface EconomiaItem {
  id: number;
  titulo: string;
  valorAtual: number;
  valorMeta: number;
}

export const Economias: React.FC = () => {
  // Dados mockados iniciais atualizados com Metas
  const [economias, setEconomias] = useState<EconomiaItem[]>([
    { id: 1, titulo: 'Reserva de Emergência', valorAtual: 3500.00, valorMeta: 10000.00 },
    { id: 2, titulo: 'Fundo Viagem', valorAtual: 1200.00, valorMeta: 5000.00 },
    { id: 3, titulo: 'Investimentos a Longo Prazo', valorAtual: 530.00, valorMeta: 20000.00 },
  ]);

  // Estados para o formulário de CRIAÇÃO de um novo bloco
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novaMeta, setNovaMeta] = useState('');

  // Estados para o controle do APORTE RÁPIDO em um bloco existente
  const [blocoIdAporte, setBlocoIdAporte] = useState<number | null>(null);
  const [valorAporte, setValorAporte] = useState('');

  // Função para criar um novo bloco
  const handleAdicionarEconomia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoValor || !novaMeta) return;

    const novoItem: EconomiaItem = {
      id: Date.now(),
      titulo: novoTitulo,
      valorAtual: parseFloat(novoValor),
      valorMeta: parseFloat(novaMeta),
    };

    setEconomias([...economias, novoItem]);
    setNovoTitulo('');
    setNovoValor('');
    setNovaMeta('');
  };

  // Função para somar dinheiro a um bloco existente
  const handleSmarAporte = (id: number) => {
    const dinheiroAdicional = parseFloat(valorAporte);
    if (isNaN(dinheiroAdicional) || dinheiroAdicional <= 0) return;

    setEconomias(economias.map(item => {
      if (item.id === id) {
        return { ...item, valorAtual: item.valorAtual + dinheiroAdicional };
      }
      return item;
    }));

    // Fecha o formulário de aporte e limpa o input
    setBlocoIdAporte(null);
    setValorAporte('');
  };

  // Cálculos totais do rodapé
  const totalAtual = economias.reduce((soma, item) => soma + item.valorAtual, 0);
  const totalMeta = economias.reduce((soma, item) => soma + item.valorMeta, 0);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', color: '#334155' }}>
      <h2 style={{ marginBottom: '24px' }}>Minhas Economias & Metas</h2>

      {/* Formulário para Criar Novo Bloco */}
      <form 
        onSubmit={handleAdicionarEconomia} 
        style={{ 
          background: '#fff', padding: '20px', borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px',
          display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '2', minWidth: '200px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Objetivo / Título</label>
          <input 
            type="text" placeholder="Ex: Viagem para o Chile" value={novoTitulo}
            onChange={(e) => setNovoTitulo(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '130px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Saldo Inicial (R$)</label>
          <input 
            type="number" step="0.01" placeholder="0,00" value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '130px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Meta Final (R$)</label>
          <input 
            type="number" step="0.01" placeholder="10.000,00" value={novaMeta}
            onChange={(e) => setNovaMeta(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required
          />
        </div>

        <button 
          type="submit"
          style={{ 
            padding: '11px 20px', background: '#10b981', color: '#fff', 
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
          }}
        >
          + Criar Bloco
        </button>
      </form>

      {/* Grid de Blocos de Economia */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {economias.map((item) => {
          // Calcula a porcentagem de conclusão da meta
          const progresso = Math.min(Math.round((item.valorAtual / item.valorMeta) * 100), 100);

          return (
            <div 
              key={item.id} 
              style={{ 
                background: '#fff', padding: '20px', borderRadius: '12px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #10b981',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Título e Botão de Aporte Rápido */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#64748b', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {item.titulo}
                  </h4>
                  <button
                    onClick={() => setBlocoIdAporte(blocoIdAporte === item.id ? null : item.id)}
                    style={{
                      background: '#e2e8f0', border: 'none', borderRadius: '4px', 
                      width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold',
                      color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Adicionar saldo"
                  >
                    {blocoIdAporte === item.id ? '✕' : '+'}
                  </button>
                </div>

                {/* Saldo Atual */}
                <p style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 'bold', color: '#1e293b' }}>
                  R$ {item.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>

                {/* Exibição da Meta */}
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                  Meta: R$ {item.valorMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({progresso}%)
                </p>

                {/* Barra de Progresso da Meta */}
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ width: `${progresso}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }} />
                </div>
              </div>

              {/* Formulário Inline de Aporte Rápido (Aparece só no bloco clicado) */}
              {blocoIdAporte === item.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                  <input
                    type="number" placeholder="Valor para somar" value={valorAporte}
                    onChange={(e) => setValorAporte(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', flex: 1 }}
                  />
                  <button
                    onClick={() => handleSmarAporte(item.id)}
                    style={{
                      background: '#10b981', color: '#fff', border: 'none', 
                      borderRadius: '4px', padding: '6px 12px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Barra Inferior Ampla com o Acumulado Total */}
      <div 
        style={{ 
          background: '#0f172a', color: '#fff', padding: '24px', borderRadius: '12px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
        }}
      >
        <div>
          <span style={{ fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            Progresso Geral das Metas
          </span>
          <span style={{ fontSize: '16px', color: '#cbd5e1' }}>
            Guardado R$ {totalAtual.toLocaleString('pt-BR')} de R$ {totalMeta.toLocaleString('pt-BR')} totais
          </span>
        </div>
        <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#34d399' }}>
          {totalMeta > 0 ? Math.round((totalAtual / totalMeta) * 100) : 0}%
        </span>
      </div>
    </div>
  );
};