/**
 * Motor de Rentabilidad - corazon del producto (Desafio 3).
 *
 * Precio mas alto != mayor ganancia. Este modulo es el que demuestra eso.
 *
 * Reglas de honestidad:
 *   - si falta un costo -> `completo: false` y la UI muestra "estimacion incompleta"
 *   - nunca se declara utilidad neta definitiva con datos incompletos
 *   - se separa INGRESO de UTILIDAD
 */

import { redondear } from './formatos.js';

/* ------------------------------------------------------------------ */
/* Utilidad neta de una operacion                                      */
/* ------------------------------------------------------------------ */

/**
 * @param {Object} o
 * @param {number} o.precio            precio ofrecido POR UNIDAD
 * @param {number} o.cantidad          cantidad aceptada
 * @param {number} o.costoUnitario     costo de produccion por unidad
 * @param {number} [o.transporte]      costo total de transporte
 * @param {number} [o.acondicionamiento] costo total de acondicionamiento/empaque
 * @param {number} [o.comisionPct]      comision en % (ej. 3 = 3%)
 * @param {number} [o.comisionFija]     comision fija en soles
 * @param {number} [o.otros]            otros gastos relevantes
 * @returns {{ingreso,utilidad,costoProduccion,costoVenta,comision,esperadoPorUnidad,completo,motivo}}
 */
export function utilidadNeta({
  precio = null,
  cantidad = null,
  costoUnitario = null,
  transporte = 0,
  acondicionamiento = 0,
  comisionPct = 0,
  comisionFija = 0,
  otros = 0,
} = {}) {
  const base = { utilidad: null, ingreso: null, comision: null, completo: false };

  if (precio === null || precio === undefined || cantidad === null || cantidad === undefined) {
    return { ...base, motivo: 'Faltan precio o cantidad' };
  }

  const ingreso = redondear(precio * cantidad);
  const comision = redondear((ingreso * (comisionPct || 0)) / 100 + (comisionFija || 0));
  const venta = redondear((transporte || 0) + (acondicionamiento || 0) + comision + (otros || 0));

  if (costoUnitario === null || costoUnitario === undefined) {
    return {
      ...base,
      ingreso,
      venta,
      comision,
      utilidad: null,
      completo: false,
      motivo: 'Falta costo de producción',
    };
  }

  const costoProduccion = redondear(costoUnitario * cantidad);
  const utilidad = redondear(ingreso - costoProduccion - venta);

  return {
    ingreso,
    costoProduccion,
    costoVenta: venta,
    transporte: redondear(transporte || 0),
    acondicionamiento: redondear(acondicionamiento || 0),
    comision,
    utilidad,
    utilidadPorUnidad: redondear(utilidad / cantidad),
    esperadoPorUnidad: redondear(precio - costoUnitario - venta / cantidad),
    completo: true,
    motivo: null,
  };
}

/* ------------------------------------------------------------------ */
/* Precio minimo (punto de equilibrio)                                 */
/* ------------------------------------------------------------------ */

/**
 * Precio por unidad al que la utilidad es exactamente 0.
 * Por debajo de esto, el productor PIERDE.
 *
 * utilidad = precio*C*(1 - comisionPct/100) - costoUnitario*C - T - A - F - Otros = 0
 */
export function precioMinimo({
  cantidad = null,
  costoUnitario = null,
  transporte = 0,
  acondicionamiento = 0,
  comisionPct = 0,
  comisionFija = 0,
  otros = 0,
} = {}) {
  if (!cantidad || cantidad <= 0) return null;
  if (costoUnitario === null || costoUnitario === undefined) return null;

  const divisor = cantidad * (1 - (comisionPct || 0) / 100);
  if (divisor <= 0) return null;

  const numerador =
    costoUnitario * cantidad + (transporte || 0) + (acondicionamiento || 0) + (comisionFija || 0) + (otros || 0);

  return redondear(numerador / divisor);
}

/** 'bajo' | 'ok' | 'margen_alto' */
export function clasificarPrecio(precio, minimo) {
  if (precio === null || minimo === null || minimo === undefined) return 'sin_dato';
  if (precio < minimo) return 'bajo';
  if (precio <= minimo * 1.15) return 'ok';
  return 'margen_alto';
}

/* ------------------------------------------------------------------ */
/* Comparador de ofertas                                               */
/* ------------------------------------------------------------------ */

/**
 * Ordena ofertas por UTILIDAD neta (nunca por precio unitario).
 * @param {Array} ofertas [{id, precio, cantidad, transporte, acondicionamiento, comisionPct, comisionFija, otros}]
 * @param {Object} ctx    {costoUnitario}
 */
export function compararOfertas(ofertas, { costoUnitario } = {}) {
  const filas = (ofertas || []).map((o) => {
    const r = utilidadNeta({ ...o, costoUnitario: o.costoUnitario ?? costoUnitario });
    const minimo = precioMinimo({
      cantidad: o.cantidad,
      costoUnitario: o.costoUnitario ?? costoUnitario,
      transporte: o.transporte,
      acondicionamiento: o.acondicionamiento,
      comisionPct: o.comisionPct,
      comisionFija: o.comisionFija,
      otros: o.otros,
    });
    return {
      ...o,
      ...r,
      precioMinimo: minimo,
      estadoPrecio: clasificarPrecio(o.precio, minimo),
      porEncima: minimo !== null && o.precio !== null ? redondear(o.precio - minimo) : null,
    };
  });

  // Mejor utilidad primero; las incompletas al final (no se comparan a ciegas).
  return filas.sort((a, b) => {
    if (a.utilidad === null && b.utilidad === null) return 0;
    if (a.utilidad === null) return 1;
    if (b.utilidad === null) return -1;
    return b.utilidad - a.utilidad;
  });
}

/* ------------------------------------------------------------------ */
/* Resumen por lote / campana                                          */
/* ------------------------------------------------------------------ */

/**
 * @param {Object} lote  {cantidadCosechada, costoProduccion, unidad}
 * @param {Array}  ofertas
 */
export function resumenLote(lote = {}, ofertas = []) {
  const cantidad = lote.cantidadCosechada;
  const costoProduccion = lote.costoProduccion;
  const costoUnitario =
    cantidad && costoProduccion !== null && costoProduccion !== undefined
      ? redondear(costoProduccion / cantidad)
      : null;

  const comparadas = compararOfertas(ofertas, { costoUnitario });
  const mejores = comparadas.filter((c) => c.utilidad !== null);
  const mejor = mejores[0] || null;

  return {
    costoUnitario,
    completo: costoUnitario !== null,
    motivoIncompleto: costoUnitario === null ? 'Falta costo de producción del lote' : null,
    ofertas: comparadas,
    mejorOferta: mejor,
    ofertaBajoMinimo: comparadas.some((c) => c.estadoPrecio === 'bajo'),
    utilidadPotencial: mejor ? mejor.utilidad : null,
    precioMinimoBase: precioMinimo({
      cantidad: cantidad || 1,
      costoUnitario,
    }),
  };
}

/** Utilidad de una venta ya cerrada (para historial). */
export function utilidadVenta({ precio, cantidad, costoUnitario, transporte = 0, acondicionamiento = 0, comisionPct = 0, otros = 0 }) {
  return utilidadNeta({ precio, cantidad, costoUnitario, transporte, acondicionamiento, comisionPct, otros });
}

/* ------------------------------------------------------------------ */
/* Ingresos extra (modulo circular, subordinado a la rentabilidad)     */
/* ------------------------------------------------------------------ */

/** Ingreso neto adicional por aprovechar un descarte. */
export function ingresoExtra({ precio = null, cantidad = null, acopio = 0, transporte = 0, preparacion = 0 } = {}) {
  if (precio === null || cantidad === null) {
    return { ingreso: null, costo: null, neto: null, completo: false, motivo: 'Faltan precio o cantidad' };
  }
  const ingreso = redondear(precio * cantidad);
  const costo = redondear((acopio || 0) + (transporte || 0) + (preparacion || 0));
  return { ingreso, costo, neto: redondear(ingreso - costo), completo: true, motivo: null };
}
