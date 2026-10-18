import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, guardarRegistro } from '../lib/db.js';
import { fechaLarga, numero, dinero, tipoLargo } from '../lib/formatos.js';
import { Card, Btn, Badge, Vacio, inputCls, Alerta, Simulado, Divider } from '../ui.jsx';
import FormularioRegistro from './RegistroForm.jsx';

const FILTROS = [
  ['todos', 'Todos'],
  ['cosecha', 'Cosechas'],
  ['compra', 'Compras'],
  ['venta', 'Ventas'],
];

export default function Registros({ usuario, ir }) {
  const [filtro, setFiltro] = useState('todos');
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(null);
  const [form, setForm] = useState(null); // null | 'nuevo' | objeto a editar

  const todos = useLiveQuery(() => db.registros.orderBy('fecha').reverse().toArray(), []);
  const loteMap = useLiveQuery(async () => {
    const lotes = await db.lotes.toArray();
    return Object.fromEntries(lotes.map((l) => [l.id, l]));
  }, []);

  const lista = (todos || []).filter((r) => {
    if (filtro !== 'todos' && r.tipo !== filtro) return false;
    if (!q.trim()) return true;
    const t = `${r.producto} ${r.unidad} ${r.nota || ''} ${r.categoriaCosto || ''}`.toLowerCase();
    return t.includes(q.trim().toLowerCase());
  });

  const totales = {
    cosecha: (todos || []).filter((r) => r.tipo === 'cosecha').length,
    compra: (todos || []).filter((r) => r.tipo === 'compra').length,
    venta: (todos || []).filter((r) => r.tipo === 'venta').length,
  };

  async function eliminar(reg) {
    if (!confirm(`¿Eliminar el registro de ${reg.producto}?`)) return;
    await db.registros.delete(reg.id);
    setAbierto(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">Registros</h1>
          <p className="text-xs text-stone-500">
            {totales.cosecha} cosechas · {totales.compra} compras · {totales.venta} ventas
          </p>
        </div>
        <button
          onClick={() => setForm('nuevo')}
          className="rounded-xl bg-campo-900 px-3 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          + Nuevo
        </button>
      </div>

      {/* Filtros obligatorios del MVP */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scroll-fino">
        {FILTROS.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltro(v)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
              filtro === v ? 'bg-campo-900 text-white ring-campo-900' : 'bg-white text-stone-600 ring-stone-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por producto, unidad o nota…"
        className={`${inputCls} mb-4`}
      />

      {lista.length === 0 ? (
        <Vacio
          titulo="No hay registros con ese filtro"
          texto="Registra hablando desde el inicio o usa «+ Nuevo»."
        />
      ) : (
        <div className="space-y-2">
          {lista.map((r) => (
            <Card key={r.id} onClick={() => setAbierto(abierto?.id === r.id ? null : r)} className="py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-campo-50 text-base">
                  {r.tipo === 'cosecha' ? '🌱' : r.tipo === 'compra' ? '🧾' : r.tipo === 'venta' ? '💰' : '♻️'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-800">{r.producto}</p>
                  <p className="text-[11px] text-stone-500">
                    {fechaLarga(r.fecha)} · {numero(r.cantidad, 0)} {r.unidad}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-stone-800">
                    {r.tipo === 'venta' && r.precioPorUnidad
                      ? dinero(r.precioPorUnidad * r.cantidad)
                      : r.costoDirecto
                        ? dinero(r.costoDirecto)
                        : ''}
                  </div>
                  <div className="mt-0.5 flex justify-end gap-1">
                    <Badge tono={r.tipo === 'venta' ? 'verde' : r.tipo === 'compra' ? 'azul' : 'gris'}>
                      {r.tipo}
                    </Badge>
                  </div>
                </div>
              </div>

              {abierto?.id === r.id ? (
                <div className="sube mt-3 border-t border-stone-100 pt-3">
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                    <div><dt className="text-stone-400">Tipo</dt><dd className="font-semibold text-stone-700">{tipoLargo(r.tipo)}</dd></div>
                    <div><dt className="text-stone-400">Fecha</dt><dd className="font-semibold text-stone-700">{fechaLarga(r.fecha)}</dd></div>
                    <div><dt className="text-stone-400">Cantidad</dt><dd className="font-semibold text-stone-700">{numero(r.cantidad, 0)} {r.unidad}</dd></div>
                    <div><dt className="text-stone-400">Precio unit.</dt><dd className="font-semibold text-stone-700">{r.precioPorUnidad ? dinero(r.precioPorUnidad) : '—'}</dd></div>
                    <div><dt className="text-stone-400">Costo</dt><dd className="font-semibold text-stone-700">{r.costoDirecto ? dinero(r.costoDirecto) : '—'}</dd></div>
                    <div><dt className="text-stone-400">Categoría</dt><dd className="font-semibold text-stone-700">{r.categoriaCosto || '—'}</dd></div>
                    <div><dt className="text-stone-400">Origen</dt><dd className="font-semibold text-stone-700">{r.origen === 'asistente' ? 'Asistente (confirmado)' : 'Manual'}</dd></div>
                    <div><dt className="text-stone-400">Sincronización</dt><dd className="font-semibold text-stone-700">{r.estadoSync === 0 ? 'Sincronizado' : 'Pendiente'}</dd></div>
                  </dl>

                  {r.loteId && loteMap?.[r.loteId] ? (
                    <p className="mt-2 rounded-lg bg-stone-50 px-2 py-1.5 text-[11px] text-stone-500">
                      Lote: {loteMap[r.loteId].cultivo} · {loteMap[r.loteId].campana}
                    </p>
                  ) : null}

                  {r.nota ? <p className="mt-2 text-[11px] italic text-stone-500">“{r.nota}”</p> : null}

                  {r.entrada ? (
                    <p className="mt-2 rounded-lg bg-campo-50 px-2 py-1.5 text-[11px] text-campo-900">
                      ✎ “{r.entrada}”
                    </p>
                  ) : null}

                  <Divider />
                  <div className="flex gap-2">
                    <Btn variante="fantasma" className="py-2 text-xs" onClick={(e) => { e.stopPropagation(); setForm(r); }}>
                      Editar
                    </Btn>
                    <Btn variante="peligro" className="py-2 text-xs" onClick={(e) => { e.stopPropagation(); eliminar(r); }}>
                      Eliminar
                    </Btn>
                    <Btn variante="secundario" className="py-2 text-xs" onClick={(e) => { e.stopPropagation(); ir('rentabilidad'); }}>
                      Ver rentabilidad
                    </Btn>
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Alerta>
          <strong>Registros ≠ ventas.</strong> Cosechar no es publicar ni vender: son acciones
          independientes con su propio estado. <Simulado /> los datos de esta demo son simulados.
        </Alerta>
      </div>

      {/* ---------- Formulario (nuevo / editar) ---------- */}
      {form ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 shadow-xl sm:rounded-3xl scroll-fino">
            <FormularioRegistro
              inicial={form === 'nuevo' ? {} : form}
              titulo={form === 'nuevo' ? 'Nuevo registro' : 'Editar registro'}
              onCancelar={() => setForm(null)}
              onGuardar={async (reg) => {
                await guardarRegistro({ ...reg, id: form === 'nuevo' ? undefined : form.id }, usuario.id);
                setForm(null);
                setAbierto(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
