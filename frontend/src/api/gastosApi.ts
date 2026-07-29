const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface GastoApi {
  id: number;
  descricao?: string | null;
  valor: number | string;
  data_gasto: string;
  categoria_id: number;

  // Campo retornado pelo JOIN do backend
  categoria_nome?: string;

  // Mantidos como alternativas caso seu backend use outro nome
  categoria?: string;
  nome_categoria?: string;

  observacao?: string | null;
  criado_em?: string;
}

export interface CriarGastoPayload {
  descricao?: string | null;
  valor: number;
  data_gasto: string;
  categoria_id: number;
  observacao?: string | null;
}

export interface AtualizarGastoPayload {
  descricao?: string | null;
  valor?: number;
  data_gasto?: string;
  categoria_id?: number;
  observacao?: string | null;
}

interface ListarGastosFiltros {
  mes?: number;
  ano?: number;
  categoriaId?: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.erro || 'Não foi possível acessar a API.'
    );
  }

  return data;
}

export function listarGastos(
  filtros: ListarGastosFiltros = {}
): Promise<GastoApi[]> {
  const parametros = new URLSearchParams();

  if (filtros.mes) {
    parametros.append('mes', String(filtros.mes));
  }

  if (filtros.ano) {
    parametros.append('ano', String(filtros.ano));
  }

  if (filtros.categoriaId) {
    parametros.append(
      'categoria_id',
      String(filtros.categoriaId)
    );
  }

  const query = parametros.toString();

  return apiRequest<GastoApi[]>(
    `/gastos${query ? `?${query}` : ''}`
  );
}

export function buscarGasto(id: number): Promise<GastoApi> {
  return apiRequest<GastoApi>(`/gastos/${id}`);
}

export function criarGasto(
  gasto: CriarGastoPayload
): Promise<GastoApi> {
  return apiRequest<GastoApi>('/gastos', {
    method: 'POST',
    body: JSON.stringify(gasto),
  });
}

export function atualizarGasto(
  id: number,
  dados: AtualizarGastoPayload
): Promise<GastoApi> {
  return apiRequest<GastoApi>(`/gastos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export function deletarGasto(id: number): Promise<void> {
  return apiRequest<void>(`/gastos/${id}`, {
    method: 'DELETE',
  });
}