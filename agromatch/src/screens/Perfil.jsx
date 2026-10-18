import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, guardarUsuario, leerMeta, escribirMeta } from '../lib/db.js';
import { Card, Btn, Badge, Alerta, Campo, inputCls, Seccion, Divider, Simulado } from '../ui.jsx';

export default function Perfil({ usuario, ir }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({
    rol: usuario.rol,
    nombre: usuario.nombre,
    organizacion: usuario.organizacion,
    telefono: usuario.telefono,
    zona: usuario.zona,
  });
  const pendientes = useLiveQuery(() => db.cola.where('estado').equals('pendiente').count(), []);
  const conteos = useLiveQuery(async () => ({
    registros: await db.registros.count(),
    publicaciones: await db.publicaciones.count(),
    ofertas: await db.ofertas.count(),
  }), []);

  async function guardar() {
    await guardarUsuario(f);
    setEdit(false);
  }

  async function restaurarDemo() {
    if (!confirm('Se borrarán los datos de este dispositivo y se recargarán los datos de demostración. ¿Continuar?')) return;
    await db.delete();
    location.reload();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-campo-900 text-2xl text-white">
          {usuario.rol === 'empresa' ? '🏢' : '🧑‍🌾'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-stone-900">{usuario.nombre}</p>
          <p className="truncate text-xs text-stone-500">{usuario.organizacion}</p>
          <div className="mt-1 flex gap-1.5">
            <Badge tono={usuario.rol === 'empresa' ? 'azul' : 'verde'}>
              {usuario.rol === 'empresa' ? 'Empresa / comprador' : 'Agricultor'}
            </Badge>
            <Simulado />
          </div>
        </div>
      </div>

      <Card>
        {!edit ? (
          <>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
              <div><dt className="text-stone-400">Nombre</dt><dd className="font-semibold text-stone-700">{usuario.nombre}</dd></div>
              <div><dt className="text-stone-400">Organización</dt><dd className="font-semibold text-stone-700">{usuario.organizacion || '—'}</dd></div>
              <div><dt className="text-stone-400">WhatsApp</dt><dd className="font-semibold text-stone-700">{usuario.telefono || '—'}</dd></div>
              <div><dt className="text-stone-400">Zona</dt><dd className="font-semibold text-stone-700">{usuario.zona || '—'}</dd></div>
            </dl>
            <div className="mt-3 flex gap-2">
              <Btn variante="fantasma" className="py-2 text-xs" onClick={() => setEdit(true)}>Editar perfil</Btn>
              <Btn variante="secundario" className="py-2 text-xs" onClick={() => escribirMeta('rolDemo', usuario.rol === 'empresa' ? 'agricultor' : 'empresa').then(() => {
                guardarUsuario({ rol: usuario.rol === 'empresa' ? 'agricultor' : 'empresa' });
              })}>
                Cambiar a {usuario.rol === 'empresa' ? 'agricultor' : 'empresa'}
              </Btn>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <Campo label="Rol">
              <select className={inputCls} value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}>
                <option value="agricultor">Agricultor</option>
                <option value="empresa">Empresa / comprador</option>
              </select>
            </Campo>
            <Campo label="Nombre">
              <input className={inputCls} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />
            </Campo>
            <Campo label="Asociación / empresa">
              <input className={inputCls} value={f.organizacion} onChange={(e) => setF({ ...f, organizacion: e.target.value })} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="WhatsApp">
                <input className={inputCls} value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
              </Campo>
              <Campo label="Zona">
                <input className={inputCls} value={f.zona} onChange={(e) => setF({ ...f, zona: e.target.value })} />
              </Campo>
            </div>
            <div className="flex gap-2">
              <Btn variante="fantasma" onClick={() => setEdit(false)}>Cancelar</Btn>
              <Btn onClick={guardar}>Guardar</Btn>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-5">
        <Seccion titulo="Estado del dispositivo">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white p-3 text-center ring-1 ring-black/5">
              <div className="text-lg font-extrabold text-stone-800">{conteos?.registros ?? '—'}</div>
              <div className="text-[10px] uppercase text-stone-400">registros</div>
            </div>
            <div className="rounded-xl bg-white p-3 text-center ring-1 ring-black/5">
              <div className="text-lg font-extrabold text-stone-800">{conteos?.publicaciones ?? '—'}</div>
              <div className="text-[10px] uppercase text-stone-400">publicaciones</div>
            </div>
            <div className="rounded-xl bg-white p-3 text-center ring-1 ring-black/5">
              <div className="text-lg font-extrabold text-stone-800">{conteos?.ofertas ?? '—'}</div>
              <div className="text-[10px] uppercase text-stone-400">ofertas</div>
            </div>
          </div>
          <div className="mt-2">
            <Alerta tono={pendientes ? 'aviso' : 'ok'}>
              <strong>Sincronización:</strong>{' '}
              {pendientes ? `${pendientes} operación(es) pendiente(s) de sincronizar` : 'todo sincronizado'}.{' '}
              Los registros viven en IndexedDB y sobreviven a recargas y a la pérdida de internet.
            </Alerta>
          </div>
        </Seccion>
      </div>

      <div className="mt-5">
        <Seccion titulo="Verdad sobre los datos de la demo">
          <Alerta tono="aviso">
            Todas las publicaciones, ofertas y compradores de esta demostración están{' '}
            <strong>etiquetados como simulados</strong>. Las cifras son ilustrativas y deben
            validarse con operaciones reales antes de presentarse como resultados.
          </Alerta>
        </Seccion>
      </div>

      <Divider />

      <div className="space-y-2">
        <Btn variante="secundario" onClick={() => ir('inicio')}>Volver al inicio</Btn>
        <Btn variante="peligro" onClick={restaurarDemo}>Restaurar datos de demostración</Btn>
      </div>

      <p className="mt-4 text-center text-[11px] text-stone-400">
        AgroMatch · PWA v2.0 · AGROTECH Challenge 2026
      </p>
    </div>
  );
}
