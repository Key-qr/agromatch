import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, publicar, registrarOferta, guardarRegistro, cerrarOperacion } from '../lib/db.js';
import { utilidadNeta, precioMinimo, clasificarPrecio } from '../lib/rentabilidad.js';
import { dinero, numero, tipoLargo } from '../lib/formatos.js';
import { abrirWhatsApp, mensajeOferta } from '../lib/wa.js';
import { Card, Btn, Badge, Vacio, Campo, inputCls, Numerico, Alerta, Semaforo, Simulado, Seccion, Divider } from '../ui.jsx';

const MERCADOS = [
  ['agrícola', '🌾 Cosechas'],
  ['extra', '♻️ Ingreso extra'],
];

export default function Mercado({ usuario, ir }) {
  const [mercado, setMercado] = useState('agrícola');
  const [abierto, setAbierto] = useState(null);
  const [pubForm, setPubForm] = useState(false);
  const [ofertaForm, setOfertaForm] = useState(null);

  const publicaciones = useLiveQuery(() => db.publicaciones.toArray(), []);
  const ofertas = useLiveQuery(() => db.ofertas.toArray(), []);
  const lotes = useLiveQuery(() => db.lotes.toArray(), []);

  const lista = (publicaciones || []).filter((p) => p.mercado === mercado);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900">Mercado</h1>
          <p className="text-xs text-stone-500">
            {usuario.rol === 'empresa' ? 'Busca oferta y envía tu propuesta' : 'Publica tu cosecha y recibe ofertas'}
          </p>
        </div>
        <button
          onClick={() => setPubForm(true)}
          className="rounded-xl bg-campo-900 px-3 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          + Publicar
        </button>
      </div>

      <div className="mb-4 flex gap-1.5">
        {MERCADOS.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setMercado(v)}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${
              mercado === v ? 'bg-campo-900 text-white ring-campo-900' : 'bg-white text-stone-600 ring-stone-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <Vacio titulo="Nada publicado aquí" texto="Usa «+ Publicar» para ofrecer un lote o un material." icono="📦" />
      ) : (
        <div className="space-y-2">
          {lista.map((p) => {
            const misOfertas = (ofertas || []).filter((o) => o.publicacionId === p.id);
            const lote = (lotes || []).find((l) => l.id === p.loteId);
            const costoUnitario =
              lote?.costoProduccion && lote?.cantidadCosechada ? lote.costoProduccion / lote.cantidadCosechada : null;
            return (
              <Card key={p.id} onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-800">{p.material}</p>
                    <p className="text-[11px] text-stone-500">
                      {numero(p.cantidad, 0)} {p.unidad} · {p.ubicacion}
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-400">{p.calidad}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-extrabold text-campo-900">
                      {p.precioReferencial ? dinero(p.precioReferencial) : '—'}
                      <span className="text-[10px] font-medium text-stone-400">/{p.unidad}</span>
                    </div>
                    <div className="mt-1 flex justify-end gap-1">
                      <Badge tono={p.estado === 'publicada' ? 'verde' : 'gris'}>{p.estado}</Badge>
                      <Simulado />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{misOfertas.length} oferta(s) recibida(s)</span>
                  <span className="font-semibold text-campo-700">
                    {abierto === p.id ? 'Cerrar ▲' : 'Ver detalle y ofertas ▼'}
                  </span>
                </div>

                {abierto === p.id ? (
                  <div className="sube mt-3 border-t border-stone-100 pt-3">
                    <DetallePublicacion
                      pub={p}
                      ofertas={misOfertas}
                      costoUnitario={costoUnitario}
                      usuario={usuario}
                      onEnviarOferta={() => setOfertaForm(p)}
                      onCerrar={async (o) => {
                        await cerrarOperacion({ ofertaId: o.id, cantidadFinal: o.cantidad });
                        await guardarRegistro(
                          {
                            tipo: 'venta',
                            producto: p.material,
                            cantidad: o.cantidad,
                            unidad: p.unidad,
                            fecha: new Date().toISOString().slice(0, 10),
                            precioPorUnidad: o.precio,
                            loteId: p.loteId,
                            nota: `Cierre desde el mercado: ${o.compradorNombre}`,
                            origen: 'oferta',
                            estado: 'confirmado',
                          },
                          usuario.id
                        );
                        setAbierto(null);
                      }}
                    />
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <Alerta>
          El contacto se hace por <strong>enlace wa.me con mensaje prellenado</strong>. No es una
          integración que lee o guarda mensajes de WhatsApp: la negociación externa no queda
          sincronizada sola.
        </Alerta>
      </div>

      {pubForm ? <FormPublicacion usuario={usuario} onClose={() => setPubForm(false)} /> : null}
      {ofertaForm ? <FormOferta pub={ofertaForm} onClose={() => setOfertaForm(null)} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DetallePublicacion({ pub, ofertas, costoUnitario, usuario, onEnviarOferta, onCerrar }) {
  const comparadas = ofertas
    .map((o) => {
      const u = utilidadNeta({
        precio: o.precio,
        cantidad: o.cantidad,
        costoUnitario,
        transporte: o.transporte,
        acondicionamiento: o.acondicionamiento,
        comisionPct: o.comisionPct,
        comisionFija: o.comisionFija,
        otros: o.otros,
      });
      const min = precioMinimo({
        cantidad: o.cantidad,
        costoUnitario,
        transporte: o.transporte,
        acondicionamiento: o.acondicionamiento,
        comisionPct: o.comisionPct,
        comisionFija: o.comisionFija,
        otros: o.otros,
      });
      return { ...o, ...u, precioMinimo: min, estadoPrecio: clasificarPrecio(o.precio, min) };
    })
    .sort((a, b) => {
      if (a.utilidad === null) return 1;
      if (b.utilidad === null) return -1;
      return b.utilidad - a.utilidad;
    });

  return (
    <div>
      {costoUnitario === null ? (
        <div className="mb-3">
          <Alerta tono="aviso">
            <strong>Estimación incompleta:</strong> no puedo calcular la utilidad sin el costo de
            producción del lote. Cárgalo en <em>¿Gano o pierdo?</em>
          </Alerta>
        </div>
      ) : null}

      <div className="space-y-2">
        {comparadas.length === 0 ? (
          <p className="text-xs text-stone-500">Todavía no hay ofertas para esta publicación.</p>
        ) : null}

        {comparadas.map((o) => (
          <div key={o.id} className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-stone-800">{o.compradorNombre}</p>
                <p className="text-[11px] text-stone-500">
                  {dinero(o.precio)}/{pub.unidad} × {numero(o.cantidad, 0)} {pub.unidad}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className={`text-sm font-extrabold ${o.utilidad === null ? 'text-stone-400' : o.utilidad >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {o.utilidad === null ? 'incompleto' : `Utilidad ${dinero(o.utilidad)}`}
                </div>
                <div className="mt-1 flex justify-end"><Semaforo estado={o.estadoPrecio} /></div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tono="gris">ingreso {dinero(o.ingreso)}</Badge>
              {o.costoVenta ? <Badge tono="gris">venta {dinero(o.costoVenta)}</Badge> : null}
              <Simulado />
            </div>

            <p className="mt-2 text-[11px] text-stone-400">{o.condiciones}</p>

            <div className="mt-2 flex gap-2">
              <Btn
                variante="fantasma"
                className="py-1.5 text-[11px]"
                onClick={() =>
                  abrirWhatsApp({
                    telefono: '+51999888777',
                    texto: mensajeOferta({
                      comprador: o.compradorNombre,
                      material: pub.material,
                      cantidad: pub.cantidad,
                      unidad: pub.unidad,
                      precio: pub.precioReferencial,
                      condiciones: pub.calidad,
                    }),
                  })
                }
              >
                💬 Contactar
              </Btn>
              <Btn variante="secundario" className="py-1.5 text-[11px]" onClick={() => onCerrar(o)}>
                Cerrar operación
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {usuario.rol === 'empresa' ? (
        <div className="mt-3">
          <Btn variante="fantasma" onClick={onEnviarOferta}>+ Enviar oferta como empresa</Btn>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FormPublicacion({ usuario, onClose }) {
  const lotes = useLiveQuery(() => db.lotes.where('usuarioId').equals(usuario.id).toArray(), [usuario.id]);
  const [mercado, setMercado] = useState('agrícola');
  const [loteId, setLoteId] = useState('');
  const [material, setMaterial] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [precio, setPrecio] = useState('');
  const [calidad, setCalidad] = useState('');
  const [aviso, setAviso] = useState(null);

  async function guardar() {
    const c = Number(String(cantidad).replace(',', '.'));
    if (!material.trim()) return setAviso('Falta el material o producto.');
    if (!c || c <= 0) return setAviso('La cantidad debe ser mayor que cero.');
    await publicar({
      usuarioId: usuario.id,
      loteId: mercado === 'agrícola' ? loteId || null : loteId || null,
      mercado,
      material: material.trim(),
      cantidad: c,
      unidad,
      precioReferencial: Number(String(precio).replace(',', '.')) || null,
      calidad: calidad || '—',
      ubicacion: usuario.zona,
      simulada: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 scroll-fino">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">Nueva publicación</h3>
          <button onClick={onClose} className="text-xs font-semibold text-stone-400">Cerrar ✕</button>
        </div>

        <div className="space-y-3">
          <Campo label="Mercado">
            <select className={inputCls} value={mercado} onChange={(e) => setMercado(e.target.value)}>
              <option value="agrícola">Agrícola (cosecha)</option>
              <option value="extra">Ingreso extra (residuo/subproducto)</option>
            </select>
          </Campo>

          <Campo label="Lote asociado" hint="se usa para calcular el costo por unidad">
            <select className={inputCls} value={loteId} onChange={(e) => setLoteId(e.target.value)}>
              <option value="">— sin lote —</option>
              {(lotes || []).map((l) => (
                <option key={l.id} value={l.id}>
                  {l.cultivo} · {numero(l.cantidadCosechada, 0)} {l.unidad} · {l.campana}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Material / producto">
            <input className={inputCls} value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Arándano exportación" />
          </Campo>

          <div className="grid grid-cols-3 gap-3">
            <Campo label="Cantidad">
              <Numerico value={cantidad} onChange={setCantidad} />
            </Campo>
            <Campo label="Unidad">
              <select className={inputCls} value={unidad} onChange={(e) => setUnidad(e.target.value)}>
                {['kg', 'quintales', 'jabas', 'cajas', 'sacos', 'bultos', 'toneladas'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Precio ref.">
              <Numerico value={precio} onChange={setPrecio} sufijo="S/" />
            </Campo>
          </div>

          <Campo label="Calidad / condiciones">
            <input className={inputCls} value={calidad} onChange={(e) => setCalidad(e.target.value)} placeholder="Categoría 1, calibre 16+" />
          </Campo>

          {aviso ? <Alerta tono="aviso">{aviso}</Alerta> : null}

          <div className="flex gap-2">
            <Btn variante="fantasma" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={guardar}>Publicar</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FormOferta({ pub, onClose }) {
  const [precio, setPrecio] = useState(String(pub.precioReferencial ?? ''));
  const [cantidad, setCantidad] = useState(String(pub.cantidad ?? ''));
  const [transporte, setTransporte] = useState('0');
  const [comision, setComision] = useState('0');
  const [condiciones, setCondiciones] = useState('Pago a 15 días.');
  const [aviso, setAviso] = useState(null);

  async function enviar() {
    const p = Number(String(precio).replace(',', '.'));
    const c = Number(String(cantidad).replace(',', '.'));
    if (!p || p <= 0) return setAviso('La oferta necesita un precio.');
    if (!c || c <= 0) return setAviso('La oferta necesita una cantidad.');
    await registrarOferta({
      publicacionId: pub.id,
      compradorNombre: 'Tu empresa (oferta enviada)',
      precio: p,
      cantidad: c,
      transporte: Number(String(transporte).replace(',', '.')) || 0,
      acondicionamiento: 0,
      comisionPct: Number(String(comision).replace(',', '.')) || 0,
      comisionFija: 0,
      otros: 0,
      condiciones,
      estado: 'recibida',
      simulada: true,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:p-4">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 scroll-fino">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-800">Enviar oferta · {pub.material}</h3>
          <button onClick={onClose} className="text-xs font-semibold text-stone-400">Cerrar ✕</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Campo label={`Precio por ${pub.unidad}`}>
              <Numerico value={precio} onChange={setPrecio} sufijo="S/" />
            </Campo>
            <Campo label="Cantidad">
              <Numerico value={cantidad} onChange={setCantidad} />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Flete total">
              <Numerico value={transporte} onChange={setTransporte} sufijo="S/" />
            </Campo>
            <Campo label="Comisión %">
              <Numerico value={comision} onChange={setComision} sufijo="%" />
            </Campo>
          </div>
          <Campo label="Condiciones">
            <input className={inputCls} value={condiciones} onChange={(e) => setCondiciones(e.target.value)} />
          </Campo>
          {aviso ? <Alerta tono="aviso">{aviso}</Alerta> : null}
          <div className="flex gap-2">
            <Btn variante="fantasma" onClick={onClose}>Cancelar</Btn>
            <Btn onClick={enviar}>Enviar oferta</Btn>
          </div>
          <p className="text-[11px] text-stone-400">
            El productor verá tu oferta con la utilidad neta que le deja.
          </p>
        </div>
      </div>
    </div>
  );
}
