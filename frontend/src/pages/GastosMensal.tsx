import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  atualizarGasto,
  criarGasto,
  deletarGasto,
  listarGastos,
} from '../api/gastosApi';

import type { GastoApi } from '../api/gastosApi';

import {
  listarCategorias,
} from '../api/categoriasApi';

import type {
  CategoriaApi,
} from '../api/categoriasApi';

interface Gasto {
  id: number;
  categoriaId: number;
  categoria: string;
  descricao: string;
  valor: number;
  dataGasto: string;
  observacao: string;
}

function obterDataAtual(): string {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}


function converterGasto(gasto: GastoApi): Gasto {
  return {
    id: gasto.id,
    categoriaId: Number(gasto.categoria_id),

    categoria:
      gasto.categoria_nome ||
      gasto.nome_categoria ||
      gasto.categoria ||
      'Sem categoria',

    descricao: gasto.descricao || '',
    valor: Number(gasto.valor),
    dataGasto: gasto.data_gasto,
    observacao: gasto.observacao || '',
  };
}

function formatarDinheiro(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function normalizarData(data?: string | null): string {
  if (!data) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    return data.substring(0, 10);
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return '';
  }

  const ano = dataConvertida.getFullYear();
  const mes = String(
    dataConvertida.getMonth() + 1
  ).padStart(2, '0');
  const dia = String(
    dataConvertida.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(data?: string | null): string {
  const dataNormalizada = normalizarData(data);

  if (!dataNormalizada) {
    return 'Data inválida';
  }

  const [ano, mes, dia] = dataNormalizada.split('-');

  return `${dia}/${mes}/${ano}`;
}

export const Gastos: React.FC = () => {
  const hoje = new Date();

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<
    CategoriaApi[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  // Filtros do histórico
  const [mesSelecionado, setMesSelecionado] = useState(
    hoje.getMonth() + 1
  );

  const [anoSelecionado, setAnoSelecionado] = useState(
    hoje.getFullYear()
  );

  const [categoriaFiltro, setCategoriaFiltro] =
    useState('');

  // Formulário de criação
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState('');

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataGasto, setDataGasto] = useState(
    obterDataAtual()
  );

  const [observacao, setObservacao] = useState('');

  // Formulário de edição
  const [gastoEmEdicao, setGastoEmEdicao] =
    useState<Gasto | null>(null);

  const [categoriaEdicao, setCategoriaEdicao] =
    useState('');

  const [descricaoEdicao, setDescricaoEdicao] =
    useState('');

  const [valorEdicao, setValorEdicao] = useState('');

  const [dataEdicao, setDataEdicao] = useState('');

  const [observacaoEdicao, setObservacaoEdicao] =
    useState('');

  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    carregarGastos();
  }, [
    mesSelecionado,
    anoSelecionado,
    categoriaFiltro,
  ]);

  async function carregarCategorias() {
    try {
      setErro('');

      const dados = await listarCategorias();

      setCategorias(dados);

      if (dados.length > 0) {
        setCategoriaSelecionada((categoriaAtual) =>
          categoriaAtual || String(dados[0].id)
        );
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as categorias.'
      );
    }
  }

  async function carregarGastos() {
    try {
      setCarregando(true);
      setErro('');

      const dados = await listarGastos({
        mes: mesSelecionado,
        ano: anoSelecionado,
        categoriaId: categoriaFiltro
          ? Number(categoriaFiltro)
          : undefined,
      });

      setGastos(dados.map(converterGasto));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os gastos.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleAdicionarGasto(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const valorNumerico = Number(valor);
    const categoriaId = Number(categoriaSelecionada);

    if (!categoriaId) {
      setErro('Selecione uma categoria.');
      return;
    }

    if (
      Number.isNaN(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setErro('O valor do gasto deve ser maior que zero.');
      return;
    }

    if (!dataGasto) {
      setErro('Informe a data do gasto.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const gastoCriado = await criarGasto({
        categoria_id: categoriaId,
        descricao: descricao.trim() || null,
        valor: valorNumerico,
        data_gasto: dataGasto,
        observacao: observacao.trim() || null,
      });

      const dataCriada = new Date(
        `${dataGasto}T00:00:00`
      );

      const pertenceAoFiltro =
        dataCriada.getMonth() + 1 === mesSelecionado &&
        dataCriada.getFullYear() === anoSelecionado &&
        (
          !categoriaFiltro ||
          categoriaId === Number(categoriaFiltro)
        );

      if (pertenceAoFiltro) {
        setGastos((gastosAtuais) => [
          converterGasto(gastoCriado),
          ...gastosAtuais,
        ]);
      }

      setDescricao('');
      setValor('');
      setObservacao('');
      setDataGasto(obterDataAtual());

      setMensagem('Gasto adicionado com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o gasto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirEdicao(gasto: Gasto) {
    setGastoEmEdicao(gasto);

    setCategoriaEdicao(String(gasto.categoriaId));
    setDescricaoEdicao(gasto.descricao);
    setValorEdicao(String(gasto.valor));
    setDataEdicao(gasto.dataGasto);
    setObservacaoEdicao(gasto.observacao);

    setErro('');
    setMensagem('');
  }

  function cancelarEdicao() {
    setGastoEmEdicao(null);
    setCategoriaEdicao('');
    setDescricaoEdicao('');
    setValorEdicao('');
    setDataEdicao('');
    setObservacaoEdicao('');
  }

  async function handleAtualizarGasto(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!gastoEmEdicao) {
      return;
    }

    const valorNumerico = Number(valorEdicao);
    const categoriaId = Number(categoriaEdicao);

    if (!categoriaId) {
      setErro('Selecione uma categoria.');
      return;
    }

    if (
      Number.isNaN(valorNumerico) ||
      valorNumerico <= 0
    ) {
      setErro('O valor do gasto deve ser maior que zero.');
      return;
    }

    if (!dataEdicao) {
      setErro('Informe a data do gasto.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const gastoAtualizado = await atualizarGasto(
        gastoEmEdicao.id,
        {
          categoria_id: categoriaId,
          descricao: descricaoEdicao.trim() || null,
          valor: valorNumerico,
          data_gasto: dataEdicao,
          observacao:
            observacaoEdicao.trim() || null,
        }
      );

      const gastoConvertido =
        converterGasto(gastoAtualizado);

      const dataAtualizada = new Date(
        `${gastoConvertido.dataGasto}T00:00:00`
      );

      const permaneceNoFiltro =
        dataAtualizada.getMonth() + 1 ===
        mesSelecionado &&
        dataAtualizada.getFullYear() ===
        anoSelecionado &&
        (
          !categoriaFiltro ||
          gastoConvertido.categoriaId ===
          Number(categoriaFiltro)
        );

      if (permaneceNoFiltro) {
        setGastos((gastosAtuais) =>
          gastosAtuais.map((gasto) =>
            gasto.id === gastoEmEdicao.id
              ? gastoConvertido
              : gasto
          )
        );
      } else {
        setGastos((gastosAtuais) =>
          gastosAtuais.filter(
            (gasto) =>
              gasto.id !== gastoEmEdicao.id
          )
        );
      }

      cancelarEdicao();

      setMensagem('Gasto atualizado com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o gasto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletarGasto(gasto: Gasto) {
    const confirmacao = window.confirm(
      `Deseja realmente excluir o gasto de ${formatarDinheiro(
        gasto.valor
      )}?`
    );

    if (!confirmacao) {
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      await deletarGasto(gasto.id);

      setGastos((gastosAtuais) =>
        gastosAtuais.filter(
          (item) => item.id !== gasto.id
        )
      );

      if (gastoEmEdicao?.id === gasto.id) {
        cancelarEdicao();
      }

      setMensagem('Gasto excluído com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o gasto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const totalGastos = useMemo(
    () =>
      gastos.reduce(
        (soma, gasto) => soma + gasto.valor,
        0
      ),
    [gastos]
  );

  return (
    <div
      style={{
        padding: '10px',
        fontFamily: 'sans-serif',
        color: '#334155',
      }}
    >
      <h2 style={{ marginBottom: '24px' }}>
        Gastos Mensais
      </h2>

      {erro && (
        <div style={erroStyle}>
          {erro}
        </div>
      )}

      {mensagem && (
        <div style={mensagemStyle}>
          {mensagem}
        </div>
      )}

      {/* Filtros */}
      <div
        style={{
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '18px',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div style={campoStyle}>
          <label style={labelStyle}>Mês</label>

          <select
            value={mesSelecionado}
            onChange={(event) =>
              setMesSelecionado(
                Number(event.target.value)
              )
            }
            style={inputStyle}
          >
            {meses.map((mes, indice) => (
              <option
                key={mes}
                value={indice + 1}
              >
                {mes}
              </option>
            ))}
          </select>
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>Ano</label>

          <input
            type="number"
            value={anoSelecionado}
            onChange={(event) =>
              setAnoSelecionado(
                Number(event.target.value)
              )
            }
            style={inputStyle}
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>
            Categoria
          </label>

          <select
            value={categoriaFiltro}
            onChange={(event) =>
              setCategoriaFiltro(event.target.value)
            }
            style={inputStyle}
          >
            <option value="">
              Todas as categorias
            </option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={carregarGastos}
          style={botaoSecundarioStyle}
        >
          Atualizar
        </button>
      </div>

      {/* Criação */}
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
          flexWrap: 'wrap',
        }}
      >
        <div style={campoStyle}>
          <label style={labelStyle}>
            Categoria
          </label>

          <select
            value={categoriaSelecionada}
            onChange={(event) =>
              setCategoriaSelecionada(
                event.target.value
              )
            }
            style={inputStyle}
            required
          >
            {categorias.length === 0 && (
              <option value="">
                Nenhuma categoria
              </option>
            )}

            {categorias.map((categoria) => (
              <option
                key={categoria.id}
                value={categoria.id}
              >
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            ...campoStyle,
            flex: '2',
          }}
        >
          <label style={labelStyle}>
            Descrição
          </label>

          <input
            type="text"
            placeholder="Ex: Uber, almoço..."
            value={descricao}
            onChange={(event) =>
              setDescricao(event.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>
            Valor
          </label>

          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={valor}
            onChange={(event) =>
              setValor(event.target.value)
            }
            style={inputStyle}
            required
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>Data</label>

          <input
            type="date"
            value={dataGasto}
            onChange={(event) =>
              setDataGasto(event.target.value)
            }
            style={inputStyle}
            required
          />
        </div>

        <div
          style={{
            ...campoStyle,
            flex: '2',
          }}
        >
          <label style={labelStyle}>
            Observação
            <span style={opcionalStyle}>
              {' '}
              (opcional)
            </span>
          </label>

          <input
            type="text"
            placeholder="Informação adicional"
            value={observacao}
            onChange={(event) =>
              setObservacao(event.target.value)
            }
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={
            salvando || categorias.length === 0
          }
          style={{
            ...botaoPrimarioStyle,
            opacity:
              salvando || categorias.length === 0
                ? 0.6
                : 1,
          }}
        >
          {salvando
            ? 'Salvando...'
            : 'Adicionar gasto'}
        </button>
      </form>

      {/* Edição */}
      {gastoEmEdicao && (
        <form
          onSubmit={handleAtualizarGasto}
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Editar gasto
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <div style={campoStyle}>
              <label style={labelStyle}>
                Categoria
              </label>

              <select
                value={categoriaEdicao}
                onChange={(event) =>
                  setCategoriaEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              >
                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                ...campoStyle,
                flex: '2',
              }}
            >
              <label style={labelStyle}>
                Descrição
              </label>

              <input
                type="text"
                value={descricaoEdicao}
                onChange={(event) =>
                  setDescricaoEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={campoStyle}>
              <label style={labelStyle}>
                Valor
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={valorEdicao}
                onChange={(event) =>
                  setValorEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={campoStyle}>
              <label style={labelStyle}>
                Data
              </label>

              <input
                type="date"
                value={dataEdicao}
                onChange={(event) =>
                  setDataEdicao(event.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div
              style={{
                ...campoStyle,
                flex: '2',
              }}
            >
              <label style={labelStyle}>
                Observação
              </label>

              <input
                type="text"
                value={observacaoEdicao}
                onChange={(event) =>
                  setObservacaoEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              style={botaoPrimarioStyle}
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={cancelarEdicao}
              style={botaoSecundarioStyle}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Histórico */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          marginBottom: '24px',
        }}
      >
        {carregando ? (
          <p style={{ padding: '20px' }}>
            Carregando gastos...
          </p>
        ) : gastos.length === 0 ? (
          <p
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Nenhum gasto encontrado neste período.
          </p>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: '800px',
            }}
          >
            <thead>
              <tr style={cabecalhoTabelaStyle}>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Descrição</th>
                <th style={thStyle}>Observação</th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: 'right',
                  }}
                >
                  Valor
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: 'center',
                  }}
                >
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {gastos.map((gasto) => (
                <tr
                  key={gasto.id}
                  style={{
                    borderBottom:
                      '1px solid #f1f5f9',
                  }}
                >
                  <td style={tdStyle}>
                    {formatarData(gasto.dataGasto)}
                  </td>

                  <td style={tdStyle}>
                    <span style={categoriaStyle}>
                      {gasto.categoria}
                    </span>
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      color: gasto.descricao
                        ? '#334155'
                        : '#94a3b8',
                      fontStyle: gasto.descricao
                        ? 'normal'
                        : 'italic',
                    }}
                  >
                    {gasto.descricao ||
                      'Sem descrição'}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      color: gasto.observacao
                        ? '#334155'
                        : '#94a3b8',
                    }}
                  >
                    {gasto.observacao || '—'}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#ef4444',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    - {formatarDinheiro(gasto.valor)}
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(gasto)
                        }
                        style={botaoEditarStyle}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeletarGasto(gasto)
                        }
                        style={botaoExcluirStyle}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Total */}
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '24px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#cbd5e1',
              display: 'block',
            }}
          >
            Total de gastos em{' '}
            {meses[mesSelecionado - 1]} de{' '}
            {anoSelecionado}
          </span>

          <span
            style={{
              fontSize: '13px',
              color: '#94a3b8',
            }}
          >
            {gastos.length}{' '}
            {gastos.length === 1
              ? 'lançamento'
              : 'lançamentos'}
          </span>
        </div>

        <span
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#f87171',
          }}
        >
          {formatarDinheiro(totalGastos)}
        </span>
      </div>
    </div>
  );
};

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const campoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  flex: '1',
  minWidth: '150px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#64748b',
};

const opcionalStyle: React.CSSProperties = {
  fontWeight: 'normal',
  color: '#94a3b8',
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  background: '#fff',
  boxSizing: 'border-box',
};

const botaoPrimarioStyle: React.CSSProperties = {
  padding: '11px 20px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '14px',
};

const botaoSecundarioStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#e2e8f0',
  color: '#334155',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const botaoEditarStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: '#dbeafe',
  color: '#1d4ed8',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const botaoExcluirStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: '#fee2e2',
  color: '#b91c1c',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const cabecalhoTabelaStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
};

const thStyle: React.CSSProperties = {
  padding: '16px',
  color: '#64748b',
  fontSize: '14px',
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
};

const categoriaStyle: React.CSSProperties = {
  background: '#f1f5f9',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 500,
};

const erroStyle: React.CSSProperties = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
};

const mensagemStyle: React.CSSProperties = {
  background: '#d1fae5',
  color: '#065f46',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
};