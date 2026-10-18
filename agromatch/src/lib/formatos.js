/** Formateo, unidades, fechas e identificadores. Sin dependencias externas. */

export const MONEDA = 'S/';

/** Id estable para evitar duplicados al sincronizar (IndexedDB -> nube). */
export function id() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function dinero(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const signo = n < 0 ? '-' : '';
  return `${signo}${MONEDA} ${Math.abs(n).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function numero(n, decimales = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return Number(n).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

export function redondear(n, decimales = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  const f = 10 ** decimales;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** 'YYYY-MM-DD' -> '17 oct 2026' (es-PE). */
export function fechaLarga(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const meses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];
  if (!y || !m || !d) return iso;
  return `${d} ${meses[m - 1]} ${y}`;
}

export function fechaHoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function fechaAyer() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function hoyCorto() {
  return fechaHoy().slice(8, 10) + '/' + fechaHoy().slice(5, 7);
}

/** Unidades reconocidas por el asistente. */
export const UNIDADES = [
  'kilogramos', 'kilogramo', 'kilos', 'kilo', 'kg',
  'quintales', 'quintal',
  'jabas', 'jaba',
  'cajas', 'caja',
  'sacos', 'saco',
  'bultos', 'bulto',
  'toneladas', 'tonelada', 'ton',
  'arrobas', 'arroba',
  'manojos', 'manojo',
  'gavillas', 'gavilla',
  'docenas', 'docena',
  'hectareas', 'hectarea', 'ha',
  'litros', 'litro', 'l',
  'unidades', 'unidad',
];

/** Catálogo simple para el MVP. Se puede ampliar sin tocar el parser. */
export const PRODUCTOS = [
  'arandano', 'fresa', 'papa', 'batata', 'maiz', 'arroz', 'trigo',
  'palta', 'aguacate', 'mango', 'uva', 'platano', 'limon',
  'tomate', 'cebolla', 'zanahoria', 'ajo', 'aji', 'pimenton',
  'cacao', 'cafe', 'algodon', 'manzana', 'naranja', 'sandia',
  'fertilizante', 'semilla', 'abono', 'pesticida', 'agroquimico',
  'descarte', 'poda', 'residuo', 'compost', 'estiercol', 'rastrojo',
];

export const CATEGORIAS_COSTO = [
  'jornales', 'flete', 'transporte', 'fertilizante', 'semilla',
  'insumos', 'riego', 'alquiler', 'acondicionamiento', 'comision', 'otros',
];

export const TIPOS = {
  cosecha: 'Cosecha',
  compra: 'Compra',
  venta: 'Venta',
  residuo: 'Residuo / subproducto',
};

export function tipoLargo(t) {
  return TIPOS[t] || t || '—';
}

/** Particula ligera para cabeceras de estado de sincronizacion. */
export const estadoSync = (n) => (n === 0 ? 'Sincronizado' : `${n} pendiente(s) de sincronizar`);
