process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"

async function probar(){
    let series = await fetch("https://alerta.ina.gob.ar/pub/datos/series&&format=json");
    series = await series.json();
    series = series.data;
    console.log(series);
    let disponibles = []
    for(let i in series){
        console.log(i)
        if (series[i].var_nombre === "Caudal"){
            let result = await fetch(`https://alerta.ina.gob.ar/pub/datos/datosDia&date=2025-08-26&seriesId=${series[i].seriesid}&desc=1&siteCode=${series[i].sitecode}&varId=2&procId=1&format=json`);
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
        fs.writeFileSync('par.json', contenidoJSON);
        console.log('✅ ¡Archivo "usuarios.json" guardado con éxito!');
      } catch (error) {
        console.error('❌ Error al guardar el archivo:', error);
      }
}
probar()