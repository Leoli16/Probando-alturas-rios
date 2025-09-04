process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"
import fetch from 'node-fetch';

let lista = fs.readFileSync("lluvias.json");
lista = JSON.parse(lista);

let listaDeOriginales = await fetch("https://alerta.ina.gob.ar/pub/datos/estaciones&&format=json");
listaDeOriginales = await listaDeOriginales.json();
listaDeOriginales = listaDeOriginales.data;

for (let i in lista){
    for (let w of listaDeOriginales){
        if (w.sitecode === lista[i].sitecode){
            lista[i].lat = w.lat;
            lista[i].lon = w.lon;
        }
    }
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('lluvias.json', contenidoJSON);
    console.log('✅ ¡Archivo "lluvias.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}