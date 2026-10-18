import React, { useState } from 'react';
import { Btn, Campo, inputCls, Card, Alerta } from '../ui.jsx';

export default function Onboarding({ onListo }) {
  const [rol, setRol] = useState('agricultor');
  const [nombre, setNombre] = useState('Rosa Quispe');
  const [organizacion, setOrganizacion] = useState('Asociación de Productores de Trujillo');
  const [telefono, setTelefono] = useState('999000111');
  const [zona, setZona] = useState('La Libertad, Trujillo');

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-campo-900 text-xl text-white">
          🌾
        </div>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-stone-900">
          AgroMatch
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Habla, registra y gana. Tu asistente para <strong>saber cuánto ganas de verdad</strong>.
        </p>
      </div>

      <Card className="mb-4">
        <p className="mb-2 text-xs font-semibold text-stone-600">¿Cómo entras?</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            ['agricultor', '🧑‍🌾 Agricultor', 'Registro, costos y venta'],
            ['empresa', '🏢 Empresa / comprador', 'Busca y hace ofertas'],
          ].map(([v, l, d]) => (
            <button
              key={v}
              onClick={() => setRol(v)}
              className={`rounded-xl p-3 text-left ring-1 transition ${
                rol === v ? 'bg-campo-900 text-white ring-campo-900' : 'bg-white text-stone-700 ring-stone-200 hover:ring-campo-500/50'
              }`}
            >
              <div className="text-sm font-bold">{l}</div>
              <div className={`mt-0.5 text-[11px] ${rol === v ? 'text-campo-100' : 'text-stone-500'}`}>{d}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        <Campo label="Nombre">
          <input className={inputCls} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo label="Asociación o empresa">
          <input className={inputCls} value={organizacion} onChange={(e) => setOrganizacion(e.target.value)} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="WhatsApp">
            <input className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" />
          </Campo>
          <Campo label="Zona">
            <input className={inputCls} value={zona} onChange={(e) => setZona(e.target.value)} />
          </Campo>
        </div>
      </div>

      <div className="mt-5">
        <Alerta>
          Los datos de la demo son <strong>simulados</strong> y se guardan solo en este dispositivo.
          Funciona <strong>sin internet</strong> una vez cargada.
        </Alerta>
      </div>

      <div className="mt-4">
        <Btn onClick={() => onListo({ rol, nombre, organizacion, telefono, zona })}>
          Empezar →
        </Btn>
      </div>
    </div>
  );
}
