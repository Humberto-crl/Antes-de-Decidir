const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensaje || 'No se pudo completar la operación.');
  }

  return data;
}

export async function getCategories() {
  return request('/categorias');
}

export async function getCategory(id) {
  return request(`/categorias/${id}`);
}

export async function createCategory({ nombre, descripcion = '' }) {
  return request('/categorias', {
    method: 'POST',
    body: JSON.stringify({ nombre, descripcion }),
  });
}
