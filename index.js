process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"
async function probar(){
    let series = await fetch("https://alerta.ina.gob.ar/pub/datos/series&&format=json");
    series = await series.json();
    series = series.data;

    let disponibles = []
    for(let i of series){
        if (i.var_nombre === "Altura hidrométrica"){
            let result = await fetch(`https://alerta.ina.gob.ar/pub/datos/datosDia&date=2025-08-21&seriesId=${i.seriesid}&desc=1&siteCode=${i.sitecode}&varId=2&procId=1&format=json`);
            result = await result.json();
            if (result.title != "Mensaje de error"){
                disponibles.push(i);
            }
        }
        
    }
    const contenidoJSON = JSON.stringify(disponibles, null, 2);

    try {
        fs.writeFileSync('disponibles.json', contenidoJSON);
        console.log('✅ ¡Archivo "usuarios.json" guardado con éxito!');
      } catch (error) {
        console.error('❌ Error al guardar el archivo:', error);
      }
}
probar()