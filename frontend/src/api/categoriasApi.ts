const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface CategoriaApi {
  id: number;
  nome: string;
}

export async function listarCategorias(): Promise<CategoriaApi[]> {
  const response = await fetch(`${API_URL}/categorias`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.erro || 'Não foi possível carregar as categorias.'
    );
  }

  return data;
}