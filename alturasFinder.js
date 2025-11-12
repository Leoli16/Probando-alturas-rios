process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fetch from "node-fetch";
import fs from "fs"

async function probar(){
    let series = await fetch("https://alerta.ina.gob.ar/pub/datos/series&&format=json");
    series = await series.json();
    series = series.data;
    console.log(series);
    let disponibles = []
    for(let i in series){
        console.log(i)
        if (series[i].varid === 2 && series[i].procid === 1){
            disponibles.push(series[i])
        }
        
    }
    const contenidoJSON = JSON.stringify(disponibles, null, 2);

    try {
        fs.writeFileSync('alturasHidrometricas.json', contenidoJSON);
        console.log('✅ ¡Archivo "usuarios.json" guardado con éxito!');
      } catch (error) {
        console.error('❌ Error al guardar el archivo:', error);
      }
}
probar()
