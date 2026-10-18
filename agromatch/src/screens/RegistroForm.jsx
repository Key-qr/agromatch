import React, { useState } from 'react';
import { Campo, inputCls, Btn, Numerico, Alerta } from '../ui.jsx';
import { UNIDADES, CATEGORIAS_COSTO, fechaHoy, TIPOS } from '../lib/formatos.js';

const TIPOS_OPCIONES = [
  ['cosecha', TIPOS.cosecha],
  ['compra', TIPOS.compra],
  ['venta', TIPOS.venta],
  ['residuo', TIPOS.residuo],
];

const UNI_OPCIONES = ['kg', 'quintales', 'jabas', 'cajas', 'sacos', 'bultos', 'toneladas', 'manojos', 'docenas', 'hectareas', 'litros', 'unidades'];

/** Formulario manual: tambien es el fallback cuando el asistente falla. */
export default function FormularioRegistro({ inicial = {}, onGuardar, onCancelar, titulo = 'Registro' }) {
  const [f, setF] = useState({
    tipo: inicial.tipo || 'cosecha',
    producto: inicial.producto || '',
    cantidad: inicial.cantidad ?? '',
    unidad: inicial.unidad || 'kg',
    fecha: inicial.fecha || fechaHoy(),
    precioPorUnidad: inicial.precioPorUnidad ?? '',
    costoDirecto: inicial.costoDirecto ?? '',
    categoriaCosto: inicial.categoriaCosto || '',
    nota: inicial.nota || '',
    entrada: inicial.entrada || null,
    origen: inicial.origen || 'manual',
  });
  const [aviso, setAviso] = useState(null);

  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  const n = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const x = Number(String(v).replace(',', '.'));
    return Number.isNaN(x) ? null : x;
  };

  function guardar() {
    if (!f.producto.trim()) return setAviso('Falta el producto o material.');
    const c = n(f.cantidad);
    const costo = n(f.costoDirecto);
    const precio = n(f.precioPorUnidad);
    const requiereCantidad = f.tipo !== 'compra';

    if (requiereCantidad && (c === null || c <= 0)) return setAviso('La cantidad debe ser mayor que cero.');
    if (!requiereCantidad && (c === null || c <= 0) && costo === null && precio === null) {
      return setAviso('Indica la cantidad o el costo de esta compra.');
    }
    if (!f.fecha) return setAviso('Falta la fecha.');
    onGuardar({
      ...f,
      producto: f.producto.trim(),
      cantidad: c !== null && c > 0 ? c : null,
      unidad: c !== null && c > 0 ? f.unidad : null,
      precioPorUnidad: precio,
      costoDirecto: costo,
      categoriaCosto: f.categoriaCosto || null,
      nota: f.nota || null,
      estado: 'confirmado',
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-800">{titulo}</h3>
        {f.origen === 'asistente' ? <span className="text-[11px] font-semibold text-campo-700">✎ corregible</span> : null}
      </div>

      <Campo label="Tipo de registro">
        <select className={inputCls} value={f.tipo} onChange={(e) => set('tipo')(e.target.value)}>
          {TIPOS_OPCIONES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </Campo>

      <Campo label={f.tipo === 'residuo' ? 'Material / subproducto' : 'Producto'}>
        <input
          className={inputCls}
          value={f.producto}
          onChange={(e) => set('producto')(e.target.value)}
          placeholder={f.tipo === 'residuo' ? 'Descarte de poda' : 'Arándano'}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Cantidad">
          <Numerico value={f.cantidad} onChange={(v) => set('cantidad')(v)} sufijo="" placeholder="0" />
        </Campo>
        <Campo label="Unidad">
          <select className={inputCls} value={f.unidad} onChange={(e) => set('unidad')(e.target.value)}>
            {UNI_OPCIONES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo label="Fecha">
        <input type="date" className={inputCls} value={f.fecha} onChange={(e) => set('fecha')(e.target.value)} />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        {f.tipo === 'venta' ? (
          <Campo label="Precio por unidad">
            <Numerico value={f.precioPorUnidad} onChange={(v) => set('precioPorUnidad')(v)} sufijo="S/" />
          </Campo>
        ) : null}
        {f.tipo === 'compra' || f.tipo === 'cosecha' ? (
          <Campo label="Costo (S/)" hint="lo que se gastó">
            <Numerico value={f.costoDirecto} onChange={(v) => set('costoDirecto')(v)} sufijo="S/" />
          </Campo>
        ) : null}
        {f.tipo === 'compra' || f.tipo === 'cosecha' ? (
          <Campo label="Categoría de costo">
            <select className={inputCls} value={f.categoriaCosto} onChange={(e) => set('categoriaCosto')(e.target.value)}>
              <option value="">—</option>
              {CATEGORIAS_COSTO.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Campo>
        ) : null}
      </div>

      <Campo label="Nota (opcional)">
        <input
          className={inputCls}
          value={f.nota}
          onChange={(e) => set('nota')(e.target.value)}
          placeholder="lote A, jornales de cosecha..."
        />
      </Campo>

      {aviso ? <Alerta tono="aviso">{aviso}</Alerta> : null}

      <div className="flex gap-2 pt-1">
        <Btn variante="fantasma" onClick={onCancelar}>Cancelar</Btn>
        <Btn onClick={guardar}>Guardar registro</Btn>
      </div>
      <p className="text-[11px] leading-relaxed text-stone-400">
        Ningún dato se guarda sin que lo confirmes tú. Unidades reconocidas:{' '}
        <span className="text-stone-500">{UNIDADES.slice(0, 10).join(', ')}…</span>
      </p>
    </div>
  );
}
