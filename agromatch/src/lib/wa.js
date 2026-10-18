/**
 * Contacto por WhatsApp SIN API de pago (etapa 1 del MVP).
 *
 * Se usa un enlace wa.me con mensaje prellenado.
 * OJO: esto NO lee ni guarda mensajes de WhatsApp. Es un enlace manual.
 * La automatizacion real requiere la API oficial (etapa posterior).
 */

const MAX = 1600;

export function telefonoNormalizado(tel = '') {
  let t = String(tel).replace(/[^\d+]/g, '');
  if (!t) return '';
  if (!t.startsWith('+')) {
    // Peru por defecto si solo trae 9 digitos
    if (t.length === 9) t = '+51' + t;
    else if (t.length === 10 && t.startsWith('51')) t = '+' + t;
    else t = '+' + t;
  }
  return t;
}

export function mensajeCompra({ comprador, material, cantidad, unidad, precio, condiciones }) {
  const lineas = [
    `Hola ${comprador}, soy productor de AgroMatch.`,
    `Me interesa su oferta por ${cantidad} ${unidad} de ${material}.`,
    precio !== null && precio !== undefined ? `Precio: S/ ${precio} por ${unidad}.` : null,
    condiciones ? `Condiciones: ${condiciones}.` : null,
    '¿Confirmamos entrega y pago?',
  ];
  return lineas.filter(Boolean).join('\n');
}

export function mensajeVenta({ comprador, material, cantidad, unidad, precio, condiciones }) {
  return mensajeCompra({ comprador, material, cantidad, unidad, precio, condiciones });
}

export function mensajeOferta({ comprador, material, cantidad, unidad, precio, condiciones }) {
  const lineas = [
    `Hola ${comprador}, tengo disponible ${cantidad} ${unidad} de ${material}.`,
    precio !== null && precio !== undefined ? `Mi precio de referencia: S/ ${precio}/${unidad}.` : null,
    condiciones ? `Condiciones: ${condiciones}.` : null,
    'Reciba los detalles por aquí cuando guste.',
  ];
  return lineas.filter(Boolean).join('\n');
}

/** Construye el enlace wa.me. No abre conversacion automatizada. */
export function waLink({ telefono, texto }) {
  const tel = telefonoNormalizado(telefono);
  const t = encodeURIComponent(String(texto || '').slice(0, MAX));
  if (!tel) return `https://wa.me/?text=${t}`;
  return `https://wa.me/${tel.replace('+', '')}?text=${t}`;
}

export function abrirWhatsApp({ telefono, texto }) {
  const url = waLink({ telefono, texto });
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}
