process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"

async function probar(){
    let series = await fetch("https://alerta.ina.gob.ar/pub/datos/series&&varId=1&format=json");
    series = await series.json();
    series = series.data;
    console.log(series);
    let disponibles = []
    for(let i in series){
        console.log(i)
        if (series[i].varid === 1){
            let result = await fetch(`https://alerta.ina.gob.ar/pub/datos/datos&timeStart=2025-05-25&timeEnd=2025-09-03&seriesId=${series[i].seriesid}&siteCode=${series[i].sitecode}&varId=1&format=json`);
            result = await result.text();
            result = result.slice(0,28);
            result+="}"
            try{
                result = JSON.parse(result);
                if (Object.hasOwn(result, 'title') == false){
                    console.log(`se cumple - ${i}/${series.length}`);
                    disponibles.push(series[i]);
                }else{
                    console.log(`No se cumple - ${i}/${series.length}`)
                }
            }catch(error){
                if (Object.hasOwn(result, 'title') == false){
                    console.log(`se cumple - ${i}/${series.length}`);
                    disponibles.push(series[i]);
                }else{
                    console.log(`No se cumple - ${i}/${series.length}`)
                }
            }

        }
        
    }
    const contenidoJSON = JSON.stringify(disponibles, null, 2);

    try {
        fs.writeFileSync('lluvias.json', contenidoJSON);
        console.log('✅ ¡Archivo "lluvias.json" guardado con éxito!');
      } catch (error) {
        console.error('❌ Error al guardar el archivo:', error);
      }
}
probar()
