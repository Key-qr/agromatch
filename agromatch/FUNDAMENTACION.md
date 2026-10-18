# Fundamentación del proyecto — AgroMatch

**¿Por qué elegimos construir AgroMatch para el Desafío 03?**
*AGROTECH Challenge 2026 · UPN Trujillo · Perú Tech Week*

---

## 0. La respuesta en una frase

Porque el Desafío 03 pide **inclusión tecnológica *y* rentabilidad al mismo tiempo**, y
la forma más honesta de cumplir ambas es atacar un dolor **concreto, cotidiano y
medible** del pequeño productor (no conocer su costo real) con una herramienta que
**funciona sin formularios y sin internet**, y cuyo resultado se puede **demostrar en
2 minutos con números que el jurado puede recalcular en vivo**.

No elegimos un tema "que suene bien". Elegimos el problema donde podíamos probar,
en la propia demo, que el productor gana más dinero.

---

## 1. El problema que justifica el proyecto

El pequeño productor agrícola decide su venta **"a ojo"**:

- No tiene su **costo por kilo** calculado (flete, empaque, comisión, mano de obra, insumos).
- Por lo tanto **no conoce su precio mínimo**: el punto por debajo del cual vende *perdiendo*.
- Evalúa las ofertas por el **precio por kilo**, que es el dato visible… y engañoso.
- Las herramientas digitales existentes asumen **formularios, lectoescritura y conexión**,
  justamente lo que el productor de chacra no siempre tiene.
- Y sus **descartes** (poda, fruta de segunda) se pierden como basura en lugar de ser ingreso.

**El núcleo verificable del problema** está en la demo:

| Oferta | Precio | Utilidad neta real |
|---|---|---|
| Exportadora Valle Verde | **S/ 6,30 /kg** (el precio más alto) | S/ 570 |
| Agrícola del Norte | S/ 6,00 /kg (precio menor) | **S/ 700** ✅ |
| Mercado Mayorista | S/ 4,20 /kg | **–S/ 500** (por debajo del mínimo) |

> La oferta que **paga más por kilo** deja **S/ 130 menos**. Ese es el problema:
> sin motor de costos, el productor habría elegido la oferta equivocada.

### 1.1 El problema en cifras (fuentes oficiales)

| Dato | Cifra | Fuente |
|---|---|---|
| Agricultura familiar en el Perú | **97%** de las unidades agropecuarias · **2,2 millones** de unidades | MIDAGRI |
| Hogares rurales con internet | **23,6%** (frente a 60,1% a nivel nacional) | INEI, ENAHO II-2025 |
| Hogares rurales con telefonía móvil | **88,3%** | INEI, ENAHO II-2025 |
| Usuarios de internet que se conectan por celular | **89,0%** | INEI, ENAHO II-2025 |
| Población rural que usa internet | **59,2%** | INEI, ENAHO II-2025 |
| Exportaciones peruanas de arándano 2025 | **USD 2 457 millones** · **373 514 t** | MIDAGRI |
| Peso de La Libertad en la exportación de arándano | **49%** · 11 480 ha | Proarándanos vía Agraria.pe |
| Barreras de un productor que trabaja solo | tecnología, financiamiento, información, mercados y negociación | Agraria.pe (AgroLeal) |

**Lectura para el pitch:** el **97% del agro peruano es agricultura familiar**, pero en el
campo solo **23,6% de los hogares tiene internet en casa**. Sin embargo, el **88,3% tiene
celular** y el **89% de quienes usan internet lo hace desde el celular**. Conclusión
sustentada en datos: **el celular es el canal; la conexión es intermitente.** Eso
justifica una app **mobile-first y offline** —no por preferencia técnica, sino porque
es la única que el productor puede usar de verdad.

Y el contexto productivo del piloto lo respalda: el **arándano peruano** exportó
**USD 2 457 millones en 2025** y **La Libertad concentra el 49%** de esa exportación
con **11 480 hectáreas**. Hay mercado, hay volumen y hay una región donde concentrar la prueba.

---

## 2. Por qué este problema y no otro (criterios de selección)

Evaluamos varios focos posibles dentro del agro (trazabilidad, clima, financiamiento,
directorio de compradores) con seis filtros:

| Criterio | Por qué AgroMatch lo cumple |
|---|---|
| **Pertinencia al desafío** | Toca *exactamente* los dos ejes: inclusión (voz/texto, sin formularios, offline) y rentabilidad (precio mínimo + utilidad neta). No elige una mitad. |
| **Dolor real y frecuente** | No es una molestia ocasional: es **cada campaña, cada oferta**. Decisión repetida = valor repetido. |
| **Medibilidad** | El resultado es un **número** (utilidad neta en soles), no una percepción. Se puede medir antes/después. |
| **Viabilidad en el tiempo del hackathon** | Todo el núcleo se resuelve **sin servidores, sin API de pago y sin base de datos remota**: corre en el teléfono. |
| **Demostrabilidad** | Se explica en **una frase y dos ofertas**. Si el jurado no lo entiende en 30 segundos, el proyecto no sirve. |
| **Diferenciación** | Lo que existe informa *contactos y precios*; nadie informa **la ganancia después de costos**. |

Descartamos, por ejemplo, el directorio de compradores como propuesta *central* porque
no mejora la decisión económica: solo cambia el canal de contacto. Lo dejamos **como
función** ("compara y cierra"), subordinada al motor de rentabilidad.

---

## 3. Por qué esta solución y no las que ya existen

Lo que ya hay en el mercado agrícola digital hace, sobre todo, esto:

- **Directorios y ferias**: te dicen **con quién** hablar y a qué precio de lista.
- **Apps de campo**: te piden llenar fichas técnicas.
- **Grupos de WhatsApp**: ruido, sin costo ni comparación.

Ninguna le dice al productor **si esa oferta le conviene después de sus costos**.

> **Frase que sintetiza la elección:**
> *"Otras apps te dicen con quién hablar. AgroMatch te dice si esa oferta te conviene."*

El **activo estratégico** no es el listado de compradores (fácil de copiar), sino el
**historial de costos y decisiones** del productor: mientras más registra, más precisa
es su recomendación. Eso crea retención real y no se replica descargando una app.

---

## 4. Por qué es una postura honesta (y por eso defendible)

El proyecto se eligió con un principio de diseño que también es un argumento ante el jurado:
**no inventar datos**.

- El asistente **confirma con el usuario** antes de guardar; si falta un dato, **lo pregunta**.
- Si falta el costo, la app muestra **"estimación incompleta"** en vez de una ganancia falsa.
- Todo lo simulado de la demo va **etiquetado `SIMULADO`**.
- El "asistente con IA" es en la demo un **parser determinístico en español**, declarado como tal,
  pero construido sobre un **contrato (`interpretar`) que un LLM real puede implementar** sin rehacer la app.
- Se eligió **offline + datos en el dispositivo (IndexedDB)** porque *ese* es el entorno real
  del productor: la restricción no es un truco de demo, es el requisito.

Esto permite responder sin titubear las preguntas duras del jurado (ver `DEMO_Y_PITCH.md`, §4).

---

## 5. Por qué es factible hoy (no es una idea, es software)

| Aspecto | Situación |
|---|---|
| Núcleo del valor | Implementado: parser de lenguaje natural + motor de rentabilidad (precio mínimo, utilidad neta, comparador). |
| Funciona sin internet | Sí: PWA con service worker + IndexedDB; probado en modo avión. |
| Costo de infraestructura | Prácticamente **S/ 0**: sin backend, `wa.me` en lugar de API de WhatsApp, datos locales. |
| Calidad | Suite de pruebas automatizadas (unitarias del parser/motor + integración de datos con IndexedDB). |
| Demo | Corre en **un solo dispositivo** con datos sembrados: a prueba de fallos de red durante el pitch. |

Es decir: el proyecto se eligió también porque **era construible de verdad** en el tiempo
disponible y **demostrable sin depender de la suerte de la conectividad**.

---

## 6. Impacto y cómo se comprueba

Métricas propuestas para el piloto (medibles con la propia app):

1. **Variación de la utilidad neta por lote** (antes vs. después de usar el comparador).
2. **% de ofertas aceptadas que superan el precio mínimo**.
3. **Kg de descarte efectivamente vendidos** (economía circular como ingreso extra).

Piloto propuesto: **50 productores en La Libertad, un cultivo (arándano), un material.**
*Supuesto a validar, no una cifra ya alcanzada.*

---

## 7. Riesgos reconocidos y mitigación

| Riesgo | Mitigación |
|---|---|
| "Eso ya existe" | El diferenciador es la **utilidad neta**, no el directorio; el valor está en el historial de costos. |
| "La IA no es real" | Se declara: parser determinístico con contrato abierto para LLM real; funciona offline. |
| "Sin señal no sirve" | Es al revés: se diseñó offline primero (IndexedDB + cola de sincronización). |
| "¿Cómo ganan dinero?" | Comisión por transacción cerrada + servicios B2B para empresas/asociaciones. **Sujeto a piloto.** |
| Sostenibilidad mal entendida | El módulo circular **advierte** revisar condiciones técnicas y sanitarias; no afirma que toda biomasa deba salir del suelo. |

---

## 8. Conclusión

Se eligió AgroMatch porque es la respuesta **más directa, más honesta y más demostrable**
al Desafío 03: convierte un problema económico invisible (no saber el costo real) en una
**decisión concreta y verificable** (esta oferta sí, esta no), y lo hace con las
herramientas que el productor realmente tiene: **su voz, su teléfono y, a veces, ninguna señal**.

**Cierre:** *"Una cosecha. Dos ingresos. Mejores decisiones."*

---

## 9. Fuentes (verificables)

Todas las cifras citadas provienen de fuentes oficiales o gremiales y fueron consultadas
el **17 de octubre de 2026**. Las frases entre comillas son textuales del documento fuente.

**[1] INEI — "El 60,1% de los hogares tiene conexión a Internet"** (nota de prensa,
29 de setiembre de 2025; ENAHO, II trimestre 2025).
*Datos:* 60,1% de hogares con internet a nivel nacional; **área rural 23,6%**; telefonía
móvil en **88,3%** de hogares rurales; **89,0%** de usuarios de internet se conecta por
celular; **59,2%** de la población rural usa internet.
https://www.gob.pe/institucion/inei/noticias/1254582-el-60-1-de-los-hogares-tiene-conexion-a-internet

**[2] MIDAGRI — "¡Agricultura Familiar!"** (campaña institucional; actualizada el
12 de mayo de 2025).
*Datos:* la agricultura familiar representa el **97%** de las unidades agropecuarias
del país, sobre **2,2 millones** de unidades; más del **83%** de los trabajadores
agrícolas; a escala mundial provee el **70% de los alimentos**.
https://www.gob.pe/institucion/midagri/campanas/659-agricultura-familiar

**[3] MIDAGRI — "Perú consolida su liderazgo mundial en arándanos y supera los
USD 2,400 millones en ventas durante el 2025"** (nota de prensa, 16 de febrero de 2026).
*Datos:* **USD 2 457 millones** exportados en 2025 (+8,2%); **373 514 toneladas**
(+14,6%); principales regiones productoras: **La Libertad, Lambayeque e Ica**.
https://www.gob.pe/institucion/midagri/noticias/1354335

**[4] Proarándanos vía Agraria.pe — "La Libertad concentra 49% de las exportaciones de
arándanos en la actual campaña"** (17 de febrero de 2026).
*Datos:* La Libertad exportó **181 242 271 kg** de arándano fresco en la campaña
2025/2026 (+14%) y representa el **49%** de la exportación nacional; **11 480 ha**
instaladas en la región.
https://agraria.pe/noticias/la-libertad-concentra-49-de-las-exportaciones-de-arandanos-e-41679

**[5] Agraria.pe — "Exportar más no basta: Alfredo Lira advierte que el Perú debe
integrar a sus pequeños productores"** (15 de octubre de 2026; declaraciones de Alfredo
Lira, fundador de AgroLeal).
*Datos:* "un pequeño productor que trabaja solo enfrenta dificultades para acceder a
tecnología, financiamiento, información, mejores mercados y capacidad de negociación";
"si el crecimiento beneficia solo a unos pocos, el país habrá crecido en volumen pero no
necesariamente como sector".
https://agraria.pe/noticias/exportar-mas-no-basta-alfredo-lira-advierte-que-el-peru-debe-43281

> **Nota de honestidad:** las cifras [1]–[4] son datos oficiales/gremiales y se citan como
> contexto del problema. El **caso económico de la demo** (lote de 1 000 kg, costo
> S/ 4 500, ofertas de S/ 6,00 y S/ 6,30) es **ilustrativo y simulado**, tal como se
> declara en la app. No se presenta como resultado medido.
