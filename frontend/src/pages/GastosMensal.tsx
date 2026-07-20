import React, { useState } from 'react';

// Definição da estrutura de um gasto
interface GastoItem {
  id: number;
  categoria: string;
  titulo?: string; // Opcional
  valor: number;
}

export const Gastos: React.FC = () => {
  // Categorias predefinidas
  const categorias = [
    'Transporte',
    'Lazer',
    'Alimentação',
    'Supermercado',
    'Casa',
    'Telefone',
    'Academia',
    'Outros'
  ];

  // Dados mockados iniciais
  const [gastos, setGastos] = useState<GastoItem[]>([
    { id: 1, categoria: 'Supermercado', titulo: 'Compras do mês', valor: 450.00 },
    { id: 2, categoria: 'Transporte', titulo: 'Combustível', valor: 150.00 },
    { id: 3, categoria: 'Academia', valor: 90.00 }, // Sem título
    { id: 4, categoria: 'Lazer', titulo: 'Cinema no fim de semana', valor: 65.50 },
  ]);

  // Estados para controlar o formulário
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(categorias[0]);
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');

  // Função para adicionar um novo gasto
  const handleAdicionarGasto = (e: React.FormEvent) => {
    e.preventDefault();

    if (!valor) return;

    const novoGasto: GastoItem = {
      id: Date.now(),
      categoria: categoriaSelecionada,
      titulo: titulo.trim() ? titulo : undefined, // Se estiver vazio, salva como undefined
      valor: parseFloat(valor),
    };

    setGastos([novoGasto, ...gastos]); // Adiciona o mais recente no topo da lista
    
    // Reseta apenas os campos de texto e valor
    setTitulo('');
    setValor('');
  };

  // Soma total de todos os gastos da lista
  const totalGastos = gastos.reduce((soma, item) => soma + item.valor, 0);

  return (
    <div style={{ padding: '10px', fontFamily: 'sans-serif', color: '#334155' }}>
      <h2 style={{ marginBottom: '24px' }}>Gastos Mensais</h2>

      {/* Formulário de Inserção */}
      <form 
        onSubmit={handleAdicionarGasto}
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}
      >
        {/* Campo Categoria */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>Categoria</label>
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Campo Descrição / Título (Opcional) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '2', minWidth: '200px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>Descrição <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(Opcional)</span></label>
          <input
            type="text"
            placeholder="Ex: Uber, Almoço, etc."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        {/* Campo Valor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '150px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            required
          />
        </div>

        {/* Botão Salvar */}
        <button
          type="submit"
          style={{
            padding: '11px 20px',
            background: '#ef4444', // Vermelho para combinar com "gastos"
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Adicionar Gasto
        </button>
      </form>

      {/* Histórico / Lista de Gastos */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>Categoria</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>Descrição</th>
              <th style={{ padding: '16px', color: '#64748b', fontSize: '14px', textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>
                    {gasto.categoria}
                  </span>
                </td>
                <td style={{ padding: '16px', color: gasto.titulo ? '#334155' : '#94a3b8', fontStyle: gasto.titulo ? 'normal' : 'italic' }}>
                  {gasto.titulo || 'Sem descrição'}
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                  - R$ {gasto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo do Total de Gastos */}
      <div 
        style={{ 
          background: '#0f172a', 
          color: '#fff', 
          padding: '24px', 
          borderRadius: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
        }}
      >
        <span style={{ fontSize: '18px', fontWeight: '500', color: '#cbd5e1' }}>Total de Gastos no Mês:</span>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#f87171' }}>
          R$ {totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
};