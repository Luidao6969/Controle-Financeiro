import React from 'react';

export const Dashboard: React.FC = () => {
  // --- DADOS MOCKADOS ---
  const receitaDoMes = 5000.00;
  const gastosDoMes = 3800.00; // Altere esse valor para testar a cor da roda mudando!
  
  const metasEconomia = [
    { nome: 'Viagem', porcentagem: 36 },
    { nome: 'Reserva de Emergência', porcentagem: 70 },
    { nome: 'Notebook Novo', porcentagem: 15 },
  ];

  // --- LÓGICA DA RODA DE GASTOS (SVG) ---
  // Relação de gastos sobre a receita (ex: 3800 / 5000 = 0.76 ou 76%)
  const relacaoGastos = Math.min(gastosDoMes / receitaDoMes, 1); 
  const porcentagemGastos = Math.round(relacaoGastos * 100);

  // Define a cor com base no limite: verde (<50%), laranja (<80%), vermelho (>=80%)
  let corRoda = '#10b981'; // Verde
  if (porcentagemGastos >= 50 && porcentagemGastos < 80) {
    corRoda = '#f97316'; // Laranja
  } else if (porcentagemGastos >= 80) {
    corRoda = '#ef4444'; // Vermelho
  }

  // Configurações do círculo SVG para o efeito "donut chart"
  const raio = 50;
  const circunferencia = 2 * Math.PI * raio;
  const strokeDashoffset = circunferencia - (relacaoGastos * circunferencia);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', color: '#334155' }}>
      <h2 style={{ marginBottom: '24px' }}>Visão Geral do Mês</h2>

      {/* Grid de Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Receita */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Receita do Mês</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            R$ {receitaDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Card 2: Roda de Gastos */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Gastos Mensais</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: 'bold', color: '#334155' }}>
              R$ {gastosDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Compromete {porcentagemGastos}% da receita</span>
          </div>
          
          {/* Gráfico de Roda em SVG */}
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              {/* Círculo de fundo cinza */}
              <circle cx="60" cy="60" r={raio} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
              {/* Círculo de progresso dinâmico */}
              <circle 
                cx="60" 
                cy="60" 
                r={raio} 
                fill="transparent" 
                stroke={corRoda} 
                strokeWidth="12" 
                strokeDasharray={circunferencia}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.5s' }}
              />
            </svg>
            {/* Texto centralizado dentro da roda */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold', fontSize: '16px', color: corRoda }}>
              {porcentagemGastos}%
            </div>
          </div>
        </div>

        {/* Card 3: Metas de Economias */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Metas de Economia</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {metasEconomia.map((meta, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500' }}>{meta.nome}</span>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{meta.porcentagem}%</span>
                </div>
                {/* Barra de progresso nativa */}
                <progress 
                  value={meta.porcentagem} 
                  max="100" 
                  style={{ width: '100%', height: '8px', borderRadius: '4px', accentColor: '#3b82f6' }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};