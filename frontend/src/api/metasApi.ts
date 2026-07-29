const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface MetaApi {
  id: number;
  nome: string;
  valor_meta: number | string;
  valor_atual: number | string;
  valor_restante?: number | string;
  data_inicio?: string;
  data_limite?: string | null;
  concluida: boolean;
  criado_em?: string;
}

export interface CriarMetaPayload {
  nome: string;
  valor_meta: number;
  valor_atual: number;
  data_limite?: string | null;
}

export interface AtualizarMetaPayload {
  nome?: string;
  valor_meta?: number;
  valor_atual?: number;
  data_limite?: string | null;
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
    throw new Error(data.erro || 'Erro ao acessar a API.');
  }

  return data;
}

export function listarMetas(): Promise<MetaApi[]> {
  return apiRequest<MetaApi[]>('/metas');
}

export function criarMeta(
  meta: CriarMetaPayload
): Promise<MetaApi> {
  return apiRequest<MetaApi>('/metas', {
    method: 'POST',
    body: JSON.stringify(meta),
  });
}

export function atualizarMeta(
  id: number,
  dados: AtualizarMetaPayload
): Promise<MetaApi> {
  return apiRequest<MetaApi>(`/metas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dados),
  });
}

export function atualizarValorMeta(
  id: number,
  valorAtual: number
): Promise<MetaApi> {
  return apiRequest<MetaApi>(`/metas/${id}/valor`, {
    method: 'PATCH',
    body: JSON.stringify({
      valor_atual: valorAtual,
    }),
  });
}

export function deletarMeta(id: number): Promise<void> {
  return apiRequest<void>(`/metas/${id}`, {
    method: 'DELETE',
  });
}