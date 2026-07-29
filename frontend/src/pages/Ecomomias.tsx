import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  MetaApi,
  atualizarMeta,
  atualizarValorMeta,
  criarMeta,
  deletarMeta,
  listarMetas,
} from '../api/metasApi';

interface Meta {
  id: number;
  titulo: string;
  valorAtual: number;
  valorMeta: number;
  dataLimite: string;
  concluida: boolean;
}

function normalizarData(data?: string | null): string {
  if (!data) {
    return '';
  }

  // Já está no formato YYYY-MM-DD
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

function converterMeta(meta: MetaApi): Meta {
  return {
    id: meta.id,
    titulo: meta.nome,
    valorAtual: Number(meta.valor_atual),
    valorMeta: Number(meta.valor_meta),
    dataLimite: meta.data_limite || '',
    concluida: meta.concluida,
  };
}

function formatarDinheiro(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export const Economias: React.FC = () => {
  const [metas, setMetas] = useState<Meta[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novaMeta, setNovaMeta] = useState('');
  const [novaDataLimite, setNovaDataLimite] =
    useState('');

  const [blocoIdAporte, setBlocoIdAporte] =
    useState<number | null>(null);
  const [valorAporte, setValorAporte] = useState('');

  const [metaEmEdicao, setMetaEmEdicao] =
    useState<Meta | null>(null);
  const [tituloEdicao, setTituloEdicao] = useState('');
  const [valorAtualEdicao, setValorAtualEdicao] =
    useState('');
  const [valorMetaEdicao, setValorMetaEdicao] =
    useState('');
  const [dataLimiteEdicao, setDataLimiteEdicao] =
    useState('');

  useEffect(() => {
    carregarMetas();
  }, []);

  async function carregarMetas() {
    try {
      setCarregando(true);
      setErro('');

      const dados = await listarMetas();

      setMetas(dados.map(converterMeta));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar as metas.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleAdicionarMeta(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const valorAtual = Number(novoValor);
    const valorMeta = Number(novaMeta);

    if (!novoTitulo.trim()) {
      setErro('Informe o título da meta.');
      return;
    }

    if (
      Number.isNaN(valorAtual) ||
      valorAtual < 0
    ) {
      setErro('O saldo inicial não pode ser negativo.');
      return;
    }

    if (
      Number.isNaN(valorMeta) ||
      valorMeta <= 0
    ) {
      setErro('O valor da meta deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const metaCriada = await criarMeta({
        nome: novoTitulo.trim(),
        valor_atual: valorAtual,
        valor_meta: valorMeta,
        data_limite: novaDataLimite || null,
      });

      setMetas((metasAtuais) => [
        ...metasAtuais,
        converterMeta(metaCriada),
      ]);

      setNovoTitulo('');
      setNovoValor('');
      setNovaMeta('');
      setNovaDataLimite('');

      setMensagem('Meta criada com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a meta.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleSomarAporte(meta: Meta) {
    const dinheiroAdicional = Number(valorAporte);

    if (
      Number.isNaN(dinheiroAdicional) ||
      dinheiroAdicional <= 0
    ) {
      setErro('Informe um aporte maior que zero.');
      return;
    }

    const novoValorAtual =
      meta.valorAtual + dinheiroAdicional;

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const metaAtualizada = await atualizarValorMeta(
        meta.id,
        novoValorAtual
      );

      setMetas((metasAtuais) =>
        metasAtuais.map((item) =>
          item.id === meta.id
            ? converterMeta(metaAtualizada)
            : item
        )
      );

      setBlocoIdAporte(null);
      setValorAporte('');

      setMensagem('Aporte adicionado com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o aporte.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirEdicao(meta: Meta) {
    setMetaEmEdicao(meta);
    setTituloEdicao(meta.titulo);
    setValorAtualEdicao(String(meta.valorAtual));
    setValorMetaEdicao(String(meta.valorMeta));
    setDataLimiteEdicao(meta.dataLimite);
    setErro('');
    setMensagem('');
  }

  function cancelarEdicao() {
    setMetaEmEdicao(null);
    setTituloEdicao('');
    setValorAtualEdicao('');
    setValorMetaEdicao('');
    setDataLimiteEdicao('');
  }

  async function handleAtualizarMeta(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!metaEmEdicao) {
      return;
    }

    const valorAtual = Number(valorAtualEdicao);
    const valorMeta = Number(valorMetaEdicao);

    if (!tituloEdicao.trim()) {
      setErro('Informe o título da meta.');
      return;
    }

    if (
      Number.isNaN(valorAtual) ||
      valorAtual < 0
    ) {
      setErro('O valor atual não pode ser negativo.');
      return;
    }

    if (
      Number.isNaN(valorMeta) ||
      valorMeta <= 0
    ) {
      setErro('O valor da meta deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      const metaAtualizada = await atualizarMeta(
        metaEmEdicao.id,
        {
          nome: tituloEdicao.trim(),
          valor_atual: valorAtual,
          valor_meta: valorMeta,
          data_limite: dataLimiteEdicao || null,
        }
      );

      setMetas((metasAtuais) =>
        metasAtuais.map((meta) =>
          meta.id === metaEmEdicao.id
            ? converterMeta(metaAtualizada)
            : meta
        )
      );

      cancelarEdicao();

      setMensagem('Meta atualizada com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar a meta.'
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletarMeta(meta: Meta) {
    const confirmacao = window.confirm(
      `Deseja realmente excluir a meta "${meta.titulo}"?`
    );

    if (!confirmacao) {
      return;
    }

    try {
      setSalvando(true);
      setErro('');
      setMensagem('');

      await deletarMeta(meta.id);

      setMetas((metasAtuais) =>
        metasAtuais.filter(
          (item) => item.id !== meta.id
        )
      );

      if (blocoIdAporte === meta.id) {
        setBlocoIdAporte(null);
        setValorAporte('');
      }

      if (metaEmEdicao?.id === meta.id) {
        cancelarEdicao();
      }

      setMensagem('Meta excluída com sucesso.');
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a meta.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const totalAtual = useMemo(
    () =>
      metas.reduce(
        (soma, meta) => soma + meta.valorAtual,
        0
      ),
    [metas]
  );

  const totalMeta = useMemo(
    () =>
      metas.reduce(
        (soma, meta) => soma + meta.valorMeta,
        0
      ),
    [metas]
  );

  const progressoGeral =
    totalMeta > 0
      ? Math.min(
          Math.round((totalAtual / totalMeta) * 100),
          100
        )
      : 0;

  return (
    <div
      style={{
        padding: '10px',
        fontFamily: 'sans-serif',
        color: '#334155',
      }}
    >
      <h2 style={{ marginBottom: '24px' }}>
        Minhas Metas
      </h2>

      {erro && (
        <div
          style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div
          style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {mensagem}
        </div>
      )}

      <form
        onSubmit={handleAdicionarMeta}
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            flex: '2',
            minWidth: '200px',
          }}
        >
          <label style={labelStyle}>
            Objetivo / Título
          </label>

          <input
            type="text"
            placeholder="Ex: Viagem para o Chile"
            value={novoTitulo}
            onChange={(event) =>
              setNovoTitulo(event.target.value)
            }
            style={inputStyle}
            required
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>
            Saldo inicial
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={novoValor}
            onChange={(event) =>
              setNovoValor(event.target.value)
            }
            style={inputStyle}
            required
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>
            Meta final
          </label>

          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="10000,00"
            value={novaMeta}
            onChange={(event) =>
              setNovaMeta(event.target.value)
            }
            style={inputStyle}
            required
          />
        </div>

        <div style={campoStyle}>
          <label style={labelStyle}>
            Data limite
          </label>

          <input
            type="date"
            value={novaDataLimite}
            onChange={(event) =>
              setNovaDataLimite(event.target.value)
            }
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          style={{
            ...botaoPrimarioStyle,
            opacity: salvando ? 0.6 : 1,
          }}
        >
          {salvando ? 'Salvando...' : '+ Criar Meta'}
        </button>
      </form>

      {metaEmEdicao && (
        <form
          onSubmit={handleAtualizarMeta}
          style={{
            background: '#f8fafc',
            padding: '20px',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Editar meta
          </h3>

          <div
            style={{
              display: 'flex',
              gap: '15px',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                ...campoStyle,
                flex: '2',
              }}
            >
              <label style={labelStyle}>Título</label>

              <input
                type="text"
                value={tituloEdicao}
                onChange={(event) =>
                  setTituloEdicao(event.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div style={campoStyle}>
              <label style={labelStyle}>
                Valor atual
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={valorAtualEdicao}
                onChange={(event) =>
                  setValorAtualEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={campoStyle}>
              <label style={labelStyle}>
                Valor da meta
              </label>

              <input
                type="number"
                step="0.01"
                min="0.01"
                value={valorMetaEdicao}
                onChange={(event) =>
                  setValorMetaEdicao(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            <div style={campoStyle}>
              <label style={labelStyle}>
                Data limite
              </label>

              <input
                type="date"
                value={dataLimiteEdicao}
                onChange={(event) =>
                  setDataLimiteEdicao(
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

      {carregando ? (
        <p>Carregando metas...</p>
      ) : metas.length === 0 ? (
        <div
          style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '30px',
          }}
        >
          Nenhuma meta cadastrada.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {metas.map((meta) => {
            const progresso =
              meta.valorMeta > 0
                ? Math.min(
                    Math.round(
                      (meta.valorAtual /
                        meta.valorMeta) *
                        100
                    ),
                    100
                  )
                : 0;

            const valorRestante = Math.max(
              meta.valorMeta - meta.valorAtual,
              0
            );

            return (
              <div
                key={meta.id}
                style={{
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow:
                    '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `5px solid ${
                    meta.concluida
                      ? '#2563eb'
                      : '#10b981'
                  }`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '10px',
                      marginBottom: '12px',
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: '#64748b',
                        fontSize: '14px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {meta.titulo}
                    </h4>

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          abrirEdicao(meta)
                        }
                        style={botaoIconeStyle}
                        title="Editar meta"
                      >
                        ✎
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeletarMeta(meta)
                        }
                        style={{
                          ...botaoIconeStyle,
                          color: '#b91c1c',
                        }}
                        title="Excluir meta"
                      >
                        🗑
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBlocoIdAporte(
                            blocoIdAporte === meta.id
                              ? null
                              : meta.id
                          );
                          setValorAporte('');
                        }}
                        style={botaoIconeStyle}
                        title="Adicionar aporte"
                      >
                        {blocoIdAporte === meta.id
                          ? '✕'
                          : '+'}
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: '0 0 4px',
                      fontSize: '26px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                    }}
                  >
                    {formatarDinheiro(
                      meta.valorAtual
                    )}
                  </p>

                  <p
                    style={{
                      margin: '0 0 5px',
                      fontSize: '12px',
                      color: '#64748b',
                    }}
                  >
                    Meta:{' '}
                    {formatarDinheiro(meta.valorMeta)} (
                    {progresso}%)
                  </p>

                  <p
                    style={{
                      margin: '0 0 16px',
                      fontSize: '12px',
                      color: '#64748b',
                    }}
                  >
                    Falta:{' '}
                    {formatarDinheiro(valorRestante)}
                  </p>

                  {meta.dataLimite && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                      }}
                    >
                      Prazo:{' '}
                      {formatarData(meta.dataLimite)}
                    </p>
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: `${progresso}%`,
                        height: '100%',
                        background: meta.concluida
                          ? '#2563eb'
                          : '#10b981',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>

                  {meta.concluida && (
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      Meta concluída
                    </span>
                  )}
                </div>

                {blocoIdAporte === meta.id && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '15px',
                      paddingTop: '10px',
                      borderTop:
                        '1px dashed #e2e8f0',
                    }}
                  >
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Valor para somar"
                      value={valorAporte}
                      onChange={(event) =>
                        setValorAporte(
                          event.target.value
                        )
                      }
                      style={{
                        ...inputStyle,
                        flex: 1,
                      }}
                    />

                    <button
                      type="button"
                      disabled={salvando}
                      onClick={() =>
                        handleSomarAporte(meta)
                      }
                      style={botaoPrimarioStyle}
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
        }}
      >
        <div>
          <span
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Progresso geral das metas
          </span>

          <span
            style={{
              fontSize: '16px',
              color: '#cbd5e1',
            }}
          >
            Guardado {formatarDinheiro(totalAtual)} de{' '}
            {formatarDinheiro(totalMeta)}
          </span>
        </div>

        <span
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#34d399',
          }}
        >
          {progressoGeral}%
        </span>
      </div>
    </div>
  );
};

const campoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  flex: '1',
  minWidth: '140px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#64748b',
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const botaoPrimarioStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#10b981',
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
  fontSize: '14px',
};

const botaoIconeStyle: React.CSSProperties = {
  background: '#e2e8f0',
  border: 'none',
  borderRadius: '4px',
  width: '30px',
  height: '30px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};