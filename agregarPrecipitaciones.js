import fs from "fs";
import fetch from "node-fetch";
import pLimit from "p-limit";

// Limitar la concurrencia a 10 peticiones simultáneas
const limit = pLimit(15);
const archivoSobreescribir = "inundacionesDesde1990.json"


async function getPrecipitation(lat, lon, fechas) {
  const start = fechas[0];
  const end = fechas[fechas.length - 1];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=precipitation_sum&timezone=auto`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.daily || !data.daily.precipitation_sum) {
    return Array(fechas.length).fill(null);
  }

  return data.daily.precipitation_sum;
}

async function main() {
  const rawData = JSON.parse(fs.readFileSync(archivoSobreescribir, "utf8"));

  let index = 0;
  const tasks = rawData.map((item) => {
    return limit(async () => {
      index++;
      console.log(`Procesando ${index}/${rawData.length}...`);

      const precip = await getPrecipitation(
        item.lat,
        item.lon,
        item.fechas
      );

      item.precipitation_sum = precip;
    });
  });

  await Promise.all(tasks);

  fs.writeFileSync(archivoSobreescribir, JSON.stringify(rawData, null, 2));
  console.log("✔️ Archivo guardado con precipitation_sum");
}

main().catch(console.error);
