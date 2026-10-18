/**
 * Persistencia local con Dexie (IndexedDB).
 *
 * Estrategia MVP: la demo corre EN UN DISPOSITIVO con datos sembrados.
 * La cola (`cola`) documenta el flujo de sincronizacion que se activaria
 * con Supabase + RLS en la etapa 2.
 */

import Dexie from 'dexie';

export const db = new Dexie('agromatch');

db.version(1).stores({
  usuarios: 'id, rol',
  lotes: 'id, usuarioId, campana, cultivo',
  registros: 'id, usuarioId, tipo, fecha, estadoSync',
  publicaciones: 'id, usuarioId, mercado, estado, loteId',
  ofertas: 'id, publicacionId, compradorId, estado',
  operaciones: 'id, ofertaId, estado',
  cola: '++seq, referencia, estado',
  meta: 'clave',
});

// v2: indice por fecha de creacion para "ultimos registros".
db.version(2).stores({
  registros: 'id, usuarioId, tipo, fecha, estadoSync, creado',
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export async function leerMeta(clave, porDefecto = null) {
  const f = await db.meta.get(clave);
  return f ? f.valor : porDefecto;
}

export async function escribirMeta(clave, valor) {
  await db.meta.put({ clave, valor });
}

/**
 * Usuario activo (el MVP usa uno solo, sembrado).
 *
 * IMPORTANTE: esta funcion se llama dentro de `useLiveQuery`, que corre en una
 * transaccion de SOLO LECTURA. Por eso NUNCA escribe aqui: si intentara guardar
 * el id activo, Dexie lanzaria `ReadOnlyError` y la app se caeria en blanco.
 * Quien elige al usuario activo es `guardarUsuario()` / `sembrarDemo()`.
 */
export async function usuarioActivo() {
  const idActivo = await leerMeta('usuarioActivo', null);
  if (idActivo) {
    const u = await db.usuarios.get(idActivo);
    if (u) return u;
  }
  return (await db.usuarios.toCollection().first()) || null;
}

export async function guardarUsuario(datos) {
  const idActivo = await leerMeta('usuarioActivo', null);
  const existente = idActivo ? await db.usuarios.get(idActivo) : null;
  const u = {
    id: existente?.id || (await nuevoId()),
    rol: datos.rol || existente?.rol || 'agricultor',
    nombre: datos.nombre || existente?.nombre || '',
    organizacion: datos.organizacion || existente?.organizacion || '',
    telefono: datos.telefono || existente?.telefono || '',
    zona: datos.zona || existente?.zona || '',
    creado: existente?.creado || new Date().toISOString(),
  };
  await db.usuarios.put(u);
  await escribirMeta('usuarioActivo', u.id);
  return u;
}

async function nuevoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Guarda un registro aprobado por el usuario.
 * Regla: NUNCA se escribe sin confirmacion explicita.
 */
export async function guardarRegistro(registro, usuarioId) {
  const r = {
    id: registro.id || (await nuevoId()),
    usuarioId,
    tipo: registro.tipo,
    producto: registro.producto,
    cantidad: registro.cantidad,
    unidad: registro.unidad,
    fecha: registro.fecha,
    precioPorUnidad: registro.precioPorUnidad ?? null,
    costoDirecto: registro.costoDirecto ?? null,
    categoriaCosto: registro.categoriaCosto ?? null,
    loteId: registro.loteId ?? null,
    nota: registro.nota ?? null,
    entrada: registro.entrada ?? null,
    origen: registro.origen || 'manual',
    estadoSync: 1, // pendiente de sincronizar (offline)
    creado: new Date().toISOString(),
  };
  await db.registros.put(r);
  await encolar('registro', r.id);
  return r;
}

/** Cola de sincronizacion: solo se crea registro, nunca se edita a ciegas. */
export async function encolar(referencia, accion) {
  await db.cola.add({
    referencia: typeof accion === 'string' ? accion : 'registro',
    detalle: accion,
    estado: 'pendiente',
    creado: new Date().toISOString(),
  });
}

export async function pendientesSync() {
  return db.cola.where('estado').equals('pendiente').count();
}

/* ------------------------------------------------------------------ */
/* Publicaciones y ofertas                                             */
/* ------------------------------------------------------------------ */

export async function publicar({ usuarioId, loteId, mercado, material, cantidad, unidad, precioReferencial, calidad, ubicacion, simulada = false }) {
  const p = {
    id: await nuevoId(),
    usuarioId,
    loteId: loteId ?? null,
    mercado, // 'agrícola' | 'extra'
    material,
    cantidad,
    unidad,
    precioReferencial,
    calidad,
    ubicacion,
    estado: 'publicada',
    simulada,
    creado: new Date().toISOString(),
  };
  await db.publicaciones.put(p);
  return p;
}

export async function registrarOferta(o) {
  const of = {
    id: await nuevoId(),
    publicacionId: o.publicacionId,
    compradorNombre: o.compradorNombre || 'Comprador',
    precio: o.precio,
    cantidad: o.cantidad,
    transporte: o.transporte ?? 0,
    acondicionamiento: o.acondicionamiento ?? 0,
    comisionPct: o.comisionPct ?? 0,
    comisionFija: o.comisionFija ?? 0,
    otros: o.otros ?? 0,
    condiciones: o.condiciones || '',
    estado: o.estado || 'recibida',
    simulada: o.simulada ?? false,
    creado: new Date().toISOString(),
  };
  await db.ofertas.put(of);
  return of;
}

/** Cierra una operacion: confirma entrega y pago. */
export async function cerrarOperacion({ ofertaId, estadoEntrega = 'entregada', estadoPago = 'pagado', cantidadFinal }) {
  const o = await db.ofertas.get(ofertaId);
  if (o) await db.ofertas.update(ofertaId, { estado: 'aceptada' });
  const op = {
    id: await nuevoId(),
    ofertaId,
    estadoEntrega,
    estadoPago,
    cantidadFinal: cantidadFinal ?? o?.cantidad ?? null,
    fecha: new Date().toISOString(),
  };
  await db.operaciones.put(op);
  return op;
}
