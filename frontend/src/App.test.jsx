import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const categories = [
  { id_categoria: 1, nombre: 'Finanzas', descripcion: 'Costos e ingresos.' },
  { id_categoria: 2, nombre: 'Salud', descripcion: 'Bienestar personal.' },
];

vi.mock('./api/categories', () => ({
  getCategories: vi.fn(),
  getCategory: vi.fn(),
  createCategory: vi.fn(),
}));

import { createCategory, getCategories, getCategory } from './api/categories';

describe('App de categorías', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCategories.mockResolvedValue(categories);
    getCategory.mockImplementation((id) =>
      Promise.resolve(categories.find((categoria) => categoria.id_categoria === id) || {
        id_categoria: 3,
        nombre: 'Familia',
        descripcion: 'La vida en común.',
      }),
    );
  });

  afterEach(() => cleanup());

  it('carga las categorías y muestra el detalle de la seleccionada', async () => {
    render(<App />);

    expect(await screen.findByText('Finanzas')).toBeInTheDocument();
    expect(screen.getByText('Salud')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Salud'));
    expect(await screen.findByRole('heading', { name: 'Salud' })).toBeInTheDocument();
  });

  it('filtra categorías por nombre y crea una categoría', async () => {
    const user = userEvent.setup();
    createCategory.mockResolvedValue({ id_categoria: 3, nombre: 'Familia', descripcion: 'La vida en común.' });
    render(<App />);

    await screen.findByText('Finanzas');
    await user.type(screen.getByLabelText('Buscar categoría'), 'fin');
    expect(screen.getAllByText('Finanzas')).toHaveLength(2);
    expect(screen.queryByText('Salud')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /nueva categoría/i }));
    await user.type(screen.getByLabelText('Nombre'), 'Familia');
    await user.type(screen.getByLabelText('Descripción'), 'La vida en común.');
    await user.click(screen.getByRole('button', { name: 'Crear categoría' }));

    await waitFor(() => expect(createCategory).toHaveBeenCalledWith({ nombre: 'Familia', descripcion: 'La vida en común.' }));
    expect(await screen.findByRole('heading', { name: 'Familia' })).toBeInTheDocument();
  });
});
