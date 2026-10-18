/**
 * Datos sembrados de demostracion - TODOS van marcados como SIMULADOS.
 *
 * Caso elegido: arándano en La Libertad.
 *   - Lote A: 1000 kg con costo de produccion de S/ 4 500 -> S/ 4.50/kg
 *   - Ingreso extra: descarte de poda -> comprador de compost
 *
 * El objetivo de este set de datos es demostrar la idea central:
 *   "la oferta que paga MAS por kilo deja MENOS utilidad".
 */

import { db, leerMeta, escribirMeta } from './db.js';

const ID = 'demo-';

export const USUARIO = {
  id: `${ID}usuario-1`,
  rol: 'agricultor',
  nombre: 'Rosa Quispe',
  organizacion: 'Asociación de Productores de Trujillo',
  telefono: '+51999000111',
  zona: 'La Libertad, Trujillo',
  creado: '2026-10-17T08:00:00.000Z',
};

export const COMPRADORES = {
  norte: 'Agrícola del Norte S.A.C.',
  exportadora: 'Exportadora Valle Verde S.A.',
  compost: 'Compost La Libertad S.A.C.',
};

export async function sembrarDemo() {
  const ya = await leerMeta('demoSembrada', false);
  if (ya) return false;

  // En una sola transaccion: asi ninguna consulta alcanza a ver un usuario
  // sin su "usuarioActivo" (eso causaba un ReadOnlyError en useLiveQuery).
  await db.transaction('rw', db.usuarios, db.meta, async () => {
    await db.usuarios.put(USUARIO);
    await escribirMeta('usuarioActivo', USUARIO.id);
  });

  /* ---------------- Lotes ---------------- */
  const loteA = {
    id: `${ID}lote-A`,
    usuarioId: USUARIO.id,
    cultivo: 'Arándano',
    campana: 'Campaña 2026-II',
    cantidadCosechada: 1000,
    unidad: 'kg',
    costoProduccion: 4500, // S/ 4.50 por kg
    nota: 'Jornales, riego, fertilización y empaque de la campaña.',
    simulada: true,
    creado: '2026-10-17T08:10:00.000Z',
  };

  const loteB = {
    id: `${ID}lote-B`,
    usuarioId: USUARIO.id,
    cultivo: 'Arándano',
    campana: 'Campaña 2026-II',
    cantidadCosechada: 400,
    unidad: 'kg',
    costoProduccion: null, // deliberadamente incompleto -> muestra "estimación incompleta"
    nota: 'Poda de renovación: costo aún no cargado.',
    simulada: true,
    creado: '2026-10-17T08:15:00.000Z',
  };

  await db.lotes.bulkPut([loteA, loteB]);

  /* ---------------- Registros ---------------- */
  const registros = [
    {
      id: `${ID}reg-1`, usuarioId: USUARIO.id, tipo: 'cosecha',
      producto: 'Arándano', cantidad: 1000, unidad: 'kg', fecha: '2026-10-17',
      precioPorUnidad: null, costoDirecto: null, categoriaCosto: null,
      loteId: loteA.id, nota: 'Cosecha principal del lote A.',
      entrada: 'Hoy 17/10 cosechamos 1000 kg de arándano', origen: 'asistente',
      estadoSync: 1, creado: '2026-10-17T08:20:00.000Z', simulada: true,
    },
    {
      id: `${ID}reg-2`, usuarioId: USUARIO.id, tipo: 'compra',
      producto: 'Fertilizante', cantidad: 20, unidad: 'sacos', fecha: '2026-10-12',
      precioPorUnidad: 24, costoDirecto: 480, categoriaCosto: 'Fertilizante',
      loteId: loteA.id, nota: null, entrada: 'Compramos 20 sacos de fertilizante a S/ 24',
      origen: 'asistente', estadoSync: 1, creado: '2026-10-12T09:00:00.000Z', simulada: true,
    },
    {
      id: `${ID}reg-3`, usuarioId: USUARIO.id, tipo: 'compra',
      producto: 'Jornales', cantidad: 1, unidad: 'unidades', fecha: '2026-10-15',
      precioPorUnidad: null, costoDirecto: 950, categoriaCosto: 'Jornales',
      loteId: loteA.id, nota: '12 jornales de cosecha.', entrada: 'Gastamos 950 soles en jornales',
      origen: 'asistente', estadoSync: 1, creado: '2026-10-15T17:30:00.000Z', simulada: true,
    },
    {
      id: `${ID}reg-4`, usuarioId: USUARIO.id, tipo: 'venta',
      producto: 'Arándano', cantidad: 300, unidad: 'kg', fecha: '2026-10-05',
      precioPorUnidad: 5.8, costoDirecto: null, categoriaCosto: null,
      loteId: null, nota: 'Venta de la campaña anterior.',
      entrada: 'Vendimos 300 kg a S/ 5.80', origen: 'asistente',
      estadoSync: 1, creado: '2026-10-05T12:00:00.000Z', simulada: true,
    },
    {
      id: `${ID}reg-5`, usuarioId: USUARIO.id, tipo: 'residuo',
      producto: 'Descarte de poda', cantidad: 400, unidad: 'kg', fecha: '2026-10-17',
      precioPorUnidad: null, costoDirecto: null, categoriaCosto: null,
      loteId: loteB.id, nota: 'Material vegetal de renovación de plantas.',
      entrada: 'Tenemos 400 kg de descarte de poda', origen: 'asistente',
      estadoSync: 1, creado: '2026-10-17T08:30:00.000Z', simulada: true,
    },
  ];
  await db.registros.bulkPut(registros);

  /* ---------------- Publicaciones ---------------- */
  const pubA = {
    id: `${ID}pub-A`, usuarioId: USUARIO.id, loteId: loteA.id,
    mercado: 'agrícola', material: 'Arándano exportación',
    cantidad: 1000, unidad: 'kg', precioReferencial: 6.0,
    calidad: 'Categoría 1, calibre 16+', ubicacion: 'Trujillo, La Libertad',
    estado: 'publicada', simulada: true, creado: '2026-10-17T09:00:00.000Z',
  };
  const pubB = {
    id: `${ID}pub-B`, usuarioId: USUARIO.id, loteId: loteB.id,
    mercado: 'extra', material: 'Descarte de poda de arándano',
    cantidad: 400, unidad: 'kg', precioReferencial: 0.35,
    calidad: 'Vegetal, sin tratar', ubicacion: 'Trujillo, La Libertad',
    estado: 'publicada', simulada: true, creado: '2026-10-17T09:05:00.000Z',
  };
  await db.publicaciones.bulkPut([pubA, pubB]);

  /* ---------------- Ofertas (el corazon de la demo) ----------------
   * Oferta A: paga S/ 6.00/kg pero deja S/ 700 de utilidad.
   * Oferta B: paga S/ 6.30/kg (el "mejor precio") pero deja S/ 570.
   * Gana A. Ese es el mensaje del pitch.
   */
  const ofertas = [
    {
      id: `${ID}of-A`, publicacionId: pubA.id,
      compradorNombre: COMPRADORES.norte,
      precio: 6.0, cantidad: 1000,
      transporte: 800,        // S/ 0.80/kg
      acondicionamiento: 0, comisionPct: 0, comisionFija: 0, otros: 0,
      condiciones: 'Retiro en finca, pago a 7 días.',
      estado: 'recibida', simulada: true, creado: '2026-10-17T09:30:00.000Z',
    },
    {
      id: `${ID}of-B`, publicacionId: pubA.id,
      compradorNombre: COMPRADORES.exportadora,
      precio: 6.3, cantidad: 1000,
      transporte: 0,          // recoge en almacén
      acondicionamiento: 600, // S/ 0.60/kg
      comisionPct: 10, comisionFija: 0, otros: 0,
      condiciones: 'Entrega en almacén del comprador, pago a 15 días.',
      estado: 'recibida', simulada: true, creado: '2026-10-17T09:45:00.000Z',
    },
    {
      id: `${ID}of-C`, publicacionId: pubA.id,
      compradorNombre: 'Mercado Mayorista de Trujillo',
      precio: 4.2, cantidad: 1000,
      transporte: 200, acondicionamiento: 0, comisionPct: 0, comisionFija: 0, otros: 0,
      condiciones: 'Pago contado en el momento.',
      estado: 'recibida', simulada: true, creado: '2026-10-17T10:00:00.000Z',
    },
    {
      id: `${ID}of-D`, publicacionId: pubB.id,
      compradorNombre: COMPRADORES.compost,
      precio: 0.35, cantidad: 400,
      transporte: 60, acondicionamiento: 0, comisionPct: 0, comisionFija: 0, otros: 0,
      condiciones: 'Retiro propio del comprador, semanal.',
      estado: 'recibida', simulada: true, creado: '2026-10-17T10:10:00.000Z',
    },
  ];
  await db.ofertas.bulkPut(ofertas);

  await escribirMeta('demoSembrada', true);
  return true;
}

/** Datos para el formulario manual cuando la IA falla. */
export const EJEMPLOS = [
  'Hoy 17/10 cosechamos 1000 kg de arándano',
  'Compramos 20 sacos de fertilizante a S/ 24',
  'Vendimos 300 kg a S/ 5,80',
  'Gastamos 950 soles en jornales',
  'Tenemos 400 kg de descarte de poda',
];
