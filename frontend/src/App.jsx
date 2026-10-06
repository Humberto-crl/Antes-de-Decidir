import { useEffect, useMemo, useState } from 'react';
import { createCategory, getCategories, getCategory } from './api/categories';

const Icon = ({ name }) => {
  const icons = {
    search: <path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    leaf: <path d="M20 4c-7.5 0-13 4.5-13 12 0 1.5.5 2.8 1.5 3.9C9.5 20 8 20 7 20c-1 0-2 .4-3 1.5 4.5 2.3 9.7 1.3 13.5-2.5C19.5 15.3 20 4 20 4ZM7 17c2.5-3 5.5-5 10-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    alert: <path d="M12 9v4m0 4h.01M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
};

function App() {
  const [categorias, setCategorias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getCategories();
        if (active) {
          setCategorias(data);
          if (data.length) setSelectedId(data[0].id_categoria);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!selectedId) {
      setSelected(null);
      return undefined;
    }

    async function loadDetail() {
      try {
        const data = await getCategory(selectedId);
        if (active) setSelected(data);
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [selectedId]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categorias;
    return categorias.filter((categoria) =>
      `${categoria.nombre} ${categoria.descripcion || ''}`.toLowerCase().includes(normalizedQuery),
    );
  }, [categorias, query]);

  async function handleCreate(event) {
    event.preventDefault();
    setFormError('');

    if (!form.nombre.trim()) {
      setFormError('Escribe un nombre para la categoría.');
      return;
    }

    setIsCreating(true);
    try {
      const categoria = await createCategory(form);
      setCategorias((current) => [...current, categoria].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm({ nombre: '', descripcion: '' });
      setShowForm(false);
      setSelected(categoria);
      setSelectedId(categoria.id_categoria);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsCreating(false);
    }
  }

  function openCreateForm() {
    setFormError('');
    setShowForm(true);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Antes de Decidir, inicio">
          <span className="brand-mark"><Icon name="leaf" /></span>
          <span>Antes de Decidir</span>
        </a>
        <span className="topbar-label">Gestión de decisiones</span>
      </header>

      <main id="top" className="main-content">
        <section className="hero">
          <div>
            <p className="eyebrow">Tu espacio de reflexión</p>
            <h1>Elige con más <em>claridad.</em></h1>
            <p className="hero-copy">Organiza las áreas que debes considerar y da forma a decisiones conscientes.</p>
          </div>
          <button className="button button-primary" onClick={openCreateForm}>
            <Icon name="plus" /> Nueva categoría
          </button>
        </section>

        <section className="workspace" aria-label="Gestión de categorías">
          <aside className="category-panel">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Biblioteca</p>
                <h2>Categorías</h2>
              </div>
              <span className="count">{categorias.length}</span>
            </div>

            <label className="search-box">
              <Icon name="search" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar categoría..."
                aria-label="Buscar categoría"
              />
            </label>

            {isLoading ? (
              <div className="loading-list" aria-label="Cargando categorías">
                {[1, 2, 3].map((item) => <div className="skeleton" key={item} />)}
              </div>
            ) : error ? (
              <div className="state-card state-error">
                <Icon name="alert" />
                <strong>No se pudieron cargar las categorías</strong>
                <p>{error}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="state-card">
                <span className="state-icon"><Icon name="leaf" /></span>
                <strong>{query ? 'No encontramos coincidencias' : 'Empieza con una categoría'}</strong>
                <p>{query ? 'Prueba con otro término de búsqueda.' : 'Crea un espacio para comenzar a analizar.'}</p>
              </div>
            ) : (
              <ul className="category-list">
                {filteredCategories.map((categoria) => (
                  <li key={categoria.id_categoria}>
                    <button
                      className={selectedId === categoria.id_categoria ? 'category-item active' : 'category-item'}
                      onClick={() => setSelectedId(categoria.id_categoria)}
                    >
                      <span className="category-icon"><Icon name="leaf" /></span>
                      <span className="category-name">{categoria.nombre}</span>
                      <Icon name="arrow" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="detail-panel">
            {selected ? (
              <article className="detail-card">
                <div className="detail-topline">
                  <span className="detail-number">#{selected.id_categoria.toString().padStart(3, '0')}</span>
                  <span className="status"><span /> Activa</span>
                </div>
                <div className="detail-icon"><Icon name="leaf" /></div>
                <p className="section-kicker">Categoría</p>
                <h2>{selected.nombre}</h2>
                <p className="description">{selected.descripcion || 'Todavía no hay una descripción para esta categoría.'}</p>
                <div className="detail-footer">
                  <span>Lista para analizar</span>
                  <button className="button button-secondary" onClick={() => setSelectedId(null)}>Volver a las categorías</button>
                </div>
              </article>
            ) : (
              <div className="detail-empty">
                <div className="empty-illustration"><Icon name="leaf" /></div>
                <p className="section-kicker">Selecciona una categoría</p>
                <h2>La reflexión empieza aquí.</h2>
                <p>Elige una categoría de la biblioteca para ver su información y continuar con el proceso.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-category-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setShowForm(false)} aria-label="Cerrar formulario"><Icon name="close" /></button>
            <div className="modal-icon"><Icon name="plus" /></div>
            <p className="section-kicker">Nueva dimensión</p>
            <h2 id="new-category-title">Crear categoría</h2>
            <p className="modal-copy">Define el tema que deseas explorar en tu proceso de decisión.</p>

            <form onSubmit={handleCreate}>
              <label>
                Nombre
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
                  placeholder="Ej. Finanzas"
                  maxLength="100"
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={form.descripcion}
                  onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
                  placeholder="Cuéntanos qué debes considerar en esta categoría..."
                  rows="4"
                  maxLength="1000"
                />
              </label>
              {formError && <p className="form-error"><Icon name="alert" />{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="button button-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="button button-primary" disabled={isCreating}>
                  {isCreating ? <span className="spinner" /> : <Icon name="check" />}
                  {isCreating ? 'Creando...' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
