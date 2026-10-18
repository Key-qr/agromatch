import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, guardarRegistro } from '../lib/db.js';
import { ingresoExtra } from '../lib/rentabilidad.js';
import { dinero, numero, fechaLarga } from '../lib/formatos.js';
import { abrirWhatsApp, mensajeCompra } from '../lib/wa.js';
import { Card, Btn, Badge, Alerta, Dato, Vacio, Campo, Numerico, inputCls, Simulado, Seccion } from '../ui.jsx';

/**
 * Módulo de INGRESOS EXTRA (economía circular).
 *
 * Está deliberadamente SUBORDINADO a la rentabilidad del Desafío 3:
 * no es un mercado con el mismo peso, sino una línea más del resultado.
 */
export default function Extra({ usuario }) {
  const residuos = useLiveQuery(
    () => db.registros.where('tipo').equals('residuo').reverse().sortBy('fecha'),
    []
  );
  const publicaciones = useLiveQuery(() => db.publicaciones.toArray(), []);
  const ofertas = useLiveQuery(() => db.ofertas.toArray(), []);

  const pubExtra = (publicaciones || []).find((p) => p.mercado === 'extra');
  const ofertasExtra = (ofertas || []).filter((o) => pubExtra && o.publicacionId === pubExtra.id);

  // Calculadora de ingreso extra neto
  const [precio, setPrecio] = useState('0.35');
  const [cantidad, setCantidad] = useState('400');
  const [acopio, setAcopio] = useState('40');
  const [transporte, setTransporte] = useState('60');
  const [preparacion, setPreparacion] = useState('0');

  const calc = ingresoExtra({
    precio: Number(String(precio).replace(',', '.')) || null,
    cantidad: Number(String(cantidad).replace(',', '.')) || null,
    acopio: Number(String(acopio).replace(',', '.')) || 0,
    transporte: Number(String(transporte).replace(',', '.')) || 0,
    preparacion: Number(String(preparacion).replace(',', '.')) || 0,
  });

  const [aviso, setAviso] = useState(null);

  async function agregarResiduo() {
    await guardarRegistro(
      {
        tipo: 'residuo',
        producto: 'Descarte de poda',
        cantidad: Number(String(cantidad).replace(',', '.')) || 0,
        unidad: 'kg',
        fecha: new Date().toISOString().slice(0, 10),
        precioPorUnidad: null,
        nota: 'Material disponible para aprovechamiento.',
        origen: 'manual',
        estado: 'confirmado',
      },
      usuario.id
    );
    setAviso('Descarte registrado ✔');
  }

  return (
    <div>
      <div className="mb-3">
        <h1 className="text-xl font-extrabold text-stone-900">Ingresos extra</h1>
        <p className="text-xs text-stone-500">
          Lo que hoy tiras u olvidas puede sumar a tu resultado de campaña.
        </p>
      </div>

      <div className="mb-4">
        <Alerta>
          Este módulo <strong>suma utilidad a tu cosecha</strong>; no reemplaza el análisis de
          rentabilidad principal. Puedes verlo todo junto en <em>¿Gano o pierdo?</em>
        </Alerta>
      </div>

      {/* ---------- Calculadora ---------- */}
      <Seccion titulo="Calculadora de ingreso extra">
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <Campo label={`Precio por kg`}>
              <Numerico value={precio} onChange={setPrecio} sufijo="S/" />
            </Campo>
            <Campo label="Cantidad (kg)">
              <Numerico value={cantidad} onChange={setCantidad} />
            </Campo>
            <Campo label="Acopio">
              <Numerico value={acopio} onChange={setAcopio} sufijo="S/" />
            </Campo>
            <Campo label="Transporte">
              <Numerico value={transporte} onChange={setTransporte} sufijo="S/" />
            </Campo>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Dato label="Ingreso" valor={dinero(calc.ingreso)} />
            <Dato label="Costos" valor={dinero(calc.costo)} />
            <Dato
              label="Neto"
              valor={calc.neto === null ? '—' : dinero(calc.neto)}
              tono={calc.neto === null ? undefined : calc.neto >= 0 ? 'verde' : 'rojo'}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Btn variante="secundario" className="py-2 text-xs" onClick={agregarResiduo}>
              + Registrar descarte
            </Btn>
            {pubExtra ? (
              <Btn
                variante="fantasma"
                className="py-2 text-xs"
                onClick={() =>
                  abrirWhatsApp({
                    telefono: '+51999777666',
                    texto: mensajeCompra({
                      comprador: 'Compost La Libertad S.A.C.',
                      material: pubExtra.material,
                      cantidad: pubExtra.cantidad,
                      unidad: pubExtra.unidad,
                      precio: pubExtra.precioReferencial,
                      condiciones: 'Retiro propio, semanal',
                    }),
                  })
                }
              >
                💬 Contactar comprador
              </Btn>
            ) : null}
          </div>
          {aviso ? <div className="mt-2"><Alerta tono="ok">{aviso}</Alerta></div> : null}
        </Card>
      </Seccion>

      {/* ---------- Compatibilidad de demanda ---------- */}
      {ofertasExtra.length ? (
        <Seccion titulo="Compradores compatibles">
          {ofertasExtra.map((o) => (
            <Card key={o.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-stone-800">{o.compradorNombre}</p>
                  <p className="text-[11px] text-stone-500">
                    {dinero(o.precio)}/kg · pide {numero(o.cantidad, 0)} kg · retira con su transporte
                  </p>
                </div>
                <Simulado />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tono="verde">material compatible</Badge>
                <Badge tono="gris">retiro: semanal</Badge>
                {o.transporte ? <Badge tono="gris">flete {dinero(o.transporte)}</Badge> : null}
              </div>
              <div className="mt-3">
                <Btn
                  variante="secundario"
                  className="py-2 text-xs"
                  onClick={() =>
                    abrirWhatsApp({
                      telefono: '+51999777666',
                      texto: mensajeCompra({
                        comprador: o.compradorNombre,
                        material: pubExtra?.material,
                        cantidad: o.cantidad,
                        unidad: pubExtra?.unidad,
                        precio: o.precio,
                        condiciones: o.condiciones,
                      }),
                    })
                  }
                >
                  💬 Contactar comprador
                </Btn>
              </div>
            </Card>
          ))}
        </Seccion>
      ) : null}

      {/* ---------- Mis descartes ---------- */}
      <Seccion titulo="Mis descartes registrados">
        {(residuos || []).length === 0 ? (
          <Vacio titulo="Sin descartes registrados" texto="Registra poda, restos o subproductos." icono="♻️" />
        ) : (
          (residuos || []).map((r) => (
            <Card key={r.id} className="py-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-stone-800">{r.producto}</p>
                  <p className="text-[11px] text-stone-500">
                    {numero(r.cantidad, 0)} {r.unidad} · {fechaLarga(r.fecha)}
                  </p>
                </div>
                <Simulado />
              </div>
              {r.nota ? <p className="mt-1 text-[11px] italic text-stone-400">{r.nota}</p> : null}
            </Card>
          ))
        )}
      </Seccion>

      <div className="mt-4">
        <Alerta tono="aviso">
          <strong>Precaución:</strong> no todo residuo puede comercializarse ni retirarse
          libremente. Revisa condiciones técnicas, sanitarias y ambientales según el material y la
          operación. No toda biomasa debe retirarse del suelo.
        </Alerta>
      </div>
    </div>
  );
}
