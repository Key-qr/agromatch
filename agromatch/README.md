# AgroMatch 🌾

**Habla, registra y gana.** Asistente de rentabilidad e inclusión digital para pequeños productores.

Proyecto para la hackatón **AGROTECH Challenge 2026** (UPN Trujillo · Perú Tech Week).
Desafío elegido: **03 — Inclusión tecnológica y rentabilidad para pequeños productores**.

---

## ¿Qué es?

Una **PWA instalable** (mobile-first, funciona sin internet) con tres pilares:

1. **Habla y listo** — el productor dicta o escribe *"Hoy 17/10 cosechamos 1000 kg de arándano"* y la app lo convierte en un registro estructurado que él **confirma o corrige**.
2. **¿Gano o pierdo?** — motor de rentabilidad: costo por kg, **precio mínimo** y utilidad neta real por oferta.
3. **Compara y cierra** — publica la cosecha, recibe ofertas, compáralas **después de costos** y contacta por WhatsApp.

Y un módulo subordinado: **Ingresos extra** (economía circular), que suma los descartes a la utilidad de la campaña.

> **La idea que vende el proyecto:** la oferta que paga *más por kilo* no siempre deja más ganancia.
> En la demo, "Exportadora Valle Verde" paga S/ 6.30/kg y deja **S/ 570**; "Agrícola del Norte" paga S/ 6.00/kg y deja **S/ 700**.

---

## Arrancar el proyecto

Requisitos: **Node.js 18+**.

```bash
npm install
npm run dev        # http://localhost:5173
```

Demo de producción (la que se abre en el celular):

```bash
npm run build
npm run preview    # http://localhost:4173
```

Pruebas:

```bash
npm test           # 20 pruebas unitarias + 8 de integración
npm run check      # pruebas + build
```

---

## Estructura

```
src/
  lib/
    parser.js         Asistente de lenguaje natural (texto/voz → JSON validado)
    rentabilidad.js   Motor: utilidad neta, precio mínimo, comparador, ingreso extra
    db.js             IndexedDB con Dexie + cola de sincronización
    seed.js           Datos de demo (arándano, La Libertad) — marcados como SIMULADOS
    wa.js             Enlaces wa.me con mensaje prellenado (sin API de pago)
    formatos.js       Moneda, fechas, unidades
  screens/
    Onboarding.jsx    Rol (agricultor / empresa) y perfil
    Inicio.jsx        Asistente + pantalla de confirmación
    Registros.jsx     Todos / Cosechas / Compras / Ventas + búsqueda + edición
    Rentabilidad.jsx  ¿Gano o pierdo? + comparador de ofertas + cierre
    Mercado.jsx       Publicar, ver ofertas, contactar, enviar oferta (empresa)
    Extra.jsx         Ingresos extra (circular) + calculadora
    Perfil.jsx        Datos, rol, estado del dispositivo, restaurar demo
    RegistroForm.jsx  Formulario compartido (alta manual y corrección de la IA)
  ui.jsx              Componentes visuales base
  App.jsx             Navegación, encabezado, barra inferior, estado offline
scripts/
  test.mjs             Pruebas unitarias del parser y del motor
  test-integracion.mjs Pruebas de datos con IndexedDB
public/
  sw.js, manifest.webmanifest, icons/   PWA
```

---

## Decisiones de arquitectura (y por qué)

| Decisión | Motivo |
|---|---|
| **Parser local** en lugar de solo LLM | Funciona sin internet en la chacra y no expone claves. Si hay red, se puede enchufar un LLM real usando el mismo contrato (`interpretar`). |
| **Confirmación obligatoria** | Nunca se guarda un registro sin que el usuario lo apruebe. Si el parser falla, se abre el formulario manual. |
| **Nunca inventar datos** | Si falta unidad, cantidad o producto, queda como pendiente y se pregunta. Si falta el costo, se muestra *"estimación incompleta"* en lugar de una ganancia falsa. |
| **IndexedDB (Dexie)** | Los registros viven en el dispositivo y sobreviven a recargas y a la pérdida de internet. |
| **Demo en 1 dispositivo con datos sembrados** | A prueba de fallos de red durante el pitch. Todo lo simulado lleva la etiqueta `SIMULADO`. |
| **wa.me en lugar de API de WhatsApp** | No hay costos ni requisitos. Es un enlace, **no** una integración que lee mensajes. |

---

## Qué está simulado (y se declara)

- Compradores, publicaciones y ofertas de la demo.
- La "interpretación con IA" es un **parser determinístico en español**; en el pitch se presenta como *asistente de lenguaje natural*.
- Datos compartidos entre dispositivos vía Supabase: **fase 2** (la demo corre en un solo dispositivo).

---

## Despliegue rápido

```bash
npm run build
```

- **Netlify Drop**: arrastra la carpeta `dist/` a https://app.netlify.com/drop → obtienes una URL pública para el celular.
- **Vercel**: `npx vercel deploy --prod` (dentro de la carpeta).
- **Local en red**: `npm run preview` y abrir la IP de la máquina desde el teléfono.

*Nota: la PWA y el service worker solo se activan en la compilación de producción (`npm run build`), no en `npm run dev`.*

---

AgroMatch · v2.0 · AGROTECH Challenge 2026
