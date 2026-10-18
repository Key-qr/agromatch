import React from 'react';

/**
 * Barrera de errores: si un componente se cae, en vez de una pantalla en blanco
 * mostramos un mensaje claro y un boton para recuperar la app.
 *
 * Es clave para una demo en vivo: nunca queremos que el jurado vea un vacio.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('AgroMatch se cayo:', error, info);
  }

  async limpiarYRecargar() {
    try {
      const bases = await indexedDB.databases?.();
      (bases || []).forEach((b) => b?.name && indexedDB.deleteDatabase(b.name));
    } catch (e) {
      /* si no se puede, igual recargamos */
    }
    this.setState({ error: null });
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-full place-items-center bg-[#f5f7f4] px-6 py-10 text-center">
        <div className="max-w-sm">
          <div className="text-4xl">🌾</div>
          <h1 className="mt-3 text-lg font-extrabold text-stone-900">Algo salió mal</h1>
          <p className="mt-1 text-sm text-stone-600">
            La app tuvo un problema al abrir. Puedes reintentar; si sigue igual, restaura los datos de
            demostración.
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-campo-900 px-4 py-3 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
            <button
              onClick={() => this.limpiarYRecargar()}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campo-900 ring-1 ring-campo-900/15"
            >
              Restaurar datos de demostración
            </button>
          </div>
          <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-stone-900 p-3 text-left text-[10px] leading-snug text-stone-100">
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
        </div>
      </div>
    );
  }
}
