/**
 * Asistente de lenguaje natural.
 *
 * Decision de arquitectura (documentada en la propuesta V2):
 *   parser LOCAL deterministico -> JSON validado -> pantalla de confirmacion.
 *
 * Por que local:
 *   - funciona SIN internet (desafio de conectividad)
 *   - sin API keys en el navegador
 *   - si hay red, se puede enchufar un LLM real via endpoint de servidor
 *     usando exactamente el MISMO contrato de salida (`interpretar`).
 *
 * NUNCA inventa datos: lo que no encuentra queda en `camposFaltantes`
 * y la app lo pregunta.
 */

import {
  UNIDADES, PRODUCTOS, CATEGORIAS_COSTO, fechaHoy, fechaAyer, hoyCorto,
} from './formatos.js';

/* ------------------------------------------------------------------ */
/* Normalizacion                                                       */
/* ------------------------------------------------------------------ */

export function normalizar(t = '') {
  return String(t)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function conTilde(t = '') {
  const mapa = {
    a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', n: 'ñ',
  };
  return String(t)
    .toLowerCase()
    .split('')
    .map((c) => mapa[c] || c)
    .join('');
}

/* ------------------------------------------------------------------ */
/* Numeros en palabras (0 - 199)                                       */
/* ------------------------------------------------------------------ */

const UNIT = {
  cero: 0, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12,
  trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19, veinte: 20,
};
const DEC = {
  veinti: 20, treinta: 30, cuarenta: 40, cincuenta: 50,
  sesenta: 60, setenta: 70, ochenta: 80, noventa: 90, cien: 100,
};

function numDePalabra(palabra) {
  if (palabra in UNIT) return UNIT[palabra];
  if (palabra in DEC) return DEC[palabra];
  if (palabra.startsWith('veinti') && palabra.slice(6) in UNIT) return 20 + UNIT[palabra.slice(6)];

  // "treinta y cinco" se resuelve en el llamador (dos tokens)
  return null;
}

function buscarNumero(tokens, i) {
  const t = tokens[i];

  // digitos: 100, 1.500, 2,5
  const digito = t.match(/^(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?|\d+(?:[.,]\d+)?)$/);
  if (digito) {
    let s = digito[1];
    // 1.500 / 1,500 = miles ; 2,5 = decimal
    if (/^\d{1,3}([.,]\d{3})+$/.test(s)) s = s.replace(/[.,]/g, '');
    else s = s.replace(',', '.');
    const n = Number(s);
    if (!Number.isNaN(n)) return { valor: n, consumed: 1 };
  }

  // palabras
  const base = numDePalabra(t);
  if (base !== null) {
    let valor = base;
    let consumed = 1;
    // "treinta y cinco" / "ciento cinco"
    const y = tokens[i + 1];
    const sig = tokens[i + 2];
    if (y === 'y' && sig && numDePalabra(sig) !== null && base >= 20 && base < 100) {
      valor += numDePalabra(sig);
      consumed = 3;
    } else if (t === 'cien' && sig && numDePalabra(sig) !== null) {
      valor = 100 + numDePalabra(sig);
      consumed = 3;
    } else if (sig && numDePalabra(sig) !== null && base >= 30 && base < 100 && y !== 'y') {
      // "treinta cinco"
      valor += numDePalabra(sig);
      consumed = 2;
    }
    if (t === 'ciento') {
      const post = tokens[i + 1];
      const post2 = tokens[i + 2];
      if (post === 'y' && post2 && numDePalabra(post2) !== null) {
        valor = 100 + numDePalabra(post2);
        consumed = 3;
      } else valor = 100;
    }
    return { valor, consumed };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Unidades y producto                                                 */
/* ------------------------------------------------------------------ */

const UNI_SET = new Set(UNIDADES);

function unidadDe(tok) {
  if (!UNI_SET.has(tok)) return null;
  if (tok === 'kilos' || tok === 'kilo' || tok === 'kilogramos' || tok === 'kilogramo') return 'kg';
  if (tok === 'kgs' || tok === 'kg') return 'kg';
  if (tok === 'tonelada' || tok === 'toneladas' || tok === 'ton') return 'toneladas';
  if (tok === 'quintal' || tok === 'quintales') return 'quintales';
  if (tok === 'jaba' || tok === 'jabas') return 'jabas';
  if (tok === 'caja' || tok === 'cajas') return 'cajas';
  if (tok === 'saco' || tok === 'sacos') return 'sacos';
  if (tok === 'bulto' || tok === 'bultos') return 'bultos';
  if (tok === 'hectarea' || tok === 'hectareas' || tok === 'ha') return 'hectareas';
  if (tok === 'docena' || tok === 'docenas') return 'docenas';
  if (tok === 'manojo' || tok === 'manojos') return 'manojos';
  if (tok === 'gavilla' || tok === 'gavillas') return 'gavillas';
  if (tok === 'arroba' || tok === 'arrobas') return 'arrobas';
  if (tok === 'unidad' || tok === 'unidades') return 'unidades';
  if (tok === 'litro' || tok === 'litros' || tok === 'l') return 'litros';
  return tok;
}

const RELLENOS = new Set([
  'hoy', 'ayer', 'anoch', 'manana', 'temprano', 'hace', 'recien',
  'nosotros', 'nosotras', 'yo', 'ellos', 'se', 'hemos', 'hemos', 'hice',
  'hicimos', 'obtuvimos', 'sacamos', 'traemos', 'quedan', 'tenemos',
  'para', 'por', 'que', 'del', 'de', 'la', 'el', 'lo', 'los', 'las',
  'en', 'con', 'y', 'o', 'a', 'al', 'un', 'una', 'unos', 'unas',
  'hoy', 'esta', 'este', 'estos', 'estas', 'dia', 'dias',
]);

const VERBOS = new Set([
  'cosechamos', 'coseche', 'cosecho', 'cosechar', 'cosecharon',
  'compramos', 'compre', 'compro', 'compraron',
  'vendimos', 'vendi', 'vendo', 'vendieron',
  'gastamos', 'gaste', 'gasto', 'gastaron',
  'obtuvimos', 'sacamos', 'hicimos', 'cogimos', 'recogimos',
  'tuvimos', 'tenemos', 'quedan', 'guarde', 'guardo', 'tengo',
  'publicamos', 'publicar', 'tenemos',
]);

const PRODUCTO_SET = new Set(PRODUCTOS);

/** Nombre para mostrar (con tildes correctas). */
const MOSTRAR = {
  arandano: 'Arándano', maiz: 'Maíz', aji: 'Ají', pimenton: 'Pimentón',
  aguacate: 'Aguacate', platano: 'Plátano', limon: 'Limón', manzana: 'Manzana',
  cacao: 'Cacao', cafe: 'Café', algodon: 'Algodón', naranja: 'Naranja',
  sandia: 'Sandía', batata: 'Batata', frijol: 'Frijol', trigo: 'Trigo',
  estiercol: 'Estiércol', compost: 'Compost',
};

function bonito(tok) {
  return MOSTRAR[tok] || capital(tok);
}

function productoDe(tokens, indiceCantidad, indiceUnidad) {
  const descartados = new Set([
    ...RELLENOS, ...VERBOS,
    'so', 'soles', 'sol', 's/', 'kg', 'quintal', 'jaba', 'jaba',
    'cada', 'cuyo', 'cuya', 'para', 'solo', 'sola',
  ]);
  // 1) buscar un producto catalogado
  for (const tok of tokens) {
    if (PRODUCTO_SET.has(tok)) {
      if (tok === 'descarte' || tok === 'poda' || tok === 'residuo') {
        // se gestiona por tipo, no como producto
      } else {
        return bonito(tok);
      }
    }
  }
  // 2) heuristica: primer sustantivo despues de la cantidad
  const inicio = Math.max(
    indiceUnidad >= 0 ? indiceUnidad + 1 : -1,
    indiceCantidad >= 0 ? indiceCantidad + 1 : -1
  );
  const desde = inicio >= 0 ? inicio : 0;
  const candidato = [];
  for (let i = desde; i < tokens.length; i++) {
    const t = tokens[i];
    if (descartados.has(t)) continue;
    if (numDePalabra(t) !== null) continue;
    if (UNI_SET.has(t)) continue;
    if (/^\d/.test(t)) continue;
    if (/[.,]/.test(t) && /\d/.test(t)) continue;
    if (candidato.length === 0) {
      // sustantivo + posible complemento ("descarte de arandano")
      candidate2(t, tokens, i, candidato);
      if (candidato.length) break;
    }
  }
  if (candidato.length) return capital(candidato.join(' ')); // ya viene legible
  return null;
}

function candidate2(t, tokens, i, out) {
  out.push(t);
  const a = tokens[i + 1];
  const b = tokens[i + 2];
  if (a === 'de' && b && !RELLENOS.has(b) && !VERBOS.has(b) && !UNI_SET.has(b)) {
    out.push(a, b);
  }
}

function capital(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------------------------------------------ */
/* Fechas                                                              */
/* ------------------------------------------------------------------ */

const MESES = {
  enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
  julio: '07', agosto: '08', septiembre: '09', setiembre: '09', octubre: '10',
  noviembre: '11', diciembre: '12',
};

function buscarFecha(texto, tokens) {
  if (/\bhoy\b/.test(texto)) return fechaHoy();
  if (/\bayer\b/.test(texto)) return fechaAyer();

  // 17/10 o 17-10-2026
  let m = texto.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (m) {
    const dia = String(m[1]).padStart(2, '0');
    const mes = String(m[2]).padStart(2, '0');
    let anio = m[3];
    if (anio) anio = anio.length === 2 ? `20${anio}` : anio;
    else anio = fechaHoy().slice(0, 4);
    if (Number(m[2]) >= 1 && Number(m[2]) <= 12) return `${anio}-${mes}-${dia}`;
  }

  // "17 de octubre"
  m = texto.match(/\b(\d{1,2})\s+(?:de\s+|del\s+)?([a-z]+)\b/);
  if (m && MESES[m[2]]) {
    const dia = String(m[1]).padStart(2, '0');
    return `${fechaHoy().slice(0, 4)}-${MESES[m[2]]}-${dia}`;
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Tipos de registro                                                   */
/* ------------------------------------------------------------------ */

function detectarTipo(texto, tokens) {
  const esResiduo = /\b(descarte|poda|podas|residuo|residuos|subproducto|subproductos|restos|rastrojo|hojarasca|compost|estiercol)\b/.test(texto);

  if (esResiduo) return 'residuo';
  if (/\b(cosech|recog|cogimos|sacamos)\w*/.test(texto)) return 'cosecha';
  if (/\b(vend|vendimos|vendi)\w*/.test(texto)) return 'venta';
  if (/\b(compr|compramos|compre)\w*/.test(texto)) return 'compra';
  if (/\b(gast\w*)/.test(texto) && !/\b(vend|compr|cosech)/.test(texto)) return 'compra';
  return null;
}

/* ------------------------------------------------------------------ */
/* API principal                                                       */
/* ------------------------------------------------------------------ */

/** Texto -> objeto de registro propuesto (nunca se guarda sin confirmar). */
export function interpretar(entrada, opts = {}) {
  const textoOriginal = String(entrada || '').trim();
  const texto = normalizar(textoOriginal);
  const tokens = texto.split(' ').filter(Boolean);
  const anio = opts.anio || fechaHoy().slice(0, 4);

  const tipo = detectarTipo(texto, tokens);
  // Si no dice fecha, se registra HOY (visible y editable en la confirmacion):
  // es el dia de la sesion, no un dato inventado.
  const fecha = buscarFecha(texto, tokens) || fechaHoy();

  // cantidad + unidad
  let cantidad = null;
  let unidad = null;
  let idxCant = -1;
  let idxUnidad = -1;

  const esDinero = (i) => {
    const prev = tokens[i - 1];
    const sig = tokens[i + 1];
    return prev === 's/' || prev === 'sol' || prev === 'soles' || sig === 'sol' || sig === 'soles';
  };

  for (let i = 0; i < tokens.length; i++) {
    const r = buscarNumero(tokens, i);
    if (r) {
      // Un monto en dinero NO es una cantidad (ej. "950 soles").
      if (esDinero(i)) {
        i += r.consumed - 1;
        continue;
      }
      // ¿sigue una unidad?
      let j = i + r.consumed;
      while (j < tokens.length && (tokens[j] === 'de' || tokens[j] === 'del')) j++;
      const u = j < tokens.length ? unidadDe(tokens[j]) : null;
      if (u || cantidad === null) {
        cantidad = r.valor;
        idxCant = i;
        if (u) {
          unidad = u;
          idxUnidad = j;
        }
      }
      i += r.consumed - 1;
      continue;
    }
    const u = unidadDe(tokens[i]);
    if (u && unidad === null) {
      unidad = u;
      idxUnidad = i;
    }
  }

  const producto = productoDe(tokens, idxCant, idxUnidad);

  // precios y costos: "a S/ 6", "a 6 soles", "S/ 24", "350 soles"
  let precioPorUnidad = null;
  let costoDirecto = null;
  let categoriaCosto = null;

  const mPrecio = texto.match(
    /\b(?:a|al? por|a razon de)\s*(?:s\/\s*)?(\d+(?:[.,]\d+)?)\s*(soles?|sol|s\/)?\b/
  );
  const mDinero = texto.match(/\b(\d+(?:[.,]\d+)?)\s*(?:soles?|sol|s\/)\b/);
  const mGastoCat = texto.match(/\ben\s+(jornales|flete|transporte|fertilizante|semilla|insumos|riego|alquiler|acondicionamiento|comision|otros)\b/);

  if (mPrecio) {
    precioPorUnidad = toNum(mPrecio[1]);
  } else if (mDinero) {
    const val = toNum(mDinero[1]);
    if (tipo === 'compra' || /\bgast\w*/.test(texto)) costoDirecto = val;
    else if (tipo === 'venta') precioPorUnidad = val;
    else costoDirecto = val;
  }

  if (/\bgast\w*/.test(texto) && !mPrecio) {
    if (costoDirecto === null && mDinero) costoDirecto = toNum(mDinero[1]);
    categoriaCosto = mGastoCat ? capital(mGastoCat[1]) : null;
  } else if (mGastoCat) {
    categoriaCosto = capital(mGastoCat[1]);
  }

  const propuesta = {
    tipo,
    producto: producto ? capital(producto) : null,
    cantidad,
    unidad,
    fecha,
    precioPorUnidad,
    costoDirecto,
    categoriaCosto,
    nota: null,
    entrada: textoOriginal,
    origen: 'asistente',
    estado: 'pendiente_confirmacion',
  };

  return { propuesta, camposFaltantes: faltantes(propuesta), confianza: confianza(propuesta) };
}

function toNum(s) {
  const n = Number(String(s).replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

/**
 * Campos que faltan para que el registro sea valido.
 * En una COMPRA, la cantidad/unidad es opcional: "gaste 950 soles en jornales"
 * es un costo valido sin cantidad.
 */
export function faltantes(p) {
  const f = [];
  if (!p.tipo) f.push('tipo');
  if (!p.producto) f.push('producto');
  if (!p.fecha) f.push('fecha');

  const esCompra = p.tipo === 'compra';
  const cantidadOK = p.cantidad !== null && p.cantidad !== undefined && p.cantidad > 0;

  if (!esCompra) {
    if (!cantidadOK) f.push('cantidad');
    if (!p.unidad) f.push('unidad');
  }
  if (p.tipo === 'venta' && (p.precioPorUnidad === null || p.precioPorUnidad === undefined)) {
    f.push('precio');
  }
  return f;
}

/** Seudopuntaje 0..1 para mostrar al usuario cuanto confiar (no es IA real). */
export function confianza(p) {
  const total = 5;
  const ok = total - Math.min(total, faltantes(p).filter((c) => c !== 'precio').length);
  return Math.max(0.1, Math.min(1, ok / total));
}

/** Placeholder para enchufar un LLM real tras un endpoint de servidor. */
export const CONTRATO_IA = {
  entrada: 'string',
  salida: {
    tipo: 'cosecha|compra|venta|residuo',
    producto: 'string',
    cantidad: 'number',
    unidad: 'string',
    fecha: 'YYYY-MM-DD',
    precioPorUnidad: 'number|null',
    costoDirecto: 'number|null',
  },
};

export { CATEGORIAS_COSTO };
