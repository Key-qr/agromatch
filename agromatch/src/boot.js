/**
 * Arranque de la aplicacion: siembra la demo de forma segura.
 * Si algo falla, la app igual abre (no bloquea al usuario).
 */
import { sembrarDemo } from './lib/seed.js';

let promesa = null;

export async function sembrarDemoSafe() {
  if (!promesa) {
    promesa = sembrarDemo().catch((e) => {
      console.warn('No se pudo sembrar la demo:', e);
      promesa = null;
      return false;
    });
  }
  return promesa;
}

export { db } from './lib/db.js';
