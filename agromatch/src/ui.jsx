import React from 'react';

/* ------------------------------------------------------------------ */
/* Base visual                                                         */
/* ------------------------------------------------------------------ */

/**
 * Tarjeta. Si es clicable va como <div role="button">: un <button> anidado
 * dentro de otro <button> es HTML inválido y provoca acciones dobles
 * (por ejemplo, pulsar "Enviar oferta" también cerraba la tarjeta).
 */
export function Card({ children, className = '', onClick }) {
  if (!onClick) {
    return (
      <div
        className={`w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 ${className}`}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={false}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      className={`w-full cursor-pointer rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.99] hover:ring-campo-500/40 ${className}`}
    >
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variante = 'primario', className = '', type = 'button', disabled }) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100';
  const v = {
    primario: 'bg-campo-900 text-white hover:bg-campo-700',
    secundario: 'bg-campo-100 text-campo-900 hover:bg-campo-500/20',
    fantasma: 'bg-white text-campo-900 ring-1 ring-campo-900/15 hover:bg-campo-50',
    peligro: 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100',
  }[variante];
  return (
    <button
      type={type}
      onClick={(e) => {
        // No dejar que el clic burbujee a la tarjeta que lo contiene.
        e.stopPropagation();
        onClick?.(e);
      }}
      disabled={disabled}
      className={`${base} ${v} ${className}`}
    >
      {children}
    </button>
  );
}

const BADGES = {
  verde: 'bg-emerald-100 text-emerald-800',
  rojo: 'bg-red-100 text-red-700',
  ambar: 'bg-amber-100 text-amber-800',
  gris: 'bg-stone-100 text-stone-600',
  azul: 'bg-sky-100 text-sky-800',
};

export function Badge({ children, tono = 'gris', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGES[tono]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Semáforo de precio: ¿la oferta está por encima del precio mínimo? */
export function Semaforo({ estado }) {
  if (estado === 'bajo') return <Badge tono="rojo">▼ bajo el precio mínimo</Badge>;
  if (estado === 'ok') return <Badge tono="ambar">● justo sobre el mínimo</Badge>;
  if (estado === 'margen_alto') return <Badge tono="verde">▲ buen margen</Badge>;
  return <Badge tono="gris">sin costo cargado</Badge>;
}

export function Campo({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-stone-600">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-stone-400">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm text-stone-900 ring-1 ring-stone-200 outline-none focus:ring-2 focus:ring-campo-500 placeholder:text-stone-400';

export function Numerico({ value, onChange, step = '0.01', placeholder = '0', sufijo }) {
  return (
    <div className="relative">
      <input
        inputMode="decimal"
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${sufijo ? 'pr-12' : ''}`}
      />
      {sufijo ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-stone-400">
          {sufijo}
        </span>
      ) : null}
    </div>
  );
}

export function Vacio({ titulo, texto, icono = '🌱' }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-6 text-center">
      <div className="text-2xl">{icono}</div>
      <p className="mt-2 text-sm font-semibold text-stone-700">{titulo}</p>
      {texto ? <p className="mt-1 text-xs text-stone-500">{texto}</p> : null}
    </div>
  );
}

export function Seccion({ titulo, extra, children }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-stone-500">{titulo}</h2>
        {extra}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function Alerta({ tono = 'info', children }) {
  const t = {
    info: 'bg-sky-50 text-sky-900 ring-sky-100',
    aviso: 'bg-amber-50 text-amber-900 ring-amber-100',
    ok: 'bg-emerald-50 text-emerald-900 ring-emerald-100',
    error: 'bg-red-50 text-red-800 ring-red-100',
  }[tono];
  return <div className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ring-1 ${t}`}>{children}</div>;
}

/** Etiqueta obligatoria: los datos demostrativos se marcan como simulados. */
export function Simulado({ activo = true }) {
  if (!activo) return null;
  return (
    <Badge tono="ambar" className="shrink-0">
      SIMULADO
    </Badge>
  );
}

export function Dato({ label, valor, sufijo, tono }) {
  const color = tono === 'rojo' ? 'text-red-600' : tono === 'verde' ? 'text-emerald-700' : 'text-stone-900';
  return (
    <div className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
      <div className="text-[11px] font-medium uppercase tracking-wide text-stone-500">{label}</div>
      <div className={`mt-0.5 text-lg font-bold ${color}`}>
        {valor}
        {sufijo ? <span className="ml-1 text-xs font-semibold text-stone-500">{sufijo}</span> : null}
      </div>
    </div>
  );
}

export function Divider() {
  return <div className="my-4 h-px bg-stone-200/70" />;
}
