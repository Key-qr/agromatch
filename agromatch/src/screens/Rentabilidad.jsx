import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db, guardarRegistro, cerrarOperacion,
} from '../lib/db.js';
import { resumenLote, utilidadNeta } from '../lib/rentabilidad.js';
import { dinero, numero, fechaLarga, tipoLargo } from '../lib/formatos.js';
import { abrirWhatsApp, mensajeCompra } from '../lib/wa.js';
import { COMPRADORES } from '../lib/seed.js';
import { Card, Btn, Badge, Alerta, Dato, Semaforo, Vacio, Numerico, Campo, inputCls, Simulado, Seccion, Divider } from '../ui.jsx';

export default function Rentabilidad({ usuario, ir }) {
  const lotes = useLiveQuery(() => db.lotes.where('usuarioId').equals(usuario.id).toArray(), [usuario.id]);
  const publicaciones = useLiveQuery(() => db.publicaciones.toArray(), []);
  const ofertas = useLiveQuery(() => db.ofertas.toArray(), []);

  const [selId, setSelId] = useState(null);
  const [costoNuevo, setCostoNuevo] = useState('');
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!selId && lotes && lotes.length) setSelId(lotes[0].id);
  }, [lotes, selId]);

  const lote = (lotes || []).find((l) => l.id === selId) || null;
  const pubs = (publicaciones || []).filter((p) => p.loteId === lote?.id);
  const ids = new Set(pubs.map((p) => p.id));
  const ofertasDelLote = (ofertas || []).filter((o) => ids.has(o.publicacionId));

  const r = lote ? resumenLote(lote, ofertasDelLote) : null;

  const ordenadas = r?.ofertas || [];
  const porPrecio = ordenadas.length
    ? [...ordenadas].sort((a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity))[0]
    : null;
  const mejor = r?.mejorOferta || null;

  async function cargarCosto() {
    const n = Number(String(costoNuevo).replace(',', '.'));
    if (!n || n <= 0) return setAviso('Escribe un costo de producción válido en soles.');
    await db.lotes.update(lote.id, { costoProduccion: n });
    setCostoNuevo('');
    setAviso(null);
  }

  async function aceptar(o) {
    const util = utilidadNeta({
      precio: o.precio,
      cantidad: o.cantidad,
      costoUnitario: r.costoUnitario,
      transporte: o.transporte,
      acondicionamiento: o.acondicionamiento,
      comisionPct: o.comisionPct,
      comisionFija: o.comisionFija,
      otros: o.otros,
    });
    const ok = confirm(
      `Aceptar la oferta de ${o.compradorNombre}?\n\n` +
        `Utilidad neta estimada: ${util.completo ? dinero(util.utilidad) : 'estimación incompleta'}\n` +
        `Esto registrará la venta y marcará la operación como cerrada.`
    );
    if (!ok) return;

    await cerrarOperacion({ ofertaId: o.id, cantidadFinal: o.cantidad });
    await guardarRegistro(
      {
        tipo: 'venta',
        producto: pubs.find((p) => p.id === o.publicacionId)?.material || 'Producto',
        cantidad: o.cantidad,
        unidad: pubs.find((p) => p.id === o.publicacionId)?.unidad || 'kg',
        fecha: new Date().toISOString().slice(0, 10),
        precioPorUnidad: o.precio,
        costoDirecto: null,
        categoriaCosto: null,
        loteId: lote.id,
        nota: `Cierre de oferta de ${o.compradorNombre}.`,
        entrada: `Vendimos ${o.cantidad} a S/ ${o.precio}`,
        origen: 'oferta',
        estado: 'confirmado',
      },
      usuario.id
    );
    setAviso('Operación cerrada y venta registrada ✔');
  }

  if (!lote) return <Vacio titulo="No hay lotes cargados" />;

  return (
    <div>
      <div className="mb-3">
        <h1 className="text-xl font-extrabold text-stone-900">¿Gano o pierdo?</h1>
        <p className="text-xs text-stone-500">
          Utilidad neta real, después de restar producción, transporte y comisiones.
        </p>
      </div>

      {/* Selector de lote */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scroll-fino">
        {(lotes || []).map((l) => (
          <button
            key={l.id}
            onClick={() => setSelId(l.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
              lote.id === l.id ? 'bg-campo-900 text-white ring-campo-900' : 'bg-white text-stone-600 ring-stone-200'
            }`}
          >
            {l.cultivo} · {numero(l.cantidadCosechada, 0)} {l.unidad}
          </button>
        ))}
      </div>

      {/* ---------- Resumen ---------- */}
      <div className="mb-3 rounded-2xl bg-campo-900 p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-campo-100/80">{lote.campana}</p>
            <p className="text-lg font-extrabold">{lote.cultivo}</p>
          </div>
          <Simulado />
        </div>

        {r.completo ? (
          <>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] uppercase text-campo-100/70">Mi costo</p>
                <p className="text-base font-extrabold">{dinero(r.costoUnitario)}<span className="text-[10px] font-medium">/{lote.unidad}</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-campo-100/70">Precio mínimo</p>
                <p className="text-base font-extrabold text-amber-300">{dinero(r.precioMinimoBase)}<span className="text-[10px] font-medium">/{lote.unidad}</span></p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-campo-100/70">Mejor utilidad</p>
                <p className="text-base font-extrabold text-emerald-300">
                  {mejor ? dinero(mejor.utilidad) : '—'}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-campo-100/80">
              Precio mínimo = precio al que <strong>no pierdes ni ganas nada</strong>. Por debajo de{' '}
              {dinero(r.precioMinimoBase)} por {lote.unidad}, la venta te conviene menos que no vender.
            </p>
          </>
        ) : (
          <div className="mt-3">
            <p className="text-sm font-bold text-amber-300">⚠ Estimación incompleta</p>
            <p className="mt-1 text-[11px] text-campo-100/80">{r.motivoIncompleto}. Sin ese dato no declaro ninguna ganancia.</p>
            <div className="mt-3 flex items-end gap-2">
              <div className="flex-1">
                <Campo label={`Costo de producción total (S/) de ${numero(lote.cantidadCosechada, 0)} ${lote.unidad}`}>
                  <Numerico value={costoNuevo} onChange={setCostoNuevo} sufijo="S/" placeholder="4500" />
                </Campo>
              </div>
              <button
                onClick={cargarCosto}
                className="rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-campo-900 transition active:scale-95"
              >
                Calcular
              </button>
            </div>
          </div>
        )}
      </div>

      {aviso ? (
        <div className="mb-3">
          <Alerta tono="ok">{aviso}</Alerta>
        </div>
      ) : null}

      {/* ---------- Comparador de ofertas ---------- */}
      <Seccion titulo={`Ofertas recibidas (${ordenadas.length})`}>
        {ordenadas.length === 0 ? (
          <Vacio
            titulo="Sin ofertas aún"
            texto="Publica la cosecha en el Mercado o revisa la demo sembrada."
            icono="🤝"
          />
        ) : null}

        {ordenadas.map((o) => {
          const esMejor = mejor && o.id === mejor.id;
          const esMasCaro = porPrecio && o.id === porPrecio.id;
          return (
            <Card key={o.id} className={esMejor ? 'ring-2 ring-emerald-400' : ''}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-800">{o.compradorNombre}</p>
                  <p className="text-[11px] text-stone-500">
                    {dinero(o.precio)}/{o.cantidad && o.transporte !== undefined ? lote.unidad : lote.unidad} · {numero(o.cantidad, 0)} {lote.unidad}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {esMejor ? <Badge tono="verde">★ MEJOR EN NETO</Badge> : null}
                  {esMasCaro && !esMejor ? <Badge tono="azul">pagó más por kilo</Badge> : null}
                  <Simulado />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Dato label="Ingreso" valor={dinero(o.ingreso)} />
                <Dato
                  label="Costo venta"
                  valor={dinero(o.costoVenta)}
                />
                <Dato
                  label="Utilidad neta"
                  valor={o.utilidad === null ? '—' : dinero(o.utilidad)}
                  tono={o.utilidad === null ? undefined : o.utilidad >= 0 ? 'verde' : 'rojo'}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Semaforo estado={o.estadoPrecio} />
                {o.precioMinimo ? <Badge tono="gris">mín. {dinero(o.precioMinimo)}/{lote.unidad}</Badge> : null}
                {o.comisionPct ? <Badge tono="gris">comisión {o.comisionPct}%</Badge> : null}
                {o.transporte ? <Badge tono="gris">flete {dinero(o.transporte)}</Badge> : null}
                {o.acondicionamiento ? <Badge tono="gris">empaque {dinero(o.acondicionamiento)}</Badge> : null}
              </div>

              <p className="mt-2 text-[11px] text-stone-400">{o.condiciones}</p>

              <div className="mt-3 flex gap-2">
                <Btn
                  variante="secundario"
                  className="py-2 text-xs"
                  onClick={() =>
                    abrirWhatsApp({
                      telefono: '+51999888777',
                      texto: mensajeCompra({
                        comprador: o.compradorNombre,
                        material: pubs.find((p) => p.id === o.publicacionId)?.material,
                        cantidad: o.cantidad,
                        unidad: lote.unidad,
                        precio: o.precio,
                        condiciones: o.condiciones,
                      }),
                    })
                  }
                >
                  💬 Contactar
                </Btn>
                {esMejor || o.estado === 'recibida' ? (
                  <Btn variante="primario" className="py-2 text-xs" onClick={() => aceptar(o)}>
                    Aceptar oferta
                  </Btn>
                ) : null}
              </div>
            </Card>
          );
        })}
      </Seccion>

      {/* ---------- El mensaje clave del producto ---------- */}
      {mejor && porPrecio && mejor.id !== porPrecio.id ? (
        <div className="mb-4">
          <Alerta tono="ok">
            <strong>Atención:</strong> {porPrecio.compradorNombre} ofrece{' '}
            <strong>{dinero(porPrecio.precio)}</strong> por {lote.unidad} (el precio más alto), pero{' '}
            {mejor.compradorNombre} deja{' '}
            <strong>{dinero(Math.abs(mejor.utilidad - porPrecio.utilidad))}</strong> más de utilidad.{' '}
            <em>Precio más alto ≠ más ganancia.</em>
          </Alerta>
        </div>
      ) : null}

      {r.ofertaBajoMinimo ? (
        <div className="mb-4">
          <Alerta tono="aviso">
            Hay ofertas <strong>por debajo de tu precio mínimo</strong>: aceptarlas significa perder
            dinero. Puedes rechazarlas o renegociar.
          </Alerta>
        </div>
      ) : null}

      {/* ---------- Ventas ya cerradas ---------- */}
      <VentasCerradas usuario={usuario} />

      <div className="mt-4">
        <Btn variante="fantasma" onClick={() => ir('mercado')}>
          Ir al mercado →
        </Btn>
      </div>
    </div>
  );
}

function VentasCerradas({ usuario }) {
  const operaciones = useLiveQuery(() => db.operaciones.toArray(), []);
  const ofertas = useLiveQuery(() => db.ofertas.toArray(), []);
  const publicaciones = useLiveQuery(() => db.publicaciones.toArray(), []);
  const lotes = useLiveQuery(() => db.lotes.toArray(), []);

  if (!operaciones || operaciones.length === 0) return null;

  return (
    <div className="mt-6">
      <Seccion titulo="Operaciones cerradas">
        {operaciones.map((op) => {
          const o = (ofertas || []).find((x) => x.id === op.ofertaId);
          const pub = (publicaciones || []).find((p) => p.id === o?.publicacionId);
          const lote = (lotes || []).find((l) => l.id === pub?.loteId);
          const util = o
            ? utilidadNeta({
                precio: o.precio,
                cantidad: op.cantidadFinal,
                costoUnitario:
                  lote?.costoProduccion && lote?.cantidadCosechada
                    ? lote.costoProduccion / lote.cantidadCosechada
                    : null,
                transporte: o.transporte,
                acondicionamiento: o.acondicionamiento,
                comisionPct: o.comisionPct,
                comisionFija: o.comisionFija,
                otros: o.otros,
              })
            : null;
          return (
            <Card key={op.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-stone-800">{o?.compradorNombre || '—'}</p>
                  <p className="text-[11px] text-stone-500">
                    {pub?.material} · {fechaLarga(op.fecha.slice(0, 10))}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-emerald-700">
                    {util?.completo ? dinero(util.utilidad) : 'estimación incompleta'}
                  </div>
                  <Badge tono="verde">pago {op.estadoPago}</Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </Seccion>
    </div>
  );
}
