import fs from "fs";
import fetch from "node-fetch";
import pLimit from "p-limit";

// Concurrency configurable
const concurrency = 2; // bajá a 2 si seguís teniendo problemas
const limit = pLimit(concurrency);
const archivoSobreescribir = "registrosNegativosDesde2000.json";

// Simple cache in-memory to avoid duplicate calls
const cache = new Map();

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetries(url, maxRetries = 5, initialDelay = 500) {
  let attempt = 0;
  let delay = initialDelay;
  while (true) {
    attempt++;
    try {
      const res = await fetch(url, { timeout: 30000 });
      if (!res.ok) {
        // For 429 or 5xx, retry; for 4xx (other than 429) probably not recoverable
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          if (attempt > maxRetries) {
            throw new Error(`HTTP ${res.status} after ${attempt} attempts`);
          }
          console.warn(`HTTP ${res.status} - retrying in ${delay}ms (attempt ${attempt})`);
          await sleep(delay);
          delay *= 2;
          continue;
        } else {
          // non-retriable error
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${text}`);
        }
      }
      const data = await res.json();
      return data;
    } catch (err) {
      // network or parse error
      if (attempt > maxRetries) throw err;
      console.warn(`Fetch failed (attempt ${attempt}): ${err.message}. Retrying in ${delay}ms`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

async function getPrecipitation(lat, lon, fechas) {
  if (!fechas || fechas.length === 0) return [];

  const start = fechas[0];
  const end = fechas[fechas.length - 1];

  // key de cache por lat/lon/rango
  const cacheKey = `${lat},${lon},${start},${end}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=precipitation_sum&timezone=auto`;

  try {
    const data = await fetchWithRetries(url, 5, 400);

    // Si no trae daily/time, devolvemos array con nulls (pero despues lo reintentamos si queremos)
    if (!data || !data.daily || !Array.isArray(data.daily.time)) {
      console.warn(`Respuesta sin daily.time para ${lat},${lon} ${start}→${end}`);
      const nulls = Array(fechas.length).fill(null);
      cache.set(cacheKey, nulls);
      return nulls;
    }

    const times = data.daily.time; // array de fechas 'YYYY-MM-DD'
    const precipArr = data.daily.precipitation_sum || [];

    // construir mapa fecha -> precip
    const map = new Map();
    for (let i = 0; i < times.length; i++) {
      map.set(times[i], precipArr[i] ?? null);
    }

    // Alineo por fechas solicitadas: si falta alguna fecha, queda null
    const result = fechas.map((f) => (map.has(f) ? map.get(f) : null));

    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`Error obteniendo precip para ${lat},${lon} ${start}→${end}: ${err.message}`);
    // si falla del todo, devolvemos nulls para mantener longitud y que la app pueda continuar
    const nulls = Array(fechas.length).fill(null);
    cache.set(cacheKey, nulls);
    return nulls;
  }
}

async function main() {
  const rawData = JSON.parse(fs.readFileSync(archivoSobreescribir, "utf8"));

  let processed = 0;
  const tasks = rawData.map((item, idx) =>
    limit(async () => {
      // log con idx para evitar race con contador global
      console.log(`Procesando ${idx + 1}/${rawData.length} - (${item.lat},${item.lon})...`);
      try {
        // si dates no están en formato YYYY-MM-DD, conviene transformarlas aquí
        const fechas = item.fechas;

        const precip = await getPrecipitation(item.lat, item.lon, fechas);
        item.precipitation_sum = precip;

        processed++;
        if (processed % 50 === 0) {
          // guardado intermedio cada 50 para no perder todo si larga ejecución falla
          fs.writeFileSync(archivoSobreescribir, JSON.stringify(rawData, null, 2));
          console.log(`Guardado intermedio: ${processed} procesados.`);
        }
      } catch (err) {
        console.error(`Fallo en item ${idx + 1}: ${err.message}`);
        // asegurar que la propiedad existe para no romper downstream
        item.precipitation_sum = Array((item.fechas && item.fechas.length) || 0).fill(null);
      }
      // pequeña pausa opcional para suavizar carga si querés
      await sleep(50);
    })
  );

  await Promise.all(tasks);

  fs.writeFileSync(archivoSobreescribir, JSON.stringify(rawData, null, 2));
  console.log("✔️ Archivo guardado con precipitation_sum");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
