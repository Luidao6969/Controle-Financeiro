import React, { useState } from 'react';

interface ProjecaoAno {
  ano: number;
  totalInvestido: number;
  totalAcumulado: number;
  jurosGanhos: number;
}

export const Planejamentos: React.FC = () => {
  // Estados do formulário de simulação
  const [tipoInvestimento, setTipoInvestimento] = useState('CDB 100% CDI');
  const [valorMensal, setValorMensal] = useState('400');
  const [anos, setAnos] = useState('10');
  const [taxaAnual, setTaxaAnual] = useState('10.75'); // Ex: Taxa Selic/CDI atual estimada

  // Sempre que mudar o tipo pré-definido, podemos sugerir uma taxa comum do mercado
  const handleTipoChange = (tipo: string) => {
    setTipoInvestimento(tipo);
    if (tipo === 'CDB 100% CDI') setTaxaAnual('10.75');
    if (tipo === 'Tesouro Direto') setTaxaAnual('11.25');
    if (tipo === 'Renda Fixa Privada') setTaxaAnual('12.50');
    if (tipo === 'Previdência Privada') setTaxaAnual('9.50');
  };

  // --- LÓGICA DO CÁLCULO DE JUROS COMPOSTOS ---
  const aporteMensal = parseFloat(valorMensal) || 0;
  const tempoAnos = parseInt(anos) || 0;
  const taxaAnoPercentual = parseFloat(taxaAnual) || 0;

  // Converte taxa anual para mensal: (1 + i_ano)^(1/12) - 1
  const taxaMensal = Math.pow(1 + taxaAnoPercentual / 100, 1 / 12) - 1;

  let totalAcumulado = 0;
  let totalInvestido = 0;
  const dadosAnuais: ProjecaoAno[] = [];

  // Calcula a evolução mês a mês, mas agrupa os resultados por ano para o gráfico/tabela
  for (let ano = 1; ano <= tempoAnos; ano++) {
    for (let mes = 1; mes <= 12; mes++) {
      totalInvestido += aporteMensal;
      // Aplica os juros sobre o saldo existente + o novo aporte do mês
      totalAcumulado = (totalAcumulado + aporteMensal) * (1 + taxaMensal);
    }

    dadosAnuais.push({
      ano,
      totalInvestido: Math.round(totalInvestido),
      totalAcumulado: Math.round(totalAcumulado),
      jurosGanhos: Math.round(totalAcumulado - totalInvestido),
    });
  }

  // Dados finais do período
  const resultadoFinal = dadosAnuais[dadosAnuais.length - 1] || { totalInvestido: 0, totalAcumulado: 0, jurosGanhos: 0 };
  const maiorValorGrafico = resultadoFinal.totalAcumulado || 1;

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', color: '#334155' }}>
      <h2 style={{ marginBottom: '24px' }}>Projeções e Planejamento</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Formulário de Parâmetros */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b' }}>Configurar Projeção</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Tipo de Planejamento</label>
              <select 
                value={tipoInvestimento} 
                onChange={(e) => handleTipoChange(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="CDB 100% CDI">CDB 100% CDI</option>
                <option value="Tesouro Direto">Tesouro Direto (Selic/Prefixado)</option>
                <option value="Renda Fixa Privada">Renda Fixa (LCI/LCA/Debêntures)</option>
                <option value="Previdência Privada">Previdência Privada</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Aporte Mensal (R$)</label>
              <input 
                type="number" 
                value={valorMensal} 
                onChange={(e) => setValorMensal(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Tempo (Anos)</label>
                <input 
                  type="number" 
                  value={anos} 
                  onChange={(e) => setAnos(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>Rendimento (% ao ano)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={taxaAnual} 
                  onChange={(e) => setTaxaAnual(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Resultados da Simulação */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cards de Resumo Rápido */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Total Investido</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#475569' }}>
                R$ {resultadoFinal.totalInvestido.toLocaleString('pt-BR')}
              </p>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
              <span style={{ fontSize: '12px', color: '#3b82f6', textTransform: 'uppercase' }}>Em Juros Ganhos</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                R$ {resultadoFinal.jurosGanhos.toLocaleString('pt-BR')}
              </p>
            </div>
            <div style={{ background: '#0f172a', padding: '20px', borderRadius: '12px', color: '#fff' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Acumulado</span>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#34d399' }}>
                R$ {resultadoFinal.totalAcumulado.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Gráfico de Barras Simplificado feito em HTML Flexbox */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Evolução do Patrimônio (Por Ano)</h4>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
              {dadosAnuais.map((d) => {
                const alturaInvestido = (d.totalInvestido / maiorValorGrafico) * 100;
                const alturaJuros = ((d.totalAcumulado - d.totalInvestido) / maiorValorGrafico) * 100;

                return (
                  <div key={d.ano} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, margin: '0 4px', maxWidth: '40px' }}>
                    <div style={{ width: '100%', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative' }}>
                      {/* Barra de Juros (Azul) */}
                      <div style={{ background: '#3b82f6', height: `${alturaJuros}%`, width: '100%', borderRadius: '3px 3px 0 0' }} title={`Juros: R$ ${d.jurosGanhos}`} />
                      {/* Barra de Capital Investido (Cinza Escuro) */}
                      <div style={{ background: '#64748b', height: `${alturaInvestido}%`, width: '100%', borderRadius: d.jurosGanhos === 0 ? '3px 3px 0 0' : '0' }} title={`Investido: R$ ${d.totalInvestido}`} />
                    </div>
                    <span style={{ fontSize: '11px', marginTop: '6px', color: '#64748b', fontWeight: 'bold' }}>A{d.ano}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '12px', fontSize: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#64748b', borderRadius: '2px' }}></div> Capital Investido</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div> Juros Compostos</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};