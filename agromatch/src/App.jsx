import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, sembrarDemoSafe } from './boot.js';
import { usuarioActivo, guardarUsuario, leerMeta, escribirMeta, pendientesSync } from './lib/db.js';
import Onboarding from './screens/Onboarding.jsx';
import Inicio from './screens/Inicio.jsx';
import Registros from './screens/Registros.jsx';
import Rentabilidad from './screens/Rentabilidad.jsx';
import Mercado from './screens/Mercado.jsx';
import Extra from './screens/Extra.jsx';
import Perfil from './screens/Perfil.jsx';

const RUTAS = {
  inicio: { comp: Inicio, titulo: 'Inicio' },
  registros: { comp: Registros, titulo: 'Registros' },
  rentabilidad: { comp: Rentabilidad, titulo: 'Rentabilidad' },
  mercado: { comp: Mercado, titulo: 'Mercado' },
  extra: { comp: Extra, titulo: 'Ingresos extra' },
  perfil: { comp: Perfil, titulo: 'Perfil' },
};

const TABS = [
  ['inicio', '🏠', 'Inicio'],
  ['registros', '📒', 'Registros'],
  ['rentabilidad', '💰', 'Rentar'],
  ['mercado', '🛒', 'Mercado'],
  ['extra', '♻️', 'Extra'],
];

export default function App() {
  const [listo, setListo] = useState(false);
  const [ruta, setRuta] = useState('inicio');
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const usuario = useLiveQuery(() => usuarioActivo(), []);
  const onboarding = useLiveQuery(() => leerMeta('onboardingCompletado', false), []);
  const pendientes = useLiveQuery(() => pendientesSync(), []);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        await sembrarDemoSafe();
      } catch (e) {
        console.error('seed', e);
      }
      if (vivo) setListo(true);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const ir = useCallback((r) => {
    setRuta(r);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!listo || usuario === undefined) {
    return (
      <div className="grid min-h-full place-items-center px-6 text-center">
        <div>
          <div className="text-3xl">🌾</div>
          <p className="mt-2 text-sm font-semibold text-stone-600 latido">Cargando AgroMatch…</p>
        </div>
      </div>
    );
  }

  if (!onboarding || !usuario) {
    return (
      <Onboarding
        onListo={async (datos) => {
          await guardarUsuario(datos);
          await escribirMeta('onboardingCompletado', true);
          ir('inicio');
        }}
      />
    );
  }

  const Comp = RUTAS[ruta]?.comp || Inicio;
  const esPerfil = ruta === 'perfil';

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      {/* ---------- Encabezado ---------- */}
      {!esPerfil ? (
        <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#f5f7f4]/95 backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-campo-900 text-sm text-white">🌾</span>
              <span className="text-[13px] font-extrabold tracking-tight text-stone-800">AgroMatch</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {online ? '● en línea' : '○ sin internet'}
                {pendientes ? ` · ${pendientes} pend.` : ''}
              </span>
              <button
                onClick={() => ir('perfil')}
                aria-label="Abrir perfil"
                className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm ring-1 ring-stone-200 transition hover:ring-campo-500"
              >
                {usuario.rol === 'empresa' ? '🏢' : '🧑‍🌾'}
              </button>
            </div>
          </div>
        </header>
      ) : null}

      {/* ---------- Contenido ---------- */}
      <main className="flex-1 px-4 pb-28 pt-4">
        <Comp usuario={usuario} ir={ir} online={online} />
      </main>

      {/* ---------- Barra inferior ---------- */}
      <nav className="safe-bottom sticky bottom-0 z-30 border-t border-stone-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
          {TABS.map(([r, ic, l]) => (
            <button
              key={r}
              onClick={() => ir(r)}
              aria-current={ruta === r ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 transition ${
                ruta === r ? 'bg-campo-100 text-campo-900' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <span className="text-base leading-none">{ic}</span>
              <span className="text-[10px] font-semibold">{l}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
