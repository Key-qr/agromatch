/**
 * Pruebas del nucleo de AgroMatch: parser de lenguaje natural y motor de rentabilidad.
 * Ejecutar:  npm test
 */

import assert from 'node:assert/strict';
import { interpretar, faltantes, confianza } from '../src/lib/parser.js';
import {
  utilidadNeta, precioMinimo, clasificarPrecio, compararOfertas, resumenLote, ingresoExtra,
} from '../src/lib/rentabilidad.js';

let ok = 0;
const fallos = [];

function t(nombre, fn) {
  try {
    fn();
    ok++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos.push(nombre);
    console.error(`  ✗ ${nombre}\n    ${e.message}`);
  }
}

/* ================================================================== */
console.log('\nMOTOR DE RENTABILIDAD');

const COSTO = 4.5;

t('oferta A: utilidad neta = S/ 700', () => {
  const r = utilidadNeta({ precio: 6.0, cantidad: 1000, costoUnitario: COSTO, transporte: 800 });
  assert.equal(r.ingreso, 6000);
  assert.equal(r.costoProduccion, 4500);
  assert.equal(r.costoVenta, 800);
  assert.equal(r.utilidad, 700);
  assert.equal(r.completo, true);
});

t('oferta B (precio mas alto): utilidad neta = S/ 570', () => {
  const r = utilidadNeta({
    precio: 6.3, cantidad: 1000, costoUnitario: COSTO,
    acondicionamiento: 600, comisionPct: 10,
  });
  assert.equal(r.ingreso, 6300);
  assert.equal(r.comision, 630);
  assert.equal(r.utilidad, 570);
});

t('IDEA CENTRAL: B paga mas por kilo pero A deja mas utilidad', () => {
  const a = utilidadNeta({ precio: 6.0, cantidad: 1000, costoUnitario: COSTO, transporte: 800 });
  const b = utilidadNeta({ precio: 6.3, cantidad: 1000, costoUnitario: COSTO, acondicionamiento: 600, comisionPct: 10 });
  assert.ok(b.precio ?? true);
  assert.ok(a.utilidad > b.utilidad, 'A debe dejar mas utilidad que B');
  assert.equal(a.utilidad - b.utilidad, 130);
});

t('sin costo de produccion: NUNCA declara utilidad', () => {
  const r = utilidadNeta({ precio: 6.0, cantidad: 1000 });
  assert.equal(r.completo, false);
  assert.equal(r.utilidad, null);
  assert.match(r.motivo, /costo de producci[oó]n/i);
});

t('precio minimo de A = S/ 5.30', () => {
  assert.equal(precioMinimo({ cantidad: 1000, costoUnitario: COSTO, transporte: 800 }), 5.3);
});

t('precio minimo de B = S/ 5.67 (incluye comision 10%)', () => {
  assert.equal(precioMinimo({ cantidad: 1000, costoUnitario: COSTO, acondicionamiento: 600, comisionPct: 10 }), 5.67);
});

t('semáforo: precio bajo el minimo se marca', () => {
  assert.equal(clasificarPrecio(4.2, 5.3), 'bajo');
  assert.equal(clasificarPrecio(5.4, 5.3), 'ok');
  assert.equal(clasificarPrecio(7.0, 5.3), 'margen_alto');
  assert.equal(clasificarPrecio(4.2, null), 'sin_dato');
});

t('comparador ordena por UTILIDAD y no por precio', () => {
  const ofertas = [
    { id: 'B', precio: 6.3, cantidad: 1000, acondicionamiento: 600, comisionPct: 10 },
    { id: 'A', precio: 6.0, cantidad: 1000, transporte: 800 },
    { id: 'C', precio: 4.2, cantidad: 1000, transporte: 200 },
  ];
  const c = compararOfertas(ofertas, { costoUnitario: COSTO });
  assert.equal(c[0].id, 'A', 'la mejor utilidad es A');
  assert.equal(c[0].utilidad, 700);
  assert.equal(c[2].id, 'C', 'la peor es C');
  assert.equal(c[2].utilidad, -500);
  assert.equal(c[2].estadoPrecio, 'bajo');
});

t('resumen del lote detecta utilidad potencial y ofertas bajo minimo', () => {
  const r = resumenLote(
    { cantidadCosechada: 1000, costoProduccion: 4500, unidad: 'kg' },
    [
      { id: 'A', precio: 6.0, cantidad: 1000, transporte: 800 },
      { id: 'C', precio: 4.2, cantidad: 1000, transporte: 200 },
    ]
  );
  assert.equal(r.costoUnitario, 4.5);
  assert.equal(r.completo, true);
  assert.equal(r.mejorOferta.id, 'A');
  assert.equal(r.utilidadPotencial, 700);
  assert.equal(r.ofertaBajoMinimo, true);
});

t('resumen incompleto sin costo cargado', () => {
  const r = resumenLote({ cantidadCosechada: 400, costoProduccion: null }, []);
  assert.equal(r.completo, false);
  assert.equal(r.costoUnitario, null);
  assert.match(r.motivoIncompleto, /costo/i);
});

t('ingreso extra (circular): neto = S/ 40', () => {
  const r = ingresoExtra({ precio: 0.35, cantidad: 400, acopio: 40, transporte: 60 });
  assert.equal(r.ingreso, 140);
  assert.equal(r.costo, 100);
  assert.equal(r.neto, 40);
  assert.equal(r.completo, true);
});

/* ================================================================== */
console.log('\nASISTENTE DE LENGUAJE NATURAL');

const ANIO = new Date().getFullYear();

t('cosecha con fecha explicita', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('Hoy 17/10 cosechamos 1000 kg de arándano');
  assert.equal(p.tipo, 'cosecha');
  assert.equal(p.producto, 'Arándano');
  assert.equal(p.cantidad, 1000);
  assert.equal(p.unidad, 'kg');
  assert.equal(p.fecha, `${ANIO}-10-17`);
  assert.deepEqual(f, []);
});

t('compra con precio unitario', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('Compramos 20 sacos de fertilizante a S/ 24');
  assert.equal(p.tipo, 'compra');
  assert.equal(p.producto, 'Fertilizante');
  assert.equal(p.cantidad, 20);
  assert.equal(p.unidad, 'sacos');
  assert.equal(p.precioPorUnidad, 24);
  assert.deepEqual(f, []);
});

t('venta con precio decimal (coma peruana)', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('Vendimos 300 kg a S/ 5,80');
  assert.equal(p.tipo, 'venta');
  assert.equal(p.cantidad, 300);
  assert.equal(p.unidad, 'kg');
  assert.equal(p.precioPorUnidad, 5.8);
  assert.ok(f.includes('producto'), 'no inventa el producto que falta');
});

t('gasto: 950 soles NO se interpretan como cantidad', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('Gastamos 950 soles en jornales');
  assert.equal(p.tipo, 'compra');
  assert.equal(p.costoDirecto, 950);
  assert.equal(p.categoriaCosto, 'Jornales');
  assert.equal(p.cantidad, null, 'el monto no debe convertirse en cantidad');
  assert.deepEqual(f, []);
  assert.equal(confianza(p), 1);
});

t('residuo / descarte de poda', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('Tenemos 400 kg de descarte de poda');
  assert.equal(p.tipo, 'residuo');
  assert.equal(p.producto, 'Descarte de poda');
  assert.equal(p.cantidad, 400);
  assert.equal(p.unidad, 'kg');
  assert.deepEqual(f, []);
});

t('cantidad en palabras', () => {
  const { propuesta: p } = interpretar('cosechamos veinticinco quintales de fresa');
  assert.equal(p.cantidad, 25);
  assert.equal(p.unidad, 'quintales');
  assert.equal(p.producto, 'Fresa');
  assert.equal(p.tipo, 'cosecha');
});

t('nunca inventa unidad', () => {
  const { propuesta: p, camposFaltantes: f } = interpretar('cosechamos arándano');
  assert.equal(p.cantidad, null);
  assert.equal(p.unidad, null);
  assert.ok(f.includes('cantidad'));
  assert.ok(f.includes('unidad'));
});

t('registro vacio no pasa validacion', () => {
  const { camposFaltantes: f } = interpretar('');
  assert.ok(f.includes('tipo'));
  assert.ok(f.includes('producto'));
});

t('texto con mayusculas, tildes y espacios dobles', () => {
  const { propuesta: p } = interpretar('  HOY  COMPRAMOS   2 SACOS DE MAÍZ  ');
  assert.equal(p.tipo, 'compra');
  assert.equal(p.producto, 'Maíz');
  assert.equal(p.cantidad, 2);
});

/* ================================================================== */
console.log(`\nResultado: ${ok} pruebas correctas, ${fallos.length} fallidas.`);
if (fallos.length) {
  console.error('Fallaron:', fallos.join(' | '));
  process.exit(1);
}
