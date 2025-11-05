import fs from "fs";

const url =  "https://alerta.ina.gob.ar/pub/datos/datos&timeStart=2025-07-28&timeEnd=2025-11-06&format=json"

let rios = fs.readFileSync("riosNecesariosCon1.json");
rios = JSON.parse(rios)

let data = {};


for (let i in rios){
    let datos = await fetch(`https://alerta.ina.gob.ar/pub/datos/datos&timeStart=1899-12-31&timeEnd=2025-11-06&seriesId=${rios[i].seriesid}&siteCode=${rios[i].sitecode}&varId=2&format=json`);
    datos = await datos.json()
    datos= datos.data;
    console.log(parseInt(i)+1 + "/" + rios.length);
    data[`${rios[i].seriesid}-${rios[i].sitecode}`] = datos;
}

let contenidoJSON = JSON.stringify(data, null, 2);
try {
    fs.writeFileSync('datosDeRios.json', contenidoJSON);
    console.log('✅ ¡Archivo "datosDeRios.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}