/**
 * Prueba de INTEGRACION: IndexedDB (via fake-indexeddb) + siembra + consultas
 * + motor de rentabilidad alimentado con los datos reales de la demo.
 *
 * Esto valida el flujo completo de datos sin navegador:
 *   sembrar -> consultar -> calcular -> guardar -> cola de sincronizacion
 */

import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { db, guardarRegistro, pendientesSync, usuarioActivo } from '../src/lib/db.js';
import { sembrarDemo } from '../src/lib/seed.js';
import { resumenLote } from '../src/lib/rentabilidad.js';

let ok = 0;
const fallos = [];
async function t(nombre, fn) {
  try {
    await fn();
    ok++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos.push(nombre);
    console.error(`  ✗ ${nombre}\n    ${e.message}`);
  }
}

console.log('\nINTEGRACION (IndexedDB + datos de demo)');

await t('la demo se siembra una sola vez', async () => {
  const primera = await sembrarDemo();
  const segunda = await sembrarDemo();
  assert.equal(primera, true);
  assert.equal(segunda, false, 'no debe sembrar dos veces');
});

await t('hay usuario, lotes, registros, publicaciones y ofertas', async () => {
  assert.ok((await db.usuarios.count()) >= 1);
  assert.equal(await db.lotes.count(), 2);
  assert.equal(await db.registros.count(), 5);
  assert.equal(await db.publicaciones.count(), 2);
  assert.equal(await db.ofertas.count(), 4);
});

await t('usuarioActivo devuelve el agricultor de la demo', async () => {
  const u = await usuarioActivo();
  assert.equal(u.rol, 'agricultor');
  assert.match(u.nombre, /Rosa/);
});

await t('el lote A tiene el costo cargado y el B no (estimacion incompleta)', async () => {
  const a = await db.lotes.get('demo-lote-A');
  const b = await db.lotes.get('demo-lote-B');
  assert.equal(a.costoProduccion, 4500);
  assert.equal(b.costoProduccion, null);
});

await t('FLUJO CLAVE: la oferta A (mas barata) deja mas utilidad que la B', async () => {
  const lote = await db.lotes.get('demo-lote-A');
  const pubs = await db.publicaciones.where('loteId').equals(lote.id).toArray();
  const ids = new Set(pubs.map((p) => p.id));
  const ofertas = (await db.ofertas.toArray()).filter((o) => ids.has(o.publicacionId));

  const r = resumenLote(lote, ofertas);
  assert.equal(r.costoUnitario, 4.5);
  assert.equal(r.completo, true);
  assert.equal(r.mejorOferta.compradorNombre, 'Agrícola del Norte S.A.C.');
  assert.equal(r.mejorOferta.utilidad, 700);

  const b = r.ofertas.find((o) => o.compradorNombre.includes('Valle Verde'));
  assert.equal(b.precio, 6.3);
  assert.equal(b.utilidad, 570);

  // El precio mas alto NO es la mejor utilidad
  assert.ok(b.precio > r.mejorOferta.precio);
  assert.ok(r.mejorOferta.utilidad > b.utilidad);
  assert.equal(r.mejorOferta.utilidad - b.utilidad, 130);

  // Y hay una oferta por debajo del precio minimo
  const c = r.ofertas.find((o) => o.compradorNombre.includes('Mayorista'));
  assert.equal(c.estadoPrecio, 'bajo');
  assert.ok(c.utilidad < 0, 'la oferta del mayorista da perdida');
  assert.equal(r.ofertaBajoMinimo, true);
});

await t('lote B (sin costo) queda como estimacion incompleta', async () => {
  const b = await db.lotes.get('demo-lote-B');
  const pubs = await db.publicaciones.where('loteId').equals(b.id).toArray();
  const ids = new Set(pubs.map((p) => p.id));
  const ofertas = (await db.ofertas.toArray()).filter((o) => ids.has(o.publicacionId));
  const r = resumenLote(b, ofertas);
  assert.equal(r.completo, false);
  assert.equal(r.mejorOferta, null);
  assert.match(r.motivoIncompleto, /costo/i);
});

await t('guardar un registro lo persiste y lo encola para sincronizar', async () => {
  const u = await usuarioActivo();
  const antes = await pendientesSync();
  const r = await guardarRegistro(
    {
      tipo: 'cosecha', producto: 'Arándano', cantidad: 500, unidad: 'kg',
      fecha: '2026-10-17', precioPorUnidad: null, costoDirecto: null,
      origen: 'asistente', entrada: 'cosechamos 500 kg de arándano',
    },
    u.id
  );
  assert.ok(r.id);
  assert.equal(r.estadoSync, 1);
  const leido = await db.registros.get(r.id);
  assert.equal(leido.producto, 'Arándano');
  assert.equal(leido.cantidad, 500);
  assert.equal(await pendientesSync(), antes + 1);
});

await t('los registros se filtran por tipo (Cosechas/Compras/Ventas)', async () => {
  const todos = await db.registros.toArray();
  const cuentas = todos.reduce((acc, r) => ({ ...acc, [r.tipo]: (acc[r.tipo] || 0) + 1 }), {});
  assert.ok(cuentas.cosecha >= 1);
  assert.ok(cuentas.compra >= 2);
  assert.ok(cuentas.venta >= 1);
  assert.ok(cuentas.residuo >= 1);
});

await t('la consulta de "ultimos registros" (orderBy creado) no rompe', async () => {
  const recientes = await db.registros.orderBy('creado').reverse().limit(4).toArray();
  assert.equal(recientes.length, 4);
  assert.ok(recientes[0].creado >= recientes[3].creado, 'debe venir del mas nuevo al mas antiguo');
});

console.log(`\nResultado integración: ${ok} correctas, ${fallos.length} fallidas.`);
if (fallos.length) {
  console.error('Fallaron:', fallos.join(' | '));
  process.exit(1);
}
