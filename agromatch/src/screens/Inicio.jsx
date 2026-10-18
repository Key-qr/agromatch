import React, { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, guardarRegistro } from '../lib/db.js';
import { interpretar } from '../lib/parser.js';
import { EJEMPLOS } from '../lib/seed.js';
import { fechaLarga, numero } from '../lib/formatos.js';
import { Card, Btn, Badge, Alerta, Seccion, Simulado } from '../ui.jsx';
import FormularioRegistro from './RegistroForm.jsx';

export default function Inicio({ usuario, ir, online }) {
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const [propuesta, setPropuesta] = useState(null); // {propuesta, camposFaltantes, confianza}
  const [manual, setManual] = useState(false);
  const [guardado, setGuardado] = useState(null);
  const [error, setError] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const recognizer = useRef(null);

  const recientes = useLiveQuery(
    () => db.registros.orderBy('creado').reverse().limit(4).toArray(),
    []
  );

  const hayVoz = typeof window !== 'undefined' && !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  async function pedir(t = texto) {
    const limpio = String(t || '').trim();
    if (!limpio) return;
    setError(null);
    setGuardado(null);
    setPensando(true);
    setPropuesta(null);
    setManual(false);
    // Pausa corta: en produccion aqui va el endpoint del parser/LLM.
    await new Promise((r) => setTimeout(r, 350));
    try {
      const r = interpretar(limpio);
      setPropuesta(r);
    } catch (e) {
      setError('No pude interpretar el mensaje. Usa el formulario manual.');
      setManual(true);
    } finally {
      setPensando(false);
    }
  }

  function dictar() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (escuchando) {
      recognizer.current?.stop();
      setEscuchando(false);
      return;
    }
    try {
      const r = new SR();
      r.lang = 'es-PE';
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (ev) => {
        const t = ev.results[0][0].transcript;
        setTexto(t);
        setEscuchando(false);
        pedir(t);
      };
      r.onerror = () => {
        setEscuchando(false);
        setError('No pude escuchar. Revisa el micrófono o escribe el mensaje.');
      };
      r.onend = () => setEscuchando(false);
      recognizer.current = r;
      r.start();
      setEscuchando(true);
    } catch {
      setError('La voz no está disponible en este navegador. Escribe el mensaje.');
    }
  }

  async function confirmar(registro) {
    const r = await guardarRegistro(registro, usuario.id);
    setGuardado(r);
    setPropuesta(null);
    setManual(false);
    setTexto('');
  }

  const faltantes = propuesta?.camposFaltantes || [];
  const criticos = faltantes.filter((c) => ['tipo', 'producto', 'unidad'].includes(c));

  return (
    <div>
      {/* ---------- Saludo ---------- */}
      <div className="mb-4 rounded-2xl bg-campo-900 p-4 text-white shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-wide text-campo-100/80">
          Hola, {usuario?.nombre || 'productor'} · {usuario?.zona}
        </p>
        <p className="mt-1 text-lg font-extrabold leading-tight">
          ¿Qué pasó hoy en la chacra?
        </p>
        <p className="mt-1 text-xs text-campo-100/85">
          Dilo con tus palabras: yo lo convierto en un registro y tú lo confirmas.
        </p>
      </div>

      {/* ---------- Entrada por lenguaje natural ---------- */}
      <Card>
        <div className="flex items-start gap-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                pedir();
              }
            }}
            rows={2}
            placeholder="Ej.: Hoy 17/10 cosechamos 1000 kg de arándano"
            className="min-h-[52px] w-full resize-none rounded-xl bg-stone-50 px-3 py-2.5 text-sm text-stone-900 ring-1 ring-stone-200 outline-none focus:ring-2 focus:ring-campo-500 placeholder:text-stone-400"
          />
          {hayVoz ? (
            <button
              onClick={dictar}
              title="Dictar por voz"
              aria-label="Dictar por voz"
              className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition ${
                escuchando ? 'bg-red-600 text-white latido' : 'bg-campo-100 text-campo-900 hover:bg-campo-500/20'
              }`}
            >
              {escuchando ? '●' : '🎤'}
            </button>
          ) : null}
        </div>

        <div className="mt-2">
          <Btn onClick={() => pedir()} disabled={!texto.trim() || pensando}>
            {pensando ? 'Interpretando…' : 'Interpretar mensaje'}
          </Btn>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {EJEMPLOS.slice(0, 3).map((e) => (
            <button
              key={e}
              onClick={() => {
                setTexto(e);
                pedir(e);
              }}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] text-stone-600 ring-1 ring-stone-200 transition hover:bg-campo-100 hover:text-campo-900"
            >
              {e}
            </button>
          ))}
        </div>

        {!online ? (
          <div className="mt-3">
            <Alerta tono="aviso">
              <strong>Sin internet.</strong> El parser local sigue funcionando y el registro se
              guarda en el dispositivo; se sincronizará cuando vuelva la red.
            </Alerta>
          </div>
        ) : null}
      </Card>

      {/* ---------- Confirmación explícita ---------- */}
      {propuesta ? (
        <div className="sube mt-4">
          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-stone-700">Revisa lo que entendí</p>
                <p className="text-[11px] text-stone-400">
                  Confianza {Math.round((propuesta.confianza || 0) * 100)}% · nada se guarda sin tu confirmación
                </p>
              </div>
              <Badge tono={criticos.length ? 'ambar' : 'verde'}>
                {criticos.length ? `${criticos.length} dato(s) faltante(s)` : 'listo para confirmar'}
              </Badge>
            </div>

            {faltantes.length ? (
              <div className="mb-3">
                <Alerta tono="aviso">
                  Me falta completar: <strong>{faltantes.join(', ')}</strong>. No invento datos, tú los decides.
                </Alerta>
              </div>
            ) : null}

            <FormularioRegistro
              inicial={propuesta.propuesta}
              titulo="Registro propuesto"
              onGuardar={confirmar}
              onCancelar={() => {
                setPropuesta(null);
                setManual(true);
              }}
            />
          </Card>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Alerta tono="error">{error}</Alerta>
        </div>
      ) : null}

      {guardado ? (
        <div className="sube mt-4">
          <Alerta tono="ok">
            <strong>Registro guardado</strong> ({fechaLarga(guardado.fecha)}): {numero(guardado.cantidad, 0)}{' '}
            {guardado.unidad} de {guardado.producto}. Ahora está en <em>Registros</em>.
          </Alerta>
        </div>
      ) : null}

      {manual && !propuesta ? (
        <div className="sube mt-4">
          <Card>
            <FormularioRegistro
              inicial={{ fecha: null }}
              titulo="Registro manual"
              onGuardar={confirmar}
              onCancelar={() => setManual(false)}
            />
          </Card>
        </div>
      ) : null}

      {!manual && !propuesta && !guardado ? (
        <div className="mt-3">
          <Btn variante="fantasma" onClick={() => setManual(true)}>
            ✎ Escribir un registro a mano
          </Btn>
        </div>
      ) : null}

      {/* ---------- Accesos rápidos ---------- */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        {[
          ['registros', '📒', 'Registros', 'Todos / Cosechas / Compras / Ventas'],
          ['rentabilidad', '💰', '¿Gano o pierdo?', 'Costo, precio mínimo y ofertas'],
          ['mercado', '🛒', 'Mercado', 'Publica y recibe ofertas'],
          ['extra', '♻️', 'Ingresos extra', 'Aprovecha tu descarte'],
        ].map(([r, ic, t, d]) => (
          <button
            key={r}
            onClick={() => ir(r)}
            className="rounded-2xl bg-white p-3 text-left ring-1 ring-black/5 transition hover:ring-campo-500/50 active:scale-[0.99]"
          >
            <div className="text-lg">{ic}</div>
            <div className="mt-1 text-[13px] font-bold text-stone-800">{t}</div>
            <div className="text-[11px] leading-tight text-stone-500">{d}</div>
          </button>
        ))}
      </div>

      {/* ---------- Persistencia visible ---------- */}
      <div className="mt-6">
        <Seccion
          titulo="Tus últimos registros"
          extra={<button onClick={() => ir('registros')} className="text-[11px] font-semibold text-campo-700">Ver todos</button>}
        >
          {(recientes || []).map((r) => (
            <Card key={r.id} className="py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-campo-50 text-sm">
                  {r.tipo === 'cosecha' ? '🌱' : r.tipo === 'compra' ? '🧾' : r.tipo === 'venta' ? '💰' : '♻️'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">{r.producto}</p>
                  <p className="text-[11px] text-stone-500">
                    {numero(r.cantidad, 0)} {r.unidad} · {fechaLarga(r.fecha)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tono={r.tipo === 'venta' ? 'verde' : r.tipo === 'compra' ? 'azul' : 'gris'}>
                    {r.tipo}
                  </Badge>
                  <Simulado />
                </div>
              </div>
            </Card>
          ))}
          {recientes && recientes.length === 0 ? (
            <p className="text-xs text-stone-500">Aún no hay registros. Di tu primer mensaje arriba.</p>
          ) : null}
        </Seccion>
      </div>
    </div>
  );
}
