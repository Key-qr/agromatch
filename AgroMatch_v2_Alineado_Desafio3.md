# AGROMATCH — PROPUESTA V2 (corregida y alineada al Desafío 3)

**Desafío 3:** Inclusión tecnológica y rentabilidad para pequeños productores.
**Eslogan:** "Habla, registra y gana. Tu asistente para saber cuánto ganas de verdad."
**Formato:** PWA instalable, mobile-first, funciona sin internet.
**Caso de demostración:** arándano + descarte/poda como ingreso extra.
**Versión:** planificación de MVP para la hackatón AGROTECH Challenge 2026 (UPN Trujillo).

---

## 0. Qué cambia respecto a la V1 (y por qué)

La V1 se apoyaba en dos mercados con el mismo peso (cosechas + residuos), lo que la hacía leerse como una solución del **Desafío 2 (economía circular)**. La V2 corrige el foco:

| Aspecto | V1 | V2 (corregida) |
|---|---|---|
| Eje principal | Dos mercados al mismo nivel | **Inclusión + rentabilidad del productor** |
| Mercado circular | Módulo co-protagonista | **Módulo de "ingresos extra"** dentro de la rentabilidad |
| Propuesta al usuario | "Publica y conecta" | **"Sabe cuánto ganas y decide mejor"** |
| IA | Punto de entrada genérico | **Inclusión real: registrar hablando** |
| Métrica estrella | Ofertas cerradas | **Utilidad neta por lote / % sobre el precio mínimo** |

**Regla de alineación:** si una función no ayuda a que un pequeño productor (a) use la app sin saber escribir bien o (b) gane más dinero, queda fuera o pasa a "futuro".

---

## 1. En una frase

AgroMatch ayuda al pequeño productor a **registrar sus operaciones hablando** y a **saber cuánto gana de verdad** en cada lote, para **vender por encima de su costo** y convertir sus descartes en **ingreso adicional**.

---

## 2. El problema (concreto, del Desafío 3)

1. **No conoce su costo real.** El productor no lleva cuentas; vende "a ojo". Resultado: acepta ofertas por debajo del costo y descubre la pérdida meses después.
2. **La tecnología lo excluye.** Las apps agrícolas asumen formularios largos y lectoescritura fluida; gran parte del sector tiene baja alfabetización digital.
3. **Poca visibilidad comercial.** No compara ofertas descontando transporte, acopio y comisión, y no tiene un mercado para sus descartes.

### 2.1 El problema en cifras (fuentes oficiales)

| Dato | Cifra | Fuente |
|---|---|---|
| Agricultura familiar en el Perú | **97%** de las unidades agropecuarias · **2,2 millones** de unidades | MIDAGRI |
| Hogares rurales con internet | **23,6%** (nacional: 60,1%) | INEI, ENAHO II-2025 |
| Hogares rurales con telefonía móvil | **88,3%** | INEI, ENAHO II-2025 |
| Usuarios de internet que usan el celular | **89,0%** | INEI, ENAHO II-2025 |
| Población rural que usa internet | **59,2%** | INEI, ENAHO II-2025 |
| Exportaciones de arándano del Perú 2025 | **USD 2 457 millones** · **373 514 t** | MIDAGRI |
| La Libertad en la exportación de arándano | **49%** · 11 480 ha | Proarándanos vía Agraria.pe |

**Lectura:** el grueso del agro es agricultura familiar, pero en el campo la conexión es
escasa (**23,6%** de hogares con internet) mientras el **celular** está ampliamente
difundido (**88,3%**) y es el medio de acceso a internet (**89,0%**). Esto **fundamenta
con datos** las dos decisiones de diseño: **offline** y **mobile-first**. El piloto se
ancla en **arándano / La Libertad** porque concentra el **49%** de la exportación nacional.

---

## 3. La solución: tres pilares (todo apunta al mismo objetivo)

### Pilar 1 — "Habla y listo" (inclusión tecnológica)
El productor dicta o escribe en lenguaje natural: *"Hoy coseché 100 jabas de arándano y gasté 350 soles en jornales"*. La app lo convierte en registros estructurados y se los muestra para **confirmar o corregir**. Sin formularios largos. Funciona **offline** y es **instalable** en un celular de gama baja.

### Pilar 2 — "¿Gano o pierdo?" (rentabilidad)
Un **Motor de Rentabilidad** calcula, con los propios datos del productor:
- costo por unidad y costo total del lote,
- **precio mínimo de venta** (punto de equilibrio),
- **utilidad neta** por lote y acumulada por campaña,
- comparación de ofertas **después de restar costos de venta**.

### Pilar 3 — "Compara y cierra" (comercialización)
Publicar la cosecha, recibir ofertas, compararlas en neto y **contactar por WhatsApp** con un mensaje preparado.

> El **módulo de ingresos extra (circular)** NO es un cuarto pilar: es un resultado más del Pilar 2 ("mi descarte también vale").

---

## 4. Diferenciador: no es "otro directorio de compradores"

Un directorio resuelve el "a quién vender". AgroMatch resuelve el **"a cuánto vender sin perder"**. El valor se queda en el productor porque la app **acumula su historial de costos y decisiones**. Ese historial es lo que ningún marketplace le da hoy.

**Frase para el jurado:** *"Otras apps te dicen con quién hablar. AgroMatch te dice si esa oferta te conviene."*

---

## 5. Núcleo técnico: el Motor de Rentabilidad

### 5.1 Fórmulas (transparentes y auditables)

- **Costo total del lote** = insumos + mano de obra + riego/alquiler + otros.
- **Costo por unidad** = costo total del lote ÷ cantidad cosechada.
- **Ingreso de la oferta** = precio ofrecido × cantidad aceptada.
- **Utilidad neta** = ingreso de la oferta − costo de producción atribuible − transporte − acondicionamiento − comisión − otros.
- **Precio mínimo (equilibrio)** = (costo unitario × cantidad + costos de venta) ÷ cantidad.
- **Utilidad por unidad** = utilidad neta ÷ cantidad.

### 5.2 Reglas de honestidad (evitan cifras falsas)
- Si faltan costos, mostrar **"estimación incompleta"** en lugar de declarar ganancia neta.
- Marcar en rojo una oferta cuyo precio esté **por debajo del precio mínimo**.
- Nunca inventar peso por caja, precio, proveedor ni comprador: si falta un dato, se pregunta o queda pendiente.
- Separar **ingreso** de **utilidad** (no confundirlos).

### 5.3 Ejemplo de demostración (arándano)
| Concepto | Valor |
|---|---|
| Cantidad del lote | 1 000 kg |
| Costo de producción del lote | S/ 4 500 |
| Costo por kg | S/ 4,50 |
| Oferta A | S/ 6,00/kg, transporte S/ 0,80/kg |
| Utilidad neta A | (6,00 − 4,50 − 0,80) × 1 000 = **S/ 700** |
| Oferta B | S/ 6,30/kg, comisión 10%, acondicionamiento S/ 0,60/kg |
| Utilidad neta B | (6,30 − 0,63 − 4,50 − 0,60) × 1 000 = **S/ 570** |
| **Decisión** | **Gana A**, aunque B paga más por kg |

> Este ejemplo es la joya del pitch: demuestra que **el precio más alto no siempre deja más ganancia**.

---

## 6. Módulo de ingresos extra (circular, subordinado al Desafío 3)

- Registrar descarte/poda: tipo, volumen, unidad, estado, ubicación.
- Regla simple de **compatibilidad** con el comprador: tipo de material, volumen mínimo, distancia, fecha.
- **Ingreso extra neto** = ingreso del material − acopio − transporte.
- El resultado se suma a la rentabilidad del lote como **"ingreso adicional"**.

**Precaución declarada:** no todo residuo es comercializable; se respetan condiciones técnicas, sanitarias y ambientales, y no se afirma que toda biomasa deba retirarse del suelo.

---

## 7. Alcance del MVP (imprescindible vs. futuro)

| # | Función | Prioridad |
|---|---|---|
| 1 | Alta simple + selector de rol (agricultor / empresa) | Imprescindible |
| 2 | Inicio "habla o escribe" (voz y texto) | Imprescindible |
| 3 | Confirmación de registro propuesto por el parser | Imprescindible |
| 4 | Registros (Todos / Cosechas / Compras / Ventas) con filtros | Imprescindible |
| 5 | Persistencia local (IndexedDB) + offline | Imprescindible |
| 6 | Motor de rentabilidad (costo/kg, precio mínimo, utilidad) | Imprescindible |
| 7 | Publicar cosecha + ofertas + comparador neto | Imprescindible |
| 8 | Botón WhatsApp (wa.me) con mensaje prellenado | Imprescindible |
| 9 | Módulo de ingresos extra (circular) | Imprescindible (simple) |
| 10 | Deploy en Vercel + prueba en celular | Imprescindible |
| 11 | Perfil empresarial / catálogo | Media |
| 12 | Supabase con datos compartidos reales | Media |
| 13 | Distribuidores / logística | Futuro |
| 14 | Monitoreo satelital / agrupación de lotes por asociación | Futuro |

---

## 8. Pantallas (mobile-first)

1. **Bienvenida / Rol** — elegir agricultor o empresa, nombre y zona.
2. **Inicio "Habla o escribe"** — botón de micrófono, campo de texto, ejemplos.
3. **Confirmación** — tarjeta editable con lo interpretado; botón Confirmar.
4. **Registros** — pestañas Todos/Cosechas/Compras/Ventas + búsqueda.
5. **Mi rentabilidad** — costo por kg, precio mínimo, utilidad por lote y por campaña.
6. **Mercado** — publicaciones con filtros; publicar producto.
7. **Ofertas** — ofertas recibidas + comparador neto + semáforo rojo/verde.
8. **Ingresos extra** — registrar descarte y ver comprador compatible.
9. **Perfil** — datos y publicaciones.

---

## 9. Asistente de lenguaje natural (decisión: parser local + LLM opcional)

### 9.1 Flujo seguro
`mensaje → interpretación → validación de esquema → pantalla de confirmación → escritura local → sync`.

### 9.2 Estrategia
- **Base (offline, sin claves):** parser local determinístico en español (fechas, cantidades, unidades, productos, verbos "coseché/compré/vendí/gasté"). Funciona sin internet.
- **Opcional (con internet):** envío a un LLM real vía **endpoint de servidor**; la clave **nunca** va al navegador.
- **Voz:** Web Speech API como entrada; si no está disponible, se escribe.
- **Fallback:** si el parser falla, se abre el **formulario manual**.

### 9.3 Ejemplo
Entrada: *"Hoy 17/10 cosechamos 100 jabas de arándano"*

| Dato | Extracción |
|---|---|
| Tipo | Cosecha |
| Producto | Arándano |
| Cantidad | 100 |
| Unidad | Jabas |
| Fecha | 17/10/2026 |
| Estado | Pendiente de confirmación |

### 9.4 Etiqueta ética
En la demo debe verse "**asistente de lenguaje natural**" y, si se usa LLM, indicar que es un prototipo. No presentar enlaces `wa.me` como integración que lee mensajes de WhatsApp.

---

## 10. Arquitectura tecnológica

| Capa | Tecnología | Finalidad |
|---|---|---|
| Interfaz | React + Vite + Tailwind | Pantallas responsive |
| Instalable | PWA + service worker | Instalación y caché de interfaz |
| Datos offline | IndexedDB (Dexie) | Registros locales y cola de sync |
| Datos centrales (media) | Supabase + RLS | Usuarios, publicaciones, ofertas |
| Lenguaje natural | Parser local + endpoint LLM opcional | Extracción y validación JSON |
| Contacto | Enlaces wa.me | Comunicación manual |
| Despliegue | Vercel / Netlify | Demo en celular |

**Demo:** un solo dispositivo con **datos sembrados** claramente etiquetados como **simulados**. Las claves nunca se entregan al navegador; RLS por usuario cuando se use Supabase.

---

## 11. Modelo de datos mínimo

| Entidad | Campos esenciales |
|---|---|
| usuarios | id, rol, nombre, organización, teléfono, zona |
| registros | id, usuario_id, tipo, producto/material, cantidad, unidad, fecha, precio/costo, **costo_total**, estado_sync |
| lotes | id, usuario_id, cultivo, cantidad_cosechada, costo_produccion, campaña |
| publicaciones | id, usuario_id, mercado (agrícola/extra), material, cantidad, unidad, precio_referencial, calidad, ubicación, estado |
| ofertas | id, publicación_id, comprador_id, precio, cantidad, transporte, acondicionamiento, comisión, estado |
| operaciones | id, oferta_id, estado_entrega, estado_pago, fecha, cantidad_final, utilidad_neta |

---

## 12. Offline y sincronización

| Función | Con internet | Sin internet |
|---|---|---|
| Consultar registros guardados | Sí | Sí |
| Registrar manualmente | Sí | Sí (pendiente de sync) |
| Interpretar con parser local | Sí | **Sí** |
| Interpretar con LLM remoto | Sí | No |
| Ver últimas publicaciones/ofertas | Sí | Solo cacheadas |
| Sincronizar con nube | Sí | No |
| Abrir la PWA | Sí | Sí (si la interfaz está cacheada) |

Registros en **IndexedDB**; cola local de operaciones pendientes con **IDs estables** para evitar duplicados.

---

## 13. Métricas de impacto (alineadas al Desafío 3)

| Área | Indicador |
|---|---|
| Inclusión | % de productores que registra una operación con asistencia mínima |
| Rentabilidad | Variación de utilidad neta por lote/kg vs. línea base |
| Decisión | % de ofertas aceptadas por encima del precio mínimo |
| Actividad | Ofertas comparadas y operaciones cerradas |
| Ingreso extra | Kg de descarte efectivamente vendidos (no solo publicados) |
| Negocio | Margen de contribución por transacción |

**Metas de piloto** (sujetas a validación, no inventar %): 50 productores, 1 comprador de arándano y 2 compradores de material aprovechable, varias operaciones comprobadas y una métrica real de utilidad neta.

---

## 14. Plan intensivo por horas (8 h)

| Bloque | Tiempo | Entregable |
|---|---|---|
| 0 | 9:30–10:15 | Kickoff interno, alcance, datos semilla, repo + **deploy "hola mundo"** |
| 1 | 10:15–11:15 | Shell de la app, navegación, roles y deploy probado en celular |
| 2 | 11:15–12:15 | Registros + IndexedDB + filtros + formulario manual |
| 3 | 12:15–13:00 | **Motor de rentabilidad** + datos semilla de arándano |
| — | 13:00–14:00 | Almuerzo (aprovechar para validar con un mentor) |
| 4 | 14:00–15:00 | Parser → JSON → pantalla de confirmación (voz opcional) |
| 5 | 15:00–16:00 | Mercado + ofertas + comparador neto + WhatsApp |
| — | 16:00–16:30 | Coffee break (deploy + prueba en celular real) |
| 6 | 16:30–17:15 | Módulo ingresos extra (circular) + offline + pulido |
| 7 | 17:15–17:45 | Ensayo de demo/pitch + checklist final |
| — | hasta 18:00 | Buffer de correcciones |

**Prioridad absoluta:** un flujo de punta a punta que funcione con pocos datos:
`texto → confirmación → registro → publicación → oferta → cálculo → contacto`.

---

## 15. División de responsabilidades (equipo de 3 a 5)

| Persona | Responsabilidad |
|---|---|
| Frontend | Interfaz, navegación, PWA, mobile-first |
| Datos / Rentabilidad | Persistencia, IndexedDB, **motor de rentabilidad** |
| Lenguaje natural | Parser, validación JSON, voz, confirmación |
| Integración / Negocio | Mercado, ofertas, WhatsApp, datos semilla, pitch |
| QA / Deploy (si hay 5) | Pruebas en celular, offline, guion y tiempos |

---

## 16. Demo (2 min) y pitch (3 min), reenfocados al Desafío 3

### 16.1 Demo integrada (2 min)
1. **0:00–0:20 — Inclusión:** el agricultor **dicta** "Hoy cosechamos 100 jabas de arándano"; aparece la tarjeta y confirma.
2. **0:20–0:35 — Registros:** filtro Cosechas; el registro persiste.
3. **0:35–1:05 — Rentabilidad:** se publica el lote, llegan dos ofertas y se muestra que **A deja más utilidad aunque B pague más por kg**.
4. **1:05–1:25 — Ingresos extra:** registrar descarte/poda y ver un comprador compatible.
5. **1:25–1:45 — WhatsApp:** abrir mensaje preparado (sin fingir automatización).
6. **1:45–2:00 — Offline:** desconectar y seguir consultando registros.

### 16.2 Guion de pitch (3 min)
- **Problema (40 s):** el pequeño productor no sabe su costo real, la tecnología lo excluye y vende por debajo del costo. *(Dato oficial: 97% del agro es agricultura familiar; solo 23,6% de hogares rurales tiene internet en casa, pero 88,3% tiene celular.)*
- **Solución (50 s):** AgroMatch registra **hablando** y calcula la **utilidad neta real**, convirtiendo el precio en decisión ("¿ganas o pierdes?").
- **Modelo (50 s):** productor gratuito; ingresos B2B por comisión y servicios, **sujetos a piloto**. Contacto inicial por WhatsApp.
- **Impacto y cierre (40 s):** medir utilidad neta, % sobre precio mínimo e ingresos extra. *"Una cosecha. Dos ingresos. Mejores decisiones."*

> Reemplaza el eslogan anterior por uno que hable de **decisión**, no solo de mercados.

---

## 17. Riesgos y mitigaciones

| Riesgo | Mitigación MVP |
|---|---|
| Aparecer como "Desafío 2 disfrazado" | Circular = módulo de ingresos extra; marco central = inclusión + rentabilidad |
| El parser interpreta mal | Confirmación y edición de cada registro; nunca guardar directo |
| Sin internet | Parser local, datos locales, formulario manual, estados de sync |
| Wifi del campus falla | Demo en 1 dispositivo con datos sembrados etiquetados como simulados |
| Sin demanda real de descarte | Elegir **un** material con comprador interesado (arándano/poda) |
| La logística anula la utilidad | El comparador **resta** transporte y acopio |
| Transacciones fuera de la app | Registro de cierre, historial y valor añadido |
| Sobrecarga del equipo | Separar imprescindible, simulación declarada y futuro |

---

## 18. Decisiones tomadas y pendientes

**Tomadas:** cultivo **arándano**; residuo **descarte/poda**; IA = **parser local + LLM opcional**; datos = **demo en 1 dispositivo con datos sembrados**.

**Pendientes:** confirmar **un comprador potencial real** de arándano y uno de descarte; definir método de login; validar el volumen de la oferta; repartir tareas según el número real de integrantes.

---

## 19. Checklist final de entrega

- [ ] La app abre en un celular mediante un enlace web.
- [ ] Se distinguen perfiles de agricultor y empresa.
- [ ] El inicio permite entrada por **lenguaje natural** (voz/texto).
- [ ] La interpretación **requiere confirmación explícita**.
- [ ] Los registros persisten al recargar y se filtran por tipo.
- [ ] Se puede publicar una cosecha y un material de ingreso extra.
- [ ] Se visualizan ofertas y se calcula la **utilidad neta** con datos editables.
- [ ] El comparador **marca en rojo** las ofertas bajo el precio mínimo.
- [ ] El botón WhatsApp crea un mensaje preparado.
- [ ] Los registros locales siguen visibles **sin internet**.
- [ ] Los datos demostrativos están **identificados como simulados**.
- [ ] El pitch presenta inclusión, rentabilidad, impacto y crecimiento.

---

## 20. Fundamentación: por qué este proyecto

1. **El desafío pide dos cosas a la vez** —inclusión tecnológica *y* rentabilidad—. AgroMatch ataca la intersección: **usable sin saber escribir bien** *y* **que mejora la decisión económica**.
2. **El problema es real y masivo.** El **97%** del agro peruano es agricultura familiar (**2,2 millones** de unidades), pero el productor decide su venta **"a ojo"**: no conoce su costo real ni su precio mínimo.
3. **La brecha digital exige offline.** Solo **23,6%** de los hogares rurales tiene internet en casa, pero **88,3%** tiene celular y **89%** de quienes usan internet lo hace por el celular. El canal es el **celular**; la conexión es **intermitente**: por eso la app es **mobile-first y offline**.
4. **El piloto tiene territorio y mercado.** El **arándano** exportó **USD 2 457 millones** en 2025 y **La Libertad concentra el 49%** con **11 480 ha**.
5. **El diferenciador es económico, no de catálogo.** Los directorios dicen *con quién* hablar; AgroMatch dice **si esa oferta conviene después de costos** (S/ 6,30/kg deja S/ 570; S/ 6,00/kg deja S/ 700).
6. **Es honesto y demostrable.** Nada se guarda sin confirmación, nada se inventa, todo lo simulado se etiqueta y funciona **sin señal**.

**Frase de fundamentación:** *"Elegimos este proyecto porque el 97% del agro es agricultura
familiar y, sin embargo, el productor decide a ciegas: no sabe cuánto le cuesta su kilo.
Le dimos una app que habla su idioma y vive en el único dispositivo que sí tiene —el
celular—, para que sepa cuánto gana antes de decir sí."*

> Argumentación completa: **`agromatch/FUNDAMENTACION.md`** y **`agromatch/DEMO_Y_PITCH.md`**.

---

## 21. Fuentes oficiales (consultadas el 17/10/2026)

1. **INEI** — *El 60,1% de los hogares tiene conexión a Internet* (ENAHO, II trim. 2025; 29/09/2025). → rural 23,6%; celular 88,3%; internet por celular 89,0%; población rural que usa internet 59,2%. https://www.gob.pe/institucion/inei/noticias/1254582-el-60-1-de-los-hogares-tiene-conexion-a-internet
2. **MIDAGRI** — *¡Agricultura Familiar!* (12/05/2025). → 97% de unidades agropecuarias; 2,2 millones de unidades; >83% de trabajadores agrícolas. https://www.gob.pe/institucion/midagri/campanas/659-agricultura-familiar
3. **MIDAGRI** — *Perú consolida su liderazgo mundial en arándanos…* (16/02/2026). → USD 2 457 millones; 373 514 t (2025). https://www.gob.pe/institucion/midagri/noticias/1354335
4. **Proarándanos vía Agraria.pe** — *La Libertad concentra 49% de las exportaciones de arándanos…* (17/02/2026). → 181 242 271 kg (2025/2026); 49%; 11 480 ha. https://agraria.pe/noticias/la-libertad-concentra-49-de-las-exportaciones-de-arandanos-e-41679
5. **Agraria.pe** — *Exportar más no basta: Alfredo Lira advierte que el Perú debe integrar a sus pequeños productores* (15/10/2026). → barreras del productor que trabaja solo. https://agraria.pe/noticias/exportar-mas-no-basta-alfredo-lira-advierte-que-el-peru-debe-43281

---

*Documento V2 preparado para la hackatón AGROTECH Challenge 2026. Los ejemplos económicos son ilustrativos y deben validarse con datos reales antes de presentarse como resultados.*
